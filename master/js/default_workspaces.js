"use strict";

/*Default workspaces that users can use to populate an open slot and perform analysis*/
var DEFAULT_WORKSPACES = [
        {
        "title": "Filter Tuning",
        "graphConfig": [
            {
                "fields": [
                    {
                        "name": "gyroRAW[0]",
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
                        "color": "#fb8072",
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
                        "color": "#fb8072",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "Roll"
            },
            {
                "fields": [
                    {
                        "name": "gyroRAW[1]",
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
                        "color": "#b3de69",
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
                        "color": "#b3de69",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "Pitch"
            },
            {
                "fields": [
                    {
                        "name": "gyroRAW[2]",
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
                        "color": "#80b1d3",
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
                        "color": "#80b1d3",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "Yaw"
            },
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
                        "color": "#fb8072",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "Headspeed"
            }
        ]
    },
    {
        "title": "Governor Preset",
        "graphConfig": [
            {
                "fields": [
                    {
                        "name": "govP",
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
                        "color": "#fb8072",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "govI",
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
                        "name": "govD",
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
                        "name": "govF",
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
                        "name": "govSum",
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
                        "name": "govRequest",
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
                        "name": "govTarget",
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
            },
            {
                "fields": [
                    {
                        "name": "mixer[2]",
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
                "label": "Mixer"
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
            },
            {
                "fields": [
                    {
                        "name": "mixer[1]",
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
                "label": "Mixer"
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
            },
            {
                "fields": [
                    {
                        "name": "mixer[0]",
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
                "label": "Mixer"
            }
        ],
        "title": "Roll Preset"
    },
    {
        "title": "Power Preset",
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
                    }
                ],
                "height": 1,
                "label": "Main Battery"
            },
            {
                "fields": [
                    {
                        "name": "Vbec",
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
                        "color": "#fb8072",
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
                        "color": "#8dd3c7",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "BEC"
            },
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
                        "color": "#d9d9d9",
                        "lineWidth": 1,
                        "grid": false
                    },
                    {
                        "name": "motor[all]",
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
                        "color": "#fccde5",
                        "lineWidth": 1,
                        "grid": false
                    }
                ],
                "height": 1,
                "label": "Headspeed and Motor"
            }
        ]
    },
]
