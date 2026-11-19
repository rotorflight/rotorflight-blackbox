"use strict";

/**
 * HeadspeedDialog — the "HeadSpeed - Information" modal, opened with the J key.
 *
 * Shows the average, minimum and maximum headspeed over the part of the log
 * where the rotor is spinning (above ROTOR_SPINNING_RPM). Only the section
 * between the user's I/O marks is used when they are set. The IN/OUT times
 * shown are the first and last samples above the threshold inside that section.
 *
 * Min/max ignore spool-up and spool-down (otherwise min would just be the
 * threshold) and are taken from a short moving average so a single noisy
 * RPM sample doesn't set them.
 */
function HeadspeedDialog(dialog) {

    var ROTOR_SPINNING_RPM = 500;
    var SMOOTHING_WINDOW_S = 0.5;
    var SPOOLED_UP_FRACTION = 0.9; // of the average, to find the end of spool-up / start of spool-down

    var body = dialog.find(".headspeed-dialog-body");

    var lastLog = null, lastRange = null, lastResult = null;

    // J closes the dialog. The modal has tabindex="-1", so Bootstrap moves focus
    // into it when it opens and the main key handler (which ignores keys inside
    // modals) won't see the second J. The main handler's toggle() still covers
    // the case where focus has left the modal.
    dialog.on("keydown", function(e) {
        if (e.which === "J".charCodeAt(0) && !(e.altKey || e.shiftKey || e.ctrlKey || e.metaKey)) {
            dialog.modal("hide");
            e.preventDefault();
            // Focus is usually the modal element itself, which the main key
            // handler's "inside a modal" check doesn't catch (it only looks at
            // parents), so without this it would toggle the dialog open again.
            e.stopPropagation();
        }
    });

    function compute(flightLog, startTime, endTime, hasMarks) {
        var fieldIndex = flightLog.getMainFieldIndexByName("headspeed");
        if (fieldIndex === undefined) {
            return { error: "This log has no headspeed field." };
        }

        var timeFieldIndex = FlightLogParser.prototype.FLIGHT_LOG_FIELD_INDEX_TIME;
        var chunks = flightLog.getChunksInTimeRange(startTime, endTime);

        // Chunks cover whole I-frame intervals, so trim to the exact range.
        var times = [], speeds = [];
        for (var c = 0; c < chunks.length; c++) {
            var frames = chunks[c].frames;
            for (var f = 0; f < frames.length; f++) {
                var t = frames[f][timeFieldIndex];
                if (t < startTime || t > endTime) continue;
                times.push(t);
                speeds.push(frames[f][fieldIndex]);
            }
        }

        var first = -1, last = -1;
        for (var i = 0; i < speeds.length; i++) {
            if (speeds[i] > ROTOR_SPINNING_RPM) {
                if (first < 0) first = i;
                last = i;
            }
        }

        if (first < 0) {
            return { error: "The rotor never went above " + ROTOR_SPINNING_RPM + " rpm " +
                (hasMarks ? "in the selected range." : "in this log (no RPM source configured?).") };
        }

        // Time-weighted average over the samples above the threshold, between IN and OUT.
        var weightedSum = 0, totalTime = 0;
        for (i = first; i <= last; i++) {
            if (speeds[i] <= ROTOR_SPINNING_RPM) continue;
            var dt = (i < last ? times[i + 1] - times[i] : 0);
            if (dt <= 0 || dt > 1000000) dt = 0; // skip gaps between log segments
            weightedSum += speeds[i] * dt;
            totalTime += dt;
        }
        var average = totalTime > 0 ? weightedSum / totalTime : speeds[first];

        // Trim spool-up and spool-down for min/max.
        var spooledThreshold = average * SPOOLED_UP_FRACTION;
        var startIdx = first, endIdx = last;
        while (startIdx < last && speeds[startIdx] < spooledThreshold) startIdx++;
        while (endIdx > startIdx && speeds[endIdx] < spooledThreshold) endIdx--;

        // Moving average min/max over the spooled-up section.
        var windowUs = SMOOTHING_WINDOW_S * 1000000;
        var min = Infinity, max = -Infinity;
        var windowStart = startIdx, windowSum = 0;
        for (i = startIdx; i <= endIdx; i++) {
            windowSum += speeds[i];
            while (times[i] - times[windowStart] > windowUs) {
                windowSum -= speeds[windowStart];
                windowStart++;
            }
            if (times[i] - times[startIdx] < windowUs) continue; // wait until the first window is full
            var smoothed = windowSum / (i - windowStart + 1);
            if (smoothed < min) min = smoothed;
            if (smoothed > max) max = smoothed;
        }
        if (min === Infinity) { // section shorter than one window
            for (i = startIdx; i <= endIdx; i++) {
                min = Math.min(min, speeds[i]);
                max = Math.max(max, speeds[i]);
            }
        }

        var logStart = flightLog.getMinTime();
        return {
            average: average,
            min: min,
            max: max,
            durationS: totalTime / 1000000,
            inMs: (times[first] - logStart) / 1000,
            outMs: (times[last] - logStart) / 1000,
            hasMarks: hasMarks
        };
    }

    function tile(label, rpm) {
        return (
            '<div class="headspeed-tile">' +
                '<div class="headspeed-tile-label">' + label + '</div>' +
                '<div class="headspeed-tile-value">' + Math.round(rpm) + '</div>' +
                '<div class="headspeed-tile-unit">rpm</div>' +
                '<div class="headspeed-tile-hz">' + (rpm / 60).toFixed(1) + ' <span>Hz</span></div>' +
            '</div>'
        );
    }

    function render(result) {
        if (result.error) {
            body.html('<p class="headspeed-note">' + result.error + '</p>');
            return;
        }

        body.html(
            '<div class="headspeed-tiles">' +
                tile("Average", result.average) +
                tile("Min", result.min) +
                tile("Max", result.max) +
            '</div>' +
            '<p class="headspeed-note">Over ' + result.durationS.toFixed(1) + 's of flight with the rotor above ' +
                ROTOR_SPINNING_RPM + ' rpm, between IN ' + formatTime(result.inMs, true) +
                ' and OUT ' + formatTime(result.outMs, true) +
                (result.hasMarks ? ' (limited to the I/O marks)' : '') + '.</p>'
        );
    }

    function resolveRange(flightLog, inTime, outTime) {
        var minTime = flightLog.getMinTime(), maxTime = flightLog.getMaxTime();
        var start = inTime !== false && inTime !== undefined ? Math.max(minTime, Math.min(maxTime, inTime)) : minTime;
        var end = outTime !== false && outTime !== undefined ? Math.max(minTime, Math.min(maxTime, outTime)) : maxTime;
        if (start > end) { var swap = start; start = end; end = swap; }
        return { start: start, end: end, hasMarks: start !== minTime || end !== maxTime };
    }

    function isCached(flightLog, range) {
        return flightLog === lastLog && lastRange && range.start === lastRange.start && range.end === lastRange.end;
    }

    function computeAndCache(flightLog, range) {
        lastResult = compute(flightLog, range.start, range.end, range.hasMarks);
        lastLog = flightLog;
        lastRange = range;
        return lastResult;
    }

    /**
     * Headspeed stats between the I/O marks, from the cache when nothing has
     * changed. Runs synchronously. Returns average/min/max in rpm, or an
     * object with `error` set when there is no usable data.
     *
     * inTime / outTime are the I and O marks in log time (microseconds), or
     * false when not set.
     */
    this.getStats = function(flightLog, inTime, outTime) {
        var range = resolveRange(flightLog, inTime, outTime);
        return isCached(flightLog, range) ? lastResult : computeAndCache(flightLog, range);
    };

    /** Closes the dialog if it is open, otherwise shows it. */
    this.toggle = function(flightLog, inTime, outTime) {
        if (dialog.hasClass("in")) {
            dialog.modal("hide");
        } else {
            this.show(flightLog, inTime, outTime);
        }
    };

    this.show = function(flightLog, inTime, outTime) {
        if (!flightLog) return;

        var range = resolveRange(flightLog, inTime, outTime);

        if (!isCached(flightLog, range)) {
            body.html('<p class="headspeed-note">Reading headspeed&hellip;</p>');

            // Let the modal paint before the synchronous decode of the whole log.
            window.setTimeout(function() {
                render(computeAndCache(flightLog, range));
            }, 0);
        } else {
            render(lastResult);
        }

        dialog.modal("show");
    };
}
