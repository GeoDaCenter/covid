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
        'decimals':2
    },
    {
        'fileName':'covid_deaths_cdc',
        'joinColumn':'fips_code',
        'dateIndex':1,
        'decimals':2
    },
    {
        'fileName':'covid_testing_cdc',
        'joinColumn':'fips_code',
        'dateIndex':1,
        'decimals':2
    },
    {
        'fileName':'covid_tcap_cdc',
        'joinColumn':'fips_code',
        'dateIndex':1,
        'decimals':2
    },
    {
        'fileName':'covid_ccpt_cdc',
        'joinColumn':'fips_code',
        'dateIndex':1,
        'decimals':4
    },
    {
        'fileName':'covid_wk_pos_cdc',
        'joinColumn':'fips_code',
        'dateIndex':1,
        'decimals':4
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
    {
        "fileName":'covid_confirmed_usafacts_h',
        'joinColumn':'countyFIPS',
        'dateIndex':4,
    },
    {
        "fileName":'covid_deaths_usafacts_h',
        'joinColumn':'countyFIPS',
        'dateIndex':4,
    },
    {
        'fileName':'vaccination_fully_vaccinated_cdc',
        'joinColumn':'fips',
        'dateIndex':1
    },
    {
        'fileName':'vaccination_fully_vaccinated_cdc_h',
        'joinColumn':'fips',
        'dateIndex':1
    },
    {
        'fileName':'vaccination_one_or_more_doses_cdc',
        'joinColumn':'fips',
        'dateIndex':1
    },
    {
        'fileName':'vaccination_one_or_more_doses_cdc_h',
        'joinColumn':'fips',
        'dateIndex':1
    }
]

def fetchAndPrepData(fileInfo):
    try:
        multiplier = 10**fileInfo['decimals']
    except:
        multiplier = 1
    
    csvData = pd.read_csv(os.path.join(repo_root, f'public/csv/{fileInfo["fileName"]}.csv'), low_memory=False)

    csvData = csvData.replace('suppressed', -9999) \
        .apply(pd.to_numeric, errors="coerce") \
        .fillna(-999) * multiplier 
    csvData = csvData.replace(-9999 * multiplier, -9999) \
        .replace(-999 * multiplier, -999)

    csvData = csvData[[fileInfo['joinColumn']] + list(csvData.columns)[fileInfo['dateIndex']:]]
    csvData[fileInfo['joinColumn']] = csvData[fileInfo['joinColumn']] / multiplier
    csvData = csvData.astype(int)

    return csvData

def packAndWritePbf(columnList, currentColumnList, csvValues, idIndex, yearMonth, suffix, fileInfo):
    colStartIndex = columnList.index(currentColumnList[0])
    colEndIndex = columnList.index(currentColumnList[-1]) + 1  

    dataOut = flatData_pb2.Rows()
    dataOut.dates.extend(list(currentColumnList))
    rowObj = {}
    for i in range(0, len(csvValues)):
        try:
            id = csvValues[i][idIndex]
        except:
            print(f'ERROR - GEOID {csvValues[i][idIndex]}')
            continue
        
        rowObj[i] = dataOut.row.add()
        rowObj[i].geoid = id
        rowObj[i].vals.extend(csvValues[i][colStartIndex:colEndIndex])
    
    # suffix += f".{yearMonth}"
    f = open(os.path.join(repo_root, f'public/pbf/{fileInfo["fileName"]}{suffix}.{yearMonth}.pbf'), "wb")
    f.write(dataOut.SerializeToString())
    f.close()

# %%
for fileInfo in fileList:
    print(fileInfo['fileName'])
    csvData = fetchAndPrepData(fileInfo)
    csvValues = csvData.values.tolist()    
    # Get a list of all columns, and truncate to month-date combo in ISO date format (eg 2020-01)
    columnList = list(csvData.columns)
    dateList = list(set([date[0:7] for date in columnList[fileInfo['dateIndex']:]]))
    dateList.sort()
    idIndex = columnList.index(fileInfo['joinColumn'])
    # get file suffix if using reverse sci notation
    try:
        suffix = f".e-{fileInfo['decimals']}"
    except:
        suffix = ""

    for yearMonth in dateList:
        currentColumnList = [column for column in columnList if column[0:7] == yearMonth]
        packAndWritePbf(columnList, currentColumnList, csvValues, idIndex, yearMonth, suffix, fileInfo)

    # Latest data of past 2 months, not to be cached
    latestColumnList = [column for column in columnList if dateList[-1] in column[0:7] or dateList[-2] in column[0:7]]
    packAndWritePbf(columnList, latestColumnList, csvValues, idIndex, 'latest', suffix, fileInfo)

# %%
