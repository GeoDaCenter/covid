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


def read_data_and_process():
    working_dir = os.path.join(dir_path, '_working')
    os.makedirs(working_dir, exist_ok=True)
    
    testing_data = pd.read_csv(os.path.join(repo_root, "docs/testing_usafacts.csv"))
    confirmed_cases = pd.read_csv(os.path.join(repo_root, "docs/coid_confirmed_usafacts.csv"))
    
    testing_data = pd.read_csv("~/Documents/GitHub/lqycovid/docs/testing_usafacts.csv")
    confirmed_cases = pd.read_csv("~/Documents/GitHub/lqycovid/docs/covid_confirmed_usafacts.csv")
    
def calc_positivity():
    working_dir = os.path.join(dir_path, '_working')
    os.makedirs(working_dir, exist_ok=True)
    
    read_data_and_process()
    df = pd.div
    save_path = os.path.join(repo_root, 'dataownload/usafacts_{}_{}.geojson'
    df.to_csv(os.path.join(working_dir, "positivity_raw.csv"))
    
      
if __name__ == '__main__':
    calc_positivity()