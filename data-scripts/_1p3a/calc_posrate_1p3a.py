import os
import csv
import pytz
import json
from datetime import datetime, timedelta

import boto3
import requests
import pandas as pd
import geopandas as gpd
from github import Github


dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

# Vidal you can set up GitHub access to our private repo, or you can try changing tokens at line 40-43.


def read_data():
    working_dir = os.path.join(dir_path, '_working')
    os.makedirs(working_dir, exist_ok=True)
    
    testing_url = "https://raw.githubusercontent.com/GeoDaCenter/covid-atlas-research/master/Testing_Data/python/county_hist.csv?token=AL7MVTCZMWHNIY5TVWYNGWK7QCJU4"
    download_data(testing_url, working_dir, 'testing_raw.csv')