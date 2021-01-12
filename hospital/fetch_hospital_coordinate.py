
import pandas as pd
from geopy.geocoders import Nominatim
import json


def fetch_hospital_coordinate():

	data = pd.read_csv("https://healthdata.gov/sites/default/files/reported_hospital_capacity_admissions_facility_level_weekly_average_timeseries_20210110.csv")

	hospital = data.groupby(['hospital_pk','hospital_name', 'address']).size().reset_index().drop([0], axis=1).set_index('hospital_pk')

	hospital = hospital.to_dict("index")

	i = 0
	for k, v in hospital.items():
		locator = Nominatim(user_agent="myGeocoder")
		location = locator.geocode(v["address"], timeout=10)
		if location:
			v["lat"] = location.latitude
			v["lon"] = location.longitude
		else:
			v["lat"] = -999
			v["lon"] = -999
		i += 1
		print(i)

	with open('hospital.json', 'w') as fp:
		json.dump(hospital, fp)

	print("JSON file saved!")


if __name__ == '__main__':
	fetch_hospital_coordinate()