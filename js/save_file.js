"use strict";

/**
 * Open NW.js's native Save As dialog before generating an export. Cancelling
 * resolves to null; choosing a file returns a target with an async write(blob).
 * No file is created or overwritten until write() is called.
 */
function pickSaveFile(options) {
    return new Promise(function(resolve, reject) {
        const input = document.createElement("input");
        input.type = "file";
        input.style.display = "none";
        input.setAttribute("nwsaveas", options.suggestedName);
        input.setAttribute("accept", options.extension);

        function cleanup() {
            input.remove();
        }

        input.addEventListener("cancel", function() {
            cleanup();
            resolve(null);
        }, {once: true});
        input.addEventListener("change", function() {
            const filename = input.value;
            cleanup();
            if (!filename) {
                resolve(null);
                return;
            }
            resolve({
                write: async function(blob) {
                    if (!blob) {
                        throw new Error("The export did not produce a file.");
                    }
                    const fs = require("fs").promises;
                    const buffer = require("buffer").Buffer.from(await blob.arrayBuffer());
                    await fs.writeFile(filename, buffer);
                },
            });
        }, {once: true});

        document.body.appendChild(input);
        try {
            input.click();
        } catch (error) {
            cleanup();
            reject(error);
        }
    });
}

function getLogBaseFilename(fallback) {
    const logFilename = $(".log-filename").text().trim();
    return logFilename ? logFilename.replace(/\.[^.]*$/, "") : fallback;
}

function reportSaveError(error) {
    console.error(error);
    alert("Unable to save the export:\n\n" + (error.message || error));
}
