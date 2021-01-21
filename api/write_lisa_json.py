

import geopandas 
import pygeoda
import json
import re
from datetime import datetime


##### 1P3A #####

# Four json file generated:
#	1. county_confirmed_lisa_1P3A.json
#	2. county_death_lisa_1P3A.json
#	3. state_confirmed_lisa_1P3A.json
#	4. state_death_lisa_1P3A.json

def write_new_json_county():

	gdf = geopandas.read_file("../data/counties_update.geojson")
	cluster  = gdf.copy()

	counties = pygeoda.geopandas_to_geoda(gdf)
	w = pygeoda.weights.queen(counties)

	select_vars = list(gdf.columns[14:-3])
	int_data = [gdf[c].tolist() for c in select_vars]
	n = len(select_vars)

	lisa = pygeoda.batch_local_moran(w, int_data, nCPUs=1, perm=999)
	for i in range(n):
		cluster.iloc[:,i+14] = lisa.GetClusterIndicators(i)

	confirmed = cluster.loc[:,:'d2020-01-21'].iloc[:,:-1]
	confirmed = confirmed.to_dict(orient="records")
	confirmed = {"type": "confirmed", "source": "1P3A", "features": confirmed}
	with open('lisa/lisa_county_confirmed_1P3A.json', 'w') as fp:
		json.dump(confirmed, fp)


	death = cluster[list(cluster.iloc[:,0:13]) + list(cluster.loc[:,"d2020-01-21":])].iloc[:,:-3]
	death = death.to_dict(orient="records")
	death = [{k.replace("d", ""):v for k,v in d.items()} for d in death]
	death = {"type": "death", "source": "1P3A", "features": death}
	with open('lisa/lisa_county_death_1P3A.json', 'w') as fp:
		json.dump(death, fp)

	print("Successfully wrote 1P3A county lisa")

	pass


def write_new_json_state():

	gdf = geopandas.read_file("../data/states_update.geojson")
	cluster  = gdf.copy()

	counties = pygeoda.geopandas_to_geoda(gdf)
	w = pygeoda.weights.queen(counties)

	select_vars = list(gdf.columns[16:-3])
	int_data = [gdf[c].tolist() for c in select_vars]
	n = len(select_vars)

	lisa = pygeoda.batch_local_moran(w, int_data, nCPUs=1, perm=999)

	for i in range(n):
		cluster.iloc[:,i+16] = lisa.GetClusterIndicators(i)

	confirmed = cluster.loc[:,:'d2020-01-21'].iloc[:,:-1]
	confirmed = confirmed.to_dict(orient="records")
	confirmed = {"type": "confirmed", "source": "1P3A", "features": confirmed}
	with open('lisa/lisa_state_confirmed_1P3A.json', 'w') as fp:
		json.dump(confirmed, fp)


	death = cluster[list(cluster.iloc[:,0:16]) + list(cluster.loc[:,"d2020-01-21":])].iloc[:,:-3]
	death = death.to_dict(orient="records")
	death = [{k.replace("d", ""):v for k,v in d.items()} for d in death]
	death = {"type": "death", "source": "1P3A", "features": death}
	with open('lisa/lisa_state_death_1P3A.json', 'w') as fp:
		json.dump(death, fp)

	print("Successfully wrote 1P3A state lisa")

	pass


##### USAFacts #####

# Two json file generated:
#	1. county_death_lisa_usafacts.json
#	2. county_confirmed_lisa_usafacts.json


def write_confirmed_lisa_usafacts():

	gdf = geopandas.read_file("../download/usafacts_confirmed_9.14.geojson")
	gdf.columns = rename_column_usafacts(gdf.columns.tolist())
	cluster  = gdf.copy()

	counties = pygeoda.geopandas_to_geoda(gdf)
	w = pygeoda.weights.queen(counties)

	select_vars = list(gdf.columns[12:-1])
	int_data = [gdf[c].tolist() for c in select_vars]
	n = len(select_vars)


	lisa = pygeoda.batch_local_moran(w, int_data, nCPUs=1, perm=999)
	for i in range(n):
		cluster.iloc[:,i+12] = lisa.GetClusterIndicators(i)

	confirmed = cluster.iloc[:,:-1].to_dict(orient="records")
	confirmed = {"type": "confirmed", "source": "USAFacts", "features": confirmed}
	with open('lisa/lisa_county_confirmed_usafacts.json', 'w') as fp:
		json.dump(confirmed, fp)

	print("Successfully wrote USAFacts confirmed lisa")

	pass


def write_death_lisa_usafacts():

	gdf = geopandas.read_file("../download/usafacts_deaths_9.14.geojson")
	gdf.columns = rename_column_usafacts(gdf.columns.tolist())
	cluster  = gdf.copy()

	counties = pygeoda.geopandas_to_geoda(gdf)
	w = pygeoda.weights.queen(counties)

	select_vars = list(gdf.columns[12:-1])
	int_data = [gdf[c].tolist() for c in select_vars]
	n = len(select_vars)


	lisa = pygeoda.batch_local_moran(w, int_data, nCPUs=1, perm=999)
	for i in range(n):
		cluster.iloc[:,i+12] = lisa.GetClusterIndicators(i)

	death = cluster.iloc[:,:-1].to_dict(orient="records")
	death = {"type": "death", "source": "USAFacts", "features": death}
	with open('lisa/lisa_county_death_usafacts.json', 'w') as fp:
		json.dump(death, fp)

	print("Successfully wrote USAFacts death lisa")

	pass



def rename_column_usafacts(colnames):

	for i, n in enumerate(colnames):
		if re.match('^[0-9]+', n):
			n  = datetime.strptime(n, '%m/%d/%y').strftime('%Y-%m-%d')
			colnames[i] = n
	return colnames



##### GO! #####

if __name__ == "__main__":
	write_new_json_county()
	write_new_json_state()
	write_confirmed_lisa_usafacts()
	write_death_lisa_usafacts()




