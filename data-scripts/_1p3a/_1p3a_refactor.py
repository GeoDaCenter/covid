# This script will fetch the covid19 data from 1point3acre and update to states.geojson
# lixun910@gmail.com
# env:
# python 3.7
# pip install apscheduler
#from apscheduler.schedulers.blocking import BlockingScheduler
import os
import urllib.request
import csv
import io
import json
from datetime import datetime
import pandas as pd
import geopandas as gpd

county_fix_code = {
    'weber-morganut':	'weberut',
    'wayne--detroitmi' : 'waynemi',
    'puerto ricopr':'san juanpr',
#    'navajo, aznn':'navajoaz',
    'sewardak':'kenai peninsulaak',
    'la salleil':'lasalleil',
    'filmoremn':'fillmoremn',
    'dona ananm':'doña ananm',
    'el paso--fort blisstx':'el pasotx',
    'soldotnaak':'kenai peninsulaak',
    'sterlingak':'kenai peninsulaak',
#    'mckinley, nmnn':'mckinleynm',
#    'coconino, aznn':'coconinoaz',
#    'apache, aznn':'apacheaz',
#    'cibola, nmnn':'cibolanm',
#    'san juan, nmnn':'san juannm',
#    'san juan, utnn':'san juanut',
    'charkeva':'clarkeva',
    'homerak':'kenai peninsulaak',
    'eagle riverak':'anchorageak',
    'north poleak':'fairbanks north starak',
    'gridwoodak':'anchorageak',
    'palmerak':'matanuska-susitnaak',
    'manassas cityva':'manassasva',
    'la sallela':'lasallela',
    'verm.in':'vermillionin',
    'joplinmo':'jaspermo',
    'manchesternh':'hillsboroughnh',
    'kenaiak':'kenai peninsulaak',
    'nashuanh':'hillsboroughnh',
    'adamid':'adamsid',
    'dukes and nantucketma':'dukesma',
    'chambersga':'fultonga',
    'fairbanks north star--north poleak':'fairbanks north starak',
    'harris--houstontx':'harristx',
    'harris--non houstontx':'harristx',
    'hillsborough-othernh':'hillsboroughnh',
    'hillsborough-nashuanh':'hillsboroughnh',
    'hillsborough-manchesternh':'hillsboroughnh',
    'kenai peninsula--sewardak':'kenai peninsulaak',
    'kenai peninsula--soldotnaak':'kenai peninsulaak',
    'kenai peninsula--sterlingak':'kenai peninsulaak',
    'kenai peninsula--homerak':'kenai peninsulaak',
    'anchorage--eagle riverak':'anchorageak',
    'anchorage--gridwoodak':'anchorageak',
#    'apachenn':'apacheaz',
#    'cibolann':'cibolanm',
    'matanuska-susitna--wasillaak':'matanuska-susitnaak',
    'staunton cityva':'stauntonva',
#    'navajonn':'navajoaz',
#    'coconinonn':'coconinoaz',
#    'mckinleynn':'mckinleynm',
    'obrienia':'o\'brienia',
    'buena vista cityva':'buena vistava',
    'de kalbin' : 'dekalbin',
    'adamoh' : 'adamsoh',
#    'socorro-nmnn' : 'socorronm',
#    'socorro, nmnn' : 'socorronm',
    'guesnseyoh':'guernseyoh',
    'bernalillo, nmnn':'bernalillonm',
    'dewittil':'de wittil',
    'boxne':'box buttene',
#    'sandoval, nmnn':'sandovalnm',
    'philipsco':'phillipsco',
    'st. marysmd':'st. mary\'smd',
    'queen annesmd':'queen anne\'smd',
    'de witttx':'dewitttx',
    'prince georgesmd':'prince george\'smd',
    'wayne--non detroitmi':'waynemi',
    'bear riverut':'box elderut',
    'henderonnc':'hendersonnc',
    'johnsonnc':'johnstonnc'
}

# la portein is a city in IN
# russellga did not find russell in ga
# edgefieldga did not find edgefield in ga
# tallapoosaga tallapoosaga is a city in ga
# bear river ut is treated as bear river city in box elder (considering the nubmer of cases)
# tricounty covers Duchesne, Uintah, Daggett counties, thus not included
# benton and franklinwa includes more than one county
# bristol bay plus lake peninsulaak includes more than one county
# no idea what is out county in OH, 1 confirmed cases showed for 0530, ignore for now
# yakutat plus hoonah-angoonak includes more than one county

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def fetch_covid_data():
    out = open(os.path.join(repo_root, 'public/last_update.txt'), 'w')
    now = datetime.now()
    out.write(now.strftime("%d/%m/%Y %H:%M:%S"))
    out.close()

    working_dir = os.path.join(dir_path, '_working')
    os.makedirs(working_dir, exist_ok=True)

    url = 'https://instant.1point3acres.com/v1/api/coronavirus/us/cases?token=PFl0dpfo'
    response = urllib.request.urlopen(url)
    cr = csv.reader(io.TextIOWrapper(response))

    with io.open(os.path.join(dir_path, '_working/cases.csv'), 'w', encoding='utf-8') as file:
        data = response.read()
        text = data.decode('utf-8')
        file.write(text)


fetch_covid_data()

# States
cases = pd.read_csv(os.path.join(dir_path, '_working/cases.csv'))

states = gpd.read_file(os.path.join(repo_root, 'data/states.geojson'), driver='GeoJSON')
list_of_states = list(states['STUSPS'])
cases_by_state = cases[['state_name', 'confirmed_count', 'death_count']].groupby('state_name').sum().reset_index()
cases_by_state = cases_by_state[cases_by_state['state_name'].isin(list_of_states)]

case_counts_by_date = cases[['state_name','confirmed_date', 'confirmed_count']]
case_counts_by_date = case_counts_by_date[case_counts_by_date['state_name'].isin(list_of_states)]
case_counts_by_date = case_counts_by_date.groupby(['confirmed_date', 'state_name']).sum().reset_index()
case_counts_by_date = case_counts_by_date.pivot(index='state_name', columns='confirmed_date').reset_index()

death_counts_by_date = cases[['state_name','confirmed_date', 'death_count']]
death_counts_by_date = death_counts_by_date[death_counts_by_date['state_name'].isin(list_of_states)]
death_counts_by_date = death_counts_by_date.groupby(['confirmed_date', 'state_name']).sum().reset_index()
death_counts_by_date = death_counts_by_date.pivot(index='state_name', columns='confirmed_date').reset_index()

# Counties
cases = pd.read_csv(os.path.join(dir_path, '_working/cases.csv'))
cases['county_name_right'] = cases.apply(lambda x: x['county_name'].strip().lower() + x['state_name'].strip().lower(), axis = 1)
cases['county_name_right'] = cases['county_name_right'].apply(lambda x: county_fix_code.get(x, x))
cases_by_county = cases[['county_name_right', 'confirmed_count', 'death_count']].groupby('county_name_right').sum().reset_index()

case_counts_by_date = cases[['county_name_right', 'confirmed_count', 'confirmed_date']]
case_counts_by_date = case_counts_by_date.groupby(['confirmed_date', 'county_name_right']).sum().reset_index()
case_counts_by_date = case_counts_by_date.pivot(index='county_name_right', columns='confirmed_date').reset_index()
case_counts_by_date.columns = ['county_name_right'] + list(case_counts_by_date.columns.get_level_values(1)[1:])

death_counts_by_date = cases[['county_name_right', 'death_count', 'confirmed_date']]
death_counts_by_date = death_counts_by_date.groupby(['confirmed_date', 'county_name_right']).sum().reset_index()
death_counts_by_date = death_counts_by_date.pivot(index='county_name_right', columns='confirmed_date').reset_index()
date_cols = list(death_counts_by_date.columns.get_level_values(1)[1:])
death_counts_by_date.columns = ['county_name_right'] + ['d' + date for date in date_cols]


counties = gpd.read_file(os.path.join(repo_root, 'data/county_2018.geojson'), driver='GeoJSON')
counties['county_name_left'] = counties['NAME'].str.strip().str.lower() + counties['state_abbr'].str.strip().str.lower()

counties_update = counties.merge(cases_by_county, left_on = 'county_name_left', right_on = 'county_name_right', how = 'left')
counties_update = counties_update.merge(case_counts_by_date, left_on = 'county_name_left', right_on = 'county_name_right', how = 'left')
counties_update = counties_update.merge(death_counts_by_date, left_on = 'county_name_left', right_on = 'county_name_right', how = 'left')

unmatched = counties.merge(case_counts_by_date, left_on = 'county_name_left', right_on = 'county_name_right', how = 'right')
unmatched = unmatched[unmatched['NAME'].isna()]


unmatch_remove = ['unassigned', 'princess', 'out-of-state', 'unknown', 'out of state']
unmatched = unmatched[~unmatched['county_name_right'].str.contains('|'.join(unmatch_remove))]

unmatched_archive = pd.read_csv(os.path.join(dir_path, 'unmatched.csv'), parse_dates=['date_added'])

for unmatched_county in list(unmatched.county_name_right):
    if unmatched_county not in list(unmatched_archive.unmatched_county):
        unmatched_archive.append(pd.DataFrame({'unmatched_county':unmatched_county,
                                               'date_added': datetime.datetime.today().date(),
                                               'resolved': 0}, index=[len(unmatched_archive) + 1]))

unmatched_archive.to_csv(os.path.join(dir_path, 'unmatched.csv'), index = False)


def get_aggregate_count(cases, group_by, value):
    return cases[[group_by, value]].groupby(group_by).agg('sum')
