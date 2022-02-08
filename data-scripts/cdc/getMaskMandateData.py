import pandas as pd
import json, requests
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def main():
    raw = pd.read_csv('https://data.cdc.gov/api/views/62d6-pm5i/rows.csv?accessType=DOWNLOAD')
    raw['date'] = pd.to_datetime(raw['date'])
    raw['COUNTYFP'] = raw['FIPS_County'].astype(str)
    raw['COUNTYFP'] = raw['COUNTYFP'].str.zfill(3)
    raw['STATEFP'] = raw['FIPS_State'].astype(str)
    raw['GEOID'] = raw['STATEFP'] + raw['COUNTYFP']
    raw['Face_Masks_Required_in_Public'] = raw['Face_Masks_Required_in_Public'].replace("Yes", 1)
    raw['Face_Masks_Required_in_Public'] = raw['Face_Masks_Required_in_Public'].replace("No", 0)
    raw['Face_Masks_Required_in_Public'] = raw['Face_Masks_Required_in_Public'].fillna(-1)
    wide = raw.pivot(index = 'GEOID', columns = 'date', values = "Face_Masks_Required_in_Public")
    wide.to_csv(os.path.join(repo_root, 'public/csv/mask_mandate_cdc.csv'))
    
if __name__ == "__main__":
    main()