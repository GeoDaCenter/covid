
import geopandas 
import pygeoda
import json
from datetime import datetime
import os.path
import write_lisa_json

##### 1P3A #####

def county_update_lisa_1P3A():

	# Read in files
	with open('lisa/lisa_county_confirmed_1P3A.json') as f:
		old_lisa_confirmed = json.load(f)
	with open('lisa/lisa_county_death_1P3A.json') as f:
		old_lisa_death = json.load(f)
	gdf = geopandas.read_file("../data/counties_update.geojson")

	# Find new dates
	lisa_dates = list(old_lisa_confirmed["features"][0].keys())

	dates = list(gdf.loc[:,:'d2020-01-21'].iloc[:,:-1].columns)
	select_vars = [i for i in dates if i not in lisa_dates]
	if not select_vars:
		print("1P3A - County: Already Updated!")
		return None		
	select_vars.extend(["d"+i for i in select_vars])
 

	# Calculate moran
	counties = pygeoda.geopandas_to_geoda(gdf)
	w = pygeoda.weights.queen(counties)
	int_data = [gdf[c].tolist() for c in select_vars]
	n = len(select_vars)
	lisa = pygeoda.batch_local_moran(w, int_data, nCPUs=1, perm=999)


	cluster  = gdf.loc[:, ["GEOID"]] 
	for i in range(n):
		cluster[select_vars[i]] = lisa.GetClusterIndicators(i)

	# Update Confirmed LISA json
	confirmed = cluster[["GEOID"] + cluster.filter(regex='^2020').columns.tolist()]
	features = []
	for county in old_lisa_confirmed["features"]:
		geoid = county["GEOID"]
		county.update(confirmed[confirmed["GEOID"] == geoid].to_dict(orient="records")[0])
		features.append(county)
	confirmed = {"type": "confirmed", "source": "1P3A", "features": features}
	with open('lisa/lisa_county_confirmed_1P3A.json', 'w') as fp:
		json.dump(confirmed, fp)


	# Update Death LISA json
	death = cluster[["GEOID"] + cluster.filter(regex='^d').columns.tolist()]
	features = []
	for county in old_lisa_death["features"]:
		geoid = county["GEOID"]
		county.update(death[death["GEOID"] == geoid].to_dict(orient="records")[0])
		features.append(county)
	features = [{k.replace("d", ""):v for k,v in d.items()} for d in features]
	death = {"type": "death", "source": "1P3A", "features": features}
	with open('lisa/lisa_county_confirmed_1P3A.json', 'w') as fp:
		json.dump(death, fp)

	pass




def state_update_lisa_1P3A():

	# Read in files
	with open('lisa/lisa_state_confirmed_1P3A.json') as f:
		old_lisa_confirmed = json.load(f)
	with open('lisa/lisa_state_death_1P3A.json') as f:
		old_lisa_death = json.load(f)
	gdf = geopandas.read_file("../data/states_update.geojson")

	# Find new dates
	lisa_dates = list(old_lisa_confirmed["features"][0].keys())
	dates = list(gdf.loc[:,:'d2020-01-21'].iloc[:,:-1].columns)
	select_vars = [i for i in dates if i not in lisa_dates]
	if not select_vars:
		print("1P3A - State: Already Updated!")
		return None
	select_vars.extend(["d"+i for i in select_vars])

	# Calculate moran
	states = pygeoda.geopandas_to_geoda(gdf)
	w = pygeoda.weights.queen(states)
	int_data = [gdf[c].tolist() for c in select_vars]
	n = len(select_vars)
	lisa = pygeoda.batch_local_moran(w, int_data, nCPUs=1, perm=999)


	cluster  = gdf.loc[:, ["GEOID"]]
	for i in range(n):
		cluster[select_vars[i]] = lisa.GetClusterIndicators(i)

	# Update Confirmed LISA json
	confirmed = cluster[["GEOID"] + cluster.filter(regex='^2020').columns.tolist()]
	
	features = []
	for county in old_lisa_confirmed["features"]:
		geoid = county["GEOID"]
		county.update(confirmed[confirmed["GEOID"] == geoid].to_dict(orient="records")[0])
		features.append(county)
	confirmed = {"type": "confirmed", "source": "1P3A", "features": features}
	with open('lisa/lisa_state_confirmed_1P3A.json', 'w') as fp:
		json.dump(confirmed, fp)

	# Update Deaths LISA json
	death = cluster[["GEOID"] + cluster.filter(regex='^d').columns.tolist()]
	features = []
	for county in old_lisa_death["features"]:
		geoid = county["GEOID"]
		county.update(death[death["GEOID"] == geoid].to_dict(orient="records")[0])
		features.append(county)
	features = [{k.replace("d", ""):v for k,v in d.items()} for d in features]
	death = {"type": "death", "source": "1P3A", "features": features}
	with open('lisa/lisa_state_death_1P3A.json', 'w') as fp:
		json.dump(death, fp)
	pass


##### USAFacts #####


def update_lisa_usafacts(type_):

	# Check if new file exists
	file = "../download/usafacts_{}_{}.geojson".format(type_, datetime.today().strftime("%-m.%-d"))
	if not os.path.isfile(file):
		print("USAFacts - {}: No Updates!".format(type_))
		return None

	# Read file and import geometry
	type_ = "death" if type_ == "deaths" else type_
	with open('lisa/lisa_county_{}_usafacts.json'.format(type_)) as f:
		old_lisa = json.load(f)
	gdf = geopandas.read_file(file)
	gdf.columns = write_lisa_json.rename_column_usafacts(gdf.columns.tolist())

	# Find new dates
	lisa_dates = list(old_lisa["features"][0].keys())
	dates = list(gdf.filter(regex='^[0-9]+', axis=1).columns)
	select_vars = [i for i in dates if i not in lisa_dates]
	if not select_vars:
		print("USAFacts - {}: Already Updated!".format(type_))
		return None

	# Calcualte new lisa
	counties = pygeoda.geopandas_to_geoda(gdf)
	w = pygeoda.weights.queen(counties)
	int_data = [gdf[c].tolist() for c in select_vars]
	n = len(select_vars)
	lisa = pygeoda.batch_local_moran(w, int_data, nCPUs=1, perm=999)

	cluster  = gdf.loc[:, ["GEOID"]]
	for i in range(n):
		cluster[select_vars[i]] = lisa.GetClusterIndicators(i)

	features = []
	for county in old_lisa["features"]:
		geoid = county["GEOID"]
		county.update(cluster[cluster["GEOID"] == geoid].to_dict(orient="records")[0])
		features.append(county)

	data = {"type": type_, "source": "USAFacts", "features": features}
	with open('lisa/lisa_county_{}_usafacts.json'.format(type_), 'w') as fp:
		json.dump(data, fp)

	print("Update for {} completed!".format(datetime.today().strftime("%-m.%-d")))

	pass



##### GO! #####

if __name__ == "__main__":
	county_update_lisa_1P3A()
	state_update_lisa_1P3A()
	update_lisa_usafacts("confirmed")
	update_lisa_usafacts("deaths")


