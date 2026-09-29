"use strict";

/**
 * FlightAnalysisDialog — the "Flight Analysis" modal.
 *
 * Follows the same constructor pattern as HeaderDialog / UserSettingsDialog:
 * built once against a jQuery-wrapped modal element, exposes a `show(flightLog)`
 * method the nav button click handler calls (see js/main.js).
 */
function FlightAnalysisDialog(dialog) {

    var body = dialog.find("#flightAnalysisBody");

    var lastLog = null, lastRange = null, lastResult = null;

    var STATUS_LABEL = { good: "Looks good", watch: "Worth watching", attention: "Needs attention", info: "Findings" };

    var LAB_ORDER = [
        { key: "governor", title: "Headspeed / Governor" },
        { key: "esc", title: "Power / ESC" },
        { key: "battery", title: "Battery" },
        { key: "vibration", title: "Vibration" },
        { key: "pid", title: "PID Tracking" }
    ];

    function escapeHtml(text) {
        return String(text === undefined || text === null ? "" : text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function formatSeconds(seconds) {
        if (!seconds) return "0s";
        return seconds >= 60 ? (seconds / 60).toFixed(1) + " min" : seconds.toFixed(0) + "s";
    }

    function renderContext(result) {
        var ctx = result.context;
        return (
            '<div class="flight-analysis-context">' +
                '<span><strong>' + escapeHtml(ctx.craftName) + '</strong></span>' +
                (ctx.firmwareVersion ? '<span>Firmware ' + escapeHtml(ctx.firmwareVersion) + '</span>' : "") +
                '<span>Flight length ' + formatSeconds(ctx.durationSeconds) + '</span>' +
                '<span>' + formatSeconds(ctx.stableSeconds) + ' identified as steady flight</span>' +
            '</div>' +
            (ctx.capped
                ? '<p class="flight-analysis-capped-note">This flight is long enough that analysing all of it would take several minutes ' +
                  'to decode, so this covers the steadiest ' + formatSeconds(ctx.analyzedSeconds) + ' found rather than the whole flight.</p>'
                : "")
        );
    }

    function renderVerdict(result) {
        var verdict = result.verdict;

        var cardsHtml = verdict.cards.map(function(card) {
            return (
                '<div class="flight-analysis-card status-' + card.status + '">' +
                    '<div class="flight-analysis-card-top">' +
                        '<span class="flight-analysis-card-title">' + escapeHtml(card.title) + '</span>' +
                        '<span class="flight-analysis-card-status">' + STATUS_LABEL[card.status] + '</span>' +
                    '</div>' +
                    '<div class="flight-analysis-card-headline">' + escapeHtml(card.headline) + '</div>' +
                    (card.action && card.status !== "good" ? '<div class="flight-analysis-card-action"><strong>Suggestion:</strong> ' + escapeHtml(card.action) + '</div>' : "") +
                '</div>'
            );
        }).join("");

        return (
            '<section class="flight-analysis-verdict">' +
                '<h4>Verdict</h4>' +
                '<p class="flight-analysis-summary">' + escapeHtml(verdict.summary) + '</p>' +
                (cardsHtml ? '<div class="flight-analysis-cards">' + cardsHtml + '</div>' : "") +
            '</section>'
        );
    }

    function renderLabSection(title, lab) {
        if (!lab) return "";

        if (lab.status === "insufficient") {
            return (
                '<section class="flight-analysis-lab status-insufficient">' +
                    '<h4>' + escapeHtml(title) + '</h4>' +
                    '<p class="flight-analysis-lab-story flight-analysis-lab-insufficient">' + escapeHtml(lab.story) + '</p>' +
                '</section>'
            );
        }

        var tilesHtml = (lab.metrics || []).map(function(metric) {
            return (
                '<div class="flight-analysis-tile">' +
                    '<div class="flight-analysis-tile-label">' + escapeHtml(metric.label) + '</div>' +
                    '<div class="flight-analysis-tile-value">' + escapeHtml(metric.value) + '</div>' +
                '</div>'
            );
        }).join("");

        return (
            '<section class="flight-analysis-lab status-' + lab.status + '">' +
                '<h4>' + escapeHtml(title) + ' <span class="flight-analysis-lab-status">' + STATUS_LABEL[lab.status] + '</span></h4>' +
                '<p class="flight-analysis-lab-story">' + escapeHtml(lab.story) + '</p>' +
                (tilesHtml ? '<div class="flight-analysis-tiles">' + tilesHtml + '</div>' : "") +
            '</section>'
        );
    }

    function render(result) {
        var html = renderContext(result) + renderVerdict(result);

        for (var i = 0; i < LAB_ORDER.length; i++) {
            html += renderLabSection(LAB_ORDER[i].title, result.labs[LAB_ORDER[i].key]);
        }

        body.html(html);
    }

    this.show = function(flightLog) {
        if (!flightLog) return;

        var range = [flightLog.getMinTime(), flightLog.getMaxTime()];

        if (flightLog !== lastLog || !lastRange || range[0] !== lastRange[0] || range[1] !== lastRange[1]) {
            body.html('<p class="flight-analysis-loading">Analysing flight&hellip;</p>');

            // Give the modal a frame to paint the loading message before the
            // (synchronous) analysis runs.
            window.setTimeout(function() {
                lastResult = FlightAnalysis.build(flightLog);
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
