# %%
import os
import pandas as pd
import flatData_pb2

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

# %%

fileList = [
    {
        'fileName':'covid_confirmed_usafacts',
        'joinColumn':'countyFIPS',
        'dateIndex':4,
    },
    {
        'fileName':'covid_deaths_usafacts',
        'joinColumn':'countyFIPS',
        'dateIndex':4,
    },
    {
        'fileName':'covid_confirmed_1p3a',
        'joinColumn':'GEOID',
        'dateIndex':7,
    },
    {
        'fileName':'covid_deaths_1p3a',
        'joinColumn':'GEOID',
        'dateIndex':7,
    },
    {
        'fileName':'covid_confirmed_nyt',
        'joinColumn':'fips',
        'dateIndex':1,
    },
    {
        'fileName':'covid_deaths_nyt',
        'joinColumn':'fips',
        'dateIndex':1,
    },
    {
        'fileName':'covid_confirmed_cdc',
        'joinColumn':'fips_code',
        'dateIndex':1,
    },
    {
        'fileName':'covid_deaths_cdc',
        'joinColumn':'fips_code',
        'dateIndex':1,
    },
    {
        'fileName':'covid_testing_cdc',
        'joinColumn':'fips_code',
        'dateIndex':1,
    },
    {
        'fileName':'covid_tcap_cdc',
        'joinColumn':'fips_code',
        'dateIndex':1,
    },
    {
        'fileName':'covid_ccpt_cdc',
        'joinColumn':'fips_code',
        'dateIndex':1,
    },
    {
        'fileName':'covid_wk_pos_cdc',
        'joinColumn':'fips_code',
        'dateIndex':1,
    },
    {
        'fileName':'mobility_fulltime_workdays_safegraph',
        'joinColumn':'county',
        'dateIndex':1,
    },
    {
        'fileName':'mobility_parttime_workdays_safegraph',
        'joinColumn':'county',
        'dateIndex':1,
    },
    {
        'fileName':'mobility_home_workdays_safegraph',
        'joinColumn':'county',
        'dateIndex':1,
    },
]


# %%
for fileInfo in fileList:
    csvData = pd.read_csv(os.path.join(repo_root, f'public/csv/{fileInfo["fileName"]}.csv'))
    dataOut = flatData_pb2.Rows()
    dataOut.dates.extend(list(csvData.columns[fileInfo['dateIndex']:]))

    rowObj = {}
    for i in range(0, len(csvData)):
        rowObj[i] = dataOut.row.add()
        rowObj[i].geoid = int(csvData.iloc[i][fileInfo['joinColumn']])
        cleanVals = []
        for val in list(csvData.iloc[i].values)[fileInfo['dateIndex']:]:
            try: 
                cleanVals.append(int(val))
            except:
                cleanVals.append(int(0))

        rowObj[i].vals.extend(cleanVals)

    f = open(os.path.join(repo_root, f'public/pbf/{fileInfo["fileName"]}.pbf'), "wb")
    f.write(dataOut.SerializeToString())
    f.close()

# %%
