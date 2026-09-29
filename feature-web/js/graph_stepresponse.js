"use strict";

function FlightLogStepResponse(flightLog, canvas, stepResponseCanvas) {

const
        STEP_RESPONSE_LARGE_LEFT_MARGIN    = 10,
        STEP_RESPONSE_LARGE_TOP_MARGIN     = 10,
        STEP_RESPONSE_LARGE_HEIGHT_MARGIN  = 20,
        STEP_RESPONSE_LARGE_WIDTH_MARGIN   = 20;

var
    that = this,

    isFullscreen = false,

    dataReload = true,

    stepResponseData = null,

    prefs = new PrefStorage();

    try {

        var stepResponsePanelElem = $(stepResponseCanvas).parent();

        StepResponseCalc.initialize(flightLog, flightLog.getSysConfig());
        StepResponsePlot.initialize(stepResponseCanvas, flightLog.getSysConfig());

        userSettings.stepResponseAxes = userSettings.stepResponseAxes || { roll: true, pitch: true, yaw: true };
        for (const axis in userSettings.stepResponseAxes) {
            StepResponsePlot.setAxisVisible(axis, userSettings.stepResponseAxes[axis]);
        }

        this.setFullscreen = function(size) {
            isFullscreen = (size == true);
            StepResponsePlot.setFullScreen(isFullscreen);
            that.resize();
        };

        this.setInTime = function(time) {
            dataReload = true;
            return StepResponseCalc.setInTime(time);
        };

        this.setOutTime = function(time) {
            dataReload = true;
            return StepResponseCalc.setOutTime(time);
        };

        this.setAxisEnabled = function(axis, state) {
            userSettings.stepResponseAxes[axis] = state;
            saveOneUserSetting('stepResponseAxes', userSettings.stepResponseAxes);
            StepResponsePlot.setAxisVisible(axis, state);
            that.draw();
        };

        var getSize = function() {
            if (isFullscreen) {
                return {
                    height: canvas.clientHeight - STEP_RESPONSE_LARGE_HEIGHT_MARGIN,
                    width:  canvas.clientWidth - STEP_RESPONSE_LARGE_WIDTH_MARGIN,
                    left:   STEP_RESPONSE_LARGE_LEFT_MARGIN,
                    top:    STEP_RESPONSE_LARGE_TOP_MARGIN,
                };
            } else {
                return {
                    height: canvas.height * parseInt(userSettings.stepResponse.size) / 100.0,
                    width:  canvas.width * parseInt(userSettings.stepResponse.size) / 100.0,
                    left:   canvas.width * parseInt(userSettings.stepResponse.left) / 100.0,
                    top:    canvas.height * parseInt(userSettings.stepResponse.top) / 100.0,
                };
            }
        };

        this.resize = function() {

            var newSize = getSize();

            StepResponsePlot.setSize(newSize.width, newSize.height);

            var parentElem = $(stepResponseCanvas).parent();

            $(parentElem).css({
                left: newSize.left,
                top:  newSize.top,
            });

            $("#stepResponseResize", parentElem).css({
                left: (newSize.width - 28) + "px",
            });
        };

        var dataLoad = function() {
            stepResponseData = StepResponseCalc.calculate();
            StepResponsePlot.setData(stepResponseData);
        };

        this.plot = function() {
            if (dataReload || stepResponseData == null) {
                dataReload = false;
                dataLoad();
            }
            that.draw();
        };

        this.draw = function() {
            StepResponsePlot.draw();
        };

        this.destroy = function() {
            $(stepResponseCanvas).off("mousemove", trackTime);
            $(stepResponseCanvas).off("touchmove", trackTime);
        };

        /* Renders the current step response data at a large fixed resolution (independent of the
           on-screen panel size) and returns it as a PNG data URL, for sending to the AI Analyse feature. */
        this.captureImage = function() {
            var CAPTURE_WIDTH = 1400, CAPTURE_HEIGHT = 800;

            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = CAPTURE_WIDTH;
            tempCanvas.height = CAPTURE_HEIGHT;

            var wasFullScreen = StepResponsePlot._isFullScreen;
            var wasShowLegend = StepResponsePlot._showLegend;
            var wasSolidBackground = StepResponsePlot._solidBackground;
            var wasLineWidth = StepResponsePlot._lineWidth;
            var wasFontSize = StepResponsePlot._fontSize;
            StepResponsePlot._isFullScreen = true;
            StepResponsePlot._showLegend = true;
            StepResponsePlot._solidBackground = true;
            StepResponsePlot._lineWidth = AILINEWIDTH;
            StepResponsePlot._fontSize = AIFONTSIZE;
            StepResponsePlot._drawGraph(tempCanvas.getContext('2d'));
            StepResponsePlot._isFullScreen = wasFullScreen;
            StepResponsePlot._showLegend = wasShowLegend;
            StepResponsePlot._solidBackground = wasSolidBackground;
            StepResponsePlot._lineWidth = wasLineWidth;
            StepResponsePlot._fontSize = wasFontSize;

            return tempCanvas.toDataURL('image/png');
        };

        /* Shift-hover to read off the response time (and per-axis value) under the mouse,
           mirroring the Analyser's shift-hover frequency readout. */
        function trackTime(e) {
            if (e.shiftKey) {
                // Hide the maximize button
                stepResponsePanelElem.removeClass('non-shift');

                var rect = stepResponseCanvas.getBoundingClientRect();
                var mouseX = e.clientX - rect.left;
                var mouseY = e.clientY - rect.top;

                StepResponsePlot.setMousePosition(mouseX, mouseY);
                that.draw();
                e.preventDefault();
            } else {
                stepResponsePanelElem.addClass('non-shift');
                StepResponsePlot.clearMousePosition();
                that.draw();
            }
        }

        $(stepResponseCanvas).on('mousemove', trackTime);
        $(stepResponseCanvas).on('touchmove', trackTime);
        $(stepResponseCanvas).on('mouseleave', function() {
            StepResponsePlot.clearMousePosition();
            that.draw();
        });

        function saveOneUserSetting(name, value) {
            prefs.get('userSettings', function(data) {
                data[name] = value;
                prefs.set('userSettings', data);
            });
        }

    } catch (e) {
        console.log('Failed to create step response panel... error:' + e);
    }
}
