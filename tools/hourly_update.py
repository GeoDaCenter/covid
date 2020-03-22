# This script will fetch the covid19 data from 1point3acre and update to states.geojson
# lixun910@gmail.com
# env:
# python 3.7
# pip install apscheduler
from apscheduler.schedulers.blocking import BlockingScheduler
import urllib.request
import csv
import io
import json
from datetime import datetime

def fetch_covid_data():
    out = open('../docs/last_update.txt', 'w') 
    now = datetime.now()
    out.write(now.strftime("%d/%m/%Y %H:%M:%S"))
    out.close()
    
    url = 'https://instant.1point3acres.com/v1/api/coronavirus/us/cases?token=PFl0dpfo'
    response = urllib.request.urlopen(url)
    cr = csv.reader(io.TextIOWrapper(response))
    
    read_covid_data(cr)


def read_covid_data(cr):
    state_count = {}
    state_deathcount = {}

    county_count = {}
    county_deathcount = {}

    date_state_count = {}
    date_state_deathcount = {}

    date_county_count = {}
    date_county_deathcount = {}

    # case_id, confirmed_date,state_name,county_name,confirmed_count,death_count
    next(cr)
    for row in cr:
        case_id, confirmed_date,state_name,county_name,confirmed_count,death_count = row
        confirmed_count = (int)(confirmed_count)
        death_count = (int)(death_count)

        if state_name not in state_count:
            state_count[state_name] = 0
            state_deathcount[state_name] = 0
        state_count[state_name] += confirmed_count
        state_deathcount[state_name] += death_count

        county_name = county_name + state_name
        if county_name not in county_count:
            county_count[county_name] = 0
            county_deathcount[county_name] = 0
        county_count[county_name] += confirmed_count
        county_deathcount[county_name] += death_count

        if confirmed_date not in date_state_count:
            date_state_count[confirmed_date] = {}
            date_state_deathcount[confirmed_date] = {}
        if state_name not in date_state_count[confirmed_date]:
            date_state_count[confirmed_date][state_name] = 0
        if state_name not in date_state_deathcount[confirmed_date]:
            date_state_deathcount[confirmed_date][state_name] = 0
        date_state_count[confirmed_date][state_name] += confirmed_count
        date_state_deathcount[confirmed_date][state_name] += death_count

        if confirmed_date not in date_county_count:
            date_county_count[confirmed_date] = {}
            date_county_deathcount[confirmed_date] = {}
        if county_name not in date_state_count[confirmed_date]:
            date_county_count[confirmed_date][county_name] = 0
        if county_name not in date_county_deathcount[confirmed_date]:
            date_county_deathcount[confirmed_date][county_name] = 0
        date_county_count[confirmed_date][county_name] += confirmed_count
        date_county_deathcount[confirmed_date][county_name] += death_count

    update_state_geojson(state_count, state_deathcount, date_state_count, date_state_deathcount)
    update_county_geojson(county_count, county_deathcount, date_county_count, date_county_deathcount)

def update_state_population(geojson):
    with open("../data/county_pop.csv") as csvfile:
        cr = csv.reader(csvfile)
        next(cr)
        pop_dict = {}
        for row in cr:
            id, geoid, name, total_population, male, female, male_50above, femal_50above = row
            county_name, state_name = name.split(',')
            state_name = state_name.strip()
            pop_dict[state_name] = totoal_population

        features = geojson["features"]
        for feat in features:
            state_name = feat["properties"]["NAME"]
            if state_name in pop_dict:
                feat["properties"]["population"] = pop_dict[state_name]
            else
                feat["properties"]["population"] = 0
        

def update_county_population(geojson):
    with open("cases.csv") as csvfile:
        cr = csv.reader(csvfile)
        next(cr)
        pop_dict = {}
        for row in cr:
            id, geoid, name, total_population, male, female, male_50above, femal_50above = row
            pop_dict[geoid] = totoal_population

        features = geojson["features"]
        for feat in features:
            geoid= feat["properties"]["GEOID"]
            if geoid in pop_dict:
                feat["properties"]["population"] = pop_dict[geoid]
            else
                feat["properties"]["population"] = 0

def update_state_geojson(state_count, state_deathcount, date_state_count, date_state_deathcount):
    with open("states.geojson") as f:
        geojson = json.load(f)
        features = geojson["features"]
        for feat in features:
            state_id = feat["properties"]["STUSPS"]

            if state_id in state_count:
                feat["properties"]["confirmed_count"] = state_count[state_id]
            else:
                feat["properties"]["confirmed_count"] = 0

            if state_id in state_deathcount:
                feat["properties"]["death_count"] = state_deathcount[state_id]
            else:
                feat["properties"]["death_count"] = 0

            for dat in date_state_count.keys():
                cnt = 0 if state_id not in date_state_count[dat] else date_state_count[dat][state_id]
                feat["properties"][dat] = cnt

            for dat in date_state_deathcount.keys():
                cnt = 0 if state_id not in date_state_deathcount[dat] else date_state_deathcount[dat][state_id]
                col_name = "d" + dat
                feat["properties"][col_name] = cnt

        update_state_population(geojson)

        with open('../docs/states_update.geojson', 'w') as outfile:
            json.dump(geojson, outfile)

def update_county_geojson(county_count, county_deathcount, date_county_count, date_county_deathcount):
    with open("../data/county_2018.geojson") as f:
        geojson = json.load(f)
        features = geojson["features"]
        for feat in features:
            county_id = feat["properties"]["NAME"] + feat["properties"]["state_abbr"]

            if county_id in county_count:
                feat["properties"]["confirmed_count"] = county_count[county_id]
            else:
                feat["properties"]["confirmed_count"] = 0

            if county_id in county_deathcount:
                feat["properties"]["death_count"] = county_deathcount[county_id]
            else:
                feat["properties"]["death_count"] = 0

            for dat in date_county_count.keys():
                cnt = 0 if county_id not in date_county_count[dat] else date_county_count[dat][county_id]
                feat["properties"][dat] = cnt

            for dat in date_county_deathcount.keys():
                cnt = 0 if county_id not in date_county_deathcount[dat] else date_county_deathcount[dat][county_id]
                col_name = "d" + dat
                feat["properties"][col_name] = cnt

        update_county_population(geojson)
        
        with open('../docs/counties_update.geojson', 'w') as outfile:
            json.dump(geojson, outfile)

fetch_covid_data()
#with open("cases.csv") as csvfile:
#    cr = csv.reader(csvfile)
#    read_covid_data(cr)

#scheduler = BlockingScheduler()
#scheduler.add_job(fetch_covid_data, 'interval', hours=1)
#scheduler.start()

