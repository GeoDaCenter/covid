

import geopandas
import pandas as pd
import json
import re
from datetime import datetime
import util_usafacts as util



##### USAFacts #####


def calculate_seven_day_lisa():
	df = pd.read_csv("../public/csv/covid_confirmed_usafacts.csv")
	df = df.rename(columns={"countyFIPS": "GEOID"})
	df["GEOID"] = df["GEOID"].astype('str').str.zfill(5)
	gdf = geopandas.read_file("../data/county_usfacts.geojson")
	gdf["GEOID"] = gdf["GEOID"].astype('str')

	fourteen_dates = util.get_date(ndays = 14, date = util.check_latest_date(df))
	seven_dates = util.get_date(ndays = 7, date = util.check_latest_date(df))

	gdf = gdf.merge(df.loc[:, fourteen_dates+["GEOID", "County Name"]], left_index = True, right_index = False, on="GEOID")

	# Select informational columns and calculate 7-day average for last 7 days
	emerging_hotspot  = util.rolling_average(gdf, fourteen_dates , seven_dates, adjusted_population=False)
	emerging_hotspot_adjusted  = util.rolling_average(gdf, fourteen_dates , seven_dates, adjusted_population=True)
	stable_hotspot = util.rolling_sum(gdf, fourteen_dates , seven_dates, adjusted_population=False)
	stable_hotspot_adjusted  = util.rolling_sum(gdf, fourteen_dates , seven_dates, adjusted_population=True)


	# Calculate LISA
	lisa = {
	"emerging_hotspot" : emerging_hotspot,
	"emerging_hotspot_adjusted": emerging_hotspot_adjusted,
	"stable_hotspot": stable_hotspot,
	"stable_hotspot_adjusted": stable_hotspot_adjusted
	}

	for k in lisa.keys():
		util.calculate_lisa(lisa, k, seven_dates)

	return lisa


def get_high_high_county(lisa):

	seven_dates = util.get_date(ndays = 7)

	for k,v in lisa.items():
		lisa[k] = util.get_high_high_county(v, seven_dates)

	return lisa



##### Go! #####


if __name__ == '__main__':

	lisa = calculate_seven_day_lisa()
	lisa = get_high_high_county(lisa)

	template_vars = util.generate_tables(lisa)
	util.generate_html(template_vars)







