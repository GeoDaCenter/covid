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

# State
def fetch_testing_data_state(): #for state leve, do not need to write any code, BUT would be nice if you could complete the state_testing column name change on line 19.
    working_dir = os.path.join(dir_path, '_working')
    os.makedirs(working_dir, exist_ok=True)
    
    state_testing = pd.read_csv("~/Documents/GitHub/covid-atlas-research/Testing_Data/python/state_testing.csv")
    #use pd to add "t" and "-": from 20201001 to t2020-10-01.
    state_positivity = gpd.read_file("~/Documents/GitHub/lqycovid/data/states_update.geojson") # this geojson already contains everything we need at the state level.
    delete_index_column()
    #Further automation: do not need data from other repo, this could be calculated on the fly in here using just the raw data.
    #To accomplish that, we need to write a script in Python to calculate positivity rate, which is a future step. (Currently accomplished in R.)

    update_state_geojson()

def update_state_geojson():
    #check if state_positivity output is currently in /public
    #if not, move to /public
    pass


# County
def fetch_testing_data_county():
    working_dir = os.path.join(dir_path, '_working')
    os.makedirs(working_dir, exist_ok=True)
    
    merge <- pd.read_csv(os.path.join(repo_root,"public/testing_1p3a.csv")
    delete_index_column()
    #here we should use pandas to change the names of the columns(if any, and .
    #This csv file should contain metadata, confirmed cases for each day(formated %YYYY-%MM-%DD), confirmed deaths for each day (d%YYYY-%MM-%DD), testing numbers for each day(t%YYYY-%%MM-%DD), and positivity rate for each day (tpos%YYYY-%MM-%DD).
    #Data should already been formated
    
    process_testing_data_county()
    
    #update_state_geojson(state_test, state_positivity, date_state_test, date_state_positivity)
    
def delete_index_column():
    #r has the issue of sometimes having an index column automatically added before the data. This function will remove it for data that do have it and pass for the ones who do not.
    pass

def update_county_geojson():
    #save geojson to /public
    pass



if __name__ == '__main__':
    fetch_testing_data_state()
    fetch_testing_data_county()

