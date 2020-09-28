import pandas as pd
import us
import numpy as np
import util

def download_data():

	url = "https://coronadatascraper.com/timeseries.csv.zip"

	# read in data with conditions
	iter_csv = pd.read_csv(url, iterator=True, chunksize=1000)
	data = pd.concat([chunk[(chunk['country'] == "United States") & (chunk['level'] == "county")] \
						 for chunk in iter_csv])

	# drop row without testing data
	data = data.dropna(axis=0, subset=['tested'])
	# drop "County" in county names
	data.county = data.county.map(lambda x: x.replace(" County", ""))

	# add state abbreviation
	state = us.states.mapping('name', 'abbr')
	state["Washington"] = state.pop("District of Columbia")
	data["st_abbr"] = data["state"].map(lambda x: state[x])
	return data


def fill_data(data):

	state = data.st_abbr.unique().tolist()
	unmatched = []
	table = pd.read_csv("county_hist.csv")

	for s in state:
		county = data[data.st_abbr == s].county.unique().tolist()
		
		# Update Checklist
		latest_update = data.loc[data.st_abbr == s].date.max()
		util.checklist_update(s, latest_update)
		
		for c in county:
			data_subset = data.loc[(data.county == c) & (data.st_abbr == s)]
			idx = table.index[(table['county'] == c) & (table["st_abbr"] == s)]
			if idx.tolist():
				print(c, " matched")
				for _, row in data_subset.iterrows():
					date = row.date
					if row.tested >= 0:
						table.loc[table.index[idx], date] = row.tested
			else:
				print(c, "unmatched")
				unmatched.append("{} - {} \n".format(s, c))
	util.write_unmatched(unmatched)
	table.to_csv("county_hist.csv", index=False)


if __name__ == '__main__':
	data = download_data()
	fill_data(data)
