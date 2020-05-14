# Berkeley Predictions

This scripts downloads the Berkeley county-level predictions data and processes it for use in the Atlas.

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

1. **Download the Berkeley predictions CSV**. (You don't have to worry about this file, but if you need to look at it for debugging purposes it's located in `_working/predictions_raw.csv` after the script runs.)
2. **Transform data**. Field names are standardized and made more machine-friendly. County FIPS are also converted to integers to match our county GeoJSON IDs.
3. **Output the cleaned file**. This can be found in `_working/predictions.csv`
