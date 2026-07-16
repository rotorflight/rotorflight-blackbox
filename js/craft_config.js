'use strict';

/**
 * CraftConfig
 *
 * Loads and parses a Rotorflight CLI "dump all" / "diff all" export, and persists the
 * parsed result via PrefStorage so it survives switching between flight logs and app restarts.
 */
function CraftConfig(prefs) {

    var that = this;

    var fileName = null;
    var loadedAt = null;
    var parsed = CraftConfig.emptyParsed();

    function persist() {
        prefs.set('craftConfig', {
            fileName: fileName,
            loadedAt: loadedAt,
            parsed: parsed,
        });
    }

    this.loadFile = function(file, onLoaded) {
        var reader = new FileReader();

        reader.onload = function(e) {
            fileName = file.name;
            loadedAt = Date.now();
            parsed = CraftConfig.parseText(e.target.result);

            persist();

            if (onLoaded) onLoaded(null, that);
        };

        reader.onerror = function() {
            if (onLoaded) onLoaded(new Error('Could not read file'), null);
        };

        reader.readAsText(file);
    };

    this.loadFromCache = function(onLoaded) {
        prefs.get('craftConfig', function(item) {
            if (item) {
                fileName = item.fileName;
                loadedAt = item.loadedAt;
                parsed = item.parsed || CraftConfig.emptyParsed();
            }

            if (onLoaded) onLoaded();
        });
    };

    this.clear = function() {
        fileName = null;
        loadedAt = null;
        parsed = CraftConfig.emptyParsed();

        prefs.set('craftConfig', null);
    };

    this.hasConfig = function() {
        return fileName !== null;
    };

    this.getFileName = function() {
        return fileName;
    };

    this.getLoadedAt = function() {
        return loadedAt;
    };

    this.getCraftName = function() {
        return parsed.craftName;
    };

    this.getSettings = function() {
        return parsed.settings;
    };

    this.getCommands = function() {
        return parsed.commands;
    };

    this.getLines = function() {
        return parsed.lines;
    };

    /**
     * Motor RPM = main rotor RPM * this ratio, per `set main_rotor_gear_ratio = <a>,<b>` (ratio is b/a).
     * Returns null if the setting isn't present or isn't parseable.
     */
    this.getMainRotorGearRatio = function() {
        return CraftConfig.parseGearRatio(parsed.settings['main_rotor_gear_ratio']);
    };

    /**
     * Tail rotor RPM = main rotor RPM * this ratio, per `set tail_rotor_gear_ratio = <a>,<b>` (ratio is b/a).
     * Returns null if the setting isn't present or isn't parseable.
     */
    this.getTailRotorGearRatio = function() {
        return CraftConfig.parseGearRatio(parsed.settings['tail_rotor_gear_ratio']);
    };
}

CraftConfig.emptyParsed = function() {
    return { craftName: null, settings: {}, commands: {}, lines: [] };
};

/**
 * Parses a `<a>,<b>` gear ratio setting value (e.g. "15,137") into the multiplier b/a,
 * or null if the value is missing or not in that format.
 */
CraftConfig.parseGearRatio = function(rawValue) {
    if (!rawValue) return null;

    var parts = rawValue.split(',');
    if (parts.length !== 2) return null;

    var a = parseFloat(parts[0]);
    var b = parseFloat(parts[1]);

    if (!isFinite(a) || !isFinite(b) || a === 0) return null;

    return b / a;
};

/**
 * Parses the text of a Rotorflight/Betaflight CLI "dump all" or "diff all" export.
 *
 * `set key = value` lines populate `settings` (keyed lowercase). Every other bare CLI
 * command (name, mixer_type, feature, aux, mmix, smix, ...) is grouped by command name into
 * `commands`, since a fixed schema can't anticipate every field a future feature might need.
 */
CraftConfig.parseText = function(text) {
    var lines = text.split('\n').map(function(line) {
        return line.replace(/\r$/, '');
    });

    var settings = {};
    var commands = {};
    var craftName = null;

    lines.forEach(function(rawLine) {
        var line = rawLine.trim();

        if (!line || line.charAt(0) === '#') return;

        var setMatch = line.match(/^set\s+([\w.\-]+)\s*=\s*(.+)$/i);
        if (setMatch) {
            var setKey = setMatch[1].toLowerCase();
            var setValue = setMatch[2].trim();
            settings[setKey] = setValue;

            if (setKey === 'name' && setValue) {
                craftName = setValue.replace(/^"(.*)"$/, '$1');
            }

            return;
        }

        var spaceIndex = line.search(/\s/);
        var cmd = (spaceIndex === -1 ? line : line.substring(0, spaceIndex)).toLowerCase();
        var args = spaceIndex === -1 ? '' : line.substring(spaceIndex + 1).trim();

        if (!commands[cmd]) commands[cmd] = [];
        commands[cmd].push(args);

        if (cmd === 'name' && args) {
            craftName = args.replace(/^"(.*)"$/, '$1');
        }
    });

    return { craftName: craftName, settings: settings, commands: commands, lines: lines };
};
