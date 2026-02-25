"use strict";

/*Default workspaces that users can use to populate an open slot and perform analysis*/
var DEFAULT_WORKSPACES = [
    {
        "graphConfig": [
            {
                "fields": [
                    {
                        "color": "#ffffb3",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisP[2]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#bebada",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisI[2]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#80b1d3",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisD[2]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#fccde5",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisF[2]",
                        "smoothing": 3000
                    }
                ],
                "height": 1,
                "label": "PID"
            },
            {
                "fields": [
                    {
                        "color": "#fb8072",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "gyroADC[2]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#8dd3c7",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisPD[2]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#ffffb3",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 0
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "setpoint[2]",
                        "smoothing": 0
                    },
                    {
                        "color": "#bebada",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisError[2]",
                        "smoothing": 3000
                    }
                ],
                "height": 1,
                "label": "Gyro and Setpoint"
            }
        ],
        "title": "Yaw Preset"
    },
    {
        "graphConfig": [
            {
                "fields": [
                    {
                        "color": "#ffffb3",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisP[1]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#bebada",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisI[1]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#80b1d3",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisD[1]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#fccde5",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisF[1]",
                        "smoothing": 3000
                    }
                ],
                "height": 1,
                "label": "PID"
            },
            {
                "fields": [
                    {
                        "color": "#fb8072",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "gyroADC[1]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#8dd3c7",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisPD[1]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#ffffb3",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 0
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "setpoint[1]",
                        "smoothing": 0
                    },
                    {
                        "color": "#bebada",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisError[1]",
                        "smoothing": 3000
                    }
                ],
                "height": 1,
                "label": "Gyro and Setpoint"
            }
        ],
        "title": "Pitch Preset"
    },
    {
        "graphConfig": [
            {
                "fields": [
                    {
                        "color": "#ffffb3",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisP[0]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#bebada",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisI[0]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#80b1d3",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisD[0]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#fccde5",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisF[0]",
                        "smoothing": 3000
                    }
                ],
                "height": 1,
                "label": "PID"
            },
            {
                "fields": [
                    {
                        "color": "#fb8072",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "gyroADC[0]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#8dd3c7",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisPD[0]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#ffffb3",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 0
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "setpoint[0]",
                        "smoothing": 0
                    },
                    {
                        "color": "#bebada",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "axisError[0]",
                        "smoothing": 3000
                    }
                ],
                "height": 1,
                "label": "Gyro and Setpoint"
            }
        ],
        "title": "Roll Preset"
    },
    {
        "graphConfig": [
            {
                "fields": [
                    {
                        "color": "#b3de69",
                        "curve": {
                            "outputRange": 1,
                            "power": 1
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 1,
                            "smoothing": 0
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "Vbat",
                        "smoothing": 0
                    },
                    {
                        "color": "#8dd3c7",
                        "curve": {
                            "outputRange": 1,
                            "power": 1
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 1,
                            "smoothing": 0
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "Ibat",
                        "smoothing": 0
                    }
                ],
                "height": 1,
                "label": "Main Battery"
            },
            {
                "fields": [
                    {
                        "color": "#fb8072",
                        "curve": {
                            "outputRange": 1,
                            "power": 1
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 1,
                            "smoothing": 0
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "Vbat",
                        "smoothing": 0
                    },
                    {
                        "color": "#8dd3c7",
                        "curve": {
                            "outputRange": 1,
                            "power": 1
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 1,
                            "smoothing": 0
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "BecI",
                        "smoothing": 0
                    }
                ],
                "height": 1,
                "label": "BEC"
            },
            {
                "fields": [
                    {
                        "color": "#8dd3c7",
                        "curve": {
                            "outputRange": 1,
                            "power": 1
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 1,
                            "smoothing": 0
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "Vbus",
                        "smoothing": 0
                    }
                ],
                "height": 1,
                "label": "5V Voltage"
            }
        ],
        "title": "Power Preset"
    },
    {
        "title": "Governor Preset",
        "graphConfig": [
            {
                "fields": [
                    {
                        "name": "debug[0]",
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
                        "name": "debug[2]",
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
                        "name": "debug[3]",
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
                        "name": "debug[4]",
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
                        "name": "debug[5]",
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
                        "color": "#fdb462",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "debug[7]",
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
                        "color": "#fdb462",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "debug[6]",
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
                    }
                ],
                "height": 1,
                "label": "Governor"
            }
        ]
    },
    {
        "graphConfig": [
            {
                "fields": [
                    {
                        "color": "#b3de69",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "gyroADC[0]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#fccde5",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "gyroADC[1]",
                        "smoothing": 3000
                    },
                    {
                        "color": "#d9d9d9",
                        "curve": {
                            "outputRange": 1,
                            "power": 0.25
                        },
                        "default": {
                            "outputRange": 1,
                            "power": 0.25,
                            "smoothing": 3000
                        },
                        "grid": false,
                        "lineWidth": 1,
                        "name": "gyroADC[2]",
                        "smoothing": 3000
                    }
                ],
                "height": 1,
                "label": "Gyros"
            }
        ],
        "title": "Gyros Preset"
    },
]