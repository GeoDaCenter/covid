# USAFacts COVID Data

This scripts downloads the [USAFacts](https://usafacts.org/data/) county-level COVID data and processes it for use in the Atlas.

## Usage

Note: make sure you've followed the setup instructions from `data-scripts/README.md` to create the expected Python environment.

First, activate the virtual environment:

```bash
pipenv shell
```

Next, run the script:

```bash
python run.py
```

## Steps

The script will do the following:

1. **Download the USAFacts cases and deaths CSV**. (You don't have to worry about these files, but if you need to look at them for debugging purposes they can be found in the in `_working/` folder the script runs. They're the two files ending in `_raw.csv`.)
2. **Validate data**. The script checks to make sure both files contain 
yesterday's data (this is a way of checking to make sure USAFacts has made
their daily update). If data for yesterday is missing, the script will error.
It also excludes any rows that don't correspond to a known county FIPS code 
per our counties GeoJSON file.
3. **Output the cleaned files**. These can be found in `_working/` and are 
called `cases.csv` and `deaths.csv`, respectively.
