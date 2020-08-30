from urllib.request import urlopen
import json
from datetime import datetime, timedelta
import pandas as pd
import util


############ JSON Data Link ############

url = 'https://e7p503ngy5.execute-api.us-west-2.amazonaws.com/prod/GetCounties'
st_abbr = "NM"

############ Read in Data ############

def read_json(url):
    '''
    Read json file and transform in to dict
    '''
    response = urlopen(url)
    data = json.loads(response.read())
    data = data["data"]
    county = []
    cases = []
    test = []
    for d in data:
        county.append(d["name"])
        # cases.append(d["cases"])
        test.append(d["tests"])
    return [county, test]

def fill_data(info, st_abbr):
    county = info[0]
    test = info[1]
    table = pd.read_csv("county_hist.csv")
    yesterday = (datetime.now() - timedelta(1)).strftime('%Y-%m-%d')
    unmatched = []

    for i in range(len(county)):
        c = county[i]
        idx = table.index[(table['county'] == c) & (table["st_abbr"] == st_abbr)]
        if idx.tolist():
            print(c, " matched")
            table.loc[table.index[idx], yesterday] = test[i]
        else:
            print(c, " unmatched")
            unmatched.append("{} - {} \n".format(st_abbr, c))
    util.write_unmatched(unmatched)
    util.checklist_update("NM", yesterday)
    table.to_csv("county_hist.csv", index=False)


if __name__ == '__main__':
    info = read_json(url)
    fill_data(info, st_abbr)

