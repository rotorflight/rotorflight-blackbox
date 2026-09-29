"use strict";

function makeScreenshot() {
    let el = document.querySelector("#screenshot-frame"),
        now = new Date(),
        timestamp = "" + now.getFullYear() +
            ("00" + (now.getMonth() + 1)).slice(-2) +
            ("00" + now.getDate()).slice(-2) + "-" +
            ("00" + now.getHours()).slice(-2) +
            ("00" + now.getMinutes()).slice(-2) +
            ("00" + now.getSeconds()).slice(-2),
        defaultFilename = $(".log-filename").text().replace(".", "_") + "-"
            + timestamp + ".png";

    // Ask where to save before rendering the screenshot.
    pickSaveFile({
        suggestedName: defaultFilename,
        description: "PNG image",
        mimeType: "image/png",
        extension: ".png",
    }).then(target => {
        if (!target) {
            return;
        }

        return html2canvas(el)
            .then(canvas => new Promise(resolve => canvas.toBlob(resolve, "image/png")))
            .then(blob => target.write(blob));
    }).catch(error => reportSaveError(error));
}
