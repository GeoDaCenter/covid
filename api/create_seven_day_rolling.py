import json
from datetime import datetime, timedelta


def create_file(_type):
	with open("../download/usafacts_{}.geojson".format(_type)) as f:
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

	with open('seven_day_rolling_average/seven_day_{}_usafacts.json'.format(_type), 'w') as f:
	    json.dump(output, f)


def seven_day_date(date):
	date = datetime.strptime(date, '%Y-%m-%d')
	return (date + timedelta(-7)).strftime('%Y-%m-%d')



if __name__ == '__main__':
	save_file(create_file("confirmed"), "confirmed")
	save_file(create_file("deaths"), "deaths")



