const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const TIME = 0;
const FIELDS = ['time', 'attitude[0]', 'attitude[1]', 'attitude[2]', 'mixer[0]', 'mixer[1]', 'setpoint[0]', 'setpoint[1]'];

function load() {
    const context = vm.createContext({
        Math, Float64Array, window: {},
        FlightLogParser: {prototype: {FLIGHT_LOG_FIELD_INDEX_TIME: TIME}},
    });
    for (const file of ['piro_wobble.js', 'graph_piro_wobble.js']) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'), context);
    }
    return context;
}

// A log with one frame per `frame(i)` at 1 kHz, in a single chunk.
function fakeLog(count, frame, fields = FIELDS) {
    const frames = [];
    for (let i = 0; i < count; i++) frames.push(frame(i, i * 1000));
    return {
        getMainFieldIndexByName: (name) => (fields.includes(name) ? FIELDS.indexOf(name) : undefined),
        getChunksInTimeRange: () => [{frames}],
    };
}

// A log from explicit frames, with gapStartsHere marks.
function fakeLogFrames(frames, gapStartsHere = {}) {
    return {
        getMainFieldIndexByName: (name) => (FIELDS.includes(name) ? FIELDS.indexOf(name) : undefined),
        getChunksInTimeRange: () => [{frames, gapStartsHere}],
    };
}

// Logged yaw (decidegrees, wrapped to -1800..1799) for a heading in degrees.
const wrapYaw = (deg) => Math.round((((deg % 360) + 360) % 360) * 10) - 1800;

const near = (actual, expected, tolerance, message) =>
    assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`);

test('P starts, ends, cancels and restarts a section', () => {
    const {nextPiroSection} = load();
    const plain = (s) => ({start: s.start, end: s.end});
    assert.deepEqual(plain(nextPiroSection({start: null, end: null}, 5)), {start: 5, end: null});
    assert.deepEqual(plain(nextPiroSection({start: 5, end: null}, 9)), {start: 5, end: 9});
    assert.deepEqual(plain(nextPiroSection({start: 5, end: null}, 2)), {start: 2, end: 5});
    assert.deepEqual(plain(nextPiroSection({start: 5, end: null}, 5)), {start: null, end: null});
    assert.deepEqual(plain(nextPiroSection({start: 2, end: 5}, 7)), {start: 7, end: null});
});

test('inside the section, an open section runs on from its start', () => {
    const {isInPiroSection} = load();
    assert.equal(isInPiroSection({start: null, end: null}, 5), false);
    assert.equal(isInPiroSection({start: 5, end: 9}, 4), false);
    assert.equal(isInPiroSection({start: 5, end: 9}, 5), true);
    assert.equal(isInPiroSection({start: 5, end: 9}, 9), true);
    assert.equal(isInPiroSection({start: 5, end: 9}, 10), false);
    assert.equal(isInPiroSection({start: 5, end: null}, 1e9), true);
});

test('a level heli has no mast lean whatever its heading', () => {
    const {piroMastLean} = load();
    for (const yaw of [0, 1, 2.5, -3]) {
        near(piroMastLean(0, 0, yaw).degrees, 0, 1e-9, `yaw ${yaw}`);
    }
});

test('the lean size is the tilt and turns with the heading', () => {
    const {piroMastLean, piroAttitudeToModelRotation} = load();
    // 3 degrees of right roll, facing away from the viewer: the head leans to the viewer's right.
    let r = piroAttitudeToModelRotation(30, 0, 0);
    let lean = piroMastLean(r.roll, r.pitch, r.yaw);
    near(lean.degrees, 3, 1e-9, 'degrees');
    near(lean.x, 3, 1e-9, 'x');
    near(lean.y, 0, 1e-9, 'y');
    // Same tilt after a half turn: the lean has swung to the other side.
    r = piroAttitudeToModelRotation(30, 0, 1800);
    lean = piroMastLean(r.roll, r.pitch, r.yaw);
    near(lean.degrees, 3, 1e-9, 'degrees after half turn');
    near(lean.x, -3, 1e-9, 'x after half turn');
});

test('averages keep the tilt fixed to the heli and cancel the tilt fixed to the world', () => {
    const {analysePiro} = load();
    // 360 deg/s for 2.5 s. The heli holds 1.0 deg right / 0.5 deg nose up; a 2 deg world-fixed
    // lean (e.g. wind) turns through the body frame once per turn.
    const log = fakeLog(2501, (i, t) => {
        const yawDeg = (t / 1e6) * 360;
        const a = (yawDeg * Math.PI) / 180;
        const yawDeci = Math.round((((yawDeg % 360) + 360) % 360) * 10) - 1800; // wrapped -1800..1799
        return [t, 10 + 20 * Math.cos(a), -5 + 20 * Math.sin(a), yawDeci, 50, -25, 3, 4];
    });
    const r = analysePiro(log, 0, 2500000);
    assert.equal(r.ok, true);
    near(r.revolutions, 2.5, 0.01, 'revolutions');
    assert.equal(r.wholeRevolutions, 2);
    near(r.durationS, 2.5, 1e-9, 'duration');
    near(r.yawRateDegS, 360, 1, 'yaw rate');
    near(r.tilt.roll, 1.0, 0.02, 'tilt roll');
    near(r.tilt.pitch, -0.5, 0.02, 'tilt pitch');
    near(r.tilt.degrees, Math.hypot(1, 0.5), 0.02, 'tilt');
});

test('an uneven turn rate does not let a world-fixed lean into the average', () => {
    const {analysePiro} = load();
    // Each turn: the first half takes 3 s, the second half 1 s. Two and a quarter turns. A 4 deg
    // world-fixed lean turns through the body frame; the heli holds 1.0 deg right / 0.5 deg nose up.
    const headingAt = (t) => {
        const turn = Math.floor(t / 4), tt = t - turn * 4;
        return turn * 360 + (tt < 3 ? (180 * tt) / 3 : 180 + 180 * (tt - 3));
    };
    const frames = [];
    for (let i = 0; i <= 9000; i++) {
        const t = i / 1000, deg = headingAt(t), a = (deg * Math.PI) / 180;
        frames.push([i * 1000, 10 + 40 * Math.cos(a), -5 + 40 * Math.sin(a), wrapYaw(deg), 0, 0, 0, 0]);
    }
    const r = analysePiro(fakeLogFrames(frames), 0, 9e6);
    assert.equal(r.wholeRevolutions, 2);
    near(r.tilt.roll, 1.0, 0.02, 'tilt roll');
    near(r.tilt.pitch, -0.5, 0.02, 'tilt pitch');
});

test('a logging gap in the section gives no turn figures', () => {
    const {analysePiro, piroDetailLines} = load();
    const frames = [];
    for (let i = 0; i <= 2000; i++) frames.push([i * 1000, 0, 0, wrapYaw(i * 0.36), 0, 0, 0, 0]);
    const r = analysePiro(fakeLogFrames(frames, {1000: true}), 0, 2e6);
    assert.equal(r.gap, true);
    assert.equal(r.tilt, undefined);
    near(r.durationS, 2, 1e-9, 'duration');
    const lines = piroDetailLines(r);
    assert.equal(lines[1].note, true);
    // A gap after the section's last frame is outside it.
    assert.equal(analysePiro(fakeLogFrames(frames, {1000: true}), 0, 1e6).gap, false);
});

test('the peak lean counts every frame, not just the thinned trail', () => {
    const {buildPiroTrace, piroPeakAt} = load();
    // Level, then one 8 deg frame at 5 ms (between the 10 ms trail samples), then level again.
    const frames = [];
    for (let i = 0; i <= 20; i++) frames.push([i * 1000, i === 5 ? 80 : 0, 0, 0, 0, 0, 0, 0]);
    const trace = buildPiroTrace(fakeLogFrames(frames), 0, 20000);
    assert.ok(![...trace.times].includes(5000), 'the 8 deg frame is not a trail sample');
    near(piroPeakAt(trace, 4000), 0, 1e-9, 'before the peak');
    near(piroPeakAt(trace, 10000), 8, 1e-9, 'after the peak');
    near(piroPeakAt(trace, 20000), 8, 1e-9, 'still the peak later');
});

test('under one turn there are no averages', () => {
    const {analysePiro, piroDetailLines} = load();
    const log = fakeLog(501, (i, t) => [t, 10, 0, Math.round(t / 1e6 * 3600), 0, 0, 0, 0]);
    const r = analysePiro(log, 0, 500000);
    assert.equal(r.wholeRevolutions, 0);
    assert.equal(r.tilt, undefined);
    const lines = piroDetailLines(r);
    assert.equal(lines.length, 2);
    assert.equal(lines[1].note, true);
});

test('a log without attitude is reported as unusable', () => {
    const {analysePiro} = load();
    const log = fakeLog(10, (i, t) => [t], ['time']);
    assert.equal(analysePiro(log, 0, 10000).ok, false);
});

test('the details are measurements only - no advice', () => {
    const {piroDetailLines} = load();
    const lines = piroDetailLines({
        ok: true, revolutions: 3.24, durationS: 2.1, yawRateDegS: 555, wholeRevolutions: 3,
        tilt: {roll: -0.84, pitch: 0.31, degrees: 0.9},
    }).map((l) => l.text);
    assert.deepEqual([...lines], [
        '3.2 turns · 2.1 s · 555°/s yaw',
        'Avg tilt 0.9° · left 0.8° · nose down 0.3°',
    ]);
    for (const line of lines) assert.doesNotMatch(line, /trim|add|should|adjust|suggest/i);
});
