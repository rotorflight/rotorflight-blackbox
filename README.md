# Rotorflight Blackbox

**Rotorflight** is a _Flight Control_/_FBL_ Software Suite for traditional single-rotor RC helicopters. It is based on Betaflight 4.2, enjoying all the great features of the Betaflight platform, plus many new features added for helicopters. Rotorflight borrows ideas and code also from Heliflight3D, an earlier fork of Betaflight for helicopters.

**Rotorflight Blackbox** is a cross-platform log viewer and analyser for logs recorded with the Rotorflight flight control system. It is available for Windows, Mac OS, and Linux.

Rotorflight does **NOT** support multi-rotor 'drones', nor airplanes; it is only for traditinal RC helicopters, including co-axial and tandem helicopters.


## Installation

Please download the latest version from github:

 - https://github.com/rotorflight/rotorflight-blackbox/releases


## Notes

#### MacOS X users

Changes to the security model used in the latest versions of MacOS X 10.14 (Mojave) and 10.15 (Catalina) mean that the operating system will show an error message ('"Rotorflight Configurator.app" is damaged and can’t be opened. You should move it to the Trash.') when trying to install the application. To work around this, run the following command in a terminal after installing: `sudo xattr -rd com.apple.quarantine /Applications/Rotorflight\ Configurator.app`.


## Usage

Click the "Open log file/video" button at the top right and select your log file and your flight video (if you recorded one).

You can scroll through the log by clicking or dragging on the seek bar that appears underneath the main graph. The 
current time is represented by the vertical red bar in the center of the graph. You can also click and drag left and
right on the graph area to scrub backwards and forwards.

### Customizing the graph display

Click the "Graph Setup" button on the right side of the display in order to choose which fields should be plotted on
the graph. You may, for example, want to remove the default gyro plot and add separate gyro plots for each rotation axis.
Or you may want to plot vbat against throttle to examine your battery's performance.

### Syncing your log to your flight video

The blackbox plays a short beep on the buzzer when arming, and this corresponds with the start of the logged data.
You can sync your log against your flight video by pressing the "start log here" button when you hear the beep in the
video. You can tune the alignment of the log manually by pressing the nudge left and nudge right buttons in the log
sync section, or by editing the value in the "log sync" box. Positive values move the log toward the end of the video, 
negative values move it towards the beginning.

### Flight video won't load, or jumpy flight video upon export

Some flight video formats aren't supported by Chrome, so the viewer can't open them. You can fix this by re-encoding
your video using the free tool [Handbrake][]. Open your original video using Handbrake. In the output settings, choose
MP4 as the format, and H.264 as the video codec.

Because of [Google Bug #66631][], Chrome is unable to accurately seek within H.264 videos that use B-frames. This is
mostly fine when viewing the flight video inside Blackbox Explorer. However, if you use the "export video" feature, this
bug will cause the flight video in the background of the exported video to occasionally jump backwards in time for a
couple of frames, causing a very glitchy appearance.

To fix that issue, you need to tell Handbrake to render every frame as an intraframe, which will avoid any problematic
B-frames. Do that by adding "keyint=1" into the Additional Options box.


## Contributing

Contributions are welcome and encouraged. You can contribute in many ways:

 - testing Rotorflight with different types of helicopters
 - improving the documentation in the Wiki
 - writing How-To guides
 - provide a new translation for the configurator
 - implement new features or fix bugs
 - reporting bugs
 - new ideas & suggestions
 - helping other users


For reporting Rotorflight issues or bugs, please raise them here:

 - [Feature requests](https://github.com/rotorflight/rotorflight/issues)
 - [Configurator issue tracker](https://github.com/rotorflight/rotorflight-configurator/issues)
 - [Blackbox issue tracker](https://github.com/rotorflight/rotorflight-blackbox/issues)
 - [Firmware issue tracker](https://github.com/rotorflight/rotorflight-firmware/issues)


## Credits

Rotorflight is Free Software. Meaning, it is available free of charge _without warranty_, the source code is available, and it is supported by the users themselves as a community. Rotorflight is under the GPLv3 license.

Rotorflight is forked from Betaflight, which in turn is forked from Cleanflight.
Rotorflight borrows ideas and code also from Heliflight-3D, another Betaflight fork for helis.

So thanks goes to all those whom have contributed along the way.

Origins for Rotorflight:

 - **Petri Mattila** (Dr.Rudder) - author and maintainer
 - **pkaig** - wiki, resource mapping, testing
 - **egon** - wiki, Dutch translation, Lua Scripts, testing
 - **mopatop** - wiki, testing
 - **Mike_PSL** - wiki, testing
 - **mattis** - German translation, testing
 - **Simon Stummer** (simonsummer) - testing

And many others.

[Handbrake]: https://handbrake.fr/
[Google Bug #66631]: http://code.google.com/p/chromium/issues/detail?id=66631
