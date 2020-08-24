import boto3
import json

def lambda_handler(event, context):
    
    # from botocore.session import Session
    # from botocore.config import Config
    # s = Session()
    # c = s.create_client('s3', config=Config(connect_timeout=5, read_timeout=60, retries={'max_attempts': 2}))
    
    # read in geojson file
    s3 = boto3.client('s3',aws_access_key_id='AKIAYFJCPR6GV6STPVRC',
                aws_secret_access_key='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')
                
    response = s3.get_object(Bucket='geoda-covid-atlas', Key='states_update.geojson')
    text = response['Body'].read().decode()
    data = json.loads(text)


    # read in parameter input
    state_input = event["queryStringParameters"]["state"].lower().replace(" ", "")
    _type = event["queryStringParameters"]["type"].lower().replace(" ", "")
    start_date = "20200121"
    end_date = "20200821"

    # extract data from json file
    output = search_info(state_input, _type, data, start_date, end_date)

    
    return {
    	"statusCode" : 200,
    	"body": json.dumps(output)
    }




def search_info(state_input, _type, data, start_date, end_date):
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
	response["state"] = state_input.upper()
	response["type"] = _type
	response["source"] = "1P3A"
	response["data"] = {}

	# check if input date is legal
	start_date, end_date = check_valid_date(start_date, end_date)
	if not start_date:
		return "Invalid Date Input!"


	# extract data 
	states =  data["features"]
	for state in states:
		state = state["properties"]
		if state_input  == state["NAME"].lower().replace(" ", "") or \
			state_input == state["STUSPS"].lower().replace(" ", ""):
			if _type == "both":
				confirmed = {}
				death = {}
				for k,v in state.items(): 
					if start_date <= k  <= end_date:
						confirmed.update({k:v})
					if k.startswith("d2020"):
						if start_date <= k[1:] <= end_date:
							death.update({k[1:]:v})
				response["data"].update({"confirmed":confirmed})
				response["data"].update({"death":death})
			elif _type == "confirmed":
				confirmed = {}
				for k,v in state.items(): 
					if start_date <= k <= end_date: 
						confirmed.update({k:v})
				response["data"].update({"confirmed":confirmed})
			elif _type == "death":
				death = {}
				for k,v in state.items(): 
					if k.startswith("d2020"):
						if start_date <= k[1:] <= end_date:
							death.update({k[1:]:v})
				response["data"].update({"death":death})
			else:
				return "Invalid Type Input!"
			return response
	return "Invalid State Input!"



def check_valid_date(start_date, end_date):
	import re
	if not re.match(r'2020[0-1][0-9][0-3][0-9]', start_date) or \
		not re.match(r'2020[0-1][0-9][0-3][0-9]', end_date) or \
		end_date < start_date:
		return "", ""
	else:
		start_date = start_date[:4]+"-"+start_date[4:6]+"-"+start_date[6:]
		end_date = end_date[:4]+"-"+end_date[4:6]+"-"+end_date[6:]
		return (start_date, end_date)


