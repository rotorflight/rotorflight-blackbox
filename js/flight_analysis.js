"use strict";

/**
 * FlightAnalysis - a lightweight, self-contained flight-health analysis engine.
 *
 * Takes a single already-loaded FlightLog and produces a plain-language verdict
 * (a handful of status cards) plus a set of "labs" - Governor, Power, Battery,
 * Vibration and PID Tracking - each with a narrative story and a few key
 * numbers. This is a scaled-down take on Blackbox_Lab's Labs/Verdict system,
 * adapted to this viewer's simpler, single-flight-in-front-of-you scope.
 * Ported from the WingFlight Blackbox Explorer and tuned for helicopters.
 *
 * Design notes:
 *  - Every number is computed only over a detected "stable flight" window
 *    (steady, governed hover/cruise), not the whole log, so spool-up/down and
 *    headspeed bank changes don't skew the numbers.
 *  - Every lab is independently gated: if the log doesn't have the fields it
 *    needs (or too little stable-flight data), it returns status "insufficient"
 *    with an explanatory story instead of guessing or showing NaN.
 */
var FlightAnalysis = (function() {

    var MIN_STABLE_SAMPLES = 100;
    var MIN_ROTOR_RPM = 500; // below this the rotor isn't spooled up

    // ------------------------------------------------------------------
    // Small math helpers
    // ------------------------------------------------------------------

    function average(values) {
        if (!values || !values.length) return null;
        var sum = 0;
        for (var i = 0; i < values.length; i++) sum += values[i];
        return sum / values.length;
    }

    function rms(values) {
        if (!values || !values.length) return null;
        var sum = 0;
        for (var i = 0; i < values.length; i++) sum += values[i] * values[i];
        return Math.sqrt(sum / values.length);
    }

    function maxOf(values) {
        var max = -Infinity;
        for (var i = 0; i < values.length; i++) if (values[i] > max) max = values[i];
        return max;
    }

    function minOf(values) {
        var min = Infinity;
        for (var i = 0; i < values.length; i++) if (values[i] < min) min = values[i];
        return min;
    }

    function spread(array, lo, hi) {
        var min = Infinity, max = -Infinity;
        for (var i = lo; i <= hi; i++) {
            if (array[i] < min) min = array[i];
            if (array[i] > max) max = array[i];
        }
        return max - min;
    }

    function pickAtIndexes(array, indexes) {
        var result = new Array(indexes.length);
        for (var i = 0; i < indexes.length; i++) result[i] = array[indexes[i]];
        return result;
    }

    function insufficient(story) {
        return { status: "insufficient", story: story, metrics: [] };
    }

    // ------------------------------------------------------------------
    // Column extraction - read the whole log once into plain arrays keyed
    // by field name, tolerant of fields the log doesn't have.
    // ------------------------------------------------------------------

    var WANTED_FIELDS = [
        "headspeed", "tailspeed",
        "govTarget", "govRequest",
        "setpoint[0]", "setpoint[1]", "setpoint[2]",
        "axisError[0]", "axisError[1]", "axisError[2]",
        "axisSum[0]", "axisSum[1]", "axisSum[2]",
        "gyroADC[0]", "gyroADC[1]", "gyroADC[2]",
        "Vbat", "Ibat",
        "EscV", "EscI", "EscThr",
        "motor[0]"
    ];

    function readColumns(flightLog, startTime, endTime) {
        var fieldIndexByName = {};
        var wanted = [];
        for (var i = 0; i < WANTED_FIELDS.length; i++) {
            var idx = flightLog.getMainFieldIndexByName(WANTED_FIELDS[i]);
            if (idx !== undefined) {
                fieldIndexByName[WANTED_FIELDS[i]] = idx;
                wanted.push(WANTED_FIELDS[i]);
            }
        }

        var timeFieldIndex = FlightLogParser.prototype.FLIGHT_LOG_FIELD_INDEX_TIME;
        var chunks = flightLog.getChunksInTimeRange(
            startTime === undefined ? flightLog.getMinTime() : startTime,
            endTime === undefined ? flightLog.getMaxTime() : endTime
        );

        var sampleCount = 0;
        for (var c = 0; c < chunks.length; c++) sampleCount += chunks[c].frames.length;

        var time = new Array(sampleCount);
        var columns = {};
        for (i = 0; i < wanted.length; i++) columns[wanted[i]] = new Array(sampleCount);

        var n = 0;
        for (c = 0; c < chunks.length; c++) {
            var frames = chunks[c].frames;
            for (var f = 0; f < frames.length; f++) {
                var frame = frames[f];
                time[n] = frame[timeFieldIndex] / 1000000; // microseconds -> seconds
                for (i = 0; i < wanted.length; i++) {
                    columns[wanted[i]][n] = frame[fieldIndexByName[wanted[i]]];
                }
                n++;
            }
        }

        // A field that's present in the header but never non-zero (e.g. no
        // RPM sensor, governor off) carries no information -- drop it so the
        // labs treat it as missing rather than scoring a flat line of zeros.
        for (i = 0; i < wanted.length; i++) {
            var column = columns[wanted[i]], anyNonZero = false;
            for (var k = 0; k < column.length; k++) if (column[k]) { anyNonZero = true; break; }
            if (!anyNonZero) delete columns[wanted[i]];
        }

        return { time: time, columns: columns, sampleCount: sampleCount };
    }

    // ------------------------------------------------------------------
    // Stable-flight-phase detection - a simplified port of Blackbox_Lab's
    // flightPhase.js. Finds steady governed hover/cruise stretches so the
    // labs below aren't scored on spool-up/down or headspeed changes.
    // ------------------------------------------------------------------

    // Centred moving average, using a running sum so wide windows stay cheap
    function movingAverage(values, windowSamples) {
        var n = values.length;
        var result = new Array(n);
        var half = Math.max(1, Math.floor(windowSamples / 2));
        var sum = 0, lo = 0, hi = -1;

        for (var i = 0; i < n; i++) {
            var wantLo = Math.max(0, i - half), wantHi = Math.min(n - 1, i + half);
            while (hi < wantHi) sum += values[++hi];
            while (lo < wantLo) sum -= values[lo++];
            result[i] = sum / (hi - lo + 1);
        }
        return result;
    }

    function percentile(sortedValues, fraction) {
        var idx = Math.min(sortedValues.length - 1, Math.max(0, Math.floor(fraction * (sortedValues.length - 1))));
        return sortedValues[idx];
    }

    function sortedCopy(values) {
        return values.slice(0).sort(function(a, b) { return a - b; });
    }

    function detectStableFlightPhase(time, headspeed, governorTarget, gyroActivity) {
        var n = time.length;

        if (n < 50 || time[n - 1] - time[0] <= 0) {
            return { stableIndexes: [], stableSampleCount: 0, reason: "This flight is too short to analyse." };
        }

        var sampleRateHz = n / (time[n - 1] - time[0]);
        var windowSamples = Math.max(1, Math.round(sampleRateHz * 2)); // +-2s

        var candidate = new Array(n);
        var i, lo, hi;
        var basis;

        if (headspeed && governorTarget) {
            // Best case: the Rotorflight governor logs its target, so "steady"
            // is simply target barely moving and headspeed tracking it closely.
            basis = "governor";

            for (i = 0; i < n; i++) {
                var speed = headspeed[i];
                candidate[i] = false;
                if (speed < MIN_ROTOR_RPM || governorTarget[i] <= MIN_ROTOR_RPM) continue;

                lo = Math.max(0, i - windowSamples);
                hi = Math.min(n - 1, i + windowSamples);

                var targetSpread = spread(governorTarget, lo, hi);
                var trackingError = Math.abs(governorTarget[i] - speed) / governorTarget[i];
                candidate[i] = targetSpread < 20 && trackingError <= 0.08;
            }

            // Blank out +-2s windows around target steps (headspeed bank changes)
            for (i = 1; i < n; i++) {
                if (Math.abs(governorTarget[i] - governorTarget[i - 1]) > 20) {
                    lo = Math.max(0, i - windowSamples);
                    hi = Math.min(n - 1, i + windowSamples);
                    for (var j = lo; j <= hi; j++) candidate[j] = false;
                }
            }
        } else if (headspeed) {
            // No governor target logged (Rotorflight governor off, e.g. an ESC
            // governor or throttle curve). A helicopter still holds a roughly
            // constant headspeed in flight, so a plateau on headspeed itself is
            // a good steady-flight signal.
            basis = "headspeed-plateau";

            for (i = 0; i < n; i++) {
                var s = headspeed[i];
                candidate[i] = false;
                if (s < MIN_ROTOR_RPM) continue;

                lo = Math.max(0, i - windowSamples);
                hi = Math.min(n - 1, i + windowSamples);
                candidate[i] = spread(headspeed, lo, hi) < Math.max(40, s * 0.03);
            }
        } else if (gyroActivity) {
            // No RPM data at all: fall back to airframe motion. A period where
            // the model isn't actively manoeuvring shows up as a sustained
            // low-and-flat patch on summed |gyro|.
            basis = "gyro-activity";

            var smoothed = movingAverage(gyroActivity, Math.round(sampleRateHz));
            var sorted = smoothed.slice(0).sort(function(a, b) { return a - b; });
            // Anchor on a low percentile of the whole flight as the calm floor,
            // with a generous margin to absorb normal noise in the calm band.
            var calmFloor = percentile(sorted, 0.1);
            var threshold = calmFloor * 1.8 + 2;

            for (i = 0; i < n; i++) {
                candidate[i] = smoothed[i] <= threshold;
            }
        } else {
            return { stableIndexes: [], stableSampleCount: 0, reason: "No headspeed or gyro data logged, so a steady-flight window can't be identified." };
        }

        // Keep only contiguous runs of >=3s, trimming 3s off each end
        var trimSamples = Math.round(sampleRateHz * 3);
        var minRunSamples = Math.round(sampleRateHz * 3);
        var stableIndexes = [];
        var runStart = null;

        for (i = 0; i <= n; i++) {
            var isStable = i < n && candidate[i];
            if (isStable && runStart === null) {
                runStart = i;
            } else if (!isStable && runStart !== null) {
                var runEnd = i; // exclusive
                if (runEnd - runStart >= minRunSamples) {
                    for (var k = runStart + trimSamples; k < runEnd - trimSamples; k++) stableIndexes.push(k);
                }
                runStart = null;
            }
        }

        return {
            stableIndexes: stableIndexes,
            stableSampleCount: stableIndexes.length,
            sampleRateHz: sampleRateHz,
            basis: basis,
            reason: stableIndexes.length ? null : "No steady flight segment of 3s or more was found - try a longer or steadier flight."
        };
    }

    // ------------------------------------------------------------------
    // Headspeed / governor lab
    // ------------------------------------------------------------------

    function analyzeGovernorLab(ctx) {
        var headspeed = ctx.columns.headspeed;
        var target = ctx.columns.govTarget || ctx.columns.govRequest;

        if (!headspeed) return insufficient("No headspeed data was logged for this flight (no RPM source configured?).");
        if (ctx.stable.stableSampleCount < MIN_STABLE_SAMPLES) return insufficient(ctx.stable.reason);

        var idx = ctx.stable.stableIndexes;
        var speedStable = pickAtIndexes(headspeed, idx);

        // With the Rotorflight governor active the target is logged, which
        // gives a precise sag-vs-target read; otherwise fall back to scoring
        // how steady the headspeed held on its own.
        if (!target) return analyzeGovernorSteadiness(speedStable);

        // Brief dips on a hard collective punch are normal, so score on the
        // sag the governor lets through for more than a moment: a 100ms
        // average, at its 99th percentile. The absolute worst dip is still reported.
        var window = Math.max(1, Math.round(ctx.stable.sampleRateHz * 0.1));
        var sustainedSag = movingAverage(target.map(function(t, i) { return t - headspeed[i]; }), window);
        return analyzeGovernorAgainstTarget(speedStable, pickAtIndexes(target, idx), pickAtIndexes(sustainedSag, idx));
    }

    function analyzeGovernorAgainstTarget(speedStable, targetStable, sustainedSagStable) {
        var avgTarget = average(targetStable);
        var avgSpeed = average(speedStable);
        var maxSag = 0;
        var errors = new Array(speedStable.length);
        for (var i = 0; i < speedStable.length; i++) {
            var sag = targetStable[i] - speedStable[i];
            if (sag > maxSag) maxSag = sag;
            errors[i] = sag;
        }
        var rmsError = rms(errors);
        var maxSagPercent = avgTarget ? (maxSag / avgTarget) * 100 : 0;
        var sustainedSag = Math.max(0, percentile(sortedCopy(sustainedSagStable), 0.99));
        var sagPercent = avgTarget ? (sustainedSag / avgTarget) * 100 : 0;

        var status = sagPercent > 5 ? "attention" : sagPercent > 2.5 ? "watch" : "good";

        var story;
        if (status === "good") {
            story = "Good headspeed hold: averaged " + Math.round(avgSpeed) + " rpm against a " +
                Math.round(avgTarget) + " rpm target, with sustained dips under load of no more than " +
                Math.round(sustainedSag) + " rpm (" + sagPercent.toFixed(1) + "%).";
        } else if (status === "watch") {
            story = "Headspeed mostly held its target, but sagged by up to " + Math.round(sustainedSag) + " rpm (" +
                sagPercent.toFixed(1) + "%) under load - worth keeping an eye on.";
        } else {
            story = "Headspeed sagged noticeably under load: up to " + Math.round(sustainedSag) + " rpm (" +
                sagPercent.toFixed(1) + "%) below target. Consider more governor gain or collective/cyclic " +
                "precompensation, or check for a power-system limit.";
        }

        return {
            status: status,
            story: story,
            metrics: [
                { label: "Average headspeed", value: Math.round(avgSpeed) + " rpm" },
                { label: "Average target", value: Math.round(avgTarget) + " rpm" },
                { label: "Sustained sag (99th pct)", value: Math.round(sustainedSag) + " rpm (" + sagPercent.toFixed(1) + "%)" },
                { label: "Worst momentary dip", value: Math.round(maxSag) + " rpm (" + maxSagPercent.toFixed(1) + "%)" },
                { label: "RMS tracking error", value: Math.round(rmsError) + " rpm" }
            ],
            sagPercent: sagPercent
        };
    }

    // No governor target logged (Rotorflight governor off) -- score on how
    // steady the headspeed held on its own instead of sag-vs-target.
    function analyzeGovernorSteadiness(speedStable) {
        var avgSpeed = average(speedStable);
        var maxDeviation = 0;
        var deviations = new Array(speedStable.length);
        for (var i = 0; i < speedStable.length; i++) {
            var deviation = speedStable[i] - avgSpeed;
            deviations[i] = deviation;
            if (Math.abs(deviation) > maxDeviation) maxDeviation = Math.abs(deviation);
        }
        var rmsDeviation = rms(deviations);
        var variabilityPercent = avgSpeed ? (maxDeviation / avgSpeed) * 100 : 0;

        var status = variabilityPercent > 3 ? "attention" : variabilityPercent > 1.2 ? "watch" : "good";

        var caveat = " (No governor target was logged - the Rotorflight governor looks to be off - so this reflects headspeed steadiness, not tracking accuracy.)";
        var story;
        if (status === "good") {
            story = "Headspeed held steady during stable flight: averaged " + Math.round(avgSpeed) +
                " rpm, straying by at most " + Math.round(maxDeviation) + " rpm (" + variabilityPercent.toFixed(1) + "%)." + caveat;
        } else if (status === "watch") {
            story = "Headspeed mostly held steady, but wandered as much as " + Math.round(maxDeviation) + " rpm (" +
                variabilityPercent.toFixed(1) + "%) during stable flight - worth keeping an eye on." + caveat;
        } else {
            story = "Headspeed varied noticeably during stable flight: up to " + Math.round(maxDeviation) + " rpm (" +
                variabilityPercent.toFixed(1) + "%) away from its average. Check the governor setup, or for a power-system limit." + caveat;
        }

        return {
            status: status,
            story: story,
            metrics: [
                { label: "Average headspeed", value: Math.round(avgSpeed) + " rpm" },
                { label: "Max deviation", value: Math.round(maxDeviation) + " rpm (" + variabilityPercent.toFixed(1) + "%)" },
                { label: "RMS variation", value: Math.round(rmsDeviation) + " rpm" }
            ],
            variabilityPercent: variabilityPercent
        };
    }

    // ------------------------------------------------------------------
    // Power / ESC lab
    // ------------------------------------------------------------------

    function analyzeEscLab(ctx) {
        var throttlePct, throttleSource;

        if (ctx.columns.EscThr) {
            throttlePct = ctx.columns.EscThr.map(function(v) { return v / 10; });
            throttleSource = "ESC-reported throttle";
        } else if (ctx.columns["motor[0]"]) {
            throttlePct = ctx.columns["motor[0]"].map(function(v) { return v / 10; });
            throttleSource = "motor output (no ESC telemetry logged)";
        } else {
            return insufficient("No ESC or motor output data was logged for this flight.");
        }

        if (ctx.stable.stableSampleCount < MIN_STABLE_SAMPLES) return insufficient(ctx.stable.reason);

        var idx = ctx.stable.stableIndexes;
        var throttleStable = pickAtIndexes(throttlePct, idx);
        var avgThrottle = average(throttleStable);
        var headroom = 100 - avgThrottle;

        var saturated = 0;
        for (var i = 0; i < throttleStable.length; i++) if (throttleStable[i] >= 97) saturated++;
        var saturationPercent = (saturated / throttleStable.length) * 100;

        var status = saturationPercent > 2 ? "attention" : headroom < 12 ? "watch" : "good";

        var metrics = [
            { label: "Average throttle", value: avgThrottle.toFixed(1) + "% (" + throttleSource + ")" },
            { label: "Headroom", value: headroom.toFixed(1) + "%" },
            { label: "Time at/near full output", value: saturationPercent.toFixed(1) + "%" }
        ];

        var current = ctx.columns.EscI || ctx.columns.Ibat;
        if (current) {
            var currentStable = pickAtIndexes(current, idx).map(function(v) { return v / 100; });
            metrics.push({ label: "Average current", value: average(currentStable).toFixed(1) + " A" });
            metrics.push({ label: "Peak current", value: maxOf(currentStable).toFixed(1) + " A" });
        }

        var story;
        if (status === "good") {
            story = "Throttle (" + throttleSource + ") averaged " + avgThrottle.toFixed(0) +
                "% during stable flight, leaving healthy headroom for the governor.";
        } else if (status === "watch") {
            story = "Throttle averaged " + avgThrottle.toFixed(0) + "% during stable flight - headroom is getting thin (" +
                headroom.toFixed(0) + "%). A lower headspeed or different gearing would give the governor more room.";
        } else {
            story = "Throttle sat at or above 97% for " + saturationPercent.toFixed(1) +
                "% of stable flight. The governor had little remaining output authority during those periods, so headspeed will sag under load.";
        }

        return { status: status, story: story, metrics: metrics, saturationPercent: saturationPercent };
    }

    // ------------------------------------------------------------------
    // Battery lab
    // ------------------------------------------------------------------

    function analyzeBatteryLab(ctx, flightLog) {
        var voltageRaw = ctx.columns.Vbat || ctx.columns.EscV;
        if (!voltageRaw) return insufficient("No battery/ESC voltage data was logged for this flight.");
        if (ctx.stable.stableSampleCount < MIN_STABLE_SAMPLES) return insufficient(ctx.stable.reason);

        var voltage = voltageRaw.map(function(v) { return v / 100; });
        var idx = ctx.stable.stableIndexes;
        var stableVoltage = pickAtIndexes(voltage, idx);

        var cellCount = flightLog.getNumCellsEstimate();
        if (!cellCount) cellCount = Math.max(1, Math.round(voltage[0] / 4.1));

        var minV = minOf(stableVoltage);
        var startV = voltage[0];
        var minVPerCell = minV / cellCount;
        var sagPercent = startV ? ((startV - minV) / startV) * 100 : 0;

        // Score the loaded voltage the pack held for more than a moment (a
        // 0.5s average, at its 1st percentile), not a single dip on a punch.
        var window = Math.max(1, Math.round(ctx.stable.sampleRateHz * 0.5));
        var sustainedV = percentile(sortedCopy(pickAtIndexes(movingAverage(voltage, window), idx)), 0.01);
        var sustainedVPerCell = sustainedV / cellCount;

        // Under-load thresholds: a healthy pack near the end of a flight
        // typically sits around 3.5V/cell while working
        var status = sustainedVPerCell < 3.3 ? "attention" : sustainedVPerCell < 3.45 ? "watch" : "good";

        var story;
        if (status === "good") {
            story = "Pack held up well: under load it stayed above " + sustainedV.toFixed(2) + "V (" +
                sustainedVPerCell.toFixed(2) + "V/cell).";
        } else if (status === "watch") {
            story = "Under load the pack sat as low as " + sustainedV.toFixed(2) + "V (" + sustainedVPerCell.toFixed(2) +
                "V/cell). Worth watching on future flights - it may be near the end of its capacity, or flown a little long.";
        } else {
            story = "Under load the pack sagged to " + sustainedV.toFixed(2) + "V (" + sustainedVPerCell.toFixed(2) +
                "V/cell) - check the matching current draw, shorten the flight, and consider the pack's health.";
        }

        return {
            status: status,
            story: story,
            metrics: [
                { label: "Cell count (est.)", value: cellCount + "S" },
                { label: "Start voltage", value: startV.toFixed(2) + "V (" + (startV / cellCount).toFixed(2) + "V/cell)" },
                { label: "Sustained low (under load)", value: sustainedV.toFixed(2) + "V (" + sustainedVPerCell.toFixed(2) + "V/cell)" },
                { label: "Lowest momentary dip", value: minV.toFixed(2) + "V (" + minVPerCell.toFixed(2) + "V/cell)" },
                { label: "Sag", value: sagPercent.toFixed(1) + "%" }
            ]
        };
    }

    // ------------------------------------------------------------------
    // Vibration lab - reuses the app's own FFT (GraphSpectrumCalc /
    // js/complex.js) restricted to the stable-flight window, so the numbers
    // agree with what the Analyser panel would show for the same time range.
    // Peaks are matched against main and tail rotor speed harmonics.
    // ------------------------------------------------------------------

    var GYRO_FIELDS = ["gyroADC[0]", "gyroADC[1]", "gyroADC[2]"];
    var AXIS_NAMES = ["Roll", "Pitch", "Yaw"];

    var MAIN_HARMONIC_LABELS = {
        1: "main rotor 1x (main blade tracking or balance)",
        2: "main rotor 2x (blade pass on a two-blade head)",
        3: "main rotor 3x (blade pass on a three-blade head)"
    };
    var TAIL_HARMONIC_LABELS = {
        1: "tail rotor 1x (tail blade balance or tail drive)",
        2: "tail rotor 2x (tail blade pass)"
    };
    var MAX_HARMONIC_ERROR = 0.08;

    function classifyVibrationSource(peakHz, headspeedRpm, tailspeedRpm) {
        if (!headspeedRpm) return "not clearly linked to rotor speed (no headspeed data to compare against)";

        var mainRatio = peakHz / (headspeedRpm / 60);

        // The tail's 1x/2x often land near a main rotor harmonic too, so take
        // whichever harmonic the peak matches most closely rather than a fixed
        // order. (A motor-driven tail's speed varies through the flight, so a
        // fixed-frequency peak usually matches a main harmonic better.)
        var best = null;
        function consider(ratio, harmonic, label) {
            var error = Math.abs(ratio - harmonic) / harmonic;
            if (error <= MAX_HARMONIC_ERROR && (!best || error < best.error)) best = { error: error, label: label };
        }
        for (var h = 1; h <= 8; h++) {
            consider(mainRatio, h, MAIN_HARMONIC_LABELS[h] || "main rotor " + h + "x (a higher main rotor harmonic)");
        }
        if (tailspeedRpm) {
            var tailRatio = peakHz / (tailspeedRpm / 60);
            consider(tailRatio, 1, TAIL_HARMONIC_LABELS[1]);
            consider(tailRatio, 2, TAIL_HARMONIC_LABELS[2]);
        }

        if (best) return best.label;
        if (mainRatio > 8) return "high frequency - likely motor, pinion/gear mesh or bearing noise";
        return "not clearly linked to rotor speed (frame or electrical resonance)";
    }

    function findSpectrumPeak(fftData, minHz) {
        if (!fftData || !fftData.fftOutput || !fftData.fftLength) return null;

        // Same bin -> Hz convention the app's own Analyser plot uses (see
        // graph_spectrum_calc.js's _normalizeFft / graph_spectrum_plot.js),
        // so these numbers agree with what's shown there for the same window.
        var maxFrequency = fftData.blackBoxRate / 2;
        var hzPerBin = maxFrequency / fftData.fftLength;
        var minBin = Math.max(1, Math.round(minHz / hzPerBin));

        var bestBin = -1, bestMag = -Infinity;
        for (var i = minBin; i < fftData.fftOutput.length && i < fftData.fftLength; i++) {
            if (fftData.fftOutput[i] > bestMag) { bestMag = fftData.fftOutput[i]; bestBin = i; }
        }
        if (bestBin < 0) return null;

        return { hz: bestBin * hzPerBin, magnitude: bestMag };
    }

    function analyzeVibrationLab(ctx, flightLog) {
        var haveGyro = false;
        for (var g = 0; g < GYRO_FIELDS.length; g++) if (ctx.columns[GYRO_FIELDS[g]]) haveGyro = true;
        if (!haveGyro) return insufficient("No gyro data was logged for this flight.");
        if (ctx.stable.stableSampleCount < MIN_STABLE_SAMPLES) return insufficient(ctx.stable.reason);

        var idx = ctx.stable.stableIndexes;
        var stableStartUs = ctx.time[idx[0]] * 1000000;
        var stableEndUs = ctx.time[idx[idx.length - 1]] * 1000000;

        var headspeedAtWindow = ctx.columns.headspeed ? average(pickAtIndexes(ctx.columns.headspeed, idx)) : null;
        var tailspeedAtWindow = null, tailIsVariable = false;
        if (ctx.columns.tailspeed) {
            var tailStable = pickAtIndexes(ctx.columns.tailspeed, idx);
            var tailAverage = average(tailStable);
            if (tailAverage >= MIN_ROTOR_RPM) {
                tailspeedAtWindow = tailAverage;
                // A motor-driven tail changes speed with yaw demand, so a single
                // spectrum peak over the window can't be tied to its harmonics
                var tailDeviations = tailStable.map(function(v) { return v - tailAverage; });
                tailIsVariable = rms(tailDeviations) / tailAverage > 0.05;
            }
        }
        // Only a tail that holds a fixed speed (driven from the main gear) can be matched
        var tailspeedForMatching = tailIsVariable ? null : tailspeedAtWindow;

        // Ignore DC and the pilot's own stick input and flight motion (the
        // strongest content below ~15-20Hz), but keep the main rotor 1x, which
        // is only ~20Hz on a large, slow-spinning heli.
        var minPeakHz = headspeedAtWindow ? Math.max(10, 0.75 * headspeedAtWindow / 60) : 20;

        var identityCurve = { lookupRaw: function(v) { return v; } };

        GraphSpectrumCalc.initialize(flightLog, flightLog.getSysConfig());
        GraphSpectrumCalc.setInTime(stableStartUs);
        GraphSpectrumCalc.setOutTime(stableEndUs);

        var results = [];
        var worstMagnitude = -Infinity, worstAxis = null, worstHz = null;

        for (var axis = 0; axis < 3; axis++) {
            var fieldName = GYRO_FIELDS[axis];
            var fieldIndex = flightLog.getMainFieldIndexByName(fieldName);
            if (fieldIndex === undefined) continue;

            GraphSpectrumCalc.setDataBuffer({ fieldIndex: fieldIndex, curve: identityCurve, fieldName: fieldName });

            var fftData;
            try {
                fftData = GraphSpectrumCalc.dataLoadFrequency();
            } catch (e) {
                continue;
            }

            var peak = findSpectrumPeak(fftData, minPeakHz);
            if (!peak) continue;

            results.push({ axis: AXIS_NAMES[axis], hz: peak.hz, source: classifyVibrationSource(peak.hz, headspeedAtWindow, tailspeedForMatching) });
            if (peak.magnitude > worstMagnitude) {
                worstMagnitude = peak.magnitude;
                worstAxis = AXIS_NAMES[axis];
                worstHz = peak.hz;
            }
        }

        if (!results.length) return insufficient("Could not compute a vibration spectrum for this flight.");

        // No good/watch/attention verdict here, and no numeric filter cutoff
        // recommendation -- only the strongest peak per axis and what it's
        // likely linked to.
        var story = "Strongest vibration is on " + worstAxis + " at " + worstHz.toFixed(1) + " Hz - " +
            classifyVibrationSource(worstHz, headspeedAtWindow, tailspeedForMatching) +
            ". Open the Analyser (top toolbar) around this part of the flight to look closer.";

        var metrics = results.map(function(r) { return { label: r.axis + " peak", value: r.hz.toFixed(1) + " Hz - " + r.source }; });
        if (headspeedAtWindow) {
            metrics.push({ label: "Main rotor 1x", value: (headspeedAtWindow / 60).toFixed(1) + " Hz (" + Math.round(headspeedAtWindow) + " rpm)" });
        }
        if (tailspeedAtWindow) {
            metrics.push({
                label: "Tail rotor 1x",
                value: (tailIsVariable ? "avg " : "") + (tailspeedAtWindow / 60).toFixed(1) + " Hz (" + Math.round(tailspeedAtWindow) + " rpm)" +
                    (tailIsVariable ? " - variable speed, not matched to peaks" : "")
            });
        }

        return { status: "info", story: story, metrics: metrics };
    }

    // ------------------------------------------------------------------
    // PID tracking lab (lightweight: a simplified RMS-tracking-error +
    // PID-sum-saturation check, not a full step-response/overshoot/ringing
    // analysis -- the Step Response panel covers that).
    // ------------------------------------------------------------------

    var PID_AXIS_NAMES = ["Roll", "Pitch", "Yaw (tail)"];
    var MAX_TRACKING_DELAY_S = 0.15;

    // How well gyro follows setpoint once the response delay is taken out.
    // A plain setpoint-minus-gyro error counts the (normal) lag between
    // command and response as error, which dominates on a heli, so instead
    // find the delay that best lines the two up and score what's left.
    // Only samples with real stick input (|setpoint| > 5 deg/s) count.
    function delayCompensatedTracking(setpoint, gyro, idx, sampleRateHz) {
        var active = [];
        for (var i = 0; i < idx.length; i++) if (Math.abs(setpoint[idx[i]]) > 5) active.push(idx[i]);
        if (active.length <= 20 || !sampleRateHz) return null;

        // Subsample to keep this cheap on long, high-rate logs
        var stride = Math.max(1, Math.floor(active.length / 20000));
        var maxLag = Math.round(MAX_TRACKING_DELAY_S * sampleRateHz);
        var lagStep = Math.max(1, Math.round(sampleRateHz / 1000)); // ~1ms resolution

        var setpointSumSq = 0, count = 0;
        for (i = 0; i < active.length; i += stride) {
            setpointSumSq += setpoint[active[i]] * setpoint[active[i]];
            count++;
        }
        var rmsSetpoint = Math.sqrt(setpointSumSq / count);
        if (!rmsSetpoint) return null;

        var bestLag = 0, bestRms = Infinity;
        for (var lag = 0; lag <= maxLag; lag += lagStep) {
            var sumSq = 0, n = 0;
            for (i = 0; i < active.length; i += stride) {
                var j = active[i] + lag;
                if (j >= gyro.length) continue;
                var err = gyro[j] - setpoint[active[i]];
                sumSq += err * err;
                n++;
            }
            if (n && Math.sqrt(sumSq / n) < bestRms) {
                bestRms = Math.sqrt(sumSq / n);
                bestLag = lag;
            }
        }

        return { errorPercent: (bestRms / rmsSetpoint) * 100, delayMs: (bestLag / sampleRateHz) * 1000 };
    }

    function analyzePidLab(ctx, flightLog) {
        var haveError = false;
        for (var a = 0; a < 3; a++) if (ctx.columns["axisError[" + a + "]"]) haveError = true;
        if (!haveError) return insufficient("No setpoint/gyro tracking data was logged for this flight.");
        if (ctx.stable.stableSampleCount < MIN_STABLE_SAMPLES) return insufficient(ctx.stable.reason);

        var idx = ctx.stable.stableIndexes;
        var sysConfig = flightLog.getSysConfig();
        var pidSumLimit = { 0: sysConfig.pidSumLimit, 1: sysConfig.pidSumLimit, 2: sysConfig.pidSumLimitYaw };

        var axisResults = [];
        var worstTrackingPercent = -1, worstAxis = null;
        var worstSaturationPercent = 0, saturatedAxis = null;

        for (var axis = 0; axis < 3; axis++) {
            var errorField = ctx.columns["axisError[" + axis + "]"];
            var setpointField = ctx.columns["setpoint[" + axis + "]"];
            if (!errorField) continue;

            var errorStable = pickAtIndexes(errorField, idx);
            var rmsError = rms(errorStable);

            var trackingPercent = null, delayMs = null;
            var gyroField = ctx.columns["gyroADC[" + axis + "]"];
            if (setpointField && gyroField) {
                var tracking = delayCompensatedTracking(setpointField, gyroField, idx, ctx.stable.sampleRateHz);
                if (tracking) {
                    trackingPercent = tracking.errorPercent;
                    delayMs = tracking.delayMs;
                }
            }

            if (trackingPercent !== null && trackingPercent > worstTrackingPercent) {
                worstTrackingPercent = trackingPercent;
                worstAxis = PID_AXIS_NAMES[axis];
            }

            var saturationPercent = null;
            var sumField = ctx.columns["axisSum[" + axis + "]"];
            var limit = pidSumLimit[axis];
            if (sumField && limit) {
                var sumStable = pickAtIndexes(sumField, idx);
                var saturated = 0;
                for (var s = 0; s < sumStable.length; s++) if (Math.abs(sumStable[s]) >= limit * 0.98) saturated++;
                saturationPercent = (saturated / sumStable.length) * 100;
                if (saturationPercent > worstSaturationPercent) {
                    worstSaturationPercent = saturationPercent;
                    saturatedAxis = PID_AXIS_NAMES[axis];
                }
            }

            axisResults.push({
                axis: PID_AXIS_NAMES[axis],
                rmsError: rmsError,
                trackingPercent: trackingPercent,
                delayMs: delayMs,
                saturationPercent: saturationPercent
            });
        }

        if (!axisResults.length) return insufficient("Not enough tracking data to assess PID performance.");

        // Tracking thresholds are for the delay-compensated error; well-flown
        // helis typically land around 15-25%
        var status = "good";
        if (worstTrackingPercent > 45 || worstSaturationPercent > 5) status = "attention";
        else if (worstTrackingPercent > 30 || worstSaturationPercent > 1) status = "watch";

        var storyParts = [];
        if (worstAxis) {
            storyParts.push(worstAxis + " has the highest tracking error during stable flight (" +
                worstTrackingPercent.toFixed(0) + "% of the commanded rate).");
        }
        if (saturatedAxis && worstSaturationPercent > 1) {
            storyParts.push(saturatedAxis + "'s PID sum sat near its configured limit for " +
                worstSaturationPercent.toFixed(1) + "% of stable flight - the controller had little headroom left there" +
                (saturatedAxis === PID_AXIS_NAMES[2] ? ", which usually points to a lack of tail authority." : "."));
        }
        if (!storyParts.length) {
            storyParts.push("Roll, pitch and tail all tracked their commands closely during stable flight, with no sign of PID-sum saturation.");
        }
        if (status !== "good") {
            storyParts.push("Open the Step Response panel for a closer look at how each axis settles.");
        }

        return {
            status: status,
            story: storyParts.join(" "),
            metrics: axisResults.map(function(r) {
                return {
                    label: r.axis + " tracking",
                    value: (r.trackingPercent !== null ? r.trackingPercent.toFixed(0) + "% error, " + r.delayMs.toFixed(0) + " ms delay" : Math.round(r.rmsError) + " deg/s RMS error") +
                        (r.saturationPercent !== null ? ", " + r.saturationPercent.toFixed(1) + "% saturated" : "")
                };
            })
        };
    }

    // ------------------------------------------------------------------
    // Verdict - rolls the labs up into cards, mirroring Blackbox_Lab's
    // flightVerdict.js card shape.
    // ------------------------------------------------------------------

    function statusRank(status) {
        return status === "attention" ? 2 : status === "watch" ? 1 : 0;
    }

    function cardFromLab(key, title, lab) {
        if (!lab || lab.status === "insufficient" || lab.status === "info") return null;

        var actionByStatus = {
            good: "Nothing to do.",
            watch: "Keep an eye on this over your next few flights.",
            attention: "Worth addressing before your next flight."
        };

        return {
            key: key,
            title: title,
            status: lab.status,
            headline: lab.story.split(/(?<=[.!?])\s/)[0],
            detail: lab.story,
            action: actionByStatus[lab.status] || ""
        };
    }

    function buildVerdict(labs) {
        var cards = [
            cardFromLab("governor", "Headspeed", labs.governor),
            cardFromLab("esc", "Power", labs.esc),
            cardFromLab("battery", "Battery", labs.battery),
            cardFromLab("pid", "PID Tracking", labs.pid)
        ].filter(function(c) { return c; });

        var worst = "good";
        for (var i = 0; i < cards.length; i++) if (statusRank(cards[i].status) > statusRank(worst)) worst = cards[i].status;

        var summary;
        if (!cards.length) {
            summary = "Not enough data in this log to build a flight verdict - see the notes in each section below.";
        } else if (worst === "attention") {
            summary = "This flight has at least one thing worth addressing - see the cards below.";
        } else if (worst === "watch") {
            summary = "This flight looks reasonable overall, with a couple of things worth keeping an eye on.";
        } else {
            summary = "This flight looks healthy across everything this log lets us check.";
        }

        return { cards: cards, worst: worst, summary: summary };
    }

    // ------------------------------------------------------------------
    // Very large logs (tens of MB+) can take minutes to fully decode --
    // flightLog.getChunksInTimeRange() is a single synchronous, CPU-bound
    // call with no opportunity to yield, and pulling a whole such flight
    // freezes the window for the duration.
    //
    // Rather than always decoding the entire flight, cap how much we ask
    // for: above MAX_ANALYSIS_DURATION_S, use the per-I-frame activity
    // summary -- already built cheaply at log-open time, no full decode
    // needed -- to find the steadiest (lowest throttle-spread) window of
    // that length, and only decode that slice.
    // ------------------------------------------------------------------

    var MAX_ANALYSIS_DURATION_S = 240;

    function findSteadiestWindow(flightLog, windowSeconds) {
        var summary = flightLog.getActivitySummary();
        if (!summary || !summary.times || !summary.times.length) return null;

        var times = summary.times, throttle = summary.avgThrottle;
        var n = times.length;
        var windowUs = windowSeconds * 1000000;

        var bestSpread = Infinity, bestStart = null;

        for (var i = 0; i < n; i++) {
            var endTime = times[i] + windowUs;
            if (endTime > times[n - 1]) break;

            // Track min/max throttle within the window (recomputed per start --
            // summary arrays are small, this stays cheap).
            var j = i, min = Infinity, max = -Infinity;
            while (j < n && times[j] <= endTime) {
                if (throttle[j] < min) min = throttle[j];
                if (throttle[j] > max) max = throttle[j];
                j++;
            }

            if (max - min < bestSpread) {
                bestSpread = max - min;
                bestStart = times[i];
            }
        }

        return bestStart !== null ? { startTime: bestStart, endTime: bestStart + windowUs } : null;
    }

    // ------------------------------------------------------------------
    // Entry point
    // ------------------------------------------------------------------

    function build(flightLog) {
        var sysConfig = flightLog.getSysConfig();

        var minTime = flightLog.getMinTime(), maxTime = flightLog.getMaxTime();
        var totalDurationS = (maxTime - minTime) / 1000000;

        var analysisWindow = null;
        if (totalDurationS > MAX_ANALYSIS_DURATION_S) {
            analysisWindow = findSteadiestWindow(flightLog, MAX_ANALYSIS_DURATION_S);
            // No usable activity summary (unlikely) -- fall back to just the
            // first MAX_ANALYSIS_DURATION_S rather than the whole flight.
            if (!analysisWindow) analysisWindow = { startTime: minTime, endTime: minTime + MAX_ANALYSIS_DURATION_S * 1000000 };
        }

        var extracted = analysisWindow
            ? readColumns(flightLog, analysisWindow.startTime, analysisWindow.endTime)
            : readColumns(flightLog);

        // Summed |gyro| stands in for "is the airframe actively manoeuvring
        // right now" when there's no headspeed data to find steady flight with.
        var gyroActivity = null;
        var gx = extracted.columns["gyroADC[0]"], gy = extracted.columns["gyroADC[1]"], gz = extracted.columns["gyroADC[2]"];
        if (gx && gy && gz) {
            gyroActivity = new Array(extracted.time.length);
            for (var gi = 0; gi < gyroActivity.length; gi++) {
                gyroActivity[gi] = Math.abs(gx[gi]) + Math.abs(gy[gi]) + Math.abs(gz[gi]);
            }
        }

        var stable = detectStableFlightPhase(extracted.time, extracted.columns.headspeed,
            extracted.columns.govTarget || extracted.columns.govRequest, gyroActivity);

        var ctx = { time: extracted.time, columns: extracted.columns, stable: stable };

        var labs = {
            governor: analyzeGovernorLab(ctx),
            esc: analyzeEscLab(ctx),
            battery: analyzeBatteryLab(ctx, flightLog),
            vibration: analyzeVibrationLab(ctx, flightLog),
            pid: analyzePidLab(ctx, flightLog)
        };

        var context = {
            craftName: sysConfig["Craft name"] || sysConfig.Craft_name || "Unnamed craft",
            firmwareVersion: sysConfig.firmwareVersion || null,
            durationSeconds: totalDurationS,
            stableSeconds: stable.sampleRateHz ? stable.stableSampleCount / stable.sampleRateHz : 0,
            stableBasis: stable.basis || null,
            analyzedSeconds: analysisWindow ? (analysisWindow.endTime - analysisWindow.startTime) / 1000000 : totalDurationS,
            capped: !!analysisWindow
        };

        return { context: context, labs: labs, verdict: buildVerdict(labs) };
    }

    return { build: build };
})();
