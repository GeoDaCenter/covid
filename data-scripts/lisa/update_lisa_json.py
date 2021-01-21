
import geopandas
import pygeoda
import os
import boto3
import pytz
import json
from datetime import datetime
import os.path
import write_lisa_json


dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

s3 = boto3.resource('s3')

working_dir = os.path.join(dir_path, '_working')
os.makedirs(working_dir, exist_ok=True)

##### 1P3A #####

def county_update_lisa_1P3A():

	# Read in files
	s3.Bucket('geoda-covid-atlas').download_file('lisa_county_confirmed_1P3A.json', os.path.join(dir_path, '_working/lisa_county_confirmed_1P3A.json'))
	with open(os.path.join(dir_path, '_working/lisa_county_confirmed_1P3A.json')) as f:
		old_lisa_confirmed = json.load(f)

	s3.Bucket('geoda-covid-atlas').download_file('lisa_county_death_1P3A.json', os.path.join(dir_path, '_working/lisa_county_death_1P3A.json'))
	with open(os.path.join(dir_path, '_working/lisa_county_death_1P3A.json')) as f:
		old_lisa_death = json.load(f)
	gdf = geopandas.read_file(os.path.join(repo_root, "data/counties_update.geojson"))

	# Find new dates
	lisa_dates = list(old_lisa_confirmed["features"][0].keys())

	dates = list([col for col in gdf.columns if len(col) == 10])
	select_vars = [i for i in dates if i not in lisa_dates]
	if not select_vars:
		print("1P3A - County: Already Updated!")
		return None
	select_vars.extend(["d"+i for i in select_vars])
	print(select_vars)


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
	confirmed = cluster[["GEOID"] + cluster.filter(regex='^202').columns.tolist()]
	features = []
	for county in old_lisa_confirmed["features"]:
		geoid = county["GEOID"]
		county.update(confirmed[confirmed["GEOID"] == geoid].to_dict(orient="records")[0])
		features.append(county)
	confirmed = {"type": "confirmed", "source": "1P3A", "features": features}
	with open(os.path.join(dir_path, '_working/lisa_county_confirmed_1P3A.json'), 'w') as fp:
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
	with open(os.path.join(dir_path, '_working/lisa_county_death_1P3A.json'), 'w') as fp:
		json.dump(death, fp)

	write_to_s3('lisa_county_confirmed_1P3A.json')
	write_to_s3('lisa_county_death_1P3A.json')




def state_update_lisa_1P3A():

	# Read in files
	s3.Bucket('geoda-covid-atlas').download_file('lisa_state_confirmed_1P3A.json', os.path.join(dir_path, '_working/lisa_state_confirmed_1P3A.json'))
	with open(os.path.join(dir_path, '_working/lisa_state_confirmed_1P3A.json')) as f:
		old_lisa_confirmed = json.load(f)
	s3.Bucket('geoda-covid-atlas').download_file('lisa_state_death_1P3A.json', os.path.join(dir_path, '_working/lisa_state_death_1P3A.json'))
	with open(os.path.join(dir_path, '_working/lisa_state_death_1P3A.json')) as f:
		old_lisa_death = json.load(f)
	gdf = geopandas.read_file(os.path.join(repo_root, "data/states_update.geojson"))

	# Find new dates
	lisa_dates = list(old_lisa_confirmed["features"][0].keys())
	dates = list([col for col in gdf.columns if len(col) == 10])
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
	confirmed = cluster[["GEOID"] + cluster.filter(regex='^202').columns.tolist()]

	features = []
	for county in old_lisa_confirmed["features"]:
		geoid = county["GEOID"]
		county.update(confirmed[confirmed["GEOID"] == geoid].to_dict(orient="records")[0])
		features.append(county)
	confirmed = {"type": "confirmed", "source": "1P3A", "features": features}
	with open(os.path.join(dir_path, '_working/lisa_state_confirmed_1P3A.json'), 'w') as fp:
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
	with open(os.path.join(dir_path, '_working/lisa_state_death_1P3A.json'), 'w') as fp:
		json.dump(death, fp)

	write_to_s3('lisa_state_confirmed_1P3A.json')
	write_to_s3('lisa_state_death_1P3A.json')



##### USAFacts #####


def update_lisa_usafacts(type_):

	# Check if new file exists
	file = os.path.join(repo_root, "download/usafacts_{}.geojson".format(type_))
	if not os.path.isfile(file):
		print("USAFacts - {}: No Updates!".format(type_))
		return None

	# Read file and import geometry
	type_ = "death" if type_ == "deaths" else type_

	s3.Bucket('geoda-covid-atlas').download_file('lisa_county_{}_usafacts.json'.format(type_), os.path.join(dir_path, '_working/lisa_county_{}_usafacts.json'.format(type_)))
	with open(os.path.join(dir_path, '_working/lisa_county_{}_usafacts.json'.format(type_))) as f:
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
	filename = 'lisa_county_{}_usafacts.json'.format(type_)
	with open(os.path.join(dir_path, '_working/{}'.format(filename)), 'w') as fp:
		json.dump(data, fp)

	write_to_s3(filename)

	print("Update for {} completed!".format(datetime.today().strftime("%-m.%-d")))


def get_month_day():
    month = str(datetime.now(pytz.timezone('US/Central')).month)
    day   = str(datetime.now(pytz.timezone('US/Central')).day).zfill(2)

    return month + '.' + day


def write_to_s3(filename):
    try:
        print('Writing {} to S3...'.format(filename))
        s3.Object('geoda-covid-atlas', filename).put(Body=open(os.path.join(dir_path, '_working/{}'.format(filename)), 'rb'))
        print('Write to S3 complete.')

    except Exception as e:
        print(e)



##### GO! #####

if __name__ == "__main__":
	county_update_lisa_1P3A()
	state_update_lisa_1P3A()
	update_lisa_usafacts("confirmed")
	update_lisa_usafacts("deaths")
