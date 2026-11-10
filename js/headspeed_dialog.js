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
                (hasMarks ? "between the I and O marks." : "in this log (no RPM source configured?).") };
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

    /**
     * inTime / outTime are the I and O marks in log time (microseconds), or
     * false when not set.
     */
    this.show = function(flightLog, inTime, outTime) {
        if (!flightLog) return;

        var minTime = flightLog.getMinTime(), maxTime = flightLog.getMaxTime();
        var start = inTime !== false && inTime !== undefined ? Math.max(minTime, Math.min(maxTime, inTime)) : minTime;
        var end = outTime !== false && outTime !== undefined ? Math.max(minTime, Math.min(maxTime, outTime)) : maxTime;
        if (start > end) { var swap = start; start = end; end = swap; }
        var hasMarks = start !== minTime || end !== maxTime;

        var range = [start, end];

        if (flightLog !== lastLog || !lastRange || range[0] !== lastRange[0] || range[1] !== lastRange[1]) {
            body.html('<p class="headspeed-note">Reading headspeed&hellip;</p>');

            // Let the modal paint before the synchronous decode of the whole log.
            window.setTimeout(function() {
                lastResult = compute(flightLog, start, end, hasMarks);
                lastLog = flightLog;
                lastRange = range;
                render(lastResult);
            }, 0);
        } else {
            render(lastResult);
        }

        dialog.modal("show");
    };
}
