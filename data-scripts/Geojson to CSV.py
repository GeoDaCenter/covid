#!/usr/bin/env python
# coding: utf-8

# In[1]:


import geopandas as gpd
import pandas as pd
import datetime


# In[ ]:


counties = gpd.read_file("./counties_update.geojson/counties_update.geojson")
usfacts = gpd.read_file('./county_usfacts.geojson')
states = gpd.read_file("./states_update.geojson/states_update.geojson")


# # Counties

# In[7]:


caseCols = ["STATEFP","COUNTYFP","COUNTYNS","AFFGEOID","GEOID","NAME","LSAD"]
for col in counties.columns:
    if col[0] == '2':
        caseCols.append(col)


# In[8]:


cases = counties[caseCols]
cases['GEOID'] = cases['GEOID'].astype(int)
cases.sort_values("GEOID").to_csv("./covid_confirmed_1p3a.csv", index=False)


# In[9]:


deathCols = ["STATEFP","COUNTYFP","COUNTYNS","AFFGEOID","GEOID","NAME","LSAD"]
for col in counties.columns:
    if col[0] == 'd':
        deathCols.append(col)


# In[10]:


deaths = counties[deathCols]
deaths['GEOID'] = deaths['GEOID'].astype(int)
deaths.sort_values("GEOID").to_csv("./covid_deaths_1p3a.csv", index=False)


# # JSON Dump

# In[ ]:


usfacts


# In[35]:


dump = []

for i in range(0, len(usfacts)):
    dump.append({
        'STATEFP':int(usfacts.iloc[i].STATEFP),
        'COUNTYFP':int(usfacts.iloc[i].COUNTYFP),
        'GEOID':int(usfacts.iloc[i].GEOID),
        'NAME':usfacts.iloc[i].NAME,
        'state_name':usfacts.iloc[i].state_name,
        'state_abbr':usfacts.iloc[i].state_abbr,
        'population':int(usfacts.iloc[i].population),
        'beds':int(usfacts.iloc[i].beds),
        'criteria':usfacts.iloc[i].criteria,
        'geom': [list(x.coords) for x in usfacts.iloc[i].geometry.boundary]
        
    })


# In[38]:


import json 

with open(f'./county_usfacts.json', 'w') as fp:
    json.dump(dump, fp)


# # States

# In[104]:


caseColsState = ["GEOID","NAME"]
for col in states.columns:
    if col[0] == '2':
        caseColsState.append(col)
cases = states[caseColsState]
cases['GEOID'] = cases['GEOID'].astype(int)
cases.sort_values("GEOID").to_csv("./covid_confirmed_1p3a_state.csv", index=False)


# In[105]:


deathColsState = ["GEOID","NAME"]
newColNames = ["GEOID","NAME"]
for col in states.columns:
    if col[0:2] == 'd2':
        deathColsState.append(col)
        newColNames.append(col[1:])
deaths = states[deathColsState]
deaths['GEOID'] = deaths['GEOID'].astype(int)
deaths.columns = newColNames
deaths.sort_values("GEOID").to_csv("./covid_deaths_1p3a_state.csv", index=False)


# In[106]:


testingColsState = ["GEOID","NAME"]
newColNames = ["GEOID","NAME"]
for col in states.columns:
    if col[0:2] == 't2':
        testingColsState.append(col)
        newColNames.append(col[1:])
testing = states[testingColsState]
testing['GEOID'] = testing['GEOID'].astype(int)
testing.columns = newColNames
testing.sort_values("GEOID").to_csv("./covid_testing_1p3a_state.csv", index=False)


# In[107]:


confirmedTestingColsState = ["GEOID","NAME"]
newColNames = ["GEOID","NAME"]
for col in states.columns:
    if col[0:2] == 'cc':
        confirmedTestingColsState.append(col)
        newColNames.append(col[4:])
testing = states[confirmedTestingColsState]
testing['GEOID'] = testing['GEOID'].astype(int)
testing.columns = newColNames
testing.sort_values("GEOID").to_csv("./covid_ccpt_1p3a_state.csv", index=False)


# In[108]:


testingCapColsState = ["GEOID","NAME"]
newColNames = ["GEOID","NAME"]
for col in states.columns:
    if col[0:2] == 'tc':
        testingCapColsState.append(col)
        newColNames.append(col[4:])
testing = states[testingCapColsState]
testing['GEOID'] = testing['GEOID'].astype(int)
testing.columns = newColNames
testing.sort_values("GEOID").to_csv("./covid_tcap_1p3a_state.csv", index=False)


# In[109]:


testingPosWkColsState = ["GEOID","NAME"]
newColNames = ["GEOID","NAME"]
for col in states.columns:
    if col[0:2] == 'wk':
        testingPosWkColsState.append(col)
        newColNames.append(col[6:])
testing = states[testingPosWkColsState]
testing['GEOID'] = testing['GEOID'].astype(int)
testing.columns = newColNames
testing.sort_values("GEOID").to_csv("./covid_wk_pos_1p3a_state.csv", index=False)


# In[ ]:




