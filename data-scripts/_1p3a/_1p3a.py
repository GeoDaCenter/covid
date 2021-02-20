import urllib.request
import csv
import os
import io
import json
import boto3
import pandas as pd
import geopandas as gpd
from datetime import datetime

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


dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def fetch_covid_data():
    out = open(os.path.join(repo_root, 'public/last_update.txt'), 'w')
    now = datetime.now()
    out.write(now.strftime("%d/%m/%Y %H:%M:%S"))
    out.close()

    os.system('curl -o {}/cases.csv https://api2.1point3acres.com/v1/api/coronavirus/us/cases?token=PFl0dpfo'.format(dir_path))

def create_state_files(raw_data):
    states = gpd.read_file(os.path.join(repo_root, 'data/states.geojson'))
    states = pd.DataFrame(states[['GEOID','STUSPS','NAME']])
    state_agg = raw_data[['confirmed_date','state_name','confirmed_count','death_count']].groupby(['confirmed_date','state_name']).sum().reset_index()
    state_deaths = state_agg.pivot(index='state_name', columns='confirmed_date',values='death_count').reset_index()
    state_confir = state_agg.pivot(index='state_name', columns='confirmed_date',values='confirmed_count').reset_index()

    states_deaths_final = pd.merge(states, state_deaths, left_on='STUSPS', right_on='state_name', how='left').fillna(0).drop(columns=['STUSPS','state_name'])
    states_confir_final = pd.merge(states, state_confir, left_on='STUSPS', right_on='state_name', how='left').fillna(0).drop(columns=['STUSPS','state_name'])

    states_deaths_final.to_csv(os.path.join(repo_root, 'public/csv/covid_deaths_1p3a_state.csv'), index=False)
    states_confir_final.to_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_1p3a_state.csv'), index=False)

    states = gpd.read_file(os.path.join(repo_root, 'data/states.geojson'))
    states_deaths_sim = states_deaths_final.copy().drop(columns=['NAME'])
    states_deaths_sim.columns = ['d' + x if x != 'GEOID' else x for x in states_deaths_sim.columns]
    states_confir_json = states_confir_final.copy()
    state_json = pd.merge(states_deaths_sim, states_confir_final, how='inner', on='GEOID')
    state_json = state_json.merge(states[['GEOID','geometry']], how='inner', on='GEOID')
    state_json = gpd.GeoDataFrame(state_json, geometry=state_json.geometry)
    state_json.to_file(os.path.join(repo_root, 'data/states_update.geojson'), driver='GeoJSON')

def create_county_files(raw_data):
    counties = gpd.read_file(os.path.join(repo_root, 'data/county_2018.geojson'))
    counties = pd.DataFrame(counties[['STATEFP','COUNTYFP','COUNTYNS','AFFGEOID','GEOID','NAME','LSAD','state_abbr']])
    counties['name_merge'] = counties.apply(lambda x: x['NAME'].lower() + x['state_abbr'].lower(), axis=1)

    raw_data['name_merge'] = raw_data.apply(lambda x: x['county_name'].lower() + x['state_name'].lower(), axis=1)
    raw_data['name_merge'] = raw_data['name_merge'].apply(lambda x: county_fix_code.get(x, x))

    county_agg = raw_data[['confirmed_date','name_merge','confirmed_count','death_count']].groupby(['confirmed_date','name_merge']).sum().reset_index()

    county_deaths = county_agg.pivot(index='name_merge', columns='confirmed_date',values='death_count').reset_index()
    county_confir = county_agg.pivot(index='name_merge', columns='confirmed_date',values='confirmed_count').reset_index()

    county_deaths_final = pd.merge(counties, county_deaths, left_on='name_merge', right_on='name_merge',how='left').drop(columns=['name_merge']).fillna(0).drop(columns=['state_abbr'])
    county_confir_final = pd.merge(counties, county_confir, left_on='name_merge', right_on='name_merge',how='left').drop(columns=['name_merge']).fillna(0).drop(columns=['state_abbr'])

    county_deaths_final.to_csv(os.path.join(repo_root, 'public/csv/covid_deaths_1p3a.csv'), index=False)
    county_confir_final.to_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_1p3a.csv'), index=False)

    unmatched = pd.merge(counties, county_deaths, left_on='name_merge', right_on='name_merge',how='right')
    unmatched_locs = list(unmatched[unmatched['STATEFP'].isna()].name_merge)
    unmatched_locs = [ct for ct in unmatched_locs if ('unknown' not in ct and 'unassigned' not in ct and 'princess' not in ct and 'out-of-state' not in ct and 'out of state' not in ct)]

    with open(os.path.join(dir_path, 'unmatched.txt'), 'w') as file:
        for item in unmatched_locs:
            file.write('%s\n' % item)

    counties = gpd.read_file(os.path.join(repo_root, 'data/county_2018.geojson'))
    county_deaths_sim = county_deaths_final.copy().drop(columns=['STATEFP', 'COUNTYFP', 'AFFGEOID', 'GEOID', 'NAME', 'LSAD'])
    county_deaths_sim.columns = ['d' + x if x != 'COUNTYNS' else x for x in county_deaths_sim.columns]
    county_confir_json = county_confir_final.copy()
    county_json = pd.merge(county_deaths_sim, county_confir_final, how='inner', on='COUNTYNS')
    county_json = county_json.merge(counties[['COUNTYNS','geometry']], how='inner', on='COUNTYNS')
    county_json = gpd.GeoDataFrame(county_json, geometry=county_json.geometry)
    county_json.to_file(os.path.join(repo_root, 'data/counties_update.geojson'), driver='GeoJSON')

if __name__ == '__main__':

    fetch_covid_data()

    raw_data = pd.read_csv(os.path.join(repo_root, 'data-scripts/_1p3a/cases.csv'))

    create_state_files(raw_data)
    create_county_files(raw_data)

    try:
        print('Writing to S3...')
        s3 = boto3.resource('s3')
        s3.Object('geoda-covid-atlas', 'covid_confirmed_1p3a_state.csv').put(Body=open(os.path.join(repo_root, 'public/csv/covid_confirmed_1p3a_state.csv'), 'rb'))
        s3.Object('geoda-covid-atlas', 'covid_deaths_1p3a_state.csv').put(Body=open(os.path.join(repo_root, 'public/csv/covid_deaths_1p3a_state.csv'), 'rb'))
        s3.Object('geoda-covid-atlas', 'covid_confirmed_1p3a.csv').put(Body=open(os.path.join(repo_root, 'public/csv/covid_confirmed_1p3a.csv'), 'rb'))
        s3.Object('geoda-covid-atlas', 'covid_deaths_1p3a.csv').put(Body=open(os.path.join(repo_root, 'public/csv/covid_deaths_1p3a.csv'), 'rb'))
        print('Write to S3 complete.')
    except Exception as e:
        print(e)
