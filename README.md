# Rotorflight Blackbox Explorer

This is a version of Blackbox Explorer that has been customized for analyzing blackbox logs created by RotorFlight.

### Installation for End-Users:

Please see the "Releases" page on this Github repo to download the latest official release for your operating system:
* [Click here to go to Releases](https://github.com/rotorflight/rotorflight-blackbox/releases)

Please ignore any snapshots on this page (github is showing them automatically).

### Installation for Beta-testers:

Please see the "Actions" tab on this Github repo to download the latest build snapshot for your operating system:
* [Click here to go to the Actions tab](https://github.com/rotorflight/rotorflight-blackbox/actions)

Please note that build snapshots are available for beta-testing, and are otherwise _not_ supported.

### Developer installation and use as a Chrome app:

1. Fork the rotorflight-blackbox repo and use git to clone it to your local machine.
2. Install node.js:  https://nodejs.org/en/download/
... You do not need to install the optional npm tools for compling modules from C/C++.
3. Install yarn: `npm install yarn -g`
... Make sure you open a new command prompt for this (do not use one that was already open before you installed Node.js).
4. Change to project folder and run `yarn install`
... Optional:  Run `yarn start` to build & run the debug flavor.
5. Start Google Chrome.
6. Click the 3-dots on the far right of the URL bar.
7. Select "More Tools"
8. Select "Extensions"
9. Check the Developer Mode checkbox.
10. Click on load unpacked extension.
11. Point it to the folder you extracted the zip to.
12. In the chrome address bar, paste the following command:  chrome://apps
13.  Click on the Rotorflight Blackbox icon, and then use Blackbox as you normally would.

To change code in Blackbox explorer, just edit the javascript/html files or download/pull the new version from Github.
Go into Chrome's Extension page and click the circular "refresh" icon next to the Rotorflight extension.
Re-run Blackbox explorer from the chrome://apps page.

## Usage

Click the "Open log file/video" button at the top right and select your log file and your flight video (if you recorded one).

You can scroll through the log by clicking or dragging on the seek bar that appears underneath the main graph. The 
current time is represented by the vertical red bar in the center of the graph. You can also click and drag left and
right on the graph area to scrub backwards and forwards.

### Syncing your log to your flight video

The blackbox plays a short beep on the buzzer when arming, and this corresponds with the start of the logged data.
You can sync your log against your flight video by pressing the "start log here" button when you hear the beep in the
video. You can tune the alignment of the log manually by pressing the nudge left and nudge right buttons in the log
sync section, or by editing the value in the "log sync" box. Positive values move the log toward the end of the video, 
negative values move it towards the beginning.

### Customizing the graph display

Click the "Graph Setup" button on the right side of the display in order to choose which fields should be plotted on
the graph. You may, for example, want to remove the default gyro plot and add separate gyro plots for each rotation axis.
Or you may want to plot vbat against throttle to examine your battery's performance.

## Native app build via NW.js

### Development

1. Install node.js
2. Install yarn: `npm install yarn -g`.
3. Change to project folder and run `yarn install`.
4. Run `yarn start` to build & run the debug flavor.

### App build and release

The tasks are defined in `gulpfile.js` and can be run through yarn:
```
yarn gulp <taskname> [[platform] [platform] ...]
```

List of possible values of `<task-name>`:
* **dist** copies all the JS and CSS files in the `./dist` folder.
* **apps** builds the apps in the `./apps` folder [1].
* **debug** builds debug version of the apps in the `./debug` folder [1].
* **release** zips up the apps into individual archives in the `./release` folder [1]. 

[1] Running this task on macOS or Linux requires Wine, since it's needed to set the icon for the Windows app (build for specific platform to avoid errors).

#### Setting up and building on a Mac

- Install GitHub desktop application from https://desktop.github.com and open the GitHub Desktop application.
- At https://github.com/rotorflight/rotorflight-configurator, select Clone or Download > Open in Desktop

(The GitHub Desktop application should come to the front and create a repository (not necessarily where you want it).  The blackbox-log-viewer repository (folder) should appear under the list of local repositories.  You can find your local repository location on your mac using the 'Locate in Finder' command GitHub Desktop  It can be moved somewhere more else, but you'll then need to tell Github where you're moved it to.)

Open Terminal.app and install or update homebrew:
```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
install node 8.x and yarn, if already installed, agree to update them
```
brew install node@8 yarn
```
Change Terminal's working directory wherever you put blackbox-log-viewer folder; easiest way is to type 'cd ' in Terminal then drag the blackbox-log-viewer folder from the Finder to the terminal window.  Or use a terminal command like 
```
cd ~/mydirectorypath/blackbox-log-viewer
```

install dependencies into that folder (ignoring many confusing messages) with:
```
yarn install
```

finally build the DMG itself, which will end up in blackbox-log-viewer/release/, with:
```
yarn gulp release
```

#### Build or release app for one specific platform
To build or release only for one specific platform you can append the plaform after the `task-name`.
If no platform is provided, only for the platform you are builing from will be build.

* **MacOS X** use `yarn gulp <task-name> --osx64`
* **Linux** use `yarn gulp <task-name> --linux64`
* **Windows** use `yarn gulp <task-name> --win32`

You can also use multiple platforms e.g. `yarn gulp <taskname> --osx64 --linux64`. Other platforms like `--win64` and `--linux32` can be used too, but they are not officially supported, so use them at your own risk.

#### macOS DMG installation background image

The release distribution for macOS uses a DMG file to install the application.
The PSD source for the DMG backgound image can be found in the root (`dmg-background.png`). After changing the source, export the image to PNG format in folder `./images/`.

## Flight video won't load, or jumpy flight video upon export

Some flight video formats aren't supported by Chrome, so the viewer can't open them. You can fix this by re-encoding
your video using the free tool [Handbrake][]. Open your original video using Handbrake. In the output settings, choose
MP4 as the format, and H.264 as the video codec.

Because of [Google Bug #66631][], Chrome is unable to accurately seek within H.264 videos that use B-frames. This is
mostly fine when viewing the flight video inside Blackbox Explorer. However, if you use the "export video" feature, this
bug will cause the flight video in the background of the exported video to occasionally jump backwards in time for a
couple of frames, causing a very glitchy appearance.

To fix that issue, you need to tell Handbrake to render every frame as an intraframe, which will avoid any problematic
B-frames. Do that by adding "keyint=1" into the Additional Options box:

![Handbrake settings](screenshots/handbrake.png)

Hit start to begin re-encoding your video. Once it finishes, you should be able to load the new video into the Blackbox
Explorer.

[Handbrake]: https://handbrake.fr/
[Google Bug #66631]: http://code.google.com/p/chromium/issues/detail?id=66631

## License

This project is licensed under GPLv3.
