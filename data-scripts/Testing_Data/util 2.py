
import pandas as pd
import us
from datetime import datetime, timedelta
import os 
from shutil import copy2


############ Create Files ############

def create_table():
    '''
    Create empty county_hist table
    '''
    table = pd.read_csv("https://coronadatascraper.com/data.csv")
    table = table[(table["country"] == "United States") & (table["level"] == "county")]
    
    # create a column for state abbr
    state = us.states.mapping('name', 'abbr')
    state["Washington, D.C."] = state.pop("District of Columbia")
    state["United States Virgin Islands"] = state.pop("Virgin Islands")
    table["st_abbr"] = table["state"].map(lambda x: state[x])
    
    # remove useless info
    table = table[["name", "county", "state", "st_abbr", "population",\
                    "populationDensity", "countyId"]]
    table["geoid"] = table["countyId"].map(lambda x: x[5:])
    
    today = datetime.today()
    yesterday = today - timedelta(days=1)
    yesterday = yesterday.strftime('%Y-%m-%d')

    dates =[d.strftime('%Y-%m-%d') for d in pd.date_range(start="2/1/2020",end=yesterday)]

    table = table.reindex(columns=table.columns.tolist() + list(dates))
    table[dates] = 0
    table["county"] = table["county"].map(lambda x: x.replace(" County", ""))
    table.to_csv("county_hist.csv", index=False)


def create_unmatched():
    '''
    Create empty unmatched txt file
    '''
    with open('unmatched.txt', 'w') as fp:
        pass
    
def create_unmatched_state():
    '''
    Create empty unmatched_state.txt file
    '''
    with open('unmatched_state.txt', 'w') as fp:
        pass  

def create_not_monotonic():
    '''
    Create empty unmatched txt file
    '''
    with open('not_monotonic.txt', 'w') as fp:
        pass


def create_checklist():
    '''
    Create empty checklist
    '''
    st_abbr = list(us.states.mapping('abbr',"name").keys())
    state = list(us.states.mapping('abbr',"name").values())
    table = pd.DataFrame({"st_abbr":st_abbr, "state":state})
    table["sources"] = ""
    table["last_update"] = ""
    table["latest_data"] = ""

    # data source
    crawler = ["IN", "NM", "MO"]
    for c in crawler:
        table.loc[table.st_abbr == c, "sources"] = "crawler"
    
    scrapper = ['AR', 'CA', 'FL', 'IL', 'NE', 'NV', 'NJ', 'ND', 'OR', 'PA', 'TN', 'WI']
    for s in scrapper:
        table.loc[table.st_abbr == s, "sources"] = "coronascrapper" 
        
    worldometer = ['NY', 'TX', 'NJ', 'PA', 'WA']
    for w in worldometer:
        table.loc[table.st_abbr == w, "sources"] = "worldometer"
    
    table.to_csv("checklist.csv", index=False)


def create_checklist_state():
    '''
    Create empty checklist for state level data
    '''
    state = list(us.states.mapping('abbr',"name").keys())
    state_name = list(us.states.mapping('abbr',"name").values())
    table = pd.DataFrame({"state":state, "state_name":state_name})
    table["sources"] = ""
    table["last_update"] = ""
    table["latest_data"] = ""
    
    #scrapper = ['AR', 'CA', 'FL', 'IL', 'NE', 'NV', 'NJ', 'ND', 'OR', 'PA', 'TN', 'WI']
    #for s in scrapper:
    #    table.loc[table.st_abbr == s, "sources"] = "coronascrapper" 
    
    table.to_csv("checklist_state.csv", index=False)

############ Merge with Latest File ############

def merge_past_values(state):
    '''
    Merge values from old files to the new one
    Input: state as a list
    '''
    new_table = pd.read_csv("county_hist.csv")
    old_table = pd.read_csv("old_files/county_hist_0728.csv")
    ncol = old_table.shape[1]
    for index, row in new_table.iterrows():
        if row.st_abbr in state:
            new_table.iloc[index, range(8, ncol)] = old_table.iloc[index, range(8, ncol)]
    new_table.to_csv("county_hist.csv", index=False)



############ Update Files ############


def write_unmatched(lst):
    '''
    Write new row in unmatched.txt
    '''
    f = open("unmatched.txt")
    lineset = f.read().split(",")[0]
    f.close()
    with open("unmatched.txt", "a+") as file_object:
        if lst:
            for l in lst:
                if not l in lineset:
                    file_object.write(l)


def write_unmatched_state(lst):
    '''
    Write new row in unmatched_state.txt
    '''
    f = open("unmatched_state.txt")
    lineset = f.read().split(",")[0]
    f.close()
    with open("unmatched_state.txt", "a+") as file_object:
        if lst:
            for l in lst:
                if not l in lineset:
                    file_object.write(l)

def write_not_monotonic(lst):
    '''
    Write new row in unmatched.txt
    '''
    f = open("not_monotonic.txt")
    lineset = f.read().split(",")[0]
    f.close()
    with open("not_monotonic.txt", "a+") as file_object:
        if lst:
            for l in lst:
                if not l in lineset:
                    file_object.write(l)


def checklist_update(st_abbr, last_date):
    '''
    Update checklist after every run
    '''
    today = datetime.today().strftime('%Y-%m-%d')
    checklist = pd.read_csv("checklist.csv")
    checklist.loc[checklist["st_abbr"] == st_abbr, "last_update"] = today
    checklist.loc[checklist["st_abbr"] == st_abbr, "latest_data"] = last_date
    checklist.to_csv("checklist.csv", index=False)

def checklist_update_state(state, last_date):
    '''
    Update checklist after every run for state level data
    '''
    today = datetime.today().strftime('%Y-%m-%d')
    checklist_state = pd.read_csv("checklist_state.csv")
    checklist_state.loc[checklist_state["state"] == state, "last_update"] = today
    checklist_state.loc[checklist_state["state"] == state, "latest_data"] = last_date
    checklist_state.to_csv("checklist_state.csv", index=False)

def accumulated_row(state):
    '''
    Compute cumulated testing cases
    '''
    table = pd.read_csv("county_hist.csv")
    ncol = table.shape[1]
    for index, row in table.iterrows():
        if row.st_abbr == state:
            accumulated = row[8:].cumsum()
            table.iloc[index, range(8,ncol)] = accumulated
    return table


############ Back Up ############

def backup():
    '''
    If create functions were called, backup old files first
    '''
    today = datetime.today().strftime('%m%d')

    copy2("county_hist.csv", "old_files/county_hist_{}.csv".format(today))
    copy2("unmatched.txt", "old_files/unmatched_{}.txt".format(today))
    copy2("checklist.csv", "old_files/checklist_{}.csv".format(today))
    copy2("checklist.csv", "old_files/not_monotonic_{}.txt".format(today))



############ Go! ############

if __name__ == '__main__':
    backup()
    create_table()
    merge_past_values(["NE", "NV"])
    create_unmatched()
    create_checklist()
    create_not_monotonic()


