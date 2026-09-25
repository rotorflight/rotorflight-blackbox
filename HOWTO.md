## Build Process

### Setup

1. Change to the project folder
2. Install Node.js 24 (the default in `.nvmrc`): `nvm install`
3. Install dependencies: `make init`
4. Start the development server: `make dev-server`
5. In another terminal, launch the desktop shell: `make dev-client`

Node.js and npm must be on your PATH. The supported Node range is
`^20.19.0 || >=22.12.0`, matching Wingflight Blackbox. Make downloads and runs Yarn 1.22.22 through
npm's `npx` command; a global Yarn installation is not required.

The server uses `http://localhost:8080/` and reloads when source files change.
The app runs in the NW.js desktop client, which provides its native APIs.
Stop the server with Ctrl+C and close the client window when finished. The first client launch downloads the NW.js SDK into `cache/`.

Run `make` or `make help` for the command list. `make web` aliases `make dev-server`.
`make debug`, `make apps`, and `make release` retain the existing desktop build workflow.
Vite is used only for development; Gulp still packages releases.

These Make commands require GNU Make and a POSIX shell (for example Git Bash on Windows).
Run both commands in the same environment. Under WSL, the client is a Linux GUI app
and requires WSLg or an X server. Without Make, use `npx --yes --package=yarn@1.22.22 yarn install --frozen-lockfile`,
`npx --yes --package=yarn@1.22.22 yarn dev`, and
`npx --yes --package=yarn@1.22.22 yarn gulp dev-client` respectively.

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
- At https://github.com/rotorflight/rotorflight-blackbox, select Clone or Download > Open in Desktop

(The GitHub Desktop application should come to the front and create a repository (not necessarily where you want it).  The rotorflight-blackbox repository (folder) should appear under the list of local repositories.  You can find your local repository location on your mac using the 'Locate in Finder' command GitHub Desktop  It can be moved somewhere more else, but you'll then need to tell Github where you're moved it to.)

Open Terminal.app and install or update homebrew:
```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
install node 8.x and yarn, if already installed, agree to update them
```
brew install node@8 yarn
```
Change Terminal's working directory wherever you put the rotorflight-blackbox folder; easiest way is to type 'cd ' in Terminal then drag the rotorflight-blackbox folder from the Finder to the terminal window.  Or use a terminal command like

```
cd ~/mydirectorypath/rotorflight-blackbox
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
* **Windows** use `yarn gulp <task-name> --win64`

You can also use multiple platforms e.g. `yarn gulp <taskname> --osx64 --linux64`. Other platforms like `--win32` and `--linux32` can be used too, but they are not officially supported, so use them at your own risk.

