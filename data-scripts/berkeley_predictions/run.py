import csv
from datetime import datetime
import re
import requests

# fetch predictions
url = 'https://docs.google.com/spreadsheets/d/1ZSG7o4cV-G0Zg3wlgJpB2Zvg-vEN1i_76n2I-djL0Dk/export?format=csv&id=1ZSG7o4cV-G0Zg3wlgJpB2Zvg-vEN1i_76n2I-djL0Dk&gid=1341003284'

request = requests.get(url)

# write to a csv file in the `_working` directory, in case we want to inspect
# the source data
with open('./_working/predictions_raw.csv', 'wb+') as out_file:
  out_file.write(request.content)

# transform data and write out
with open('./_working/predictions_raw.csv') as in_file, open('./_working/predictions.csv', 'w+') as out_file:
  # skip first few rows (explanatory text) and read in rest of rows
  lines = in_file.readlines()[2:]

  # parse csv as dicts
  csv_reader = csv.DictReader(lines)


  '''
  CREATE FIELD MAP
  '''

  # TODO this is really only for date fields, so could be named more accurately
  field_map = {}
  source_field_names = csv_reader.fieldnames

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
      field_map[prediction_date] = source_field_name

    # check for interval field
    elif interval_field_match:
      # reformat date
      # TODO this duplicates most of the code just above this, so could be a
      # util
      source_interval_date = interval_field_match.group(1)
      source_interval_date_dt = datetime.strptime(source_interval_date, '%B %d')
      source_interval_date_dt = source_interval_date_dt.replace(year=2020)
      interval_date = source_interval_date_dt.strftime('deaths_intervals_%Y_%m_%d')
      field_map[interval_date] = source_field_name


  '''
  PROCESS ROWS
  '''
  
  out_rows = []

  # loop over counties
  for row in csv_reader:
    fips = row['countyFIPS']
    # parse fips as int (this is what our counties geojson looks like)
    fips_int = int(fips)

    out_row = {
      'fips': fips_int,
      'severity_index': row['Severity County 5-day'],
    }

    # add predictions
    for field_name, source_field_name in field_map.items():
      out_row[field_name] = row[source_field_name]

    out_rows.append(out_row)


  '''
  WRITE OUT
  '''

  out_field_names = list(out_rows[0].keys())
  
  csv_writer = csv.DictWriter(out_file, fieldnames=out_field_names)
  
  csv_writer.writeheader()
  csv_writer.writerows(out_rows)

print('Finished.')
