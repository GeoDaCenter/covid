import boto3
import json
from datetime import datetime, timedelta
import re

# confirmed to cases

def lambda_handler(event, context):
    
    # from botocore.session import Session
    # from botocore.config import Config
    # s = Session()
    # c = s.create_client('s3', config=Config(connect_timeout=5, read_timeout=60, retries={'max_attempts': 2}))
    
    # read in geojson file
    s3 = boto3.client('s3',aws_access_key_id='AKIAYFJCPR6GXLACUXPC',
                aws_secret_access_key='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')
                
    file = "states_update.geojson"
    response = s3.get_object(Bucket='geoda-covid-atlas', Key= file)
    text = response['Body'].read().decode()
    data = json.loads(text)


    # read in parameter input
    state_input = event["queryStringParameters"]["state"].lower().replace(" ", "")
    _type = event["queryStringParameters"]["type"].lower().replace(" ", "")
    
    
    if "start" in event["queryStringParameters"]:
        start = event["queryStringParameters"]["start"]
    else:
        start = "20200121"
        
    if "end" in event["queryStringParameters"]:
        end = event["queryStringParameters"]["end"]
    else:
        end = "20200820"


    # extract data from json file
    output = search_info(state_input, _type, data, start, end)

    
    return {
        "statusCode" : 200,
        "body": json.dumps(output)
    }




def search_info(state_input, _type, data, start, end):
    '''
    Input:
        state_input: user input state name or abbr
        _type: "confirmed", "death", "both"
        start: 8 digits string
        end: 8 digits string

        data: states_update.geojson
    '''

    # set response object
    response = {}
    response["state"] = state_input.upper()
    response["type"] = _type
    response["source"] = "1P3A"
    response["data"] = {}

    # check if input date is legal
    start, end = check_valid_date_json(start, end)
    if not start:
        return "Invalid Date Input!"


    # extract data 
    states =  data["features"]
    for state in states:
        state = state["properties"]
        if state_input  == state["NAME"].lower().replace(" ", "") or \
            state_input == state["STUSPS"].lower().replace(" ", ""):
            if _type == "confirmed":
                confirmed = {}
                for k,v in state.items(): 
                    if start <= k <= end: 
                        confirmed.update({k:v})
                response["data"].update({"confirmed":confirmed})
            elif _type == "death":
                death = {}
                for k,v in state.items(): 
                    if k.startswith("d2020"):
                        if start <= k[1:] <= end:
                            death.update({k[1:]:v})
                response["data"].update({"death":death})
            else:
                return "Invalid Type Input!"
            return response
    return "Invalid State Input!"



def check_valid_date_json(start, end):
    if not re.match(r'2020[0-1][0-9][0-3][0-9]', start) or \
        not re.match(r'2020[0-1][0-9][0-3][0-9]', end) or \
        end < start:
        return "", ""
    else:
        start = datetime.strptime(start, '%Y%m%d').strftime('%Y-%m-%d') 
        end = datetime.strptime(end, '%Y%m%d').strftime('%Y-%m-%d') 
        return (start, end)
