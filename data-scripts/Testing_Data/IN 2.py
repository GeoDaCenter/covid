from urllib.request import urlopen
import json
import pandas as pd

import util

############ JSON Data Link ############

url = "https://www.coronavirus.in.gov/map/covid-19-indiana-daily-report-current.topojson"

############ Read in Data ############

def read_json(url):
	'''
	Read json file and transform in to dict
	'''
	response = urlopen(url)
	data = json.loads(response.read())
	data = data["objects"]["cb_2015_indiana_county_20m"]["geometries"]
	return data


############ Write xlsx file ############

def fill_data(data, table):

	unmatched = []
	for k in range(len(data)):
		geoid = data[k]["properties"]["GEOID"]
		idx = table.index[table['geoid'] == geoid]
		county = data[k]["properties"]["VIZ_DATE"][0]["COUNTY_NAME"]

		if idx.tolist():
			print(county, " matched")
			info = data[k]["properties"]["VIZ_DATE"]

			for n in range(len(info)):
				date = info[n]["DATE"]
				table.loc[table.index[idx], date] = info[n]['COVID_TEST']
			util.checklist_update("IN", date)
		else:
			unmatched.append("{} - {} \n".format("IN", county))
			print(county, " unmatched")
	table = util.accumulated_row("IN")
	util.write_unmatched(unmatched)
	table.to_csv("county_hist.csv", index=False)


############ Go! ############

if __name__ == '__main__':
    data = read_json(url)
    table = pd.read_csv("county_hist.csv")
    fill_data(data, table)

    
