import boto3
import json
from datetime import datetime, timedelta
import re


def lambda_handler(event, context):
	
	# from botocore.session import Session
	# from botocore.config import Config
	# s = Session()
	# c = s.create_client('s3', config=Config(connect_timeout=5, read_timeout=60, retries={'max_attempts': 2}))
	
	# read in geojson file
	s3 = boto3.client('s3',aws_access_key_id='',
				aws_secret_access_key='')

	# read in parameter input
	state_input = event["queryStringParameters"]["state"].lower()

	# Type, default as deaths
	if "type" in event["queryStringParameters"]:
		_type = event["queryStringParameters"]["type"].lower().replace(" ", "")
	else:
		_type = "death"
	
	# Start date, default as 2020-01-21
	if "start" in event["queryStringParameters"]:
		start = event["queryStringParameters"]["start"]
	else:
		start = "20200121"
	
	# End date, default as 2020-08-20
	if "end" in event["queryStringParameters"]:
		end = event["queryStringParameters"]["end"]
	else:
		end = "20200820"

	# Data source, default as USAFacts
	if "source" in event["queryStringParameters"]:
		source = event["queryStringParameters"]["source"]
	else:
		source = "usafacts"

	# Level: county or state, default as state
	if "level" in event["queryStringParameters"]:
		level = event["queryStringParameters"]["level"]
	else:
		source = "state"

	# Select proper data source
	if source == "usafacts":
		if _type == "confirmed":
			response = s3.get_object(Bucket='geoda-covid-atlas', Key= "lisa_county_confirmed_usafacts.json")
		else:
			response = s3.get_object(Bucket='geoda-covid-atlas', Key= "lisa_county_death_usafacts.json")
	else:
		if _type == "confirmed":
			if level == "county":
				response = s3.get_object(Bucket='geoda-covid-atlas', Key= "lisa_county_confirmed_1P3A.json")
			else:
				response = s3.get_object(Bucket='geoda-covid-atlas', Key= "lisa_state_confirmed_1P3A.json")
		else:
			if level == "county":
				response = response = s3.get_object(Bucket='geoda-covid-atlas', Key= "lisa_county_death_1P3A.json")
			else:
				response = response = s3.get_object(Bucket='geoda-covid-atlas', Key= "lisa_state_death_1P3A.json")


	text = response['Body'].read().decode()
	data = json.loads(text)


	# extract data from json file
	output = search_info(data, state_input, start, end, source, _type, level)

	
	return {
		"statusCode" : 200,
		"body": json.dumps(output)
	}




def search_info(data, state_input, start, end, source, _type, level):
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
	response["source"] = source
	response["level"] = level

	# check if input date is legal
	start, end = check_valid_date_json(start, end)
	if not start:
		return "Invalid Date Input!"

	if start < "2020-01-21":
		return "Invalid Date Input! Starts from 20200121"
	if end > datetime.today().strftime('%Y-%m-%d'):
		return "Invalid Date Input! Max end date as today or yesterday"

	# extract data 
	locations =  data["features"]
	output = []
	basic_info = ["NAME", "GEOID"]

	for loc in locations:
		if state_input  == loc["state_name"].lower() or \
			state_input == loc["state_abbr"].lower():
			cases = {k:v for k,v in loc.items() if k in basic_info or start <= k <= end}
			output.append(cases)
	
	response["data"] = output
	return response



def check_valid_date_json(start, end):
	if not re.match(r'2020[0-1][0-9][0-3][0-9]', start) or \
		not re.match(r'2020[0-1][0-9][0-3][0-9]', end) or \
		end < start:
		return "", ""
	else:
		start = datetime.strptime(start, '%Y%m%d').strftime('%Y-%m-%d') 
		end = datetime.strptime(end, '%Y%m%d').strftime('%Y-%m-%d') 
		return (start, end)
