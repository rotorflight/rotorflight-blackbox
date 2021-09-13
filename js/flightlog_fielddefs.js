"use strict";

function makeReadOnly(x) {
    // Make read-only if browser supports it:
    if (Object.freeze) {
        return Object.freeze(x);
    }

    // Otherwise a no-op
    return x;
}

// Some constants used at different places
const MAX_MOTOR_NUMBER = 4;

// Fields definitions for lists
var
    FlightLogEvent = makeReadOnly({
        SYNC_BEEP: 0,

        AUTOTUNE_CYCLE_START: 10,
        AUTOTUNE_CYCLE_RESULT: 11,
        AUTOTUNE_TARGETS: 12,
        INFLIGHT_ADJUSTMENT: 13,
        LOGGING_RESUME: 14,
        DISARM: 15,

        GTUNE_CYCLE_RESULT: 20,
        FLIGHT_MODE: 30,
        TWITCH_TEST: 40, // Feature for latency testing
        GOVERNOR_STATE: 50,  // Main motor governor state

        CUSTOM : 250, // Virtual Event Code - Never part of Log File.
        CUSTOM_BLANK : 251, // Virtual Event Code - Never part of Log File. - No line shown

        LOG_END: 255
    }),

    // Add a general axis index.
    AXIS = makeReadOnly({
        ROLL:  0,
        PITCH: 1,
        YAW:   2
    }),

    FLIGHT_LOG_FLIGHT_MODE_NAME = [],

    FLIGHT_LOG_FLIGHT_MODE_NAME_4_2 = makeReadOnly([
        'ARM',
        'ANGLE',
        'HORIZON',
        'PASSTHRU',
        'FAILSAFE',
        'RESCUE',
        'GPSRESCUE',
        'CAMSTAB',
        'BEEPER',
        'LEDLOW',
        'CALIB',
        'OSD',
        'TELEMETRY',
        'SERVO1',
        'SERVO2',
        'SERVO3',
        'BLACKBOX',
        'BLACKBOXERASE',
        'CAMERA1',
        'CAMERA2',
        'CAMERA3',
        'PREARM',
        'VTXPITMODE',
        'PARALYZE',
        'USER1',
        'USER2',
        'USER3',
        'USER4',
        'PIDAUDIO',
        'ACROTRAINER',
        'VTXCONTROLDISABLE',
    ]),

    FLIGHT_LOG_FEATURES = [],

    FLIGHT_LOG_FEATURES_4_2 = makeReadOnly([
        'RX_PPM',
        'UNUSED1',
        'INFLIGHT_ACC_CAL',
        'RX_SERIAL',
        'UNUSED4',
        'UNUSED5',
        'SOFTSERIAL',
        'GPS',
        'UNUSED8',
        'SONAR',
        'TELEMETRY',
        'UNUSED11',
        'UNUSED12',
        'RX_PARALLEL_PWM',
        'RX_MSP',
        'RSSI_ADC',
        'LED_STRIP',
        'DISPLAY',
        'OSD',
        'UNUSED19',
        'UNUSED20',
        'UNUSED21',
        'UNUSED22',
        'UNUSED23',
        'UNUSED24',
        'RX_SPI',
        'GOVERNOR',
        'ESC_SENSOR',
        'FREQ_SENSOR',
        'DYNAMIC_FILTER',
        'RPM_FILTER',
    ]),

    PID_CONTROLLER_TYPE = ([
        'UNUSED',
        'MWREWRITE',
        'LUXFLOAT'
    ]),

    PID_DELTA_TYPE = makeReadOnly([
        'ERROR',
        'MEASUREMENT'
    ]),

    OFF_ON = makeReadOnly([
        "OFF",
        "ON"
    ]),

    FAST_PROTOCOL = makeReadOnly([
        "PWM",
        "ONESHOT125",
        "ONESHOT42",
        "MULTISHOT",
        "BRUSHED",
        "DSHOT150",
        "DSHOT300",
        "DSHOT600",
        "PROSHOT1000",
        "DISABLED",
    ]),

    MOTOR_SYNC = makeReadOnly([
        "SYNCED",
        "UNSYNCED"
    ]),

    SERIALRX_PROVIDER = makeReadOnly([
	    "SPEK1024",
	    "SPEK2048",
	    "SBUS",
	    "SUMD",
	    "SUMH",
	    "XB-B",
	    "XB-B-RJ01",
	    "IBUS",
	    "JETIEXBUS",
        "CRSF",
        "SRXL",
        "CUSTOM",
        "FPORT",
        "SRXL2",
    ]),

    ANTI_GRAVITY_MODE = makeReadOnly([
        "SMOOTH",
        "STEP"
    ]),

    RC_SMOOTHING_TYPE = makeReadOnly([
        "INTERPOLATION",
        "FILTER"
    ]),

    RC_SMOOTHING_INPUT_TYPE = makeReadOnly([
        "PT1",
        "BIQUAD"
    ]),

    RC_SMOOTHING_DERIVATIVE_TYPE = makeReadOnly([
        "OFF",
        "PT1",
        "BIQUAD"
    ]),

    RC_SMOOTHING_DEBUG_AXIS = makeReadOnly([
        "ROLL",
        "PITCH",
        "YAW",
        "THROTTLE"
    ]),

    RC_INTERPOLATION = makeReadOnly([
        "OFF",
        "DEFAULT",
        "AUTO",
        "MANUAL"
    ]),

    FILTER_TYPE = makeReadOnly([
        "PT1",
        "BIQUAD",
        "FIR",
    ]),

    DEBUG_MODE = [],

    DEBUG_MODE_4_2 = makeReadOnly([
        "NONE",
        "CYCLETIME",
        "BATTERY",
        "GYRO",
        "ACCELEROMETER",
        "PIDLOOP",
        "GYRO_SCALED",
        "RC_INTERPOLATION",
        "ANGLERATE",
        "ESC_SENSOR",
        "SCHEDULER",
        "STACK",
        "ESC_SENSOR_RPM",
        "ESC_SENSOR_TMP",
        "ALTITUDE",
        "FFT",
        "FFT_TIME",
        "FFT_FREQ",
        "RX_FRSKY_SPI",
        "RX_SFHSS_SPI",
        "GYRO_RAW",
        "DUAL_GYRO_RAW",
        "DUAL_GYRO_DIFF",
        "MAX7456_SIGNAL",
        "MAX7456_SPICLOCK",
        "SBUS",
        "FPORT",
        "RANGEFINDER",
        "RANGEFINDER_QUALITY",
        "LIDAR_TF",
        "ADC_INTERNAL",
        "GOVERNOR",
        "SDIO",
        "CURRENT_SENSOR",
        "USB",
        "SMARTAUDIO",
        "RTH",
        "ITERM_RELAX",
        "ACRO_TRAINER",
        "RC_SMOOTHING",
        "RX_SIGNAL_LOSS",
        "RC_SMOOTHING_RATE",
        "UNUSED_42",
        "DYN_LPF",
        "RX_SPECTRUM_SPI",
        "DSHOT_RPM_TELEMETRY",
        "RPM_FILTER",
        "RPM_SOURCE",
        "AC_CORRECTION",
        "AC_ERROR",
        "DUAL_GYRO_SCALED",
        "DSHOT_RPM_ERRORS",
        "CRSF_LINK_STATISTICS_UPLINK",
        "CRSF_LINK_STATISTICS_PWR",
        "CRSF_LINK_STATISTICS_DOWN",
        "BARO",
        "GPS_RESCUE_THROTTLE_PID",
        "FREQ_SENSOR",
        "FF_LIMIT",
        "FF_INTERPOLATED",
        "BLACKBOX_OUTPUT",
        "GYRO_SAMPLE",
        "RX_TIMING",
        "USER1",
        "USER2",
        "USER3",
        "USER4",
    ]),

    SUPER_EXPO_YAW = makeReadOnly([
        "OFF",
        "ON",
        "ALWAYS"
    ]),

    DTERM_DIFFERENTIATOR = makeReadOnly([
        "STANDARD",
        "ENHANCED"
    ]),

    GYRO_LPF = makeReadOnly([
        "OFF",
        "188HZ",
        "98HZ",
        "42HZ",
        "20HZ",
        "10HZ",
        "5HZ",
        "EXPERIMENTAL"
    ]),

    GYRO_HARDWARE_LPF = makeReadOnly([
        "NORMAL",
        "EXPERIMENTAL",
        "1KHZ_SAMPLING"
    ]),

    GYRO_32KHZ_HARDWARE_LPF = makeReadOnly([
        "NORMAL",
        "EXPERIMENTAL"
    ]),

    ACC_HARDWARE = makeReadOnly([
	    "AUTO",
	    "NONE",
	    "ADXL345",
	    "MPU6050",
	    "MMA8452",
	    "BMA280",
	    "LSM303DLHC",
	    "MPU6000",
	    "MPU6500",
	    "FAKE"
    ]),

    BARO_HARDWARE = makeReadOnly([
        "AUTO",
        "NONE",
        "BMP085",
        "MS5611",
        "BMP280"
    ]),

    MAG_HARDWARE = makeReadOnly([
        "AUTO",
        "NONE",
        "HMC5883",
        "AK8975",
        "AK8963"
    ]),

    FLIGHT_LOG_FLIGHT_STATE_NAME = makeReadOnly([
        "GPS_FIX_HOME",
        "GPS_FIX",
        "CALIBRATE_MAG",
        "SMALL_ANGLE",
        "FIXED_WING"
    ]),

    FLIGHT_LOG_FAILSAFE_PHASE_NAME = makeReadOnly([
        "IDLE",
        "RX_LOSS_DETECTED",
        "LANDING",
        "LANDED"
    ]),

    FFT_CALC_STEPS = makeReadOnly([
        "ARM_CFFT_F32",
        "BITREVERSAL",
        "STAGE_RFFT_F32",
        "ARM_CMPLX_MAG_F32",
        "CALC_FREQUENCIES",
        "UPDATE_FILTERS",
        "HANNING"
    ]),

    ITERM_RELAX = makeReadOnly([
        "OFF",
        "RP",
        "RPY",
        "RP_INC",
        "RPY_INC",
    ]),

    ITERM_RELAX_TYPE = makeReadOnly([
        "GYRO",
        "SETPOINT",
    ]),

    DYN_NOTCH_RANGE = makeReadOnly([
        "HIGH",
        "MEDIUM",
        "LOW",
        "AUTO",
    ]),

    FLIGHT_LOG_DISARM_REASON = makeReadOnly([
        "ARMING_DISABLED",
        "FAILSAFE",
        "THROTTLE_TIMEOUT",
        "STICKS",
        "SWITCH",
        "CRASH_PROTECTION",
        "RUNAWAY_TAKEOFF",
        "GPS_RESCUE",
        "SERIAL_IO",
    ]),

    FLIGHT_LOG_GOVSTATES = makeReadOnly([
        "THROTTLE_OFF",
        "THROTTLE_IDLE",
        "SPOOLING_UP",
        "RECOVERY",
        "ACTIVE",
        "LOST_THROTTLE",
        "LOST_HEADSPEED",
        "AUTOROTATION",
        "BAILOUT",
    ]),

    RATES_TYPE = makeReadOnly([
        "BETAFLIGHT",
        "RACEFLIGHT",
        "KISS",
        "ACTUAL",
        "QUICK",
    ]),

    GYRO_TO_USE = makeReadOnly([
        "FIRST",
        "SECOND",
        "BOTH",
    ]);

function adjustFieldDefsList(firmwareType, firmwareVersion) {
    if(firmwareType == FIRMWARE_TYPE_ROTORFLIGHT) {

        // Debug names
        if(semver.gte(firmwareVersion, '4.2.0')) {
            DEBUG_MODE = DEBUG_MODE_4_2.slice();
            // Add modifications here
        }
        DEBUG_MODE = makeReadOnly(DEBUG_MODE);

        // Features
        if (semver.gte(firmwareVersion, '4.2.0')) {
            FLIGHT_LOG_FEATURES = FLIGHT_LOG_FEATURES_4_2.slice();
            // Add modifications here
        }
        FLIGHT_LOG_FEATURES = makeReadOnly(FLIGHT_LOG_FEATURES);

        // Flight mode names
        if (semver.gte(firmwareVersion, '4.2.0')) {
            FLIGHT_LOG_FLIGHT_MODE_NAME = FLIGHT_LOG_FLIGHT_MODE_NAME_4_2.slice();
            // Add modifications here
        }
        FLIGHT_LOG_FLIGHT_MODE_NAME = makeReadOnly(FLIGHT_LOG_FLIGHT_MODE_NAME);

    }
}
