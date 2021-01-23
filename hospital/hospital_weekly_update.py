
import pandas as pd
import json
import numpy as np
import datetime


def fetch_data():

	try:
		date = get_last_sunday()
		data = pd.read_csv("https://healthdata.gov/sites/default/files/reported_hospital_capacity_admissions_facility_level_weekly_average_timeseries_{}.csv".format(date))
		print("Data updated as of {}".format(date))
	except:
		date = get_last_sunday(delta=7)
		data = pd.read_csv("https://healthdata.gov/sites/default/files/reported_hospital_capacity_admissions_facility_level_weekly_average_timeseries_{}.csv".format(date))
		print("Data updated as of {}".format(date))


	colnames = ["hospital_pk",
	"collection_week",
	"hospital_name",
	"address",
	"city" ,
	"zip" ,
	"hospital_subtype", 
	"fips_code", 
	"all_adult_hospital_inpatient_beds_7_day_avg", 
	"inpatient_beds_used_7_day_avg", 
	"total_icu_beds_7_day_avg", 
	"icu_beds_used_7_day_avg",
	"total_adult_patients_hospitalized_confirmed_covid_7_day_avg"]
	
	data = data.loc[:,colnames]

	return data



def merge_coordinate(data):

	with open("hospital.json") as f:
		hospital_geo = json.loads(f.read())
	hospital_geo = pd.DataFrame.from_dict(hospital_geo, orient='index').reset_index()
	data = pd.merge(data, hospital_geo.loc[:,["index", "lat", "lon"]], left_on="hospital_pk", right_on = "index", how="left").drop(columns=["index"])
	# data["fips_code"] = data["fips_code"].fillna(0).astype('int').astype('str').apply(lambda x: x.zfill(5))
	# data["zip"] = data["zip"].fillna(0).astype('int').astype('str').apply(lambda x: x.zfill(5))
	
	return data


def save_data(data):
	data.to_csv("hospital_facility.csv", index=False)


def get_last_sunday(delta=0):
	today = datetime.date.today()
	idx = (today.weekday() + 1) % 7
	sunday = today - datetime.timedelta(idx)
	return sunday.strftime("%Y%m%d")


if __name__ == '__main__':
	data = fetch_data()
	data = merge_coordinate(data)
	save_data(data)
