
import urllib.request
import csv
import os
import io
import json
import geopandas as gpd
import pandas as pd
import requests
from datetime import datetime

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def fetch_testing_data_state():
    working_dir = os.path.join(dir_path, '_working')
    os.makedirs(working_dir, exist_ok=True)
    testing_url = "https://raw.githubusercontent.com/GeoDaCenter/covid-atlas-research/master/Testing_Data/python/state_testing.csv?token=AL7MVTETXIP4I25BWJNAX3C7QSVLU"
    download_data(testing_url, working_dir, 'testing_state_raw.csv')

    positivity_url = "https://raw.githubusercontent.com/GeoDaCenter/covid-atlas-research/master/Testing_Data/python/state_testing_posrate.csv?token=AL7MVTEA4KAZ3KNXDY3SDEK7QSVM4"
    download_data(positivity_url, working_dir, 'state_positivity_raw.csv')
    
    #Further automation: do not need data from other repo, this could be calculated on the fly in here using a separate script.
    #download_data(calc_posrate_1p3a.calc_positivity(), working_dir, 'state_positivity_raw.csv')
    
    process_testing_data_state(cr)
    
    #update_state_geojson(state_test, state_positivity, date_state_test, date_state_positivity)

def get_csv_reader():
    with open("_working/testing_state_raw.csv", 'r') as f:
        cr = csv.reader(f)
    return cr
cr = get_csv_reader()

def wide_to_long_state():
    df = pd.read_csv("~/Documents/GitHub/lqycovid/data-scripts/_1p3a/_working/testing_state_raw.csv")
    df.set_index(['state', 'criteria'], inplace=True)
    df = df.stack(level = 0).reset_index(level = 1, drop = False).reset_index()
    df['level_1'] = df.level_1.astype(str)
    df.rename(columns={'level_1':'date', 0:'testing'}, inplace = True)
    df['testing'] = df.testing.astype(int)
    df['date'] =  pd.to_datetime(df['date'], format = '%Y-%m-%d')
    df['date'] = df.date.astype(str)
    df.to_csv("testing_state_raw.csv")


def process_testing_data_state(cr):
    wide_to_long_state()
    
    state_test = {}
    
    date_state_test = {}
    
    with open("_working/testing_state_raw.csv", 'r') as f:
        cr = csv.reader(f)
        
        first_row = next(cr)
           
        for row in cr:
            if len(row) ==0:
                continue

            state, date, testing = row[:3]
            #testing = [int(x) for x in row[3:]]

            if state not in state_test:
                state_test[state] = 0
            state_test[state] += testing
            date_state_test[date][state] += date
            
    update_state_geojson(state_test, date_state_test)
            
def update_state_geojson(state_test, state_positivity, date_state_test, date_state_positivity):
    with io.open(os.path.join(repo_root, "docs/states_update.geojson"), 'r', encoding='utf-8') as f:
        geojson = json.load(f)
        features = geojson["features"]
        for feat in features:
            state_id = feat["properties"]["STUSPS"]

            if state_id in state_test:
                feat["properties"]["testing"] = state_test[state_id]
            else:
                feat["properties"]["testing"] = 0
            
            for dat in date_state_test.keys():
                cnt = -1 if state_id not in date_state_test[dat] else date_state_test[dat][state_id]
                col_name = "t" + dat
                feat["properties"][dat] = cnt

                
    with open(os.path.join(repo_root, 'docs/states_update.geojson'), 'w') as outfile:
        json.dump(geojson, outfile)


def download_data(url, target_dir, filename):
    request = requests.get(url)

    with open(os.path.join(target_dir, filename), 'wb+') as out_file:
        out_file.write(request.content)

if __name__ == '__main__':
    fetch_testing_data_state()