# This script will fetch the covid19 data from 1point3acre and update to states.geojson
# lixun910@gmail.com
# env:
# python 3.7
# pip install apscheduler
#from apscheduler.schedulers.blocking import BlockingScheduler
import urllib.request
import csv
import io
import json
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

# la portein is a city in IN
# russellga did not find russell in ga
# edgefieldga did not find edgefield in ga
# tallapoosaga tallapoosaga is a city in ga
# bear river ut is treated as bear river city in box elder (considering the nubmer of cases)
# tricounty covers Duchesne, Uintah, Daggett counties, thus not included
# benton and franklinwa includes more than one county
# bristol bay plus lake peninsulaak includes more than one county
# no idea what is out county in OH, 1 confirmed cases showed for 0530, ignore for now

def fetch_covid_data():
    out = open('../docs/last_update.txt', 'w') 
    now = datetime.now()
    out.write(now.strftime("%d/%m/%Y %H:%M:%S"))
    out.close()
    
    url = 'https://instant.1point3acres.com/v1/api/coronavirus/us/cases?token=PFl0dpfo'
    response = urllib.request.urlopen(url)
    cr = csv.reader(io.TextIOWrapper(response))

    with io.open('cases.csv', 'w', encoding='utf-8') as file:
        data = response.read() 
        text = data.decode('utf-8')
        file.write(text)


    with open("cases.csv") as csvfile:
        cr = csv.reader(csvfile)
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

        # fix any known issue from 1p3a
        if county_name in county_fix_code:
            county_name = county_fix_code[county_name]

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
        if county_name not in date_county_count[confirmed_date]:
            date_county_count[confirmed_date][county_name] = 0
        if county_name not in date_county_deathcount[confirmed_date]:
            date_county_deathcount[confirmed_date][county_name] = 0
        date_county_count[confirmed_date][county_name] += confirmed_count
        date_county_deathcount[confirmed_date][county_name] += death_count

    update_state_geojson(state_count, state_deathcount, date_state_count, date_state_deathcount)
    update_county_geojson(county_count, county_deathcount, date_county_count, date_county_deathcount)

def update_state_beds(geojson):
    with open("../data/state_beds.csv") as csvfile:
        cr = csv.reader(csvfile)
        next(cr)
        beds_dict = {}
        for row in cr:
            state_abb = row[0]
            #staff_beds = row[2]
            #icu_beds = row[3]
            all_beds = row[4]

            if state_abb not in beds_dict:
                beds_dict[state_abb] = 0
            beds_dict[state_abb] += (int)((float)(all_beds))

        features = geojson["features"]
        for feat in features:
            state_abb = feat["properties"]["STUSPS"]
            if state_abb in beds_dict:
                feat["properties"]["beds"] = beds_dict[state_abb]
            else:
                feat["properties"]["beds"] = 0

def update_state_population(geojson):
    with open("../data/county_pop.csv") as csvfile:
        cr = csv.reader(csvfile)
        next(cr)
        pop_dict = {}
        for row in cr:
            id, geoid, name, total_population, male, female, male_50above, femal_50above = row
            county_name, state_name = name.split(',')
            state_name = state_name.strip()
            if state_name not in pop_dict:
                pop_dict[state_name] = 0
            pop_dict[state_name] += (int)(total_population)

        features = geojson["features"]
        for feat in features:
            state_name = feat["properties"]["NAME"]
            if state_name in pop_dict:
                feat["properties"]["population"] = pop_dict[state_name]
            else:
                feat["properties"]["population"] = 0
        
def update_county_beds(geojson):
    with open("../data/county_beds.csv") as csvfile:
        cr = csv.reader(csvfile)
        next(cr)
        beds_dict = {}
        for row in cr:
            state_abb = row[0]
            county_nm = row[1]
            #icu_beds = row[3]
            all_beds = row[4]
            county_key = state_abb.lower() + county_nm.lower()
            if county_key not in beds_dict:
                beds_dict[county_key] = 0
            beds_dict[county_key] += (int)((float)(all_beds))

        features = geojson["features"]
        for feat in features:
            state_abb = feat["properties"]["state_abbr"]
            county_nm = feat["properties"]["NAME"]
            county_key = state_abb.lower() + county_nm.lower()

            if county_key in beds_dict:
                feat["properties"]["beds"] = beds_dict[county_key]
            else:
                feat["properties"]["beds"] = 0

def update_county_population(geojson):
    with open("../data/county_pop.csv") as csvfile:
        cr = csv.reader(csvfile)
        next(cr)
        pop_dict = {}
        for row in cr:
            id, geoid, name, total_population, male, female, male_50above, femal_50above = row
            pop_dict[geoid] = (int)(total_population)

        features = geojson["features"]
        for feat in features:
            geoid= feat["properties"]["GEOID"]
            if geoid in pop_dict:
                feat["properties"]["population"] = pop_dict[geoid]
            else:
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
        update_state_beds(geojson)

        with open('../docs/states_update.geojson', 'w') as outfile:
            json.dump(geojson, outfile)

def update_county_geojson(county_count, county_deathcount, date_county_count, date_county_deathcount):
    with io.open("../data/county_2018.geojson", 'r', encoding='utf-8') as f:
    #with open("../data/county_2018.geojson") as f:
        geojson = json.load(f)
        features = geojson["features"]
        county_id_dict = {}

        i = 0
        for feat in features:
            i += 1
            county_id = feat["properties"]["NAME"].lower() + feat["properties"]["state_abbr"].lower()
            county_id_dict[county_id] = 1
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
        update_county_beds(geojson)
        
        with open('../docs/counties_update.geojson', 'w') as outfile:
            json.dump(geojson, outfile)

        # check input county
        with io.open('unmatched.txt', 'w', encoding='utf-8') as o:
            for ct in county_count.keys():
                if ct not in county_id_dict:
                    if 'unknown' in ct or 'unassigned' in ct or 'princess' in ct or 'out-of-state' in ct or 'out of state' in ct:
                        continue
                    else:
                        o.write(ct + '\n')

fetch_covid_data()
with open("cases.csv") as csvfile:
    cr = csv.reader(csvfile)
    read_covid_data(cr)

#scheduler = BlockingScheduler()
#scheduler.add_job(fetch_covid_data, 'interval', hours=1)
#scheduler.start()

