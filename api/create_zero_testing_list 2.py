import pandas as pd 
import json


def create_zero_testing_list():

	data = pd.read_csv("county_hist.csv", dtype={'geoid': str})

	state = {k:data["st_abbr"].tolist().count(k) for k in data["st_abbr"].tolist()} 

	for idx, row in data.iterrows():
		if (row[8:] == -1).all():
			state[row["st_abbr"]] -= 1

	state = [k for k, v in state.items() if v == 0]

	with open('zero_testing_state.txt', 'w') as filehandle:
		json.dump(state, filehandle)


##### GO! #####

if __name__ == "__main__":
	create_zero_testing_list()

