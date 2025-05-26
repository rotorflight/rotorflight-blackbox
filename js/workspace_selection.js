"use strict";

function WorkspaceSelection(targetElem, workspaces, onSelectionChange, onSaveWorkspace) {
    var
        numberSpan = null,
        titleSpan = null,
        buttonElem = null,
        menuElem = null,
        editButton = null,
        workspaces = [],
        activeId = 1

    function buildUI() {

        buttonElem = $('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" id="workspace-menu"></button>');
        numberSpan = $('<span class="workspace-selector-index">');
        titleSpan = $('<span class="workspace-selector-title">');
        var caretElem = $('<span class="caret"></span>')

        editButton = $('<span class="glyphicon glyphicon-pencil workspace-selector-editButton" aria-hidden="true" data-toggle="tooltip" title="Edit Workspace Name"></span>');
        editButton.click(editTitle);
        editButton.tooltip({ trigger: "hover", placement: "auto bottom" });

        menuElem = $('<ul class="dropdown-menu pull-right" role="menu" aria-labelledby="workspace-menu"></ul>');

        targetElem.empty();
        targetElem.addClass("dropdown")
        targetElem.append(buttonElem);
        targetElem.append(menuElem);
        buttonElem.append(numberSpan);
        buttonElem.append(titleSpan);
        buttonElem.append(editButton);
        buttonElem.append(caretElem);

        buttonElem.dropdown(); // initialise dropdown
    }

    function editTitle(e) {
        buttonElem.dropdown("toggle"); // Hack to undrop
        editButton.hide();
        var inputElem = $('<input type="text" onkeyup="event.preventDefault()">');
        inputElem.click((e) => e.stopPropagation()); // Stop click from closing
        titleSpan.replaceWith(inputElem);
        inputElem.val(workspaces[activeId].title)
        inputElem.focus();
        inputElem.on('focusout', () => {
            inputElem.replaceWith(titleSpan);
            editButton.show();
            onSaveWorkspace(activeId, inputElem.val())
        });

        e.preventDefault();
    }

    const totalNumberOfWorkspaces = 21;

    function update() {
        menuElem.empty();
        for (let index = 1; index < totalNumberOfWorkspaces; index++) {
            let id = index;
            let element = workspaces[id];

            var item = $('<li></li>');
            var link = $('<a href="#"></a>')

            if (!element) {
                // item.addClass("disabled");
            }

            var number = $('<span class="workspace-selector-index">').text(id);
            var title = $('<span class="workspace-selector-title">')

            if (!element) {
                title.text("<empty>");
                title.addClass("faded");
            }
            else {
                title.text(element.title);
            }

            link.click((e) => {
                if (element) {
                    buttonElem.dropdown("toggle");
                    onSelectionChange(workspaces, id);
                    e.preventDefault();
                }
            });

            var actionButtons = $('<span class="pull-right"></span>');

            var saveButton = $('<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true" data-toggle="tooltip" title="Save current graph setup to this Workspace"></span>');
            saveButton.click((e) => {
                if (!element) {
                    onSaveWorkspace(id, "Unnamed");
                }
                else {
                    onSaveWorkspace(id, element.title);
                }
                e.preventDefault();
            });

            saveButton.tooltip({ trigger: "hover", placement: "auto bottom" });

            item.append(link);
            link.append(number);
            link.append(title);
            link.append(actionButtons);
            actionButtons.append(saveButton);
            item.toggleClass("active", id == activeId)
            menuElem.append(item);
        }

         // Add prebuilt/default workspaces to workspaces array
        DEFAULT_WORKSPACES.forEach((defWorkspace, index) => {
            workspaces[totalNumberOfWorkspaces+index] = {
            ...defWorkspace
            }
        });

        // Add prebuild workspaces with no save button as these are read only
        for (let index = totalNumberOfWorkspaces; index < totalNumberOfWorkspaces+DEFAULT_WORKSPACES.length ; index++) {
            //Add to menu item
            let element = DEFAULT_WORKSPACES[index-totalNumberOfWorkspaces];
            const item = $('<li></li>');
            const link = $('<a href="#"></a>')
            const number = $('<span class="workspace-selector-index">').text(index);
            const title = $('<span class="workspace-selector-title-preset">');
            title.text(element.title);
            link.click((e) => {
                if (element) {
                    buttonElem.dropdown("toggle");
                    onSelectionChange(workspaces, index);
                    e.preventDefault();
                }
            });
            item.append(link);
            link.append(number);
            link.append(title);
            menuElem.append(item);
        }

        if (workspaces[activeId]) {
            numberSpan.text(activeId);
            titleSpan.text(workspaces[activeId].title);
        }
        else {
            titleSpan.text("");
        }
    }


    this.setWorkspaces = function (newWorkspaces) {
        workspaces = newWorkspaces;
        update();
    }

    this.setActiveWorkspace = function (newId) {
        activeId = newId;
        update();
    }

    buildUI();
}