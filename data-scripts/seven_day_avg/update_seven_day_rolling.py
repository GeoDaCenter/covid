import os
import json
import boto3
from datetime import datetime, timedelta


dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

s3 = boto3.resource('s3')

def update_data(_type):

	with open(os.path.join(dir_path, "_working/seven_day_{}_usafacts.json".format(_type))) as f:
		old_data = json.load(f)
	old_data_feature = old_data["features"]

	with open(os.path.join(repo_root, "download/usafacts_{}.geojson".format(_type))) as f:
		data = json.load(f)
	data = data["features"]

	start_date = '2020-01-29'

	date_list = [i for i in list(data[0]["properties"].keys()) if i not in list(old_data_feature[0].keys()) and i > start_date]

	if not date_list:
		print("All data up to yesterday")
		return

	for county in old_data_feature:
		geoid = county["GEOID"]
		for county_new in data:
			if county_new["properties"]["GEOID"] == geoid:
				for date in date_list:
					seven_day_prior = seven_day_date(date)
					county[date] = (county_new["properties"][date]-county_new["properties"][seven_day_prior])/7
	return old_data


def create_file(_type):
	with open(os.path.join(repo_root, "download/usafacts_{}.geojson".format(_type))) as f:
		data = json.load(f)
	data = data["features"]

	info_keys = ['STATEFP', 'COUNTYFP', 'GEOID', 'NAME', 'state_name', 'state_abbr', 'population', 'beds', 'countyFIPS', 'County Name', 'State', 'StateFIPS']

	start_date = '2020-01-29'

	seven_day_rolling_average  = []

	for county in data:
		rolling_average = {}
		for k, v in county['properties'].items():
			if k in info_keys:
				rolling_average[k] = v
			else:
				if k >= start_date:
					seven_day_prior = seven_day_date(k)
					rolling_average[k] = (v - county['properties'][seven_day_prior])/7
		seven_day_rolling_average.append(rolling_average)

	output = {}
	output["type"] = _type
	output["source"] = "USAFacts"
	output["features"] = seven_day_rolling_average

	return output


def save_file(output, _type):
	with open(os.path.join(dir_path, '_working/seven_day_{}_usafacts.json'.format(_type)), 'w') as f:
	    json.dump(output, f)


def seven_day_date(date):
	date = datetime.strptime(date, '%Y-%m-%d')
	return (date + timedelta(-7)).strftime('%Y-%m-%d')

if __name__ == '__main__':
	working_dir = os.path.join(dir_path, '_working')
	os.makedirs(working_dir, exist_ok=True)

	try:
		s3.Bucket('geoda-covid-atlas').download_file('seven_day_confirmed_usafacts.json', os.path.join(dir_path, '_working/seven_day_confirmed_usafacts.json'))
		s3.Bucket('geoda-covid-atlas').download_file('seven_day_deaths_usafacts.json', os.path.join(dir_path, '_working/even_day_deaths_usafacts.json'))
	except:
		save_file(create_file("confirmed"), "confirmed")
		save_file(create_file("deaths"), "deaths")

	save_file(update_data("confirmed"), "confirmed")
	save_file(update_data("deaths"), "deaths")
