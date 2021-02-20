

import geopandas
import pandas as pd
import json
import re
from datetime import datetime
import util



##### USAFacts #####


def calculate_seven_day_lisa():

	gdf = geopandas.read_file("../data/counties_update.geojson")
	gdf["GEOID"] = gdf["GEOID"].astype('str')
	population = geopandas.read_file("../public/geojson/county_usfacts.geojson")
	population["GEOID"] = population["GEOID"].astype('str').apply(lambda x: x.zfill(5))

	thirteen_dates = util.get_date(ndays = 13)
	seven_dates = util.get_date(ndays = 7)

	gdf = pd.merge(gdf.loc[:,thirteen_dates+["GEOID", "geometry"]], population.loc[:,["GEOID", "population", 
		"NAME", "state_name", "state_abbr"]], left_on = "GEOID", right_on = "GEOID")


	# Select informational columns and calculate 7-day average for last 7 days
	emerging_hotspot  = util.rolling_average(gdf, thirteen_dates , seven_dates, adjusted_population=False)
	emerging_hotspot_adjusted  = util.rolling_average(gdf, thirteen_dates , seven_dates, adjusted_population=True)
	stable_hotspot = util.rolling_sum(gdf, thirteen_dates , seven_dates, adjusted_population=False)
	stable_hotspot_adjusted  = util.rolling_sum(gdf, thirteen_dates , seven_dates, adjusted_population=True)


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







