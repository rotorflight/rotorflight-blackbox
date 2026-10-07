"use strict";

/**
 * Open a Save As dialog before generating an export. Cancelling resolves to
 * null; choosing a file returns a target with an async write(blob). No file is
 * created or overwritten until write() is called.
 *
 * NW.js uses its native dialog and writes with Node's fs. A plain browser tab
 * has no require(), so it uses the File System Access API where available, or
 * a normal download of suggestedName otherwise (Firefox, Safari). Browsers only
 * open the picker shortly after a user gesture, so call this from the click or
 * key handler before doing any slow work.
 */
function pickSaveFile(options) {
    if (typeof require !== "function") {
        return pickBrowserSaveFile(options);
    }

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

function pickBrowserSaveFile(options) {
    function checkBlob(blob) {
        if (!blob) {
            throw new Error("The export did not produce a file.");
        }
    }

    if (typeof window.showSaveFilePicker !== "function") {
        return Promise.resolve({
            write: async function(blob) {
                checkBlob(blob);
                const anchor = document.createElement("a");
                anchor.download = options.suggestedName;
                anchor.href = window.URL.createObjectURL(blob);
                anchor.click();
                // Give the browser time to start the download before releasing the blob
                setTimeout(function() {
                    window.URL.revokeObjectURL(anchor.href);
                }, 10000);
            },
        });
    }

    const pickerOptions = {suggestedName: options.suggestedName};
    if (options.mimeType) {
        pickerOptions.types = [{
            description: options.description || options.extension,
            accept: {[options.mimeType]: [options.extension]},
        }];
    }

    return window.showSaveFilePicker(pickerOptions).then(function(fileHandle) {
        return {
            write: async function(blob) {
                checkBlob(blob);
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
            },
        };
    }, function(error) {
        // The user dismissing the picker isn't an error worth reporting
        if (error && error.name === "AbortError") {
            return null;
        }
        throw error;
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
