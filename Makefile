##
## Makefile for Rotorflight Blackbox
##

.DEFAULT_GOAL := help
.DELETE_ON_ERROR:

# Default version number
SEMVER ?= 0.0.0

# npm supplies npx; no global Yarn installation is required.
ifeq ($(OS),Windows_NT)
NPX ?= npx.cmd
else
NPX ?= npx
endif
YARN := $(NPX) --yes --package=yarn@1.22.22 yarn


## Rules

.PHONY: all init apps debug release version clean realclean distclean dev-server dev-client web help


all: apps ## Build desktop apps for the current platform

init: ## Install development dependencies
	$(YARN) install --frozen-lockfile

apps: ## Build desktop apps for the current platform
	$(YARN) gulp apps

debug: ## Build and launch the desktop debug app
	$(YARN) gulp debug

release: ## Build installers for the current platform
	$(YARN) gulp release

version: ## Set application version using SEMVER
	sed -i -e 's/\("version":[ \t]*\)".*"/\1"$(SEMVER)"/' package.json


## Cleaning

clean: ## Remove build output
	rm -fr apps debug release dev-client

realclean: clean ## Also remove dist
	rm -fr dist

distclean: realclean ## Also remove cached runtimes and dependencies
	rm -fr cache node_modules


## Development

dev-server: ## Serve the app at http://localhost:8080 with reload on save
	$(YARN) dev

web: dev-server ## Alias for dev-server

dev-client: ## Launch NW.js against dev-server (start the server first)
	$(YARN) gulp dev-client

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "  make %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
