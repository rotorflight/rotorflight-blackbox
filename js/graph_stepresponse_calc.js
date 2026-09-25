"use strict";

/**
 * Step response estimation for the Roll/Pitch/Yaw rate loops.
 *
 * A "step response" shows how the gyro (measured rotation rate) settles onto the setpoint
 * after a sudden stick movement - fast rise, little overshoot and a quick, non-oscillatory
 * settle at 1.0 (response normalised to the setpoint) indicates good tuning; overshoot,
 * ringing or a slow crawl to 1.0 indicate tuning problems.
 *
 * Blackbox logs don't contain a deliberate step input though - just whatever the pilot did
 * in flight. So rather than looking for an actual step, this uses the same statistical
 * technique as Betaflight Blackbox Explorer / PIDtoolbox to recover it from ordinary flight
 * data:
 *
 *   1. Slice the log into many overlapping windows (STEP_RESPONSE_FRAME_LEN_SEC long,
 *      overlapping by a factor of STEP_RESPONSE_SUPERPOS) so every sample contributes to
 *      several windows and the result isn't sensitive to where a window boundary falls.
 *   2. Skip windows where the pilot barely moved the stick (peak-to-peak setpoint movement
 *      below STEP_RESPONSE_MIN_STICK_MOVEMENT) - without excitation there is nothing to
 *      deconvolve, and the divide in step 4 would just amplify noise.
 *   3. Apply a Hanning window to the setpoint and gyro signal for that window, to reduce
 *      spectral leakage from the hard edges of the slice before the FFT.
 *   4. FFT both signals and estimate the axis's frequency response H via a lightly
 *      regularised Wiener deconvolution:
 *          H(f) = G(f) * conj(X(f)) / (|X(f)|^2 + reg)
 *      where X is the setpoint spectrum and G is the gyro spectrum for this window. reg
 *      (a small fraction of the mean input power) keeps the division stable at frequencies
 *      the stick didn't excite, where |X(f)|^2 would otherwise be close to zero.
 *   5. Inverse-FFT H to get the window's impulse response, then cumulatively sum it to turn
 *      the impulse response into a step response (a step is the integral of an impulse).
 *   6. Repeat for every accepted window across the whole log, then average the per-window
 *      step responses together. Windows whose average deviation from the pointwise mean
 *      exceeds STEP_RESPONSE_OUTLIER_SIGMA standard deviations are discarded first, so a
 *      single noisy/aggressive window can't dominate the average.
 *   7. The result is only reported as "valid" once at least STEP_RESPONSE_MIN_WINDOWS
 *      windows survive rejection - too few windows and the average isn't statistically
 *      meaningful yet.
 *
 * Steps 1-6 run independently for each axis in STEP_RESPONSE_AXIS_NAMES.
 */
const
    STEP_RESPONSE_AXIS_NAMES        = ['roll', 'pitch', 'yaw'],
    STEP_RESPONSE_FRAME_LEN_SEC     = 1.0,     // length of each analysis window
    STEP_RESPONSE_SUPERPOS          = 4,       // window overlap factor (stride = frameLen / this)
    STEP_RESPONSE_LEN_SEC           = 0.5,     // length of step response to keep from each window
    STEP_RESPONSE_MIN_STICK_MOVEMENT= 20,      // deg/s peak-to-peak setpoint excitation required to accept a window
    STEP_RESPONSE_OUTLIER_SIGMA     = 2,       // reject windows deviating more than this many pointwise std-devs from the mean
    STEP_RESPONSE_MIN_WINDOWS       = 10,      // minimum accepted windows for a result to be considered valid
    STEP_RESPONSE_REG_FRACTION      = 0.01,    // Wiener deconvolution regularization, as a fraction of mean input power
    STEP_RESPONSE_MAX_LENGTH        = 300 * 1000 * 1000; // 5min, matches the Analyser's analysis length cap

var StepResponseCalc = StepResponseCalc || {
    _timeRange : {
            in: 0,
            out: 0
    },
    _blackBoxRate : 0,
    _flightLog : null,
    _sysConfig : null,
};

// Derives the effective blackbox sample rate (Hz) from the log's looptime/decimation
// config, so window lengths below can be expressed in seconds rather than samples.
StepResponseCalc.initialize = function(flightLog, sysConfig) {

    this._flightLog = flightLog;
    this._sysConfig = sysConfig;

    var gyroRate = (1000000 / this._sysConfig['looptime']).toFixed(0);
    this._blackBoxRate = gyroRate * this._sysConfig['frameIntervalPNum'] / this._sysConfig['frameIntervalPDenom'];
    if (this._sysConfig.pid_process_denom != null) {
        this._blackBoxRate = this._blackBoxRate / this._sysConfig.pid_process_denom;
    }
};

StepResponseCalc.setInTime = function(time) {
    this._timeRange.in = time;
    return this._timeRange.in;
};

StepResponseCalc.setOutTime = function(time) {
    if ((time - this._timeRange.in) <= STEP_RESPONSE_MAX_LENGTH) {
        this._timeRange.out = time;
    } else {
        this._timeRange.out = this._timeRange.in + STEP_RESPONSE_MAX_LENGTH;
    }
    return this._timeRange.out;
};

/**
 * Calculates the averaged step response (setpoint -> gyro) for roll, pitch and yaw
 * over the currently configured time range, via windowed Wiener deconvolution.
 *
 * Returns { roll, pitch, yaw }, each { time, response, windowCount, valid }.
 */
StepResponseCalc.calculate = function() {
    var result = {};
    for (var axisIndex = 0; axisIndex < STEP_RESPONSE_AXIS_NAMES.length; axisIndex++) {
        result[STEP_RESPONSE_AXIS_NAMES[axisIndex]] = this._calculateAxis(axisIndex);
    }
    return result;
};

// Fetches the raw log chunks for the currently configured [in, out) time range, clamped
// to STEP_RESPONSE_MAX_LENGTH so a huge selection can't blow up the FFT work below.
StepResponseCalc._getFlightChunks = function() {

    var logStart = this._timeRange.in || this._flightLog.getMinTime();
    var logEnd = this._timeRange.out || this._flightLog.getMaxTime();

    logEnd = (logEnd - logStart <= STEP_RESPONSE_MAX_LENGTH) ? logEnd : logStart + STEP_RESPONSE_MAX_LENGTH;

    return this._flightLog.getChunksInTimeRange(logStart, logEnd);
};

// Flattens the setpoint[axisIndex] and gyroADC[axisIndex] fields for the whole selected
// range into two parallel, contiguous sample arrays - the raw input/output pair that
// _calculateAxis slices into windows and deconvolves.
StepResponseCalc._getAxisSamples = function(axisIndex) {

    var allChunks = this._getFlightChunks();

    var FIELD_SETPOINT_INDEX = this._flightLog.getMainFieldIndexByName('setpoint[' + axisIndex + ']');
    var FIELD_GYRO_INDEX = this._flightLog.getMainFieldIndexByName('gyroADC[' + axisIndex + ']');

    if (FIELD_SETPOINT_INDEX == null || FIELD_GYRO_INDEX == null) {
        return { setpoint: new Float64Array(0), gyro: new Float64Array(0), count: 0 };
    }

    var maxSamples = STEP_RESPONSE_MAX_LENGTH / (1000 * 1000) * this._blackBoxRate;
    var setpoint = new Float64Array(maxSamples);
    var gyro = new Float64Array(maxSamples);

    var samplesCount = 0;
    for (var chunkIndex = 0; chunkIndex < allChunks.length; chunkIndex++) {
        var chunk = allChunks[chunkIndex];
        for (var frameIndex = 0; frameIndex < chunk.frames.length; frameIndex++) {
            setpoint[samplesCount] = chunk.frames[frameIndex][FIELD_SETPOINT_INDEX];
            gyro[samplesCount] = chunk.frames[frameIndex][FIELD_GYRO_INDEX];
            samplesCount++;
        }
    }

    return { setpoint: setpoint, gyro: gyro, count: samplesCount };
};

// Applies a Hanning window in-place, tapering both ends of the slice to zero so the FFT
// below doesn't see the sharp discontinuities at the window edges as spurious frequency
// content (spectral leakage).
StepResponseCalc._hanningWindow = function(samples, size) {
    for (var i = 0; i < size; i++) {
        samples[i] *= 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
    }
};

// Placeholder "no data" result (flat zero response, 0 windows) for when an axis can't be
// analysed at all, e.g. the fields are missing from the log or there aren't enough samples.
StepResponseCalc._emptyResult = function(timeAxis, responseLenSamples) {
    return {
        time: timeAxis,
        response: new Float64Array(responseLenSamples),
        windowCount: 0,
        valid: false,
    };
};

// Computes the averaged step response for a single axis. See the file header for the
// overall approach; this is the per-window windowing/FFT/Wiener-deconvolution/averaging
// pipeline (steps 1-7) run for one of roll/pitch/yaw.
StepResponseCalc._calculateAxis = function(axisIndex) {

    // responseLenSamples/timeAxis describe the fixed-length output curve (0..STEP_RESPONSE_LEN_SEC)
    // that every window's step response gets trimmed/averaged down to.
    var responseLenSamples = Math.round(STEP_RESPONSE_LEN_SEC * this._blackBoxRate);
    var timeAxis = new Float64Array(responseLenSamples);
    for (var t = 0; t < responseLenSamples; t++) {
        timeAxis[t] = t / this._blackBoxRate;
    }

    // Each analysis window is FRAME_LEN_SEC long; it must be at least as long as the step
    // response we want to keep from it.
    var frameLen = Math.round(STEP_RESPONSE_FRAME_LEN_SEC * this._blackBoxRate);

    if (frameLen < responseLenSamples || frameLen < 2) {
        return this._emptyResult(timeAxis, responseLenSamples);
    }

    var samples = this._getAxisSamples(axisIndex);

    if (samples.count < frameLen) {
        return this._emptyResult(timeAxis, responseLenSamples);
    }

    // Windows step forward by a fraction of their own length (SUPERPOS-way overlap), so
    // consecutive windows share most of their samples rather than being independent slices.
    var stride = Math.max(1, Math.round(frameLen / STEP_RESPONSE_SUPERPOS));

    var forwardFft = new FFT.complex(frameLen, false);
    var inverseFft = new FFT.complex(frameLen, true);

    var windowResponses = [];

    for (var start = 0; start + frameLen <= samples.count; start += stride) {

        var setpointWindow = samples.setpoint.slice(start, start + frameLen);
        var gyroWindow = samples.gyro.slice(start, start + frameLen);

        // Reject windows without enough stick excitation - deconvolution is meaningless without input
        var minSp = setpointWindow[0], maxSp = setpointWindow[0];
        for (var s = 1; s < frameLen; s++) {
            if (setpointWindow[s] < minSp) minSp = setpointWindow[s];
            if (setpointWindow[s] > maxSp) maxSp = setpointWindow[s];
        }
        if ((maxSp - minSp) < STEP_RESPONSE_MIN_STICK_MOVEMENT) {
            continue;
        }

        this._hanningWindow(setpointWindow, frameLen);
        this._hanningWindow(gyroWindow, frameLen);

        var X = new Float64Array(frameLen * 2); // setpoint spectrum
        var G = new Float64Array(frameLen * 2); // gyro spectrum
        forwardFft.simple(X, setpointWindow, 'real');
        forwardFft.simple(G, gyroWindow, 'real');

        // Regularization proportional to mean input power, avoids dividing by (near) zero
        // at frequencies the stick didn't excite.
        var meanPower = 0;
        for (var f = 0; f < frameLen; f++) {
            meanPower += X[2 * f] * X[2 * f] + X[2 * f + 1] * X[2 * f + 1];
        }
        meanPower /= frameLen;
        var reg = STEP_RESPONSE_REG_FRACTION * meanPower + 1e-9;

        // Wiener deconvolution: H = G * conj(X) / (X * conj(X) + reg)
        var H = new Float64Array(frameLen * 2);
        for (var k = 0; k < frameLen; k++) {
            var xr = X[2 * k], xi = X[2 * k + 1];
            var gr = G[2 * k], gi = G[2 * k + 1];

            var denom = xr * xr + xi * xi + reg;

            var numR = gr * xr + gi * xi;
            var numI = gi * xr - gr * xi;

            H[2 * k] = numR / denom;
            H[2 * k + 1] = numI / denom;
        }

        var impulse = new Float64Array(frameLen * 2);
        inverseFft.simple(impulse, H, 'complex');

        // Cumulative sum of the impulse response gives the step response. This library's
        // inverse transform is unnormalized (verified empirically), so divide by frameLen.
        var stepResponse = new Float64Array(responseLenSamples);
        var acc = 0;
        var windowIsFinite = true;
        for (var n = 0; n < responseLenSamples; n++) {
            acc += impulse[2 * n] / frameLen;
            stepResponse[n] = acc;
            if (!isFinite(acc)) windowIsFinite = false;
        }

        // A dropped/corrupted frame (NaN or Infinity in the raw setpoint or gyro data for this
        // window) poisons the whole window's FFT output. Since the FFT is a transform over the
        // entire window, this isn't recoverable per-sample - discard the window rather than
        // letting a single bad window contaminate the averaged result for every other window.
        if (!windowIsFinite) {
            continue;
        }

        windowResponses.push(stepResponse);
    }

    if (windowResponses.length === 0) {
        return this._emptyResult(timeAxis, responseLenSamples);
    }

    // Pointwise mean and std-dev across all accepted windows
    var mean = new Float64Array(responseLenSamples);
    for (var w = 0; w < windowResponses.length; w++) {
        for (var n = 0; n < responseLenSamples; n++) {
            mean[n] += windowResponses[w][n];
        }
    }
    for (var n = 0; n < responseLenSamples; n++) {
        mean[n] /= windowResponses.length;
    }

    var std = new Float64Array(responseLenSamples);
    for (var w = 0; w < windowResponses.length; w++) {
        for (var n = 0; n < responseLenSamples; n++) {
            var d = windowResponses[w][n] - mean[n];
            std[n] += d * d;
        }
    }
    for (var n = 0; n < responseLenSamples; n++) {
        std[n] = Math.sqrt(std[n] / windowResponses.length);
    }

    // Single-pass outlier rejection: drop windows whose average deviation from the mean
    // (in units of the pointwise std-dev) exceeds STEP_RESPONSE_OUTLIER_SIGMA
    var accepted = [];
    for (var w = 0; w < windowResponses.length; w++) {
        var totalDeviation = 0;
        var countedPoints = 0;
        for (var n = 0; n < responseLenSamples; n++) {
            if (std[n] > 1e-9) {
                totalDeviation += Math.abs(windowResponses[w][n] - mean[n]) / std[n];
                countedPoints++;
            }
        }
        if (countedPoints === 0 || (totalDeviation / countedPoints) <= STEP_RESPONSE_OUTLIER_SIGMA) {
            accepted.push(windowResponses[w]);
        }
    }

    if (accepted.length === 0) {
        // Rejection removed every window (e.g. a very noisy log) - fall back to using them
        // all rather than reporting no data.
        accepted = windowResponses;
    }

    // Final pointwise average of the accepted (outlier-filtered) per-window step responses.
    var finalResponse = new Float64Array(responseLenSamples);
    for (var w = 0; w < accepted.length; w++) {
        for (var n = 0; n < responseLenSamples; n++) {
            finalResponse[n] += accepted[w][n];
        }
    }
    for (var n = 0; n < responseLenSamples; n++) {
        finalResponse[n] /= accepted.length;
    }

    return {
        time: timeAxis,
        response: finalResponse,
        windowCount: accepted.length,
        valid: accepted.length >= STEP_RESPONSE_MIN_WINDOWS,
    };
};
