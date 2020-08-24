import boto3
import json
import io
import pandas as pd
import re
import us
from datetime import datetime, timedelta

def lambda_handler(event, context):
    
    # read in parameter input
    county_input = event["queryStringParameters"]["county"].lower().replace(" ", "").replace("county", "")
    state_input = event["queryStringParameters"]["state"].lower().replace(" ", "")
    _type = event["queryStringParameters"]["type"].lower().replace(" ", "")
    source = event["queryStringParameters"]["source"].lower().replace(" ", "")
    start_date = "20200121"
    end_date = "20200821"


    if source == "1p3a":

        # read in geojson file
        s3 = boto3.client('s3',aws_access_key_id='AKIAYFJCPR6GV6STPVRC',
                    aws_secret_access_key='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')
        response = s3.get_object(Bucket='geoda-covid-atlas', Key="counties_update.geojson")
        text = response['Body'].read().decode()
        data = json.loads(text)

        # extract data from json file
        output = search_info_json(county_input, state_input, source,  _type, \
                                data, start_date, end_date)
     
    else:

        response = {}
        response["county"] = county_input.upper()
        response["state"] = state_input.upper()
        response["type"] = _type
        response["source"] = source.upper()
        response["data"] = {}

        if _type == "confirmed":
            s3 = boto3.client('s3',aws_access_key_id='AKIAYFJCPR6GV6STPVRC',
                        aws_secret_access_key='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')
            response = s3.get_object(Bucket='geoda-covid-atlas', Key="covid_confirmed_usafacts.csv")
            data = pd.read_csv(io.BytesIO(response['Body'].read()))
            output = search_info_csv(county_input, state_input, source, _type, data, start_date, end_date)
            response["data"].update(output)
            
        elif _type == "death":
            s3 = boto3.client('s3',aws_access_key_id='AKIAYFJCPR6GV6STPVRC',
                        aws_secret_access_key='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')
            response = s3.get_object(Bucket='geoda-covid-atlas', Key="covid_deaths_usafacts.csv")
            data = pd.read_csv(io.BytesIO(response['Body'].read()))
            output = search_info_csv(county_input, state_input, source, _type, data, start_date, end_date)
            response["data"].update(output)

        elif _type == "both"
            s3 = boto3.client('s3',aws_access_key_id='AKIAYFJCPR6GV6STPVRC',
                        aws_secret_access_key='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')
            response = s3.get_object(Bucket='geoda-covid-atlas', Key="covid_deaths_usafacts.csv")
            data = pd.read_csv(io.BytesIO(response['Body'].read()))
            output = search_info_csv(county_input, state_input, source, _type, data, start_date, end_date)
            response["data"].update(output)
            # s3 = boto3.client('s3',aws_access_key_id='AKIAYFJCPR6GV6STPVRC',
            #             aws_secret_access_key='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')
            response = s3.get_object(Bucket='geoda-covid-atlas', Key="covid_confirmed_usafacts.csv")
            data = pd.read_csv(io.BytesIO(response['Body'].read()))
            output = search_info_csv(county_input, state_input, source, _type, data, start_date, end_date)
            response["data"].update(output)
        else:
            output = "Invalid Type Input!"

    return {
        "statusCode" : 200,
        "body": json.dumps(output)
    }


########## Data Retrieve Functions ##########


def search_info_csv(county_input, state_input, source, _type, data, start_date, end_date):


    if len(state_input) > 2:
        temp = us.states.lookup(state_input)
        if not temp:
            return "Invalid State Input! Please Add Space between Words!"
        state_input = str(us.states.lookup(state_input).abbr)
    
    start_date, end_date = check_valid_date_csv(start_date, end_date)    
    if not start_date:
        return "Invalid Date Input!"

    row = data[(data['County Name'].str.contains(county_input,flags=re.IGNORECASE)) \
                & (data["State"] == state_input.upper())]
    if row.empty:
        return "Invalid County-State Input!"

    try:
        col1 = data.columns.get_loc(start_date)
        col2 = data.columns.get_loc(end_date)
    except:
        last_date = datetime.strptime(row.columns[-1], '%m/%d/%y').strftime('%Y%m%d')
        return "Date range exceeds record. Record starts from 20200122 and ends {}".format(last_date)

    data_get = row.iloc[:,col1:col2].values.tolist()[0]
    data_date = row.columns[col1:col2].tolist()

    return {_type: dict(zip(data_date, data_get))}




def search_info_json(county_input, state_input, source, _type, data, start_date, end_date):
    '''
    Input:
        state_input: user input state name or abbr
        _type: "confirmed", "death", "both"
        start_date: 8 digits string
        end_date: 8 digits string

        data: states_update.geojson

    '''

    # set response object
    response = {}
    response["county"] = county_input.upper()
    response["state"] = state_input.upper()
    response["source"] = source.upper()
    response["data"] = {}

    # check if input date is legal
    start_date, end_date = check_valid_date_json(start_date, end_date)
    if not start_date:
        return "Invalid Date Input!"


    # extract data 
    counties =  data["features"]
    for county in counties:
        county = county["properties"]
        if county_input == county["NAME"].lower().replace(" ", ""):
            if (state_input  == county["state_name"].lower().replace(" ", "") or \
                state_input == county["state_abbr"].lower().replace(" ", "")):
                if _type == "both":
                    confirmed = {}
                    death = {}
                    for k,v in county.items(): 
                        if start_date <= k  <= end_date:
                            confirmed.update({k:v})
                        if k.startswith("d2020"):
                            if start_date <= k[1:] <= end_date:
                                death.update({k[1:]:v})
                    response["data"].update({"confirmed":confirmed})
                    response["data"].update({"death":death})
                elif _type == "confirmed":
                    confirmed = {}
                    for k,v in county.items(): 
                        if start_date <= k <= end_date: 
                            confirmed.update({k:v})
                    response["data"].update({"confirmed":confirmed})
                elif _type == "death":
                    death = {}
                    for k,v in county.items(): 
                        if k.startswith("d2020"):
                            if start_date <= k[1:] <= end_date:
                                death.update({k[1:]:v})
                    response["data"].update({"death":death})
                else:
                    return "Invalid Type Input!"
                return response
    return "Invalid County-State Input!"


########## Util Functions ##########


def check_valid_date_json(start_date, end_date):
    if not re.match(r'2020[0-1][0-9][0-3][0-9]', start_date) or \
        not re.match(r'2020[0-1][0-9][0-3][0-9]', end_date) or \
        end_date < start_date:
        return "", ""
    else:
        start_date = datetime.strptime(start_date, '%Y%m%d').strftime('%Y-%m-%d') 
        end_date = datetime.strptime(end_date, '%Y%m%d').strftime('%Y-%m-%d') 
        return (start_date, end_date)


def check_valid_date_csv(start_date, end_date):
    if not re.match(r'2020[0-1][0-9][0-3][0-9]', start_date) or \
        not re.match(r'2020[0-1][0-9][0-3][0-9]', end_date) or \
        end_date < start_date:
        return "", ""
    else:
        start_date = datetime.strptime(start_date, '%Y%m%d').strftime('%-m/%-d/%y') 
        end_date = datetime.strptime(end_date, '%Y%m%d').strftime('%-m/%-d/%y')   
        return (start_date, end_date)

