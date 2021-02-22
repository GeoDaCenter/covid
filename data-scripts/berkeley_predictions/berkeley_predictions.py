import os
import re
import csv
import json
from datetime import datetime

import pytz
import boto3
import requests
import pandas as pd

# this is to handle known discrepancies between our fips and theirs
OVERRIDES = {'county_fips_overrides': {# theirs => ours
                                       '2270': '2158',
                                       '46113': '46102',
                                      },
            }

URL = 'https://docs.google.com/spreadsheets/d/1ZSG7o4cV-G0Zg3wlgJpB2Zvg-vEN1i_76n2I-djL0Dk/export?format=csv&id=1ZSG7o4cV-G0Zg3wlgJpB2Zvg-vEN1i_76n2I-djL0Dk&gid=1341003284'

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def berkeley_predictions():

    working_dir = os.path.join(dir_path, '_working')
    os.makedirs(working_dir, exist_ok=True)

    download_data(URL, working_dir, 'predictions_raw.csv')

    validate_and_process()


def validate_and_process():

    # make a set of our county fips to validate against
    fips_set = None

    with open(os.path.join(repo_root, 'data/county_3220.geojson')) as in_file:
      data = json.load(in_file)
      features = data['features']
      fips_list = [str(int(x['properties']['GEOID'])) for x in features]
      fips_set = set(fips_list)

    with open(os.path.join(dir_path, '_working/predictions_raw.csv')) as in_file, open(os.path.join(repo_root, 'public/csv/berkeley_predictions.csv'), 'w+') as out_file:
      # skip first few rows (explanatory text) and read in rest of rows
      lines = in_file.readlines()[2:]

      # parse csv as dicts
      csv_reader = csv.DictReader(lines)
      source_field_names = csv_reader.fieldnames

      # VALIDATE: make sure first column is for today's date
      # note: this assumes the dates are in order from left to right
      for source_field_name in source_field_names:
        source_date_field_prefix = 'Predicted Deaths by'

        if source_field_name.startswith(source_date_field_prefix):
          source_date_today = datetime.now(pytz.timezone('US/Central')).strftime('%B %d')
          source_date_field_today = ' '.join([source_date_field_prefix, source_date_today])

          # if source_field_name != source_date_field_today:
          #   raise ValueError("Predictions do not start from today's date; expecting {}, saw {}".format(source_date_field_today, source_field_name))

          break

      # TRANSFORM: create map of standardized/machine-friendly date fields
      # (e.g. Predictions for May 14 => deaths_2020_05_14)
      date_field_map = {}

      prediction_field_pat = r'Predicted Deaths by (\w+ \d+)'
      interval_field_pat = r'Predicted Deaths Intervals by (\w+ \d+)'

      # get all prediction and interval field matches
      for source_field_name in source_field_names:
        # check for prediction field
        prediction_field_match = re.match(prediction_field_pat, source_field_name)
        interval_field_match = re.match(interval_field_pat, source_field_name)

        field_name = None

        if prediction_field_match:
          # reformat date
          source_prediction_date = prediction_field_match.group(1)
          source_prediction_date_dt = datetime.strptime(source_prediction_date, '%B %d')
          source_prediction_date_dt = source_prediction_date_dt.replace(year=2020)
          prediction_date = source_prediction_date_dt.strftime('deaths_%Y_%m_%d')
          date_field_map[prediction_date] = source_field_name

        # check for interval field
        elif interval_field_match:
          # reformat date
          # TODO this duplicates most of the code just above this, so could be a
          # util
          source_interval_date = interval_field_match.group(1)
          source_interval_date_dt = datetime.strptime(source_interval_date, '%B %d')
          source_interval_date_dt = source_interval_date_dt.replace(year=2020)
          interval_date = source_interval_date_dt.strftime('deaths_intervals_%Y_%m_%d')
          date_field_map[interval_date] = source_field_name

      # field-level validations/transforms
      county_fips_overrides = OVERRIDES['county_fips_overrides']
      out_rows = []

      for row in csv_reader:
        fips = row['countyFIPS']

        # TRANSFORM: apply fips overrides
        if fips in county_fips_overrides:
           fips = county_fips_overrides[fips]

        # VALIDATE: make sure their fips match ours (accounting for known mismatches)
        if fips not in fips_set:
          county_name = row['CountyName']
          state_name = row['StateName']

          raise ValueError('Unknown county based on FIPS ({}): {} County, {}'.format(fips, county_name, state_name))

        out_row = {
          'fips': fips,
          'severity_index': row['Severity County 5-day'],
        }

        # add predictions
        for field_name, source_field_name in date_field_map.items():
          out_row[field_name] = row[source_field_name]

        out_rows.append(out_row)

      out_field_names = list(out_rows[0].keys())

      csv_writer = csv.DictWriter(out_file, fieldnames=out_field_names)

      csv_writer.writeheader()
      csv_writer.writerows(out_rows)

      try:
          print('Writing to S3...')
          s3 = boto3.resource('s3')
          s3.Object('geoda-covid-atlas', 'berkeley_predictions.csv').put(Body=open(os.path.join(repo_root, 'public/csv/berkeley_predictions.csv'), 'rb'))
          print('Write to S3 complete.')
      except Exception as e:
          print(e)

    print('Finished.')


def download_data(url, target_dir, filename):
    request = requests.get(url)

    with open(os.path.join(target_dir, filename), 'wb+') as out_file:
      out_file.write(request.content)




if __name__ == '__main__':
    berkeley_predictions()
