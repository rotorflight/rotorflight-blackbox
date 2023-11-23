"use strict";

function FlightLogFieldPresenter() {
}

(function() {
    const FRIENDLY_FIELD_NAMES = {

        'axisP[all]': 'PID P',
        'axisP[0]': 'PID P [roll]',
        'axisP[1]': 'PID P [pitch]',
        'axisP[2]': 'PID P [yaw]',

        'axisI[all]': 'PID I',
        'axisI[0]': 'PID I [roll]',
        'axisI[1]': 'PID I [pitch]',
        'axisI[2]': 'PID I [yaw]',

        'axisD[all]': 'PID D',
        'axisD[0]': 'PID D [roll]',
        'axisD[1]': 'PID D [pitch]',
        'axisD[2]': 'PID D [yaw]',

        'axisF[all]': 'PID Feedforward',
        'axisF[0]': 'PID Feedforward [roll]',
        'axisF[1]': 'PID Feedforward [pitch]',
        'axisF[2]': 'PID Feedforward [yaw]',

        //Virtual field
        'axisSum[all]': 'PID Sum',
        'axisSum[0]' : 'PID Sum [roll]',
        'axisSum[1]' : 'PID Sum [pitch]',
        'axisSum[2]' : 'PID Sum [yaw]',

        //Virtual field
        'axisError[all]': 'PID Error',
        'axisError[0]' : 'PID Error [roll]',
        'axisError[1]' : 'PID Error [pitch]',
        'axisError[2]' : 'PID Error [yaw]',

        'rcCommand[all]': 'RC Commands',
        'rcCommand[0]': 'RC Command [roll]',
        'rcCommand[1]': 'RC Command [pitch]',
        'rcCommand[2]': 'RC Command [yaw]',
        'rcCommand[3]': 'RC Command [collective]',
        'rcCommand[4]': 'RC Command [throttle]',

        'setpoint[all]': 'Setpoints',
        'setpoint[0]': 'Setpoint [roll]',
        'setpoint[1]': 'Setpoint [pitch]',
        'setpoint[2]': 'Setpoint [yaw]',
        'setpoint[3]': 'Setpoint [collective]',

        'gyroADC[all]': 'Gyros',
        'gyroADC[0]': 'Gyro [roll]',
        'gyroADC[1]': 'Gyro [pitch]',
        'gyroADC[2]': 'Gyro [yaw]',

        'gyroRAW[all]': 'Unfiltered Gyros',
        'gyroRAW[0]': 'Unfiltered Gyro [roll]',
        'gyroRAW[1]': 'Unfiltered Gyro [pitch]',
        'gyroRAW[2]': 'Unfiltered Gyro [yaw]',

        'accADC[all]': 'Accel',
        'accADC[0]': 'Accel [X]',
        'accADC[1]': 'Accel [Y]',
        'accADC[2]': 'Accel [Z]',

        'magADC[all]': 'Compass',
        'magADC[0]': 'Compass [X]',
        'magADC[1]': 'Compass [Y]',
        'magADC[2]': 'Compass [Z]',

        'mixer[all]': 'Mixer',
        'mixer[0]': 'Mixer SR [roll]',
        'mixer[1]': 'Mixer SP [pitch]',
        'mixer[2]': 'Mixer SY [yaw]',
        'mixer[3]': 'Mixer SC [collective]',

        'headspeed': 'Headspeed',
        'tailspeed': 'Tailspeed',

        'altitude': 'Altitude',
        'vario': 'Variometer',

        'rssi': 'RSSI',

        'Vbat': 'Battery voltage',
        'Ibat': 'Battery current',

        'motor[all]': 'Motors',
        'motor[0]': 'Motor [1]',
        'motor[1]': 'Motor [2]',
        'motor[2]': 'Motor [3]',
        'motor[3]': 'Motor [4]',

        'servo[all]': 'Servos',
        'servo[0]': 'Servo [1]',
        'servo[1]': 'Servo [2]',
        'servo[2]': 'Servo [3]',
        'servo[3]': 'Servo [4]',
        'servo[4]': 'Servo [5]',
        'servo[5]': 'Servo [6]',
        'servo[6]': 'Servo [7]',
        'servo[7]': 'Servo [8]',

        'attitude[all]': 'Attitude',
        'attitude[0]': 'Attitude [roll]',
        'attitude[1]': 'Attitude [pitch]',
        'attitude[2]': 'Attitude [yaw]',

        'flightModeFlags': 'Flight Mode Flags',
        'stateFlags': 'State Flags',
        'failsafePhase': 'Failsafe Phase',
        'rxSignalReceived': 'RX Signal Received',
        'rxFlightChannelsValid': 'RX Flight Ch. Valid',
    };

    const DEBUG_FRIENDLY_FIELD_NAMES_INITIAL = {
        'NONE' : {
            'debug[all]':'Debug [all]',
            'debug[0]':'Debug [0]',
            'debug[1]':'Debug [1]',
            'debug[2]':'Debug [2]',
            'debug[3]':'Debug [3]',
            'debug[4]':'Debug [4]',
            'debug[5]':'Debug [5]',
            'debug[6]':'Debug [6]',
            'debug[7]':'Debug [7]',
        },
        'CYCLETIME' : {
            'debug[all]':'Debug Cycle Time',
            'debug[0]':'Cycle Time',
            'debug[1]':'CPU Load',
            'debug[2]':'Motor Update',
            'debug[3]':'Motor Deviation',
        },
        'BATTERY' : {
            'debug[all]':'Debug Battery',
            'debug[0]':'Battery Volt. ADC',
            'debug[1]':'Battery Volt.',
            'debug[2]':'Not Used',
            'debug[3]':'Not Used',
        },
        'GYRO' : {
            'debug[all]':'Debug Gyro',
            'debug[0]':'Gyro Raw [X]',
            'debug[1]':'Gyro Raw [Y]',
            'debug[2]':'Gyro Raw [Z]',
            'debug[3]':'Not Used',
        },
        'GYRO_FILTERED' : {
            'debug[all]':'Debug Gyro Filtered',
            'debug[0]':'Gyro Filtered [X]',
            'debug[1]':'Gyro Filtered [Y]',
            'debug[2]':'Gyro Filtered [Z]',
            'debug[3]':'Not Used',
        },
        'ACCELEROMETER' : {
            'debug[all]':'Debug Accel.',
            'debug[0]':'Accel. Raw [X]',
            'debug[1]':'Accel. Raw [Y]',
            'debug[2]':'Accel. Raw [Z]',
            'debug[3]':'Not Used',
        },
        'MIXER' : {
            'debug[all]':'Debug Mixer',
            'debug[0]':'Roll-Pitch-Yaw Mix [0]',
            'debug[1]':'Roll-Pitch-Yaw Mix [1]',
            'debug[2]':'Roll-Pitch-Yaw Mix [2]',
            'debug[3]':'Roll-Pitch-Yaw Mix [3]',
        },
        'PIDLOOP' : {
            'debug[all]':'Debug PID',
            'debug[0]':'Step 1',
            'debug[1]':'Step 2',
            'debug[2]':'Step 3',
            'debug[3]':'Step 4',
            'debug[4]':'Step 5',
            'debug[5]':'Step 6',
            'debug[6]':'Step 7',
            'debug[7]':'Step 8',
        },
        'NOTCH' : {
            'debug[all]':'Debug Notch',
            'debug[0]':'Gyro Pre-Notch [roll]',
            'debug[1]':'Gyro Pre-Notch [pitch]',
            'debug[2]':'Gyro Pre-Notch [yaw]',
            'debug[3]':'Not Used',
        },
        'GYRO_SCALED' : {
            'debug[all]':'Debug Gyro Scaled',
            'debug[0]':'Gyro Scaled [roll]',
            'debug[1]':'Gyro Scaled [pitch]',
            'debug[2]':'Gyro Scaled [yaw]',
            'debug[3]':'Not Used',
        },
        'RC_COMMAND' : {
            'debug[all]':'Debug RC Command',
            'debug[0]':'Roll',
            'debug[1]':'Pitch',
            'debug[2]':'Rudder',
            'debug[3]':'Collective',
            'debug[4]':'Throttle',
        },
        'RC_SMOOTHING' : {
            'debug[all]':'Debug RC Smoothing',
            'debug[0]':'Raw RC Command',
            'debug[1]':'Raw RC Derivative',
            'debug[2]':'Smoothed RC Derivative',
            'debug[3]':'RX Refresh Rate',
        },
        'RC_SMOOTHING_RATE' : {
            'debug[all]':'Debug RC Smoothing Rate',
            'debug[0]':'Current RX Refresh Rate',
            'debug[1]':'Training Step Count',
            'debug[2]':'Average RX Refresh Rate',
            'debug[3]':'Sampling State',
        },
        'DTERM_FILTER' : {
            'debug[all]':'Debug Filter',
            'debug[0]':'DTerm Filter [roll]',
            'debug[1]':'DTerm Filter [pitch]',
            'debug[2]':'Not Used',
            'debug[3]':'Not Used',
        },
        'ANGLERATE' : {
            'debug[all]':'Debug Angle Rate',
            'debug[0]':'Angle Rate[roll]',
            'debug[1]':'Angle Rate[pitch]',
            'debug[2]':'Angle Rate[yaw]',
            'debug[3]':'Not Used',
        },
        'ESC_SENSOR' : {
            'debug[all]':'ESC Sensor',
            'debug[0]':'ESC 1 RPM',
            'debug[1]':'ESC 1 Temp',
            'debug[2]':'ESC 1 Voltage',
            'debug[3]':'ESC 1 Current',
            'debug[4]':'ESC 2 RPM',
            'debug[5]':'ESC 2 Temp',
            'debug[6]':'ESC 2 Voltage',
            'debug[7]':'ESC 2 Current',
        },
        'SCHEDULER' : {
            'debug[all]':'Scheduler',
            'debug[0]':'Not Used',
            'debug[1]':'Not Used',
            'debug[2]':'Schedule Time',
            'debug[3]':'Function Exec Time',
        },
        'STACK' : {
            'debug[all]':'Stack',
            'debug[0]':'Stack High Mem',
            'debug[1]':'Stack Low Mem',
            'debug[2]':'Stack Current',
            'debug[3]':'Stack p',
        },
        'DYN_NOTCH' : {
            'debug[all]':'Dyn Notch [debug-axis]',
            'debug[0]':'Gyro Pre-filter',
            'debug[1]':'Gyro Post-filter',
            'debug[2]':'Not Used',
            'debug[3]':'Gyro Average',
            'debug[4]':'Notch 1',
            'debug[5]':'Notch 2',
            'debug[6]':'Notch 3',
            'debug[7]':'Notch 4',
        },
        'DYN_NOTCH_TIME' : {
            'debug[all]':'Dyn Notch timing',
            'debug[0]':'dynNotchUpdate duration',
            'debug[1]':'sdftPushBatch duration',
            'debug[2]':'stepWindow duration',
            'debug[3]':'stepDetectPeaks duration',
            'debug[4]':'stepCalcFreqs duration',
            'debug[5]':'stepUpdate duration',
            'debug[6]':'stateTick',
            'debug[7]':'sampleIndex',
        },
        'DYN_NOTCH_FREQ' : {
            'debug[all]':'Dyn Notches [debug-axis]',
            'debug[0]':'Notch 1',
            'debug[1]':'Notch 2',
            'debug[2]':'Notch 3',
            'debug[3]':'Notch 4',
            'debug[4]':'Notch 5',
            'debug[5]':'Notch 6',
            'debug[6]':'Notch 7',
            'debug[7]':'Notch 8',
        },
        'GYRO_RAW' : {
            'debug[all]':'Debug Gyro Raw',
            'debug[0]':'Gyro Raw [X]',
            'debug[1]':'Gyro Raw [Y]',
            'debug[2]':'Gyro Raw [Z]',
            'debug[3]':'Not Used',
        },
        'DUAL_GYRO' : {
            'debug[all]':'Debug Dual Gyro',
            'debug[0]':'Gyro 1 Filtered [roll]',
            'debug[1]':'Gyro 1 Filtered [pitch]',
            'debug[2]':'Gyro 2 Filtered [roll]',
            'debug[3]':'Gyro 2 Filtered [pitch]',
        },
        'DUAL_GYRO_RAW': {
            'debug[all]':'Debug Dual Gyro Raw',
            'debug[0]':'Gyro 1 Raw [roll]',
            'debug[1]':'Gyro 1 Raw [pitch]',
            'debug[2]':'Gyro 2 Raw [roll]',
            'debug[3]':'Gyro 2 Raw [pitch]',
        },
        'DUAL_GYRO_COMBINED': {
            'debug[all]':'Debug Dual Combined',
            'debug[0]':'Not Used',
            'debug[1]':'Gyro Filtered [roll]',
            'debug[2]':'Gyro Filtered [pitch]',
            'debug[3]':'Not Used',
        },
        'DUAL_GYRO_DIFF': {
            'debug[all]':'Debug Dual Gyro Diff',
            'debug[0]':'Gyro Diff [roll]',
            'debug[1]':'Gyro Diff [pitch]',
            'debug[2]':'Gyro Diff [yaw]',
            'debug[3]':'Not Used',
        },
        'ESC_SENSOR_DATA' : {
            'debug[all]':'ESC Data',
            'debug[0]':'RPM',
            'debug[1]':'PWM',
            'debug[2]':'Temp',
            'debug[3]':'Voltage',
            'debug[4]':'Current',
            'debug[5]':'Capacity',
            'debug[6]':'Extra',
            'debug[7]':'Age',
        },
        'ESC_SENSOR_FRAME' : {
            'debug[all]':'ESC Framing',
            'debug[0]':'Byte Count',
            'debug[1]':'Frame Count',
            'debug[2]':'Sync Count',
            'debug[3]':'Sync Errors',
            'debug[4]':'CRC Errors',
            'debug[5]':'Timeouts',
            'debug[6]':'Buffer size',
            'debug[7]':'Not Used',
        },
        'DSHOT_RPM_TELEMETRY' : {
            'debug[all]':'DShot Telemetry RPM',
            'debug[0]':'Motor 1 - DShot',
            'debug[1]':'Motor 2 - DShot',
            'debug[2]':'Motor 3 - DShot',
            'debug[3]':'Motor 4 - DShot',
        },
        'RPM_FILTER' : {
            'debug[all]':'RPM Filter',
            'debug[0]':'Motor RPM',
            'debug[1]':'Freq',
            'debug[2]':'Notch',
            'debug[3]':'Update rate',
            'debug[4]':'Motor',
            'debug[5]':'Min Hz',
            'debug[6]':'Max Hz',
            'debug[7]':'Notch Q',
        },
        'D_MIN' : {
            'debug[all]':'D_MIN',
            'debug[0]':'Gyro Factor [roll]',
            'debug[1]':'Setpoint Factor [roll]',
            'debug[2]':'Actual D [roll]',
            'debug[3]':'Actual D [pitch]',
        },
        'ITERM_RELAX' : {
            'debug[all]':'I-term Relax',
            'debug[0]':'Setpoint HPF [roll]',
            'debug[1]':'I Relax Factor [roll]',
            'debug[2]':'Relaxed I Error [roll]',
            'debug[3]':'Axis Error [roll]',
        },
        'DYN_LPF' : {
            'debug[all]':'Debug Dyn LPF',
            'debug[0]':'Gyro Scaled [dbg-axis]',
            'debug[1]':'Notch Center [roll]',
            'debug[2]':'Lowpass Cutoff',
            'debug[3]':'Gyro Pre-Dyn [dbg-axis]',
        },
        'AC_CORRECTION' : {
            'debug[all]':'AC Correction',
            'debug[0]':'AC Correction [roll]',
            'debug[1]':'AC Correction [pitch]',
            'debug[2]':'AC Correction [yaw]',
            'debug[3]':'Not Used',
        },
        'AC_ERROR' : {
            'debug[all]':'AC Error',
            'debug[0]':'AC Error [roll]',
            'debug[1]':'AC Error [pitch]',
            'debug[2]':'AC Error [yaw]',
            'debug[3]':'Not Used',
        },
        'DUAL_GYRO_SCALED' : {
            'debug[all]':'Dual Gyro Scaled',
            'debug[0]':'Gyro 1 [roll]',
            'debug[1]':'Gyro 1 [pitch]',
            'debug[2]':'Gyro 2 [roll]',
            'debug[3]':'Gyro 2 [pitch]',
        },
        'DSHOT_RPM_ERRORS' : {
            'debug[all]':'DSHOT RPM Error',
            'debug[0]':'DSHOT RPM Error [1]',
            'debug[1]':'DSHOT RPM Error [2]',
            'debug[2]':'DSHOT RPM Error [3]',
            'debug[3]':'DSHOT RPM Error [4]',
        },
        'CRSF_LINK_STATISTICS_UPLINK' : {
            'debug[all]':'CRSF Stats Uplink',
            'debug[0]':'Uplink RSSI 1',
            'debug[1]':'Uplink RSSI 2',
            'debug[2]':'Uplink Link Quality',
            'debug[3]':'RF Mode',
        },
        'CRSF_LINK_STATISTICS_PWR' : {
            'debug[all]':'CRSF Stats Power',
            'debug[0]':'Antenna',
            'debug[1]':'SNR',
            'debug[2]':'TX Power',
            'debug[3]':'Not Used',
        },
        'CRSF_LINK_STATISTICS_DOWN' : {
            'debug[all]':'CRSF Stats Downlink',
            'debug[0]':'Downlink RSSI',
            'debug[1]':'Downlink Link Quality',
            'debug[2]':'Downlink SNR',
            'debug[3]':'Not Used',
        },
        'BARO' : {
            'debug[all]':'Debug Barometer',
            'debug[0]':'Baro State',
            'debug[1]':'Baro Temperature',
            'debug[2]':'Baro Pressure',
            'debug[3]':'Baro Pressure Sum',
        },
        'GPS_RESCUE_THROTTLE_PID' : {
            'debug[all]':'GPS Rescue Throttle PID',
            'debug[0]':'Throttle P',
            'debug[1]':'Throttle I',
            'debug[2]':'Throttle D',
            'debug[3]':'Z Velocity',
        },
        'DYN_IDLE' : {
            'debug[all]':'Dyn Idle',
            'debug[0]':'Motor Range Min Inc',
            'debug[1]':'Target RPS Change Rate',
            'debug[2]':'Error',
            'debug[3]':'Min RPM',
        },
        'FF_LIMIT' : {
            'debug[all]':'FF Limit',
            'debug[0]':'FF input [roll]',
            'debug[1]':'FF input [pitch]',
            'debug[2]':'FF limited [roll]',
            'debug[3]':'Not Used',
        },
        'FF_INTERPOLATED' : {
            'debug[all]':'FF Interpolated [roll]',
            'debug[0]':'Setpoint Delta Impl [roll]',
            'debug[1]':'Boost amount [roll]',
            'debug[2]':'Boost amount, clipped [roll]',
            'debug[3]':'Clip amount [roll]',
        },
        'RTH' : {
            'debug[all]':'RTH',
            'debug[0]':'Rescue Throttle',
            'debug[1]':'Rescue Angle',
            'debug[2]':'Altitude Adjustment',
            'debug[3]':'Rescue State',
        },
        'YAW_PRECOMP' : {
            'debug[all]':'Yaw Precompensation',
            'debug[0]':'Collective Deflection',
            'debug[1]':'Collective Feedforward',
            'debug[2]':'Collective High Freq FF',
            'debug[3]':'Cyclic Deflection',
            'debug[4]':'Yaw Collective Feedforward',
            'debug[5]':'Yaw Collective High Freq FF',
            'debug[6]':'Yaw Cyclic Feedforward',
            'debug[7]':'Total Precompensation',
        },
        'GOVERNOR' : {
            'debug[all]':'Governor',
            'debug[0]':'HS Requested',
            'debug[1]':'HS Setpoint',
            'debug[2]':'HS Actual',
            'debug[3]':'Gov PID sum',
            'debug[4]':'Gov P',
            'debug[5]':'Gov I',
            'debug[6]':'Gov D',
            'debug[7]':'Gov F',
        },
        'RX_TIMING' : {
            'debug[all]':'Receiver Timing',
            'debug[0]':'Average Refresh Rate',
            'debug[1]':'ARR * currentMult',
            'debug[2]':'Current Refresh Rate',
            'debug[3]':'Not Used',
            'debug[4]':'Frame Delta',
            'debug[5]':'Local Delta',
            'debug[6]':'Frame Age',
            'debug[7]':'currentMult',
        },
        'FREQ_SENSOR' : {
            'debug[all]':'Freq Sensor',
            'debug[0]':'Input Freq',
            'debug[1]':'Freq',
            'debug[2]':'Input Period',
            'debug[3]':'Period',
            'debug[4]':'Zeros',
            'debug[5]':'Prescaler',
        },
        'PITCH_PRECOMP' : {
            'debug[all]':'Pitch Precompensation',
            'debug[0]':'Collective Deflection',
            'debug[1]':'Pitch Precompensation',
        },
        'RESCUE' : {
            'debug[all]':'Rescue',
            'debug[0]':'Roll Attitude',
            'debug[1]':'Pitch Attitude',
            'debug[2]':'Yaw Attitude',
            'debug[3]':'Cos Tilt Angle',
            'debug[4]':'Setpoint Roll',
            'debug[5]':'Setpoint Pitch',
            'debug[6]':'Setpoint Yaw',
            'debug[7]':'Setpoint Collective',
        },
        'SETPOINT' : {
            'debug[all]':'Setpoint',
            'debug[0]':'RC Deflection',
            'debug[1]':'SP After Cyclic Ring',
            'debug[2]':'SP After Slew Limit',
            'debug[3]':'SP After Filter',
            'debug[4]':'SP After Rates',
            'debug[5]':'SP Maximum',
            'debug[6]':'Cutoff',
            'debug[7]':'Frame Time',
        },
        'AIRBORNE' : {
            'debug[all]':'Setpoint',
            'debug[0]':'Sqrt SP Max [roll]',
            'debug[1]':'Sqrt SP Max [pitch]',
            'debug[2]':'Sqrt SP Max [yaw]',
            'debug[3]':'Sqrt SP Max [collective]',
            'debug[4]':'Cos Tilt Angle',
            'debug[5]':'Is Spooled Up',
            'debug[6]':'Is Hands On',
            'debug[7]':'Is Airborne',
        },
    };

    let DEBUG_FRIENDLY_FIELD_NAMES = null;

    FlightLogFieldPresenter.adjustDebugDefsList = function(firmwareType, firmwareVersion) {

        DEBUG_FRIENDLY_FIELD_NAMES = {...DEBUG_FRIENDLY_FIELD_NAMES_INITIAL};

        if (firmwareType === FIRMWARE_TYPE_BETAFLIGHT) {
            if (semver.gte(firmwareVersion, '4.3.0')) {
                DEBUG_FRIENDLY_FIELD_NAMES.FEEDFORWARD = {
                    'debug[all]':'Feedforward [roll]',
                    'debug[0]':'Setpoint, interpolated [roll]',
                    'debug[1]':'Delta, smoothed [roll]',
                    'debug[2]':'Boost, smoothed [roll]',
                    'debug[3]':'rcCommand Delta [roll]',
                };
                DEBUG_FRIENDLY_FIELD_NAMES.FEEDFORWARD_LIMIT = {
                    'debug[all]':'Feedforward Limit [roll]',
                    'debug[0]':'Feedforward input [roll]',
                    'debug[1]':'Feedforward input [pitch]',
                    'debug[2]':'Feedforward limited [roll]',
                    'debug[3]':'Not Used',
                };
                DEBUG_FRIENDLY_FIELD_NAMES.DYN_IDLE = {
                    'debug[all]':'Dyn Idle',
                    'debug[0]':'Dyn Idle P [roll]',
                    'debug[1]':'Dyn Idle I [roll]',
                    'debug[2]':'Dyn Idle D [roll]',
                    'debug[3]':'Min RPM',
                };
            } else if (semver.gte(firmwareVersion, '4.2.0')) {
                DEBUG_FRIENDLY_FIELD_NAMES.FF_INTERPOLATED = {
                    'debug[all]':'Feedforward [roll]',
                    'debug[0]':'Setpoint Delta [roll]',
                    'debug[1]':'Acceleration [roll]',
                    'debug[2]':'Acceleration, clipped [roll]',
                    'debug[3]':'Duplicate Counter [roll]',
                };
                DEBUG_FRIENDLY_FIELD_NAMES.FF_LIMIT = {
                    'debug[all]':'Feedforward Limit [roll]',
                    'debug[0]':'FF limit input [roll]',
                    'debug[1]':'FF limit input [pitch]',
                    'debug[2]':'FF limited [roll]',
                    'debug[3]':'Not Used',
                };
            } else if (semver.gte(firmwareVersion, '4.1.0')) {
                DEBUG_FRIENDLY_FIELD_NAMES.FF_INTERPOLATED = {
                    'debug[all]':'Feedforward [roll]',
                    'debug[0]':'Setpoint Delta [roll]',
                    'debug[1]':'Boost [roll]',
                    'debug[2]':'Boost, clipped [roll]',
                    'debug[3]':'Duplicate Counter [roll]',
                };
                DEBUG_FRIENDLY_FIELD_NAMES.FF_LIMIT = {
                    'debug[all]':'Feedforward Limit [roll]',
                    'debug[0]':'FF limit input [roll]',
                    'debug[1]':'FF limit input [pitch]',
                    'debug[2]':'FF limited [roll]',
                    'debug[3]':'Not Used',
                };
            }
        }
    };

    FlightLogFieldPresenter.presentFlags = function(flags, flagNames) {
        var
            printedFlag = false,
            i,
            result = "";

        i = 0;

        while (flags > 0) {
            if ((flags & 1) != 0) {
                if (printedFlag) {
                    result += "|";
                } else {
                    printedFlag = true;
                }

                result += flagNames[i];
            }

            flags >>= 1;
            i++;
        }

        if (printedFlag) {
            return result;
        } else {
            return "0"; //No flags set
        }
    };

    // Only list events that have changed, flag with eirer go ON or OFF.
    FlightLogFieldPresenter.presentChangeEvent = function presentChangeEvent(flags, lastFlags, flagNames) {
        var eventState = '';
        var found = false;
        for(var i = 0; i < flagNames.length; i++) {
           if((1<<i) & (flags ^ lastFlags)) { // State Changed
               eventState += '|' + flagNames[i] + ' ' + (((1<<i) & flags)?'ON':'OFF')
               found = true;
           }
        }
        if(!found) {eventState += ' | ACRO';} // Catch the state when all flags are off, which is ACRO of course
        return eventState;
    };

    FlightLogFieldPresenter.presentEnum = function presentEnum(value, enumNames) {
        if (enumNames[value] === undefined) {
            return value;
        }

        return enumNames[value];
    };

    /**
     * Attempt to decode the given raw logged value into something more human readable, or return an empty string if
     * no better representation is available.
     *
     * @param fieldName Name of the field
     * @param value Value of the field
     */
    FlightLogFieldPresenter.decodeFieldToFriendly = function(flightLog, fieldName, value, currentFlightMode) {
        if (value === undefined) {
            return "";
        }

        switch (fieldName) {
            case 'time':
                return formatTime(value / 1000, true);

            case 'rcCommand[0]':
            case 'rcCommand[1]':
            case 'rcCommand[2]':
            case 'rcCommand[3]':
                return (value / 5).toFixed(1) + ' %';
            case 'rcCommand[4]':
                return (value / 10).toFixed(1) + " %";

            case 'setpoint[0]':
            case 'setpoint[1]':
            case 'setpoint[2]':
                return value.toFixed(0) + " °/s";
            case 'setpoint[3]':
                return (value * 0.012).toFixed(1) + "°";

            case 'mixer[0]':
            case 'mixer[1]':
            case 'mixer[2]':
                return (value * 0.012).toFixed(1) + "°";
            case 'mixer[3]':
                return (value / 10).toFixed(1) + '%';

            case 'axisP[0]':
            case 'axisP[1]':
            case 'axisP[2]':
            case 'axisI[0]':
            case 'axisI[1]':
            case 'axisI[2]':
            case 'axisD[0]':
            case 'axisD[1]':
            case 'axisD[2]':
            case 'axisF[0]':
            case 'axisF[1]':
            case 'axisF[2]':
            case 'axisSum[0]':
            case 'axisSum[1]':
            case 'axisSum[2]':
                return flightLog.getPIDPercentage(value).toFixed(1) + "%";

            case 'axisError[0]':
            case 'axisError[1]':
            case 'axisError[2]':
                return Math.round(value) + " °/s";

            case 'attitude[0]':
            case 'attitude[1]':
            case 'attitude[2]':
                return (value / 10).toFixed(1) + '°';

            case 'gyroADC[0]':
            case 'gyroADC[1]':
            case 'gyroADC[2]':
            case 'gyroRAW[0]':
            case 'gyroRAW[1]':
            case 'gyroRAW[2]':
                return value.toFixed(0) + " °/s";

            case 'accADC[0]':
            case 'accADC[1]':
            case 'accADC[2]':
                return flightLog.accRawToGs(value).toFixed(2) + "g";

            case 'Vbat':
                return (value / 100).toFixed(2) + "V" + ", " + (value / 100 / flightLog.getNumCellsEstimate()).toFixed(2) + "V/cell";

            case 'Ibat':
                return (value / 100).toFixed(2) + "A";

            case 'altitude':
                return (value / 100).toFixed(1) + "m";

            case 'vario':
                return (value / 100).toFixed(1) + "m/s";

            case 'rssi':
                return (value / 1024 * 100).toFixed(2) + "%";

            case 'headspeed':
            case 'tailspeed':
                    return (value).toFixed(0) + " rpm";

            case 'motor[0]':
            case 'motor[1]':
            case 'motor[2]':
            case 'motor[3]':
                return `${flightLog.rcMotorRawToPct(value).toFixed(1)} %`;

            case 'servo[0]':
            case 'servo[1]':
            case 'servo[2]':
            case 'servo[3]':
            case 'servo[4]':
            case 'servo[5]':
            case 'servo[6]':
            case 'servo[7]':
                return (value).toFixed(0) + " µs";

            case 'debug[0]':
            case 'debug[1]':
            case 'debug[2]':
            case 'debug[3]':
            case 'debug[4]':
            case 'debug[5]':
            case 'debug[6]':
            case 'debug[7]':
                return FlightLogFieldPresenter.decodeDebugFieldToFriendly(flightLog, fieldName, value, currentFlightMode);

            case 'flightModeFlags':
                return FlightLogFieldPresenter.presentFlags(value, FLIGHT_LOG_FLIGHT_MODE_NAME);

            case 'stateFlags':
                return FlightLogFieldPresenter.presentFlags(value, FLIGHT_LOG_FLIGHT_STATE_NAME);

            case 'failsafePhase':
                return FlightLogFieldPresenter.presentEnum(value, FLIGHT_LOG_FAILSAFE_PHASE_NAME);

            case 'features':
                return FlightLogFieldPresenter.presentEnum(value, FLIGHT_LOG_FEATURES);

            default:
                return (value).toFixed(0);
        }
    };

    FlightLogFieldPresenter.decodeDebugFieldToFriendly = function(flightLog, fieldName, value, currentFlightMode) {
        if (flightLog) {
            const debugModeName = DEBUG_MODE[flightLog.getSysConfig().debug_mode]; // convert to recognisable name
            switch (debugModeName) {
                case 'NONE':
                case 'AIRMODE':
                case 'VELOCITY':
                    return "";
                case 'CYCLETIME':
                    switch (fieldName) {
                        case 'debug[1]':
                            return value.toFixed(0) + "%";
                        default:
                            return value.toFixed(0) + " µs";
                    }
                case 'PIDLOOP':
                    return value.toFixed(0) + " µs";
                case 'BATTERY':
                    switch (fieldName) {
                        case 'debug[0]':
                            return value.toFixed(0);
                        default:
                            return (value/10).toFixed(1) + "V"
                    }
                case 'GYRO':
                case 'GYRO_FILTERED':
                case 'GYRO_SCALED':
                case 'NOTCH':
                case 'DUAL_GYRO':
                case 'DUAL_GYRO_COMBINED':
                case 'DUAL_GYRO_DIFF':
                case 'DUAL_GYRO_RAW':
                    return Math.round(value) + "°/s";
                case 'ACCELEROMETER':
                    return flightLog.accRawToGs(value).toFixed(2) + "g";
                case 'MIXER':
                    return Math.round(flightLog.rcCommandRawToThrottle(value)) + " %";
                case 'RC_COMMAND':
                    switch (fieldName) {
                        case 'debug[0]': // roll
                        case 'debug[1]': // pitch
                        case 'debug[2]': // rudder
                        case 'debug[3]': // collective
                        case 'debug[4]': // throttle
                            return (value).toFixed(0) + " µs";
                        }
                    break;
                case 'RC_SMOOTHING':
                    switch (fieldName) {
                        case 'debug[0]':
                            return (value + 1500).toFixed(0) + " µs";
                        case 'debug[3]': // rx frame rate [µs]
                            return (value / 1000).toFixed(1) + 'ms';
                    }
                    break;
                case 'RC_SMOOTHING_RATE':
                    switch (fieldName) {
                        case 'debug[0]': // current frame rate [µs]
                        case 'debug[2]': // average frame rate [µs]
                            return (value / 1000).toFixed(2) + 'ms';
                    }
                    break;
                case 'DFILTER':
                    return "";
                case 'ANGLERATE':
                    return value.toFixed(0) + "°/s";
                case 'ESC_SENSOR':
                    switch (fieldName) {
                        case 'debug[0]':
                        case 'debug[4]':
                            return value.toFixed(0) + " erpm";
                        case 'debug[1]':
                        case 'debug[5]':
                            return (value / 10).toFixed(1) + " °C";
                        case 'debug[2]':
                        case 'debug[6]':
                            return (value / 100).toFixed(2) + " V";
                        case 'debug[3]':
                        case 'debug[7]':
                            return (value / 100).toFixed(2) + " A";
                    }
                    break;
                case 'ESC_SENSOR_DATA':
                    switch (fieldName) {
                        case 'debug[0]':
                            return value.toFixed(0) + " [erpm]";
                        case 'debug[1]':
                            return value.toFixed(0) + " [%]";
                        case 'debug[2]':
                            return value.toFixed(0) + " [°C]";
                        case 'debug[3]':
                            return value.toFixed(2) + " [V]";
                        case 'debug[4]':
                            return value.toFixed(2) + " [A]";
                        case 'debug[5]':
                            return value.toFixed(0) + " [mAh]";
                        case 'debug[6]':
                        case 'debug[7]':
                            return value.toFixed(0);
                    }
                    break;
                case 'ESC_SENSOR_FRAME':
                    return value.toFixed(0);
                case 'SCHEDULER':
                    return value.toFixed(0) + " µs";
                case 'STACK':
                    return value.toFixed(0);
                case 'DYN_NOTCH':
                    switch (fieldName) {
                        case 'debug[0]':
                        case 'debug[1]':
                            return value.toFixed(0) + "°/s";
                        default:
                            return value.toFixed(0) + " Hz";
                    }
                    break;
                case 'DYN_NOTCH_TIME':
                    switch (fieldName) {
                        case 'debug[6]':
                        case 'debug[7]':
                            return value.toFixed(0);
                        default:
                            return value.toFixed(0) + " µs";
                    }
                    break;
                case 'DYN_NOTCH_FREQ':
                    return (value / 10).toFixed(1) + " Hz";
                case 'DSHOT_RPM_TELEMETRY':
                    return (value * 200 / flightLog.getSysConfig()['motor_poles']).toFixed(0) + " rpm";
                case 'RPM_FILTER':
                    switch (fieldName) {
                        case 'debug[0]': // motor rpm
                            return value.toFixed(0) + ' rpm';
                        case 'debug[1]': // freq
                        case 'debug[2]': // notch
                        case 'debug[3]': // update rate
                        case 'debug[5]': // min hz
                        case 'debug[6]': // max hz
                            return (value/10).toFixed(1) + ' Hz';
                        case 'debug[4]': // motor
                            return value.toFixed(0);
                        case 'debug[7]': // notch q
                            return (value/10).toFixed(1);
                    }
                    break;
                case 'D_MIN':
                    switch (fieldName) {
                        case 'debug[0]': // roll gyro factor
                        case 'debug[1]': // roll setpoint Factor
                            return value.toFixed(0) + '%';
                        case 'debug[2]': // roll actual D
                        case 'debug[3]': // pitch actual D
                            return (value / 10).toFixed(1);
                    }
                    break;
                case 'ITERM_RELAX':
                    switch (fieldName) {
                        case 'debug[0]': // roll setpoint high-pass filtered
                            return value.toFixed(0) + '°/s';
                        case 'debug[1]': // roll I-term relax factor
                            return value.toFixed(0) + '%';
                        case 'debug[3]': // roll absolute control axis error
                            return (value / 10).toFixed(1) + 'deg';
                    }
                    break;
                case 'DYN_LPF':
                    switch (fieldName) {
                        case 'debug[0]': // gyro scaled [for selected axis]
                            return Math.round(value) + "°/s";
                        default:
                            return value.toFixed(0) + " Hz";
                    }
                    break;
                case 'DYN_IDLE':
                    switch (fieldName) {
                        case 'debug[3]': // minRPS best shown as rpm, since commanded value is rpm
                            return (value * 6);
                        default:
                            return value.toFixed(0);
                    }
                case 'AC_ERROR':
                    return (value / 10).toFixed(1) + 'deg';
                case 'AC_CORRECTION':
                    return (value / 10).toFixed(1) + '°/s';
                case 'GPS_RESCUE_THROTTLE_PID':
                        return value.toFixed(0);
                case 'RTH':
                    switch(fieldName) {
                        case 'debug[1]':
                            return (value / 100).toFixed(1) + 'deg';
                        default:
                            return value.toFixed(0);
                    }
                case 'YAW_PRECOMP':
                    switch (fieldName) {
                        case 'debug[0]': // collective deflection
                        case 'debug[1]': // collective ff
                        case 'debug[2]': // collective hf
                        case 'debug[3]': // cyclic deflection
                        case 'debug[4]': // yaw collective ff
                        case 'debug[5]': // yaw collective hf
                        case 'debug[6]': // yaw cyclic ff
                        case 'debug[7]': // yaw total precomp
                            return (value / 10).toFixed(1) + '%';
                    }
                    break;
                case 'GOVERNOR':
                    switch (fieldName) {
                        case 'debug[0]': // requested head speed
                        case 'debug[1]': // target head speed
                        case 'debug[2]': // actual head speed
                            return value.toFixed(0) + 'rpm';
                        case 'debug[3]': // gov.pidSum * 1000
                        case 'debug[4]': // gov.P * 1000
                        case 'debug[5]': // gov.I * 1000
                        case 'debug[6]': // gov.D * 1000
                        case 'debug[7]': // gov.F * 1000
                            return (value / 10).toFixed(1) + '%';
                    }
                    break;
                case 'RX_TIMING':
                    switch (fieldName) {
                        case 'debug[0]': // average rx refresh rate
                        case 'debug[1]': // average rx refresh rate * currentMult
                        case 'debug[2]': // current refresh rate
                        case 'debug[4]': // frame delta us
                        case 'debug[5]': // local delta us
                        case 'debug[6]': // frame age us
                           return value.toFixed(0) + 'µs';
                        case 'debug[7]': // currentMult
                            break;
                    }
                    break;
                case 'FREQ_SENSOR':
                    switch (fieldName) {
                        case 'debug[0]': // input freq
                        case 'debug[1]': // freq
                            return (value / 1000).toFixed(2) + 'Hz';
                        case 'debug[2]': // input period
                        case 'debug[3]': // period
                            return value.toFixed(0) + 'ticks';
                        case 'debug[4]': // zeros
                        case 'debug[5]': // prescaler
                            break;
                    }
                    break;
                case 'PITCH_PRECOMP':
                    switch (fieldName) {
                        case 'debug[0]': // collective deflection
                        case 'debug[1]': // pitch precomp
                            return (value / 10).toFixed(1) + '%';
                    }
                    break;
                case 'RESCUE':
                    switch (fieldName) {
                        case 'debug[0]': // roll attitude
                        case 'debug[1]': // pitch attitude
                        case 'debug[2]': // yaw attitude
                            return (value / 10).toFixed(1) + 'deg';
                        case 'debug[3]': // cos tilt angle
                            return (value / 1000).toFixed(2);
                        case 'debug[4]': // setpoint roll
                        case 'debug[5]': // setpoint pitch
                        case 'debug[6]': // setpoint yaw
                            return value.toFixed(0) + " °/s";
                        case 'debug[7]': // setpoint collective
                            break;
                    }
                    break;
                case 'SETPOINT':
                    switch (fieldName) {
                        case 'debug[0]': // rc deflection
                        case 'debug[1]': // sp after cyclic ring
                        case 'debug[2]': // sp after slew limit
                        case 'debug[3]': // sp after filter
                            return (value / 10).toFixed(1) + "%";
                        case 'debug[4]': // sp after rates
                        case 'debug[5]': // maximum
                        case 'debug[6]': // cutoff
                            break;
                        case 'debug[7]': // frame rate
                            return value.toFixed(0) + " µs";
                    }
                    break;
                case 'AIRBORNE':
                    switch (fieldName) {
                        case 'debug[0]': // sqrt sp max roll
                        case 'debug[1]': // sqrt sp max pitch
                        case 'debug[2]': // sqrt sp max yaw
                        case 'debug[3]': // sqrt sp max collective
                        case 'debug[4]': // cos tilt angle
                            return (value / 1000).toFixed(2);
                        case 'debug[5]': // is spooled up
                        case 'debug[6]': // is hands on
                        case 'debug[7]': // is airborne
                            break;
                    }
                    break;
            }
            return value.toFixed(0);
        }
        return "";
    };

    FlightLogFieldPresenter.fieldNameToFriendly = function(fieldName, debugMode) {
        if (debugMode) {
            if (fieldName.includes('debug')) {
                var debugModeName = DEBUG_MODE[debugMode];
                var debugFields;
                if (debugModeName) {
                    debugFields = DEBUG_FRIENDLY_FIELD_NAMES[debugModeName];
                }

                if (!debugFields) {
                    if (fieldName === 'debug[all]') {
                        return 'Debug (' + (debugModeName || debugMode) + ')';
                    }
                    debugFields = DEBUG_FRIENDLY_FIELD_NAMES[DEBUG_MODE[0]];
                }

                if (debugFields[fieldName])
                    return debugFields[fieldName];

                return fieldName;
            }
        }
        if (FRIENDLY_FIELD_NAMES[fieldName]) {
            return FRIENDLY_FIELD_NAMES[fieldName];
        }

        return fieldName;
    };
})();
