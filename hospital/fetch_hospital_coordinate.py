
import pandas as pd
from geopy.geocoders import ArcGIS 
import json


def fetch_hospital_coordinate():

	data = pd.read_csv("https://healthdata.gov/sites/default/files/reported_hospital_capacity_admissions_facility_level_weekly_average_timeseries_20210110.csv")

	hospital = data.groupby(['hospital_pk','hospital_name', 'address']).size().reset_index().drop([0], axis=1).set_index('hospital_pk')

	hospital = hospital.to_dict("index")
	geolocator = ArcGIS()

	i = 0
	for k, v in hospital.items():
		try:
			address, (lat, lon) = geolocator.geocode(v["hospital_name"], timeout=10)
			v["lat"] = lat
			v["lon"] = lon
		except:
			v["lat"] = -999
			v["lon"] = -999
		i += 1
		print(i)

	# Use hospital address to find coordinates for empty points, if exist
	unresolved_points = {k:v for k,v in hospital.items() if v["lon"] == -999}
	if unresolved_points:
		for k, v in unresolved_points.items():
			try:
				address, (lat, lon) = geolocator.geocode(v["address"], timeout=10)
				hospital[k]["lat"] = lat
				hospital[k]["lon"] = lon
			except:
				hospital[k]["lat"] = -999
				hospital[k]["lon"] = -999

	with open('hospital.json', 'w') as fp:
		json.dump(hospital, fp)

	print("JSON file saved!")


if __name__ == '__main__':
	fetch_hospital_coordinate()