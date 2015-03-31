/*
 * Copyright 2000-2015 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Created by Semyon.Atamas on 3/31/2015.
 */

var resizableProjectTreeHolder = document.getElementById("examples-list-resizer");
var projectTreeDisplayButton = document.getElementById("accordion-display-button");
var gridElement = document.getElementById("g-grid");
var gridTopElement = document.getElementById("grid-top");
var fullscreenButton = document.getElementById("fullscreen-button");
var toolbox = document.getElementById("toolbox");
var argumentsButton = document.getElementById("argumentsButton");

projectTreeDisplayButton.onclick = function () {
    $(projectTreeDisplayButton).toggleClass("accordion-hidden");
    if ($(resizableProjectTreeHolder).is(":visible")) {
        $(resizableProjectTreeHolder).hide();
    } else {
        $(resizableProjectTreeHolder).show();
    }
    onAccordionResized();
    updateGridConfigurationInLocalStorage()
};

toolbox.style.minWidth = (function () {
    var childWidth = 0;
    $(toolbox).children().each(function () {
        childWidth = childWidth + $(this).outerWidth();
    });
    return (childWidth + 10) + "px";
})();

fullscreenButton.onclick = function () {

    if (isFullscreenMode()) {
        $("[fullscreen-sensible]").removeClass("fullscreen");
        $(this).find(".text").html("Expand");

        $(gridElement).css("height", "");
        $(gridTopElement).css("height", "");

        $("#grid-bottom").css("height", "");
        $("#result-tabs").css("height", "");
        $(".tab-space").css("height", "");

        $("#examples-list-resizer").css("width", "");
        if ($(resizableProjectTreeHolder).is(":visible")) {
            $("#workspace").css("margin-left", "");
        } else {
            $("#workspace").css("margin-left", 0);
        }
        editor.resize();
    } else {
        $("[fullscreen-sensible]").addClass("fullscreen");
        $(this).find(".text").html("Collapse");
        updateGridHeightFullscreen();
    }
    updateProjectTreeMaxWidth();
    updateGridConfigurationInLocalStorage();
};

window.onresize = function () {
    updateProjectTreeMaxWidth();
    if (isFullscreenMode()) {
        updateGridHeightFullscreen();
    }
};

$(resizableProjectTreeHolder).resizable({
    handles: "e",
    minWidth: 17,
    stop: updateGridConfigurationInLocalStorage,
    resize: onAccordionResized
});

function updateProjectTreeMaxWidth() {
    $(resizableProjectTreeHolder).resizable("option", "maxWidth", $("#grid-top").width() - parseInt(toolbox.style.minWidth));
}
updateProjectTreeMaxWidth();

function onAccordionResized() {
    if ($(resizableProjectTreeHolder).is(":visible")) {
        $("#workspace").css("margin-left", $(resizableProjectTreeHolder).outerWidth());
    } else {
        $("#workspace").css("margin-left", 0);
    }
}

$("#grid-bottom").resizable({
    handles: "n",
    minHeight: (function () {
        return $("#statusBarWrapper").outerHeight() + $(".result-tabs-footer").outerHeight();
    })(),
    start: function () {
        $(this).resizable({
            minHeight: (function () {
                return $("#statusBarWrapper").outerHeight() + $(".result-tabs-footer").outerHeight();
            })()
        });

        $(this).resizable({
            maxHeight: (function () {
                return $("#g-grid").height() - $(argumentsInputElement).outerHeight() - $("#toolbox").outerHeight();
            })()
        });
    },
    stop: updateGridConfigurationInLocalStorage,
    resize: onOutputViewResized
});

argumentsButton.onclick = function () {
    if ($(argumentsButton).hasClass("active")) {
        $(argumentsButton).removeClass("active");
        $(argumentsInputElement).hide();
    } else {
        $(argumentsButton).addClass("active");
        $(argumentsInputElement).show()
    }
    editor.resize();
    updateGridConfigurationInLocalStorage();
};

function onOutputViewResized() {
    $("#grid-bottom").css("top", "");
    $("#result-tabs").css("height", $("#grid-bottom").height() - $("#statusBarWrapper").outerHeight());
    $(".tab-space").css("height", $("#result-tabs").height() - $(".result-tabs-footer").outerHeight());

    var gridTopHeight;
    var gridTopElement = document.getElementById("grid-top");
    var gridHeight = $("#g-grid").height();
    gridTopHeight = gridHeight - $("#grid-bottom").outerHeight(true);
    gridTopHeight -= ($(gridTopElement).outerHeight(true) - $(gridTopElement).height());
    $(gridTopElement).css("height", gridTopHeight);
    editor.resize();
}

var gridConfiguration = localStorage.getItem("gridConfiguration");
if (gridConfiguration != null) {
    gridConfiguration = JSON.parse(gridConfiguration);
    if (gridConfiguration.fullscreenMode) fullscreenButton.click();
    if (!gridConfiguration.argumentsVisible) argumentsButton.click();
    if (!gridConfiguration.projectTreeVisible) projectTreeDisplayButton.click();
    $("#examples-list-resizer").width(gridConfiguration.examplesWidth);
    onAccordionResized();
    $("#grid-bottom").height(gridConfiguration.gridBottomHeight);
    onOutputViewResized();
}

function updateGridConfigurationInLocalStorage() {
    var gridConfiguration = {
        examplesWidth: $(resizableProjectTreeHolder).width(),
        gridBottomHeight: $("#grid-bottom").height(),
        fullscreenMode: isFullscreenMode(),
        argumentsVisible: $(argumentsInputElement).is(":visible"),
        projectTreeVisible: $(resizableProjectTreeHolder).is(":visible")
    };
    localStorage.setItem("gridConfiguration", JSON.stringify(gridConfiguration));
}

function updateGridHeightFullscreen() {
    var gridHeight;
    gridHeight = $(".global-layout").height() - $(".global-toolbox").outerHeight(true);
    gridHeight -= ($(gridElement).outerHeight(true) - $(gridElement).height());
    $(gridElement).css("height", gridHeight);

    var gridTopHeight;
    gridTopHeight = gridHeight - $("#statusBarWrapper").outerHeight(true) - $("#result-tabs").outerHeight();
    gridTopHeight -= ($(gridTopElement).outerHeight(true) - $(gridTopElement).height());
    $(gridTopElement).css("height", gridTopHeight);
    editor.resize();
}

function isFullscreenMode() {
    return $(fullscreenButton).hasClass("fullscreen");
}

editor.resize();