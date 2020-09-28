from datetime import datetime, timedelta
import pandas as pd
import util
import worldometer

############ URL Data Link ############

url="https://www.worldometers.info/coronavirus/usa/new-jersey/"
st_abbr = "NJ"

############ Read in Data ############
def read_data(url):
    '''
    Read data table and transform in to dict
    '''
    data = worldometer.read_table_TX(url) 
    county = data["County"].tolist()
    #cases = []
    test = data["TotalTests"].tolist()
    return [county, test]
    
def fill_data_hist(info, st_abbr):
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
    util.checklist_update("NJ", yesterday)
    util.write_unmatched(unmatched)
    table.to_csv("county_hist.csv", index=False)

if __name__ == '__main__':
    info = read_data(url)
    #fill_data_now(data, table_now)
    fill_data_hist(info, st_abbr)
