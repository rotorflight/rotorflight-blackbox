const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

function setup() {
    let input;
    const context = vm.createContext({
        require, console, alert() {},
        $: () => ({text: () => 'flight.test.bbl'}),
        document: {
            createElement() {
                const listeners = {};
                input = {
                    style: {}, attributes: {}, value: '', removed: false,
                    setAttribute(name, value) { this.attributes[name] = value; },
                    addEventListener(name, callback) { listeners[name] = callback; },
                    remove() { this.removed = true; },
                    click() { this.clicked = true; },
                    emit(name) { listeners[name](); },
                };
                return input;
            },
            body: {appendChild() {}},
        },
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/save_file.js'), 'utf8'), context);
    return {context, get input() { return input; }};
}

test('save dialog uses the suggested filename and cancellation does not produce a target', async () => {
    const app = setup();
    const pending = app.context.pickSaveFile({suggestedName: 'flight.csv', extension: '.csv'});
    assert.equal(app.input.attributes.nwsaveas, 'flight.csv');
    assert.equal(app.input.attributes.accept, '.csv');
    assert.equal(app.input.clicked, true);
    app.input.emit('cancel');
    assert.equal(await pending, null);
    assert.equal(app.input.removed, true);
});

test('selection leaves existing files untouched until data is ready, then replaces all contents', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rf-save-'));
    const filename = path.join(directory, 'flight.csv');
    try {
        fs.writeFileSync(filename, 'existing data longer than replacement');
        const app = setup();
        const pending = app.context.pickSaveFile({suggestedName: 'flight.csv', extension: '.csv'});
        app.input.value = filename;
        app.input.emit('change');
        const target = await pending;
        assert.equal(fs.readFileSync(filename, 'utf8'), 'existing data longer than replacement');
        await target.write(new Blob(['time,gyro\n1,2\n']));
        assert.equal(fs.readFileSync(filename, 'utf8'), 'time,gyro\n1,2\n');
        assert.equal(app.input.removed, true);
    } finally {
        fs.rmSync(directory, {recursive: true, force: true});
    }
});

test('empty selection cancels and write failures propagate to the caller', async () => {
    const app = setup();
    let pending = app.context.pickSaveFile({suggestedName: 'shot.png', extension: '.png'});
    app.input.emit('change');
    assert.equal(await pending, null);
    pending = app.context.pickSaveFile({suggestedName: 'shot.png', extension: '.png'});
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rf-save-'));
    try {
        app.input.value = directory; // A directory cannot be replaced by a file.
        app.input.emit('change');
        const target = await pending;
        await assert.rejects(target.write(new Blob(['image'])), /EISDIR|EPERM|EACCES/);
        await assert.rejects(target.write(null), /did not produce a file/);
    } finally {
        fs.rmSync(directory, {recursive: true, force: true});
    }
    assert.equal(app.context.getLogBaseFilename('log'), 'flight.test');
});
