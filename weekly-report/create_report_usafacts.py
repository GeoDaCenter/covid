import fiona
import geopandas
import pandas as pd
import util_usafacts as util
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..'))

##### USAFacts #####


def calculate_seven_day_lisa():
	df = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_usafacts.csv'))
	df = df.rename(columns={"countyFIPS": "GEOID"})
	df["GEOID"] = df["GEOID"].astype('str').str.zfill(5)
	gdf = geopandas.read_file(os.path.join(repo_root, 'public/geojson/county_usfacts.geojson'))
	gdf["GEOID"] = gdf["GEOID"].astype('str')

	fourteen_dates = util.get_date(ndays = 14, date = util.check_latest_date(df))
	seven_dates = util.get_date(ndays = 7, date = util.check_latest_date(df))

	gdf = gdf.merge(df.loc[:, fourteen_dates+["GEOID", "County Name"]], on="GEOID")

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

	# template_vars = util.generate_tables(lisa)
	# util.generate_html(template_vars)







