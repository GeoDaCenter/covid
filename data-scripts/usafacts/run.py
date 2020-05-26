import csv
from datetime import datetime, timedelta
import json
import os
import requests

'''
SET UP
'''

# make _working dir if it doesn't exist. this is where working files and output
# are stored.
os.makedirs('./_working', exist_ok=True)

'''
EXTRACT
'''

# get cases
cases_url = 'https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_confirmed_usafacts.csv'

cases_request = requests.get(cases_url)

with open('./_working/cases_raw.csv', 'wb+') as out_file:
  out_file.write(cases_request.content)

# get deaths
deaths_url = 'https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_deaths_usafacts.csv'

deaths_request = requests.get(deaths_url)

with open('./_working/deaths_raw.csv', 'wb+') as out_file:
  out_file.write(deaths_request.content)

'''
VALIDATE/TRANSFORM
'''

# make a set of our county fips to validate against
fips_set = None

with open('../../data/county_3220.geojson') as in_file:
  data = json.load(in_file)
  features = data['features']
  fips_list = [str(int(x['properties']['GEOID'])) for x in features]
  fips_set = set(fips_list)

# note: we need to open the files with encoding `utf-8-sig` to correctly parse
# the byte-order mark (bom) of the sources files
# https://stackoverflow.com/a/49150749
with open('./_working/cases_raw.csv', encoding='utf-8-sig') as cases_in_file, open('./_working/deaths_raw.csv', encoding='utf-8-sig') as deaths_in_file, open('./_working/cases.csv', 'w+') as cases_out_file, open('./_working/deaths.csv', 'w+') as deaths_out_file:
  cases_csv_reader =  csv.DictReader(cases_in_file)
  cases_source_field_names = cases_csv_reader.fieldnames

  deaths_csv_reader = csv.DictReader(deaths_in_file)
  deaths_source_field_names = deaths_csv_reader.fieldnames

  # VALIDATE: make sure cases contain yesterday's data
  yesterday = datetime.today() - timedelta(days=1)
  yesterday_source_field = yesterday.strftime('%-m/%-d/%y')
  
  cases_last_date = cases_source_field_names[-1]

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
