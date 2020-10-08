import boto3
import json
from datetime import datetime, timedelta
import re


def lambda_handler(event, context):
	

	# read in parameter input
	if "state" in event["queryStringParameters"]:
		state_input = event["queryStringParameters"]["state"].lower().replace(" ", "")
	else:
		return {
		"statusCode" : 200,
		"body": json.dumps("Please Type In Valid State Abbreviation")
	}
	
	if "category" in event["queryStringParameters"]:
		category = event["queryStringParameters"]["category"].lower().replace(" ", "")
	else:
		return {
		"statusCode" : 200,
		"body": json.dumps("Please Type In Valid Category")
	}


	# Type, default as deaths
	if "type" in event["queryStringParameters"]:
		_type = event["queryStringParameters"]["type"].lower().replace(" ", "")
	else:
		_type = "death"
	

	# Start date, default as seven days before yesterday
	if "start" in event["queryStringParameters"]:
		start = event["queryStringParameters"]["start"]
	else:
		start = (datetime.today()- timedelta(days=8)).strftime("%Y%m%d")
	

	# End date, default as yesterday
	if "end" in event["queryStringParameters"]:
		end = event["queryStringParameters"]["end"]
	else:
		end = (datetime.today()- timedelta(days=1)).strftime("%Y%m%d")


	# Data source, default as USAFacts
	if "source" in event["queryStringParameters"]:
		source = event["queryStringParameters"]["source"].lower()
	else:
		source = "usafacts"


	# Level: county or state, default as county
	if "level" in event["queryStringParameters"]:
		level = event["queryStringParameters"]["level"]
	else:
		level = "county"
		

	# Check validity of input
	if check_valid_parameters(level, source, _type, category) != "valid":
		return {
		"statusCode" : 200,
		"body": json.dumps(check_valid_parameters(level, source, _type, category))
	}
	
		
	s3 = boto3.resource('s3')		
		
	# Select proper data source
	if category == "lisa":
		if source == "1p3a":
			if _type == "confirmed":

				if level == "state":
					response = s3.Object(bucket_name='geoda-covid-atlas', key="lisa_state_confirmed_1P3A.json")

				else:
					response = s3.Object(bucket_name='geoda-covid-atlas', key="lisa_county_confirmed_1P3A.json")

			else:
				if level == "state":
					response = s3.Object(bucket_name='geoda-covid-atlas', key="lisa_state_death_1P3A.json")

				else:
					response = s3.Object(bucket_name='geoda-covid-atlas', key="lisa_county_death_1P3A.json")
		
		else:
			if _type == "confirmed":
				response = s3.Object(bucket_name='geoda-covid-atlas', key="lisa_county_confirmed_usafacts.json")

			else:
				response = s3.Object(bucket_name='geoda-covid-atlas', key="lisa_county_death_usafacts.json")
		
		text = response.get()['Body'].read().decode()
		data = json.loads(text)
		output = search_lisa(data, state_input, start, end, source, _type, level, category)

	else:
		if _type == "death":
			response = s3.Object(bucket_name='geoda-covid-atlas', key="covid_deaths_usafacts.geojson")
			text = response.get()['Body'].read().decode()
			data = json.loads(text)			
			output = search_usafacts(data, state_input, start, end, source, _type, level, category)
		
		elif _type == "confirmed":
			response = s3.Object(bucket_name='geoda-covid-atlas', key="covid_confirmed_usafacts.geojson")
			text = response.get()['Body'].read().decode()
			data = json.loads(text)			
			output = search_usafacts(data, state_input, start, end, source, _type, level, category)

		elif _type == "positivity":
			if source == "1p3a":
				output = "1p3a -  pos rate"

			else:
				output = "USAFacts - pos rate"

		else:
			if level == "state":
				response = s3.Object(bucket_name='geoda-covid-atlas', key="state_testing.json")
				text = response.get()['Body'].read().decode()
				data = json.loads(text)			
				output = search_state_testing(data, state_input, start, end, source, _type, level, category)
			
			else:
				output = "county_testing"

	
	return {
		"statusCode" : 200,
		"body": json.dumps(output)
	}



####### Search Functions #######


# 1. Search Lisa Files


def search_lisa(data, state_input, start, end, source, _type, level, category):


	# set response object
	response = {}
	response["state"] = state_input.upper()
	response["category"] = category
	response["type"] = _type
	response["source"] = source
	response["level"] = level


	# Check dates are valid 
	start, end = check_valid_date_json(start, end)
	if not start:
		return "Invalid Date Input!"
	if start < "2020-01-21":
		return "Invalid Date Input! Starts from 20200121"
	if end > datetime.today().strftime('%Y-%m-%d'):
		return "Invalid Date Input! Max end date as today or yesterday"


	# Extract data 
	locations =  data["features"]
	output = []
	basic_info = ["NAME", "GEOID"]
	
	if level == "state":
		state_var = 'STUSPS'
	else:
		state_var = "state_abbr"

	for loc in locations:
		if state_input.lower() == loc[state_var].lower():
			cases = {k:v for k,v in loc.items() if k in basic_info or start <= k <= end}
			output.append(cases)

	if not output:
		return "Invalid State Input!"

	response["data"] = output
	return response



# 2. Search USAFacts Files


def search_usafacts(data, state_input, start, end, source, _type, level, category):

	# Set response object
	response = {}
	response["state"] = state_input.upper()
	response["category"] = category
	response["type"] = _type
	response["source"] = source
	response["level"] = level


	# Check dates are valid
	date_range = create_date_range(start , end)
	if not date_range:
		return "Invalid Date Input!"
	if start < "20200122":
		return "Invalid Date Input! Starts from 20200122"
	if end > datetime.today().strftime('%Y%m%d'):
		return "Invalid Date Input! Max end date as today or yesterday"


	# Extract data 
	locations =  data["features"]
	output = []
	basic_info = ['County Name', "GEOID"]

	for loc in locations:
		if state_input.lower()  == loc["properties"]["state_abbr"].lower():
			cases = {k:v for k,v in loc["properties"].items() if k in basic_info or k in date_range}
			output.append(cases)

	if not output:
		return "Invalid State Input!"
	
	response["data"] = output
	return response



# 3. Search State Testing Data


def search_state_testing(data, state_input, start, end, source, _type, level, category):

	# Set response object
	response = {}
	response["state"] = state_input.upper()
	response["category"] = category
	response["type"] = _type
	response["source"] = source
	response["level"] = level


	# Check dates are valid
	if not start or not end:
		return "Invalid Date Input!"
	if start < "20200122":
		return "Invalid Date Input! Starts from 20200122"
	if end > datetime.today().strftime('%Y%m%d'):
		return "Invalid Date Input! Max end date as today or yesterday"


	# Extract data 
	basic_info = ["criteria"]
	output = {k:v for k,v in data[state_input.upper()].items() if k in basic_info or k >= start and k <= end}

	if not output:
		return "Invalid State Input!"
	
	response["data"] = output
	return response




####### Helper Functions #######



def check_valid_date_json(start, end):


	# Use in all search functions

	if not re.match(r'2020[0-1][0-9][0-3][0-9]', start) or \
		not re.match(r'2020[0-1][0-9][0-3][0-9]', end) or \
		end < start:
		return "", ""
	else:
		start = datetime.strptime(start, '%Y%m%d').strftime('%Y-%m-%d') 
		end = datetime.strptime(end, '%Y%m%d').strftime('%Y-%m-%d') 
		return (start, end)



def check_valid_parameters(level, source, _type, category):

	# Use in all search functions

	if level not in ["state", "county"]:
		return "Invalid Level Input.  Valid Options: state or county"
	if source not in ["usafacts", "1p3a"]:
		return "Invalid Source Input.  Valid Options: 1p3a or usafacts"
	if _type not in ["confirmed", "testing", "death", "positivity"]:
		return "Invalid Type Input.  Valid Options: confirmed, testing, death, or positivity"
	if category not in ["lisa", "data"]:
		return "Invalid Category Input.  Valid Options: lisa or data"

	return "valid"



def create_date_range(start, end):

	# Use in USAFacts Search

	if not re.match(r'2020[0-1][0-9][0-3][0-9]', start) or \
		not re.match(r'2020[0-1][0-9][0-3][0-9]', end) or \
		end < start:
		return ""
	else:
		start = datetime.strptime(start, '%Y%m%d')
		end = datetime.strptime(end, '%Y%m%d')
		ndays = (end - start).days
		date_range = [(start + timedelta(days=x)).strftime('%-m/%-d/%y') for x in range(ndays+1)]
		return date_range




