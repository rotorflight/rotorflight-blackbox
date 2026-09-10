'use strict';

function CraftConfigDialog(dialog, craftConfig, onConfigChanged) {

    var emptyElem      = $(".craft-config-empty", dialog);
    var detailsElem     = $(".craft-config-details", dialog);
    var nameElem        = $(".craft-config-craft-name", dialog);
    var fileElem        = $(".craft-config-file-name", dialog);
    var loadedElem       = $(".craft-config-loaded-at", dialog);
    var countElem       = $(".craft-config-setting-count", dialog);
    var filterElem       = $(".craft-config-filter", dialog);
    var listElem        = $(".craft-config-list", dialog);
    var errorElem        = $(".craft-config-error", dialog);
    var chooseButton     = $(".craft-config-choose-file", dialog);
    var clearButton      = $(".craft-config-clear", dialog);
    var fileInput        = $(".craft-config-file-input", dialog);

    function renderList(filter) {
        var lines = craftConfig.getLines();

        listElem.empty();

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            if (!filter) {
                if (line.length === 0) continue;
                listElem.append($('<li class="configuration-row"></li>').text(line));
                continue;
            }

            var idx = line.toLowerCase().indexOf(filter.toLowerCase());
            if (idx === -1) continue;

            var li = $('<li class="configuration-row"></li>');
            li.text(line.substring(0, idx));
            li.append($('<b></b>').text(line.substr(idx, filter.length)));
            li.append(document.createTextNode(line.substring(idx + filter.length)));
            listElem.append(li);
        }
    }

    function render() {
        var has = craftConfig.hasConfig();

        emptyElem.toggle(!has);
        detailsElem.toggle(has);

        if (!has) return;

        nameElem.text(craftConfig.getCraftName() || '(unnamed craft)');
        fileElem.text(craftConfig.getFileName());
        loadedElem.text(craftConfig.getLoadedAt() ? new Date(craftConfig.getLoadedAt()).toLocaleString() : '-');
        countElem.text(Object.keys(craftConfig.getSettings()).length);

        renderList(filterElem.val());
    }

    chooseButton.click(function(e) {
        e.preventDefault();
        fileInput.click();
    });

    fileInput.change(function(e) {
        var file = e.target.files[0];
        fileInput.val('');

        if (!file) return;

        craftConfig.loadFile(file, function(err) {
            if (err) {
                errorElem.text('Could not load file: ' + err.message).show();
                return;
            }

            errorElem.hide();
            render();

            if (onConfigChanged) onConfigChanged();

            dialog.modal('hide');
        });
    });

    clearButton.click(function(e) {
        e.preventDefault();

        craftConfig.clear();
        render();

        if (onConfigChanged) onConfigChanged();
    });

    filterElem.on('keyup', function() {
        renderList(filterElem.val());
    });

    this.show = function() {
        errorElem.hide().text('');
        render();

        dialog.modal('show');
    };
}
