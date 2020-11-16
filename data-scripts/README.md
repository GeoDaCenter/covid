# Data Scripts

This folder contains scripts for processing COVID data used in the Atlas.

## Setup

To get started running the data scripts, follow these instructions to set up the expected Python environment.

### macOS

1. Install the [Homebrew](https://brew.sh/) package manager.
2. Install [Pipenv](https://pipenv.pypa.io/en/latest/) for managing Python dependencies: `brew install pipenv`
3. Run `pipenv install` from this directory.

### Linux

If on Debian (Buster+):

1. Install [Pipenv](https://pipenv.pypa.io/en/latest/) for managing Python dependencies: `sudo apt install pipenv`
3. Run `pipenv install` from this directory.

### Windows

_TODO_

## Usage

See the `README.md` in individual script folders for usage instructions.

## Update Workflow (Notes for Automation)
### run the following scripts:
1. data-scripts/_1p3a/_1p3a.py
2. data-scripts/usafacts/usafacts.py
3. data-scripts/states_update_testing.r
4. data-scripts/Geojson to CSV.py

### Note that the R script for handling testing data is different on the covid-atlas-research repo because that script is designed where it is run the last (after the Geojson to CSV.py, and was designed with not needing the Geojson to CSV.py in mind (This script will be incorporated into 1p3a.py if need be, easy fix here.))
