import urllib.request
import csv
import os
import io
import json
import geopandas as gpd
import pandas
from datetime import datetime

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def fetch_testing_data_state():
    testing_url = "https://raw.githubusercontent.com/GeoDaCenter/covid-atlas-research/master/Testing_Data/python/state_testing.csv?token=AL7MVTCZMWHNIY5TVWYNGWK7QCJU4"
    download_data(testing_url, working_dir, 'testing_state_raw.csv')

    positivity_url = "https://raw.githubusercontent.com/GeoDaCenter/covid-atlas-research/master/Testing_Data/python/state_testing_posrate.csv?token=AL7MVTCZMWHNIY5TVWYNGWK7QCJU4"
    download_data(positivity_url, working_dir, 'positivity_state_raw.csv')
    
    process_testing_data_state()
    
    update_state_geojson
    
def fetch_testing_data_county():
    working_dir = os.path.join(dir_path, '_working')
    os.makedirs(working_dir, exist_ok=True)
    
    testing_url = "https://raw.githubusercontent.com/GeoDaCenter/covid-atlas-research/master/Testing_Data/python/county_hist.csv?token=AL7MVTCZMWHNIY5TVWYNGWK7QCJU4"
    download_data(testing_url, working_dir, 'testing_county_raw.csv')

    positivity_url = "https://raw.githubusercontent.com/GeoDaCenter/covid-atlas-research/master/Testing_Data/python/county_positivity.csv?token=AL7MVTCZMWHNIY5TVWYNGWK7QCJU4"
    download_data(positivity_url, working_dir, 'positivity_county_raw.csv')
    
    response = urllib.request.urlopen(testing_url)
    cr = csv.reader(io.TextIOWrapper(response))
    
    process_testing_data_county(cr)
    
    update_county_geojson

def process_testing_data_state(cr):
    state_test = {}
    state_positivity = {}

    date_state_test = {}
    date_state_positivity = {}

    # case_id, confirmed_date,state_name,county_name,confirmed_count,death_count
    next(cr)
    i = 0
    for row in cr:
        if len(row) ==0:
            continue

        i += 1
        case_id, confirmed_date,state_name,county_name,confirmed_count,death_count = row[:6]
        confirmed_count = (int)(confirmed_count)
        death_count = (int)(death_count)

        if state_name not in state_count:
            state_count[state_name] = 0
            state_deathcount[state_name] = 0
        state_count[state_name] += confirmed_count
        state_deathcount[state_name] += death_count

        county_name = county_name.encode('ascii', 'ignore').decode("utf-8")
        county_name = county_name.strip().lower() + state_name.strip().lower()
        
    update_state_geojson(state_test, state_positivity, date_state_test, date_state_positivity)
    
def process_testing_data_county(cr):
    
    
def update_state_geojson(state_test, state_positivity, date_state_test, date_state_positivity):
    with io.open(os.path.join(repo_root, "docs/counties_update.geojson"), 'r', encoding='utf-8') as f:

def update_state_geojson(state_test, state_positivity, date_state_test, date_state_positivity):
    with open(os.path.join(repo_root, "docs/states_update.geojson")) as f:
    geojson = json.load(f)
    features = geojson["features"]
    for feat in features:
        state_id = feat["properties"]["STUSPS"]

        if state_id in state_test:
            feat["properties"]["testing"] = state_test[state_id]
        else:
            feat["properties"]["testing"] = 0

        if state_id in state_positivity:
            feat["properties"]["positivity"] = state_positivity[state_id]
        else:
            feat["properties"]["positivity"] = 0

        for dat in date_state_test.keys():
            cnt = 0 if state_id not in date_state_test[dat] else date_state_test[dat][state_id]
            col_name = "t" + dat
            feat["properties"][dat] = cnt
            
        for dat in date_state_positivity.keys():
            cnt = 0 if state_id not in date_state_positivity[dat] else date_state_positivity[dat][state_id]
            col_name = "tpos" + dat
            feat["properties"][col_name] = cnt
                
    with open('states_update.geojson'), 'w') as outfile:
    json.dump(geojson, outfile)

    
def update_county_geojson(county_test, county_positivity, date_county_test, date_county_positivity):
    with io.open(os.path.join(repo_root, "docs/counties_update.geojson"), 'r', encoding='utf-8') as f:
        geojson = json.load(f)
        features = geojson["features"]
        county_id_dict = {}

        i = 0
        for feat in features:
            i += 1
            county_id = feat["properties"]["NAME"].lower() + feat["properties"]["state_abbr"].lower()
            county_id_dict[county_id] = 1
            if county_id in county_test:
                feat["properties"]["testing"] = county_test[county_id]
            else:
                feat["properties"]["testing"] = 0

            if county_id in county_positivity:
                feat["properties"]["positivity"] = county_positivity[county_id]
            else:
                feat["properties"]["positivity"] = 0

            for dat in date_county_test.keys():
                cnt = 0 if county_id not in date_county_test[dat] else date_county_positivity[dat][county_id]
                col_name = "t" + dat
                feat["properties"][dat] = cnt

            for dat in date_county_positivity.keys():
                cnt = 0 if county_id not in date_county_test[dat] else date_county_positivity[dat][county_id]
                col_name = "d" + dat
                feat["properties"][col_name] = cnt

        with open(os.path.join(repo_root, 'docs/counties_update.geojson'), 'w') as outfile:
            json.dump(geojson, outfile)

        # check input county
        with io.open('unmatched.txt', 'w', encoding='utf-8') as o:
            for ct in county_count.keys():
                if ct not in county_id_dict:
                    if 'unknown' in ct or 'unassigned' in ct or 'princess' in ct or 'out-of-state' in ct or 'out of state' in ct:
                        continue
                    else:
                        o.write(ct + '\n')

def update_state_criteria():

def update_county_criteria():        
                
def download_data(url, target_dir, filename):
    request = requests.get(url)

    with open(os.path.join(target_dir, filename), 'wb+') as out_file:
      out_file.write(request.content)

fetch_testing_data_state()

fetch_testing_data_county()


os.system('apt install zip')
os.system('rm docs/counties_update.geojson.zip docs/states_update.geojson.zip')
os.system('zip -r docs/counties_update.geojson.zip docs/counties_update.geojson')
os.system('zip -r docs/states_update.geojson.zip docs/states_update.geojson')
