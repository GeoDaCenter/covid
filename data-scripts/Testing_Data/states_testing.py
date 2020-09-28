import pandas as pd
import us
import numpy as np
import util

def download_data():

    url = "https://api.covidtracking.com/v1/states/daily.csv"

    # read in data
    data = pd.read_csv(url)
    data['posrate'] = data['positive']/data['posNeg']
    
    return data

def fill_data(data):
    state = data.state.unique().tolist()
    unmatched = []
    table = pd.read_csv("state_testing.csv")

    for s in state:        
        # Update Checklist
        latest_update = data.loc[data.state == s].date.max()
        util.checklist_update_state(s, latest_update)
        
        data_subset = data.loc[(data.state == s)]
        idx = table.index[(table["state"] == s)]
        if idx.tolist():
            print(s, " matched")
            for _, row in data_subset.iterrows():
                date = row.date
                if row.posNeg >= 0:
                    table.loc[table.index[idx], date] = row.posNeg
        else:
            print(c, "unmatched")
            unmatched.append("{} - {} \n".format(s))
    util.write_unmatched_state(unmatched)
    table.to_csv("state_testing.csv", index=False)
    
def fill_data_posrate(data):
    state = data.state.unique().tolist()
    unmatched = []
    table = pd.read_csv("state_testing_posrate.csv")

    for s in state:        
        data_subset = data.loc[(data.state == s)]
        idx = table.index[(table["state"] == s)]
        if idx.tolist():
            print(s, " matched")
            for _, row in data_subset.iterrows():
                date = row.date
                if row.posNeg >= 0:
                    table.loc[table.index[idx], date] = row.posrate
        else:
            print(c, "unmatched")
    table.to_csv("state_testing_posrate.csv", index=False)


if __name__ == '__main__':
    data = download_data()
    fill_data(data)
    fill_data_posrate(data)
