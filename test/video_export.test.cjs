const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup({target, fileSystem} = {}) {
    const calls = {frames: 0, errors: [], picker: null};
    let finish;
    const done = new Promise(resolve => { finish = resolve; });
    const $ = () => ({css: () => '0'});
    $.extend = Object.assign;
    const chrome = {runtime: {}, fileSystem};
    const context = vm.createContext({
        $, window: {chrome}, chrome, userSettings: {}, console, setTimeout,
        document: {
            createElement: () => ({appendChild() {}, getContext: () => ({})}),
        },
        FlightLogGrapher: function() { this.render = () => {}; },
        WebMWriter: function(options) {
            this.addFrame = () => { calls.frames++; };
            this.complete = () => Promise.resolve(options.fileWriter ? null : new Blob(['video']));
        },
        getLogBaseFilename: () => 'flight',
        pickSaveFile: options => { calls.picker = options; return Promise.resolve(target); },
        reportSaveError: error => calls.errors.push(error),
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/flightlog_video_renderer.js'), 'utf8'), context);
    const renderer = new context.FlightLogVideoRenderer(
        {getMinTime: () => 0, getMaxTime: () => 1000000},
        {}, {frameRate: 2, width: 16, height: 16, videoDim: 0},
        {onComplete: (success, frames) => finish({success, frames})}
    );
    return {renderer, calls, done};
}

test('video picker cancellation stops before any frames are rendered', async () => {
    const app = setup({target: null});
    app.renderer.start();
    assert.equal((await app.done).success, false);
    assert.equal(app.calls.frames, 0);
    assert.equal(app.calls.picker.suggestedName, 'flight.webm');
    assert.equal(app.calls.errors.length, 0);
});

test('video completion waits for the selected target to finish writing', async () => {
    let releaseWrite;
    const pendingWrite = new Promise(resolve => { releaseWrite = resolve; });
    let wrote = false;
    const app = setup({target: {write: async blob => {
        assert.equal(await blob.text(), 'video');
        await pendingWrite;
        wrote = true;
    }}});
    app.renderer.start();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(wrote, false);
    releaseWrite();
    assert.equal((await app.done).success, true);
    assert.equal(wrote, true);
    assert.equal(app.calls.frames, 2);
});

test('video write failure reports an error and does not report success', async () => {
    const app = setup({target: {write: () => Promise.reject(new Error('disk full'))}});
    app.renderer.start();
    assert.equal((await app.done).success, false);
    assert.equal(app.calls.errors[0].message, 'disk full');
});

test('native streaming picker cancellation without a file entry is handled', async () => {
    let suggestion;
    const app = setup({fileSystem: {chooseEntry(options, callback) {
        suggestion = options.suggestedName;
        callback(undefined);
    }}});
    app.renderer.start();
    assert.equal((await app.done).success, false);
    assert.equal(suggestion, 'flight.webm');
    assert.equal(app.calls.frames, 0);
    assert.equal(app.calls.errors.length, 0);
});
