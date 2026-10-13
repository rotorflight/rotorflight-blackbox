"use strict";

/**
 * A lightweight right-click menu.
 *
 * ContextMenu.show(items, pageX, pageY) where each item is one of:
 *     {header: "text"}
 *     {divider: true}
 *     {label: "text", shortcut: "I", action: function() {...}, disabled: false}
 *
 * The menu closes on selection, Escape, scrolling, resizing or clicking elsewhere.
 */
const ContextMenu = (function() {
    let menu = null;
    let bindTimer = null;
    let previousFocus = null;

    function close() {
        clearTimeout(bindTimer);
        if (menu) {
            menu.remove();
            menu = null;
        }

        $(document).off(".rfContextMenu");
        $(window).off(".rfContextMenu");
        if (previousFocus && document.contains(previousFocus)) previousFocus.focus();
        previousFocus = null;
    }

    function show(items, pageX, pageY) {
        close();

        previousFocus = document.activeElement;
        menu = $('<ul class="dropdown-menu rf-context-menu" role="menu" tabindex="-1" aria-label="Graph actions"></ul>');

        items.forEach(function(item) {
            if (item.divider) {
                menu.append('<li class="divider" role="separator"></li>');
            } else if (item.header) {
                menu.append($('<li class="dropdown-header"></li>').text(item.header));
            } else {
                let
                    li = $('<li role="presentation"></li>'),
                    a = $('<a href="#" role="menuitem"></a>');

                a.append($('<span class="rf-context-menu-label"></span>').text(item.label));

                if (item.shortcut) {
                    a.append($('<kbd class="rf-context-menu-shortcut"></kbd>').text(item.shortcut));
                }

                if (item.disabled) {
                    li.addClass("disabled");
                    a.attr({"aria-disabled": "true", tabindex: "-1"});
                }

                a.on("click", function(e) {
                    e.preventDefault();

                    if (!item.disabled) {
                        close();
                        item.action();
                    }
                });

                menu.append(li.append(a));
            }
        });

        menu.css({display: "block", visibility: "hidden", left: 0, top: 0}).appendTo("body");

        // Keep the menu on screen, opening up/left from the cursor when it would overflow
        let
            width = menu.outerWidth(),
            height = menu.outerHeight(),
            viewLeft = $(window).scrollLeft(),
            viewTop = $(window).scrollTop(),
            left = pageX,
            top = pageY;

        if (left + width > viewLeft + $(window).width() - 4) {
            left = Math.max(viewLeft + 4, pageX - width);
        }
        if (top + height > viewTop + $(window).height() - 4) {
            top = Math.max(viewTop + 4, pageY - height);
        }

        menu.css({left: left, top: top, visibility: "visible"});

        menu.on("keydown", function(e) {
            // Keep menu navigation from also triggering the graph's keyboard shortcuts.
            e.stopPropagation();
            const links = menu.find("li:not(.disabled) > a");
            const index = links.index(document.activeElement);
            if (e.key === "Escape") {
                e.preventDefault();
                close();
            } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const step = e.key === "ArrowDown" ? 1 : -1;
                if (links.length) links.eq((index + step + links.length) % links.length).focus();
            } else if (e.key === "Tab") {
                close();
            }
        });
        menu.focus();

        // Defer so the click/contextmenu that opened the menu doesn't immediately close it
        bindTimer = setTimeout(function() {
            $(document).on("mousedown.rfContextMenu contextmenu.rfContextMenu", function(e) {
                if (!menu || !$.contains(menu[0], e.target)) {
                    close();
                }
            });
            $(document).on("keydown.rfContextMenu", function(e) {
                if (e.key === "Escape") {
                    close();
                }
            });
            $(window).on("resize.rfContextMenu blur.rfContextMenu wheel.rfContextMenu", close);
        }, 0);
    }

    return {
        show: show,
        close: close,
    };
})();
