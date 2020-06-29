import os
import csv
import pytz
import json
from datetime import datetime, timedelta

import requests
import pandas as pd
import geopandas as gpd

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def usafacts():
    working_dir = os.path.join(dir_path, '_working')
    os.makedirs(working_dir, exist_ok=True)

    cases_url = 'https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_confirmed_usafacts.csv'
    download_data(cases_url, working_dir, 'cases_raw.csv')

    deaths_url = 'https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_deaths_usafacts.csv'
    download_data(deaths_url, working_dir, 'deaths_raw.csv')

    validate_and_process()

    month_day = get_month_day()

    create_geojson_files(month_day)


def validate_and_process():
    fips_set = None

    with open(os.path.join(repo_root, 'data/county_3220.geojson')) as in_file:
      data = json.load(in_file)
      features = data['features']
      fips_list = [str(int(x['properties']['GEOID'])) for x in features]
      fips_set = set(fips_list)

    # note: we need to open the files with encoding `utf-8-sig` to correctly parse
    # the byte-order mark (bom) of the sources files
    # https://stackoverflow.com/a/49150749
    with open(os.path.join(dir_path, '_working/cases_raw.csv'), encoding='utf-8-sig') as cases_in_file, open(os.path.join(dir_path, '_working/deaths_raw.csv'), encoding='utf-8-sig') as deaths_in_file, open(os.path.join(repo_root, 'docs/covid_confirmed_usafacts.csv'), 'w+') as cases_out_file, open(os.path.join(repo_root, 'docs/covid_deaths_usafacts.csv'), 'w+') as deaths_out_file:
      cases_csv_reader =  csv.DictReader(cases_in_file)
      cases_source_field_names = cases_csv_reader.fieldnames

      deaths_csv_reader = csv.DictReader(deaths_in_file)
      deaths_source_field_names = deaths_csv_reader.fieldnames

      # VALIDATE: make sure cases contain yesterday's data
      yesterday = datetime.now(pytz.timezone('US/Central')) - timedelta(days=1)
      yesterday_source_field = yesterday.strftime('%-m/%-d/%y')
      print(yesterday)
      print(yesterday_source_field)
      cases_last_date = cases_source_field_names[-1]
      print(cases_last_date)
      if cases_last_date != yesterday_source_field:
        raise ValueError("Cases do not contain yesterday's data; last date {}".format(cases_last_date))

      # VALIDATE: make sure deaths contain yesterday's data
      deaths_last_date = deaths_source_field_names[-1]

      if deaths_last_date != yesterday_source_field:
        raise ValueError("Deaths do not contain yesterday's data; last date {}".format(deaths_last_date))

      cases_out_rows = []
      deaths_out_rows = []

      # VALIDATE: make sure all cases rows belong to a known county
      for cases_row in cases_csv_reader:
        fips = cases_row['countyFIPS']
        county_name = cases_row['County Name']
        state_abbr = cases_row['State']

        if fips not in fips_set:
          print('WARNING: Cases - Skipping unknown county based on FIPS ({}): {} County, {}'.format(fips, county_name, state_abbr))
          continue

        # TODO tidy field names?

        cases_out_rows.append(cases_row)

      # VALIDATE: make sure all deaths rows belong to a known county
      for deaths_row in deaths_csv_reader:
        fips = deaths_row['countyFIPS']
        county_name = deaths_row['County Name']
        state_abbr = deaths_row['State']

        if fips not in fips_set:
          print('WARNING: Deaths - Skipping unknown county based on FIPS ({}): {} County, {}'.format(fips, county_name, state_abbr))
          continue

        # TODO tidy field names?

        deaths_out_rows.append(deaths_row)

      '''
      LOAD
      '''

      out_field_names = list(cases_out_rows[0].keys())

      cases_csv_writer = csv.DictWriter(cases_out_file, fieldnames=out_field_names)
      cases_csv_writer.writeheader()
      cases_csv_writer.writerows(cases_out_rows)

      deaths_csv_writer = csv.DictWriter(deaths_out_file, fieldnames=out_field_names)
      deaths_csv_writer.writeheader()
      deaths_csv_writer.writerows(deaths_out_rows)

    print('Finished.')


def create_geojson_files(month_day):
    county_geom = gpd.read_file(os.path.join(repo_root, 'docs/county_usfacts.geojson'))

    for dataset in ['confirmed', 'deaths']:
        data  = pd.read_csv(os.path.join(repo_root, 'docs/covid_{}_usafacts.csv'.format(dataset)))
        data['countyFIPS']  = data.countyFIPS.apply(lambda x: str(x).zfill(5))
        data_geom = county_geom.merge(data, left_on='GEOID', right_on='countyFIPS', how='left')
        data_geom = data_geom.fillna(0)
        for column in data_geom.columns:
            if '/' in column:
                data_geom[column] = data_geom[column].astype(int)
        save_path = os.path.join(repo_root, 'download/usafacts_{}_{}.geojson'.format(dataset, month_day))
        data_geom.to_file(save_path, driver='GeoJSON')


def download_data(url, target_dir, filename):
    request = requests.get(url)

    with open(os.path.join(target_dir, filename), 'wb+') as out_file:
      out_file.write(request.content)


def get_month_day():
    month = str(datetime.now(pytz.timezone('US/Central')).month)
    day   = str(datetime.now(pytz.timezone('US/Central')).day).zfill(2)

    return month + '.' + day

if __name__ == '__main__':
    usafacts()
