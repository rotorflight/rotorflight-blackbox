"use strict";

/*Default workspaces that users can use to populate an open slot and perform analysis*/
var DEFAULT_WORKSPACES = [
    {
        "title": "Yaw",
        "graphConfig": [
            {
                "fields": [
                    {
                        "name": "gyroADC[2]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#b3de69",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "rcCommand[2]",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#8dd3c7",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisP[2]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#ffffb3",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisI[2]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#bebada",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisD[2]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#80b1d3",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisSum[2]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#fdb462",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisF[2]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#fccde5",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "setpoint[2]",
                        "smoothing": 0,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#ffed6f",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisError[2]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#d9d9d9",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "Yaw"
            }
        ]
    },
    {
        "title": "Pitch",
        "graphConfig": [
            {
                "fields": [
                    {
                        "name": "gyroADC[1]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#b3de69",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "rcCommand[1]",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#8dd3c7",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisP[1]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#ffffb3",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisI[1]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#bebada",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisD[1]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#80b1d3",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisPD[1]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#fdb462",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisF[1]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#fccde5",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "setpoint[1]",
                        "smoothing": 0,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#ffed6f",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisError[1]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#d9d9d9",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "Pitch"
            }
        ]
    },
    {
        "title": "Roll",
        "graphConfig": [
            {
                "fields": [
                    {
                        "name": "gyroADC[0]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#b3de69",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "rcCommand[0]",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#8dd3c7",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisP[0]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#ffffb3",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisI[0]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#bebada",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisD[0]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#80b1d3",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisSum[0]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#fdb462",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisF[0]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#fccde5",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "setpoint[0]",
                        "smoothing": 0,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#ffed6f",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "axisError[0]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#d9d9d9",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "Roll"
            }
        ]
    },
    {
        "title": "Power",
        "graphConfig": [
            {
                "fields": [
                    {
                        "name": "Vbat",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#b3de69",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "Ibat",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#8dd3c7",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "BecV",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#ffffb3",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "BecI",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#bebada",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "Voltages and Currents"
            }
        ]
    },
    {
        "title": "Governor",
        "graphConfig": [
            {
                "fields": [
                    {
                        "name": "headspeed",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#b3de69",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "rcCommand[4]",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#8dd3c7",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "rcCommand[3]",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#bebada",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "rcCommand[2]",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#80b1d3",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "motor[0]",
                        "smoothing": 5000,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 5000,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#fdb462",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "Governor"
            }
        ]
    },
    {
        "title": "Gyros",
        "graphConfig": [
            {
                "fields": [
                    {
                        "name": "gyroADC[all]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#b3de69",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "gyroADC[0]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#8dd3c7",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "gyroADC[1]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#ffffb3",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "gyroADC[2]",
                        "smoothing": 3000,
                        "curve": {
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 3000,
                            "power": 0.25,
                            "outputRange": 1
                        },
                        "color": "#bebada",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "headspeed",
                        "smoothing": 0,
                        "curve": {
                            "power": 1,
                            "outputRange": 1
                        },
                        "default": {
                            "smoothing": 0,
                            "power": 1,
                            "outputRange": 1
                        },
                        "color": "#80b1d3",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "Gyros"
            }
        ]
    }
]