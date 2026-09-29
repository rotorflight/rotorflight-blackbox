## Build Process

### Setup

1. Change to the project folder
2. Install Node.js 24 (the default in `.nvmrc`): `nvm install`
3. Install dependencies: `make init`
4. Start the development server: `make dev-server`
5. In another terminal, launch the desktop shell: `make dev-client`

Node.js and [pnpm](https://pnpm.io/installation) 10 must be on your PATH (`corepack enable pnpm`
or `npm install -g pnpm@10`). The supported Node range is `^20.19.0 || >=22.12.0`, matching
Wingflight Blackbox. `yarn` is still a dev dependency because the desktop packaging step runs a
nested `yarn install` inside `dist/`, but you never need to run it yourself.

The server uses `http://localhost:8080/` and reloads when source files change.
Open that URL in a browser to use the web version, or use the NW.js desktop client for its native APIs.
Stop the server with Ctrl+C and close the client window when finished. The first client launch downloads the NW.js SDK into `cache/`.

Run `make` or `make help` for the command list. `make web` aliases `make dev-server`.
`make debug`, `make apps`, and `make release` retain the existing desktop build workflow.
Vite is used only for development; Gulp still packages releases.

These Make commands require GNU Make and a POSIX shell (for example Git Bash on Windows).
Run both commands in the same environment. Under WSL, the client is a Linux GUI app
and requires WSLg or an X server. Without Make, use `pnpm install --frozen-lockfile`,
`pnpm dev`, and `pnpm gulp dev-client` respectively.

### Web app

The app also runs as a static site in any modern browser. `js/browser_compat.js` stands in for
the NW.js/Chrome App APIs (`chrome.i18n`, `chrome.runtime`, `chrome.storage`) when they are
missing, and desktop-only code (native windows, file associations) is gated behind
`window.isNWjs()`. Exports use the browser's save picker, or a normal download where that isn't
supported.

`make web-dist` (or `pnpm gulp web-dist`) assembles the static site into `./web-dist`.

`.github/workflows/deploy-web.yml` builds it on every push to `master`, `RF-*`, `feature/**`,
`bugfix/**`, `experiment/**` and `release/**` branches, and on `release/*` and `snapshot/*` tags,
and publishes it to the `gh-pages` branch, served at https://blackbox.rotorflight.org/:

| Ref                         | URL                     |
|-----------------------------|-------------------------|
| `master`                    | `/master/`              |
| other branches              | `/<branch-name>/` (`/` replaced by `-`) |
| `release/X.Y.Z` tag         | `/release/X.Y.Z/`, and `/latest/` for plain X.Y.Z |
| `snapshot/<version>` tag    | `/snapshot/<version>/`  |

Deleting a branch removes its deployment. The landing page (`.github/pages/`) lists every
deployed build from `versions.json`, which `.github/scripts/generate_versions.py` regenerates on
each deploy.

### App build and release

The tasks are defined in `gulpfile.js` and can be run through pnpm:
```
pnpm gulp <taskname> [[platform] [platform] ...]
```

List of possible values of `<task-name>`:
* **web-dist** copies the static web app into the `./web-dist` folder.
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
install node and pnpm, if already installed, agree to update them
```
brew install node@24 pnpm
```
Change Terminal's working directory wherever you put the rotorflight-blackbox folder; easiest way is to type 'cd ' in Terminal then drag the rotorflight-blackbox folder from the Finder to the terminal window.  Or use a terminal command like

```
cd ~/mydirectorypath/rotorflight-blackbox
```

install dependencies into that folder (ignoring many confusing messages) with:
```
pnpm install
```

finally build the DMG itself, which will end up in rotorflight-blackbox/release/, with:
```
pnpm gulp release
```

#### Build or release app for one specific platform

To build or release only for one specific platform you can append the plaform after the `task-name`.
If no platform is provided, only for the platform you are builing from will be build.

* **MacOS X** use `pnpm gulp <task-name> --osx64`
* **Linux** use `pnpm gulp <task-name> --linux64`
* **Windows** use `pnpm gulp <task-name> --win64`

You can also use multiple platforms e.g. `pnpm gulp <taskname> --osx64 --linux64`. Other platforms like `--win32` and `--linux32` can be used too, but they are not officially supported, so use them at your own risk.


### Export regression checks

Run the native save-dialog and video-export tests with Node 24:

```
node --test test/save_file.test.cjs test/video_export.test.cjs
```

These tests simulate dialog selection/cancellation and check file writes and error handling.
Also check native Save As dialogs in the desktop client on your target platform.
