"use strict";

// The piro wobble plot: a top-down view of where the bottom of the heli's mast swings through the
// piro section (P key, see piro_wobble.js), with the section's measurements underneath. It has its
// own 2D canvas, which grapher.js places directly under the craft while the section is on screen.
//
// The plot is in the craft view's frame (right = the viewer's right, up = away from the viewer):
// the dot is where the bottom of the mast has swung to, so it moves the opposite way to the rotor
// head's lean.

const PIRO_MAX_DEGREES = 6; // Outer ring.
const PIRO_RING_DEGREES = [2, 4, 6];
const PIRO_CLAMP = 1.15; // Leans beyond the outer ring are pinned just outside it.
const PIRO_TRAIL_RGB = "128, 177, 211";
const PIRO_ARROW_COLOR = "#ffed6f";
const PIRO_POINT_COLOR = "#5aa9ff"; // the mast's blue on the 3D craft
const PIRO_NOTE_COLOR = "#fdb462";
const PIRO_TRAIL_FADE_US = 4e6; // The trail fades over this long, down to PIRO_TRAIL_MIN_ALPHA.
const PIRO_TRAIL_MIN_ALPHA = 0.25;
const PIRO_OPEN_SECTION_LOOKAHEAD_US = 5e6;

/**
 * Where the nose points on the plot for a model yaw (wrapper rotation.y). At 0 the model shows
 * its tail to the viewer, so the nose points away - up on the plot - and a positive yaw turns it
 * to the left. Canvas coordinates: +x right, +y down.
 */
function piroHeadingOnPlot(yaw) {
    return { x: -Math.sin(yaw), y: -Math.cos(yaw) };
}

/**
 * The measurement lines under the plot, as [{ text, note }]: `note` lines are drawn in orange.
 */
function piroDetailLines(result) {
    if (result.gap) {
        return [
            { text: `${result.durationS.toFixed(1)} s` },
            { text: "Logging gap in the section - no turn figures", note: true },
        ];
    }
    const lines = [{
        text: `${result.revolutions.toFixed(1)} turns · ${result.durationS.toFixed(1)} s · ` +
            `${result.yawRateDegS.toFixed(0)}°/s yaw`,
    }];
    if (!result.tilt) {
        lines.push({ text: "Under one full turn - no averages", note: true });
        return lines;
    }
    const t = result.tilt;
    lines.push({
        text: `Avg tilt ${t.degrees.toFixed(1)}° · ${t.roll >= 0 ? "right" : "left"} ${Math.abs(t.roll).toFixed(1)}°` +
            ` · ${t.pitch >= 0 ? "nose down" : "nose up"} ${Math.abs(t.pitch).toFixed(1)}°`,
    });
    return lines;
}

/**
 * The heli's current position: a blue dot on the exact point, over an arrow pointing where the
 * nose points, with the arrow's middle (half way from tip to tail) under the dot.
 */
function drawPiroHeadingArrow(ctx, pointX, pointY, yaw, length) {
    const heading = piroHeadingOnPlot(yaw);
    const ux = heading.x, uy = heading.y;
    const px = -uy, py = ux; // perpendicular
    const half = length / 2, wing = length * 0.38;
    // Tail: a short shaft back from the head's notch, outlined like the head.
    const tailFrom = half * 0.45, tailTo = half + length * 0.55;
    // The head is built around (x, y); shift it so tip-to-tail is centred on the point.
    const shift = (tailTo - half) / 2;
    const x = pointX + ux * shift, y = pointY + uy * shift;
    ctx.save();
    ctx.lineCap = "round";
    [["black", Math.max(4, length * 0.22)], [PIRO_ARROW_COLOR, Math.max(2, length * 0.13)]].forEach(([style, width]) => {
        ctx.strokeStyle = style;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x - ux * tailFrom, y - uy * tailFrom);
        ctx.lineTo(x - ux * tailTo, y - uy * tailTo);
        ctx.stroke();
    });
    ctx.lineCap = "butt";
    ctx.fillStyle = PIRO_ARROW_COLOR;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + ux * half, y + uy * half); // tip
    ctx.lineTo(x - ux * half + px * wing, y - uy * half + py * wing);
    ctx.lineTo(x - ux * half * 0.45, y - uy * half * 0.45); // notch
    ctx.lineTo(x - ux * half - px * wing, y - uy * half - py * wing);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PIRO_POINT_COLOR;
    ctx.beginPath();
    ctx.arc(pointX, pointY, Math.max(2.5, length * 0.14), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function PiroWobblePlot(flightLog, canvas) {
    const ctx = canvas.getContext("2d");
    const attitude = [0, 1, 2].map((i) => flightLog.getMainFieldIndexByName(`attitude[${i}]`));
    const hasAttitude = attitude.every((i) => typeof i === "number");

    let cssSize = 0;
    let trace = null, traceKey = null, traceEnd = 0;
    let detailKey = null, detailLines = [];

    this.hasData = () => hasAttitude;

    this.resize = function (size) {
        const dpr = window.devicePixelRatio || 1;
        cssSize = Math.max(1, Math.round(size));
        canvas.style.width = `${cssSize}px`;
        canvas.style.height = `${cssSize}px`;
        canvas.width = Math.round(cssSize * dpr);
        canvas.height = Math.round(cssSize * dpr);
    };

    function ensureTrace(section, time) {
        const open = section.end == null;
        const key = `${section.start}|${section.end}`;
        if (key !== traceKey || (open && time > traceEnd)) {
            traceEnd = open ? Math.max(time, section.start) + PIRO_OPEN_SECTION_LOOKAHEAD_US : section.end;
            trace = buildPiroTrace(flightLog, section.start, traceEnd);
            traceKey = key;
        }
        return trace;
    }

    // The section's measurements, worked out once per section.
    function details(section) {
        if (section.end == null) return [{ text: "Press P to end the section" }];
        const key = `${section.start}|${section.end}`;
        if (key !== detailKey) {
            detailKey = key;
            detailLines = piroDetailLines(analysePiro(flightLog, section.start, section.end));
        }
        return detailLines;
    }

    /**
     * @param {{start: number, end: number|null}} section
     * @param {number} time - the cursor's log time
     * @param {Array|null} frame - the frame at the cursor, for the current lean
     */
    this.draw = function (section, time, frame) {
        const dpr = canvas.width / (cssSize || 1);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const w = cssSize, h = cssSize;
        ctx.clearRect(0, 0, w, h);
        if (!hasAttitude) return;

        const font = Math.min(13, Math.max(9, Math.round(w / 30)));
        const headerH = font * 1.9;
        const lines = details(section);
        const footerH = font * (2.2 + 1.3 * lines.length);
        // The plot uses the whole square; the title and details are drawn over it, so the plot's
        // size never depends on how much text there is.
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.max(10, Math.min(w, h) / 2 - font * 0.8);
        const k = radius / PIRO_MAX_DEGREES;
        // Leans beyond the outer ring are pinned just outside it - but never so far out that the
        // current dot and its arrow (centred on the point) would run off the canvas.
        const markerLength = Math.max(12, font * 1.8);
        const pinRadius = Math.max(0, Math.min(radius * PIRO_CLAMP, Math.min(w, h) / 2 - markerLength * 0.8 - 2));
        const toXY = (x, y) => {
            // x, y: the rotor head's lean; the mast's bottom swings the other way.
            const r = Math.hypot(x, y) * k;
            const s = r > pinRadius ? pinRadius / r : 1;
            return [cx - x * k * s, cy + y * k * s];
        };
        // White Verdana with a black outline, so it reads over the craft window's backdrop.
        const label = (text, x, y, align, scale, color) => {
            ctx.save();
            ctx.font = `${Math.round(font * (scale || 1))}px Verdana, Arial, sans-serif`;
            ctx.textAlign = align;
            ctx.textBaseline = "middle";
            ctx.shadowColor = "black";
            ctx.shadowBlur = 3;
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            const maxWidth = Math.max(1, w - x - font * 0.5);
            ctx.strokeText(text, x, y, maxWidth);
            ctx.fillStyle = color || "rgba(255,255,255,0.9)";
            ctx.fillText(text, x, y, maxWidth);
            ctx.restore();
        };

        // Rings and crosshair
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - radius, cy);
        ctx.lineTo(cx + radius, cy);
        ctx.moveTo(cx, cy - radius);
        ctx.lineTo(cx, cy + radius);
        ctx.stroke();
        PIRO_RING_DEGREES.forEach((deg) => {
            const r = deg * k;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            label(`${deg}°`, cx + r * Math.SQRT1_2 + 2, cy + r * Math.SQRT1_2 + 2, "left", 0.8);
        });

        // Trail up to the cursor
        const t = ensureTrace(section, time);
        const count = piroTraceCountAt(t.times, time);
        ctx.lineWidth = 1.5;
        // The peak comes from every logged frame, not the thinned trail, so no sample is missed.
        let maxLean = piroPeakAt(t, time);
        for (let i = 1; i < count; i++) {
            const alpha = Math.max(PIRO_TRAIL_MIN_ALPHA, 1 - (time - t.times[i]) / PIRO_TRAIL_FADE_US);
            const [x0, y0] = toXY(t.x[i - 1], t.y[i - 1]);
            const [x1, y1] = toXY(t.x[i], t.y[i]);
            ctx.strokeStyle = `rgba(${PIRO_TRAIL_RGB}, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
        }

        // Current lean - only while the cursor is inside the section
        const inside = time >= section.start && (section.end == null || time <= section.end);
        let nowText = inside ? "" : time < section.start ? "Before the section" : "After the section";
        if (inside && frame) {
            const r = piroAttitudeToModelRotation(frame[attitude[0]], frame[attitude[1]], frame[attitude[2]]);
            const lean = piroMastLean(r.roll, r.pitch, r.yaw);
            const [dx, dy] = toXY(lean.x, lean.y);
            drawPiroHeadingArrow(ctx, dx, dy, r.yaw, markerLength);
            nowText = `Lean now ${lean.degrees.toFixed(1)}°`;
            maxLean = Math.max(maxLean, lean.degrees);
        }

        // Title and details, over the plot
        label("Piro wobble", font * 0.5, headerH / 2, "left");
        const footerTop = h - footerH;
        label(`${nowText}${nowText ? " · " : ""}max ${maxLean.toFixed(1)}°`, font * 0.5, footerTop + font, "left");
        lines.forEach((line, i) => {
            label(line.text, font * 0.5, footerTop + font * (2.3 + 1.3 * i), "left", 1, line.note ? PIRO_NOTE_COLOR : null);
        });
    };
}
