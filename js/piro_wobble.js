"use strict";

// Piro section (P key): a stretch of the log where the heli pirouettes in place, so only the tail
// goes round. On a perfectly set-up heli the rotor disc stays level throughout; any wobble or
// progression of roll/pitch shows up as the mast leaning away from vertical. The piro wobble plot
// (graph_piro_wobble.js) draws that lean under the 3D craft while the section is on screen.
//
// Attitude signs follow the firmware (imu.c): positive roll is right side down and positive pitch
// is nose down, the same sense as the roll/pitch sticks.

// Trace samples are kept no closer together than this - plenty to draw a smooth path.
const PIRO_TRACE_INTERVAL_US = 10000;

/**
 * The section after pressing P at `time`: the first press starts a section, the second ends it
 * (in either order), pressing again at the start time cancels it, and a press on a finished
 * section starts a new one there.
 *
 * @param {{start: number|null, end: number|null}} section
 * @param {number} time - log time, microseconds
 * @returns {{start: number|null, end: number|null}}
 */
function nextPiroSection(section, time) {
    const start = section ? section.start : null;
    const end = section ? section.end : null;
    if (start == null || end != null) return { start: time, end: null };
    if (time === start) return { start: null, end: null };
    return { start: Math.min(start, time), end: Math.max(start, time) };
}

/**
 * Whether `time` is inside the section. An open section (no end yet) runs on from its start.
 */
function isInPiroSection(section, time) {
    if (!section || section.start == null) return false;
    return time >= section.start && (section.end == null || time <= section.end);
}

/**
 * The model rotations the 3D craft uses for a logged attitude (decidegrees) - see grapher.js.
 */
function piroAttitudeToModelRotation(rollDeci, pitchDeci, yawDeci) {
    return {
        roll: (-rollDeci / 1800) * Math.PI,
        pitch: (-pitchDeci / 1800) * Math.PI,
        yaw: (-yawDeci / 1800) * Math.PI,
    };
}

/**
 * The lean of the mast seen from above, in the craft view's world frame (the same rotations the
 * 3D craft applies: wrapper yaw, then the model's pitch and roll in three.js "XYZ" order).
 *
 * Returns { x, y, degrees }: x is to the viewer's right and y away from the viewer, each in
 * degrees of lean along that direction, so the point sits `degrees` from the centre.
 *
 * @param {number} rollRad - model.rotation.z
 * @param {number} pitchRad - model.rotation.x
 * @param {number} yawRad - wrapper rotation.y
 */
function piroMastLean(rollRad, pitchRad, yawRad) {
    const sx = Math.sin(pitchRad), cx = Math.cos(pitchRad);
    const sz = Math.sin(rollRad), cz = Math.cos(rollRad);
    const sy = Math.sin(yawRad), cy = Math.cos(yawRad);
    // Body up (0,1,0) rotated by Rx(pitch)·Rz(roll), then Ry(yaw).
    const ux = -sz * cy + cz * sx * sy;
    const uy = cz * cx;
    const uz = sz * sy + cz * sx * cy;
    const horizontal = Math.hypot(ux, uz);
    const degrees = (Math.acos(Math.min(1, Math.max(-1, uy))) * 180) / Math.PI;
    if (horizontal < 1e-9) return { x: 0, y: 0, degrees: degrees };
    return { x: (ux / horizontal) * degrees, y: (-uz / horizontal) * degrees, degrees: degrees };
}

function piroFrameTimeIndex() {
    return FlightLogParser.prototype.FLIGHT_LOG_FIELD_INDEX_TIME;
}

/**
 * The mast lean through a section, from the logged attitude:
 *   times, x, y      - the trail, thinned to one sample per PIRO_TRACE_INTERVAL_US
 *   peakTimes, peaks - every logged frame's time, with the largest lean (degrees) up to and
 *                      including it, so the peak never misses a sample the thinning dropped
 * (all Float64Arrays).
 */
function buildPiroTrace(flightLog, start, end) {
    const timeIndex = piroFrameTimeIndex();
    const rollIndex = flightLog.getMainFieldIndexByName("attitude[0]");
    const pitchIndex = flightLog.getMainFieldIndexByName("attitude[1]");
    const yawIndex = flightLog.getMainFieldIndexByName("attitude[2]");
    const times = [], xs = [], ys = [], peakTimes = [], peaks = [];

    if ([rollIndex, pitchIndex, yawIndex].every((i) => typeof i === "number")) {
        let lastTrail = -Infinity, lastFrame = -Infinity, peak = 0;
        for (const chunk of flightLog.getChunksInTimeRange(start, end)) {
            for (const frame of chunk.frames || []) {
                const time = frame[timeIndex];
                if (time < start || time > end || time <= lastFrame) continue;
                lastFrame = time;
                const r = piroAttitudeToModelRotation(frame[rollIndex], frame[pitchIndex], frame[yawIndex]);
                const lean = piroMastLean(r.roll, r.pitch, r.yaw);
                peak = Math.max(peak, lean.degrees);
                peakTimes.push(time);
                peaks.push(peak);
                if (time - lastTrail < PIRO_TRACE_INTERVAL_US) continue;
                lastTrail = time;
                times.push(time);
                xs.push(lean.x);
                ys.push(lean.y);
            }
        }
    }
    return {
        times: Float64Array.from(times), x: Float64Array.from(xs), y: Float64Array.from(ys),
        peakTimes: Float64Array.from(peakTimes), peaks: Float64Array.from(peaks),
    };
}

/**
 * The largest lean (degrees) in the trace at or before `time`, 0 before the first frame.
 */
function piroPeakAt(trace, time) {
    const count = piroTraceCountAt(trace.peakTimes, time);
    return count ? trace.peaks[count - 1] : 0;
}

/**
 * Number of trace samples at or before `time` (binary search).
 */
function piroTraceCountAt(times, time) {
    let lo = 0, hi = times.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (times[mid] <= time) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

/**
 * Measurements over a piro section. Anything that is fixed relative to the world (wind, drift)
 * rotates through every direction during a turn, so the tilt is averaged over whole turns, and
 * by angle turned rather than by frame - otherwise the slower part of an uneven turn would count
 * for more and let the wind back in. What is left is the tilt the heli itself holds.
 *
 * A logging gap inside the section hides whatever the heli did in it, so the turns, yaw rate and
 * averages can't be measured and only the duration is given.
 *
 * @returns {{
 *   ok: boolean,               false when the log has no attitude
 *   gap: boolean,              true when logging stopped inside the section (no turn figures)
 *   revolutions: number,       turns made over the section
 *   durationS: number,
 *   yawRateDegS: number,       average yaw rate over the section
 *   wholeRevolutions: number,  turns the averages are taken over (0 = no averages)
 *   tilt?: {roll: number, pitch: number, degrees: number}, mean attitude, degrees
 * }}
 */
function analysePiro(flightLog, start, end) {
    const timeIndex = piroFrameTimeIndex();
    const idx = (name) => flightLog.getMainFieldIndexByName(name);
    const rollIndex = idx("attitude[0]"), pitchIndex = idx("attitude[1]"), yawIndex = idx("attitude[2]");

    if ([rollIndex, pitchIndex, yawIndex].some((i) => typeof i !== "number")) {
        return { ok: false, gap: false, revolutions: 0, durationS: 0, yawRateDegS: 0, wholeRevolutions: 0 };
    }

    // Unwrapped yaw (decidegrees) per sample, so the averages can stop at the last whole turn.
    const yaw = [], roll = [], pitch = [];
    let prevRaw = null, unwrapped = 0, last = -Infinity, firstTime = null, lastTime = null;
    let gapPending = false, gap = false;
    for (const chunk of flightLog.getChunksInTimeRange(start, end)) {
        const frames = chunk.frames || [];
        for (let f = 0; f < frames.length; f++) {
            const frame = frames[f];
            const time = frame[timeIndex];
            if (time < start || time > end || time <= last) continue;
            last = time;
            // A gap marked after an earlier frame of the section, with this frame on its far side.
            // FlightLog marks a gap just before a chunk's first frame at index -1.
            if (gapPending || (f === 0 && firstTime != null && chunk.gapStartsHere && chunk.gapStartsHere[-1])) {
                gap = true;
            }
            if (firstTime == null) firstTime = time;
            lastTime = time;
            if (chunk.gapStartsHere && chunk.gapStartsHere[f]) gapPending = true;
            const raw = frame[yawIndex];
            if (prevRaw !== null) {
                let d = raw - prevRaw;
                if (d > 1800) d -= 3600;
                else if (d < -1800) d += 3600;
                unwrapped += d;
            }
            prevRaw = raw;
            yaw.push(unwrapped);
            roll.push(frame[rollIndex]);
            pitch.push(frame[pitchIndex]);
        }
    }

    const n = yaw.length;
    const durationS = n > 1 ? (lastTime - firstTime) / 1e6 : 0;
    if (gap) {
        return { ok: true, gap: true, revolutions: 0, durationS: durationS, yawRateDegS: 0, wholeRevolutions: 0 };
    }
    const revolutions = n ? Math.abs(yaw[n - 1]) / 3600 : 0;
    const result = {
        ok: true,
        gap: false,
        revolutions: revolutions,
        durationS: durationS,
        yawRateDegS: durationS > 0 ? (Math.abs(unwrapped) / 10) / durationS : 0,
        wholeRevolutions: Math.floor(revolutions),
    };
    if (result.wholeRevolutions < 1) return result;

    // Average over the angle turned: integrate roll and pitch against the yaw progress (in the
    // direction of the net turn, so any back-and-forth cancels itself), trapezium by trapezium,
    // stopping exactly at the end of the last whole turn.
    const direction = Math.sign(yaw[n - 1]);
    const target = result.wholeRevolutions * 3600;
    let sumRoll = 0, sumPitch = 0;
    for (let i = 1; i < n; i++) {
        const p0 = direction * yaw[i - 1], p1 = direction * yaw[i];
        let r1 = roll[i], q1 = pitch[i], end1 = p1;
        const done = p1 >= target;
        if (done) {
            // Interpolate to the turn boundary.
            const k = p1 === p0 ? 1 : (target - p0) / (p1 - p0);
            r1 = roll[i - 1] + (roll[i] - roll[i - 1]) * k;
            q1 = pitch[i - 1] + (pitch[i] - pitch[i - 1]) * k;
            end1 = target;
        }
        const dp = end1 - p0;
        sumRoll += ((roll[i - 1] + r1) / 2) * dp;
        sumPitch += ((pitch[i - 1] + q1) / 2) * dp;
        if (done) break;
    }
    const tiltRoll = sumRoll / target / 10, tiltPitch = sumPitch / target / 10;
    result.tilt = { roll: tiltRoll, pitch: tiltPitch, degrees: Math.hypot(tiltRoll, tiltPitch) };
    return result;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        nextPiroSection, isInPiroSection, piroAttitudeToModelRotation, piroMastLean, buildPiroTrace, piroPeakAt, piroTraceCountAt, analysePiro,
    };
}
