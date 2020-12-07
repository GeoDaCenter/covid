

import geopandas
import pygeoda
import json
import re
from datetime import datetime
import util



##### USAFacts #####


def calculate_seven_day_lisa():

	month_day = util.get_month_day()

	gdf = geopandas.read_file("../download/usafacts_confirmed_{}.geojson".format(month_day))

	gdf.columns = util.rename_column_usafacts(gdf.columns.tolist())


	# Select informational columns and calculate 7-day average for last 7 days
	seven_day  = gdf.iloc[:, 1:13]
	seven_day_adjusted  = gdf.iloc[:, 1:13]
	stable_adjusted  = gdf.iloc[:, 1:13]
	stable_unadjusted  = gdf.iloc[:, 1:13]


	for i in range(-8, -1):
		seven_day[gdf.columns[i]] = (gdf.iloc[:,i] - gdf.iloc[:,i-7])/7
		seven_day_adjusted[gdf.columns[i]] = ((gdf.iloc[:,i] - gdf.iloc[:,i-7])/7)*100000/gdf['population']
		stable_unadjusted[gdf.columns[i]] = gdf.iloc[:,i]
		stable_adjusted[gdf.columns[i]] = gdf.iloc[:,i]*100000/gdf['population']

	seven_day["average"] = seven_day.iloc[:, -7:].mean(axis=1)
	seven_day_adjusted["average"] = seven_day_adjusted.iloc[:, -7:].mean(axis=1)
	stable_unadjusted["average"] = stable_unadjusted.iloc[:, -7:].mean(axis=1)
	stable_adjusted["average"] = stable_adjusted.iloc[:, -7:].mean(axis=1)
	
	seven_day["geometry"] = gdf["geometry"]
	seven_day_adjusted["geometry"] = gdf["geometry"]
	stable_unadjusted["geometry"] = gdf["geometry"]
	stable_adjusted["geometry"] = gdf["geometry"]


	# Weight parameters for LISA
	counties = pygeoda.geopandas_to_geoda(seven_day)
	w = pygeoda.weights.queen(counties)


	# Unadjusted Seven Day
	select_col = util.get_date(ndays = 7)
	int_data = [seven_day[c].tolist() for c in select_col]

	lisa = pygeoda.batch_local_moran(w, int_data, nCPUs=1, perm=999)
	for i, col in enumerate(select_col):
		seven_day[col] = lisa.GetClusterIndicators(i)
	seven_day = seven_day.to_dict(orient="records")
	seven_day = {"type": "7 day average unadjusted", "source": "USAFacts", "features": seven_day}
	print("7 day average unadjusted")


	# Adjusted Seven Day
	int_data = [seven_day_adjusted[c].tolist() for c in select_col]

	lisa = pygeoda.batch_local_moran(w, int_data, nCPUs=1, perm=999)
	for i, col in enumerate(select_col):
		seven_day_adjusted[col] = lisa.GetClusterIndicators(i)
	seven_day_adjusted = seven_day_adjusted.to_dict(orient="records")
	seven_day_adjusted = {"type": "7 day average adjusted", "source": "USAFacts", "features": seven_day_adjusted}
	print("7 day average adjusted")

	# Unadjusted Stable
	int_data = [stable_unadjusted[c].tolist() for c in select_col]

	lisa = pygeoda.batch_local_moran(w, int_data, nCPUs=1, perm=999)
	for i, col in enumerate(select_col):
		stable_unadjusted[col] = lisa.GetClusterIndicators(i)
	stable_unadjusted = stable_unadjusted.to_dict(orient="records")
	stable_unadjusted = {"type": "stable unadjusted", "source": "USAFacts", "features": stable_unadjusted}
	print("stable unadjusted")


	# Adjusted Stable
	int_data = [stable_adjusted[c].tolist() for c in select_col]

	lisa = pygeoda.batch_local_moran(w, int_data, nCPUs=1, perm=999)
	for i, col in enumerate(select_col):
		stable_adjusted[col] = lisa.GetClusterIndicators(i)
	stable_adjusted = stable_adjusted.to_dict(orient="records")
	stable_adjusted = {"type": "stable adjusted", "source": "USAFacts", "features": stable_adjusted}
	print("stable adjusted")


	return seven_day, seven_day_adjusted, stable_unadjusted, stable_adjusted



def get_high_high_county(seven_day, seven_day_adjusted, stable_unadjusted, stable_adjusted):

	date_list = util.get_date(ndays = 7)
	seven_day = util.get_high_high_county(seven_day, date_list)
	seven_day_adjusted = util.get_high_high_county(seven_day_adjusted, date_list)
	stable_unadjusted = util.get_high_high_county(stable_unadjusted, date_list)
	stable_adjusted = util.get_high_high_county(stable_adjusted, date_list)
	output = {
			"seven_day_average": seven_day, 
			"seven_day_average_adjusted": seven_day_adjusted,
			"stable_unadjusted": stable_unadjusted,
			"stable_adjusted": stable_adjusted
			}

	return output



##### Go! #####



if __name__ == '__main__':

	seven_day, seven_day_adjusted, stable_unadjusted, stable_adjusted = calculate_seven_day_lisa()
	output = get_high_high_county(seven_day, seven_day_adjusted, stable_unadjusted, stable_adjusted)

	template_vars = util.generate_tables(output)
	util.generate_html(template_vars)







