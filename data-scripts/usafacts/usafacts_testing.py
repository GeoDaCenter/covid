import os
import csv
import pytz
import json
from datetime import datetime, timedelta

import boto3
import requests
import pandas as pd
import geopandas as gpd

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

# Vidal you can set up GitHub access to our private repo, or you can try changing tokens at line 40-43.


def usafacts_testing():
    working_dir = os.path.join(dir_path, '_working')
    os.makedirs(working_dir, exist_ok=True)
    
    #testing_url = "https://raw.githubusercontent.com/GeoDaCenter/covid-atlas-research/master/Testing_Data/python/county_hist.csv?token=AL7MVTCZMWHNIY5TVWYNGWK7QCJU4"
    #download_data(testing_url, working_dir, 'testing_raw.csv')
    #positivity_url = "https://raw.githubusercontent.com/linqinyu/covid/master/public/testingpos_usafacts.csv"
    #download_data(positivity_url, working_dir, 'positivity_raw.csv')

    #dateparse = lambda dates: [pd.datetime.strptime(d, '%m/%d/%Y') for d in dates
    df = pd.read_csv("_working/positivity_raw.csv")
    df["countyFIPS"] = df.countyFIPS.astype(str)
    #df = df.drop(['stateFIPS'], axis=1)
    df.to_csv("_working/positivity_raw.csv", index = False)
    
    validate_and_process()

    month_day = get_month_day()

    create_geojson_files(month_day)

    try:
        print('Writing to S3...')
        s3 = boto3.resource('s3')
        s3.Object('geoda-covid-atlas', 'testing_usafacts.csv').put(Body=open(os.path.join(repo_root, 'public/covid_testing_usafacts.csv'), 'rb'))
        s3.Object('geoda-covid-atlas', 'testingpos_usafacts.csv').put(Body=open(os.path.join(repo_root, 'public/covid_positivity_usafacts.csv'), 'rb'))
        print('Write to S3 complete.')

    except Exception as e:
        print(e)
        
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
    with open(os.path.join(dir_path, '_working/testing_usafacts.csv'), encoding='utf-8-sig') as testing_in_file, open(os.path.join(dir_path, '_working/positivity_raw.csv'), encoding='utf-8-sig') as positivity_in_file, open(os.path.join(repo_root, 'public/testing_usafacts.csv'), 'w+') as testing_out_file, open(os.path.join(repo_root, 'public/testingpos_usafacts.csv'), 'w+') as positivity_out_file:
      testing_csv_reader =  csv.DictReader(testing_in_file)
      testing_source_field_names = testing_csv_reader.fieldnames
      
      positivity_csv_reader =  csv.DictReader(positivity_in_file)
      positivity_source_field_names = positivity_csv_reader.fieldnames

###!Not sure about the following error handling. The code worked without it.
      # VALIDATE: make sure testing contain yesterday's data
      #yesterday = datetime.now(pytz.timezone('US/Central')) - timedelta(days=1)
      #yesterday_source_field = yesterday.strftime('%-m/%-d/%y')
      #print(yesterday)
      #print(yesterday_source_field)
      #testing_last_date = testing_source_field_names[-1]
      #print(testing_last_date)
      #if testing_last_date != yesterday_source_field:
      #  raise ValueError("Testing do not contain yesterday's data; last date {}".format(testing_last_date))
      #  pass
  
      # VALIDATE: make sure positivity contain yesterday's data
      #positivity_last_date = positivity_source_field_names[-1]
      #print(positivity_last_date)
      #if positivity_last_date != yesterday_source_field:
      #  raise ValueError("Positivity do not contain yesterday's data; last date {}".format(positivity_last_date))
      #  pass
        
      testing_out_rows = []
      positivity_out_rows = []
      
      # VALIDATE: make sure all testing rows belong to a known county
      for testing_row in testing_csv_reader:
        fips = testing_row['countyFIPS']
        county_name = testing_row['County Name']
        state_abbr = testing_row['State']

        if fips not in fips_set:
          print('WARNING: Testing - Skipping unknown county based on FIPS ({}): {} County, {}'.format(fips, county_name, state_abbr))
          continue

        testing_out_rows.append(testing_row)
        
      # VALIDATE: make sure all positivity rows belong to a known county
      for positivity_row in positivity_csv_reader:
        fips = positivity_row['countyFIPS']
        county_name = positivity_row['County Name']
        state_abbr = positivity_row['State']

        if fips not in fips_set:
          print('WARNING: Positivity - Skipping unknown county based on FIPS ({}): {} County, {}'.format(fips, county_name, state_abbr))
          continue

        positivity_out_rows.append(positivity_row)

      '''
      LOAD
      '''

      out_field_names = list(testing_out_rows[0].keys())

      testing_csv_writer = csv.DictWriter(testing_out_file, fieldnames=out_field_names)
      testing_csv_writer.writeheader()
      testing_csv_writer.writerows(testing_out_rows)
      
      positivity_csv_writer = csv.DictWriter(positivity_out_file, fieldnames=out_field_names)
      positivity_csv_writer.writeheader()
      positivity_csv_writer.writerows(positivity_out_rows)
    print('Finished.')
    
    
def create_geojson_files(month_day):
    county_geom = gpd.read_file(os.path.join(repo_root, 'public/county_usfacts.geojson'))

    for dataset in ['testing', 'positivity']:
        data  = pd.read_csv(os.path.join(repo_root, 'public/{}_usafacts.csv'.format(dataset)))
        county_geom['GEOID']  = county_geom['GEOID'].apply(lambda x: str(x).zfill(5))
        county_geom['GEOID'] = county_geom['GEOID'].astype(str)
        data['countyFIPS']  = data.countyFIPS.apply(lambda x: str(x).zfill(5))
        data['countyFIPS'] = data['countyFIPS'].astype(str)
        data_geom = county_geom.merge(data, left_on='GEOID', right_on='countyFIPS', how='left')
        data_geom = data_geom.fillna(-1)
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
    usafacts_testing()