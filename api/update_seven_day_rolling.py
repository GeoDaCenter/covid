import json
from datetime import datetime, timedelta
import create_seven_day_rolling as util


def create_file(_type):

	with open("seven_day_rolling_average/seven_day_{}_usafacts.json".format(_type)) as f:
		old_data = json.load(f)
	old_data_feature = old_data["features"]

	with open("../download/usafacts_{}.geojson".format(_type)) as f:
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
					seven_day_prior = util.seven_day_date(date)
					county[date] = (county_new["properties"][date]-county_new["properties"][seven_day_prior])/7
	return old_data


if __name__ == '__main__':
	util.save_file(create_file("confirmed"), "confirmed")
	util.save_file(create_file("deaths"), "deaths")



