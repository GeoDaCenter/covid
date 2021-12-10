import warnings
warnings.simplefilter(action='ignore')

import os
import grequests
from datetime import datetime
import pandas as pd
import numpy as np

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))
fipsList = pd.read_csv('https://covid.cdc.gov/covid-data-tracker/content/CoronaViewJson_01/fips-codes-covid-tracker.csv')

def getCdcUrl(fips):
    if len(f'{fips}') == 4:
        fips = f'0{fips}'
    return f"https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=integrated_county_timeseries_fips_{fips}_external"

def getUrls(fipsList):
    return [getCdcUrl(fips) for fips in fipsList]

def processBatch(r):
    try:
        return r.json()
    except:
        return False

def fetchBatch(urls):
    rs = (grequests.get(u) for u in urls)
    responses = grequests.map(rs)
    dfs = []
    for response in responses:
        try:
            data = response.json()
            dfs.append(pd.DataFrame(data['integrated_county_timeseries_external_data']).reset_index(drop=True))
        except:
            continue
    return dfs

def bulkFetchFips(fipsList, columns, batch=50):
    columnsNeeded = ['fips_code','date'] + columns
    urls = getUrls(fipsList)
    for i in range(0, len(fipsList), batch):
        dfs = fetchBatch(urls[i:i+batch])
        if i == 0:
            combined = pd.concat(dfs, axis=0)
        else:
            tempCombined = pd.concat(dfs, axis=0)
            combined = pd.concat([combined.reset_index(drop=True), tempCombined.reset_index(drop=True)], axis=0)
    return combined.reset_index()

# fetches current CDC county level data
def getCdcCountyData(fipsList, columns):
    parsed = bulkFetchFips(fipsList, columns)
    # sort by and clean date
    parsed = parsed.sort_values('date')
    
    # return sorted DF
    return parsed

def shouldBeNan(x):
    try:
        float(x)
        return False
    except:
        return True


def reconcileCol(x, col):
    if (x[f"{col}_x"] > 0 or x[f"{col}_x"] < 0):
        return x[f"{col}_x"]
    elif (x[f"{col}_x"] >= 0 or x[f"{col}_x"] < 0):
        return x[f"{col}_y"]
    else:
        return x[f"{col}_x"]

# This is weird.
# CDC Has started reported partial, duplicate columns
# As part of cleaning, we need to merge duplicates and merge partially complete rows
# This is weird.
def reconcileDfCols(df, cols):
    df['combo-id'] = df['fips_code'].astype(str) + df['date'].astype('str')
    merged = df[~df['combo-id'].duplicated()].merge(
        df[df['combo-id'].duplicated()],
        how="outer",
        on="combo-id"
    )

    reconciled = merged[['fips_code_x','date_x']]
    reconciled.columns = ['fips_code', 'date']
    
    for col in cols:
        reconciled[col] = merged.apply(lambda x: reconcileCol(x, col), axis = 1)
    
    return reconciled

# replace null or suppressed values with NAN
def cleanDf(df, colName):
    df = df.replace('suppressed', -9999)
    df.loc[df[[colName]].apply(lambda x: shouldBeNan(x), axis=1), colName] = np.nan
    df.loc[:, colName] = df[colName].astype(float)
    df = reconcileDfCols(df, [colName])
    return df

# preps specific time-series DF for CSV output
def parseCsvOutput(df, colName, operation=None):
    tempDf = cleanDf(df[['fips_code','date',colName]], colName)
    # thanks to @piRSquared on stackoverflow for this nifty pivot expressions
    # https://stackoverflow.com/questions/54915215/expressing-time-series-data-in-the-columns-rather-than-the-rows-of-a-dataframe
    tempDf = tempDf.pivot(index='fips_code', columns='date').swaplevel(0, 1, 1).reset_index().sort_index(1)

    tempDf.columns = [column[0] for column in list(tempDf.columns)]
    tempDf = tempDf[['fips_code'] + [col for col in list(tempDf.columns)[:-1]]]
    if operation != None:
        if operation['operator'] == 'divide':
            for column in tempDf.columns[operation['dateIndex']:]:
                tempDf.loc[tempDf[column]!=-9999,column] = tempDf[column]/operation['denominator']

    return tempDf

# calculates numerator and denominator time series DF and returns DF
# for CSV output
def parseNewMeasure(df, colName1, colName2, dateIndex):
    tempDf = cleanDf(df[['fips_code','date',colName1]], colName1)
    tempDf = tempDf.pivot(index='fips_code', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    tempDf.columns = [column[0] for column in list(tempDf.columns)]
    
    tempDf2 = cleanDf(df[['fips_code','date',colName2]], colName2)
    tempDf2 = tempDf2.pivot(index='fips_code', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    tempDf2.columns = [column[0] for column in list(tempDf2.columns)]
    
    for column in tempDf.columns[dateIndex:]:
        tempDf.loc[(tempDf[column] != -9999)&(tempDf2[column] != -9999), column] = tempDf[column] / tempDf2[column]
        tempDf.loc[(tempDf[column] == -9999)|(tempDf2[column] == -9999), column] = -9999

    return tempDf

def parsePopulationNormalized(df, colName):
    tempDf = cleanDf(df[['fips_code','date',colName]], colName)
    tempDf = tempDf.pivot(index='fips_code', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    tempDf.columns = [column[0] for column in list(tempDf.columns)]
    outputColumns = list(tempDf.columns).copy()

    popDf = pd.read_csv(os.path.join(dir_path, 'county_populations.csv'))[["GEOID","population"]]
    tempDf = tempDf.merge(popDf, left_on="fips_code", right_on="GEOID", how="left")

    for column in outputColumns[1:]:
        tempDf.loc[tempDf[column] != -9999, column] = tempDf[column]/tempDf['population']*100000

    return tempDf[outputColumns]


def unique(list):
 
    uniqueList = []
     
    for el in list:
        if el not in uniqueList:
            uniqueList.append(el)
    return uniqueList

def reconcileDf(extantDf, newDf):
    extantDf = extantDf[["fips_code"] + [column for column in list(extantDf.columns) if column not in list(newDf.columns)]]
    return cleanTail0Vals(extantDf.merge(newDf, on="fips_code"))

def cleanTail0Vals(df):
    zeroCount = list(df.fillna(0).astype(bool).sum(axis=0))
    cols = list(df.columns)
    dfLen = len(df)
    for i in range(len(cols)-1, 0, -1):
        if zeroCount[i] > dfLen/2:
            break
        else:
            df = df.drop(cols[i],axis=1)
    return df

if __name__ == "__main__":

    # columns and csv output names to loop through
    colsToParse = [
        {
            'column':'new_cases_7_day_rolling_average',
            'csv':'covid_confirmed_cdc',
            'roundTo':1,
            'operation':None
        },
        {
            'column':'new_deaths_7_day_rolling_average',
            'csv':'covid_deaths_cdc',
            'roundTo':1,
            'operation':None
        },
        {
            'column':'new_test_results_reported_7_day_rolling_average',
            'csv':'covid_testing_cdc',
            'roundTo':1,
            'operation':None
        },
        {
            'column':'percent_positive_7_day',
            'csv':'covid_wk_pos_cdc',
            'roundTo':4,
            'operation': {
                'operator':'divide',
                'dateIndex':1,
                'denominator':100
            }
        }
    ]

    # numerator/denominators to loop through
    colsToCalculate = [
        {
            'numerator':'new_cases_7_day_rolling_average',
            'denominator':'new_test_results_reported_7_day_rolling_average',
            'csv':'covid_ccpt_cdc',
            'roundTo':4
        }
    ]

    colsToNormalize = [
        {
            'column':'new_test_results_reported_7_day_rolling_average',
            'csv':'covid_tcap_cdc',
            'roundTo':1
        }

    ]

    allNeededColumns = [entry['column'] for entry in colsToParse] + [entry['numerator'] for entry in colsToCalculate] + [entry['denominator'] for entry in colsToCalculate] + [entry['column'] for entry in colsToNormalize]
    allNeededColumns = unique(allNeededColumns)
    # fetch data
    raw = getCdcCountyData(list(fipsList.fips_code), allNeededColumns).reset_index()
    
    # loop through list of column parsing entries
    # output CSV to this folder and docs
    for entry in colsToParse:
        tempDf = parseCsvOutput(raw, entry['column'], entry['operation']).replace([np.inf, -np.inf], np.nan).round(entry['roundTo']).replace(-9999, 'suppressed')
        tempDf = reconcileDf(pd.read_csv(os.path.join(repo_root, f'public/csv/{entry["csv"]}.csv')), tempDf)
        tempDf.to_csv(os.path.join(repo_root, f'public/csv/{entry["csv"]}.csv'), index=False)
        
    for entry in colsToCalculate:
        tempDf = parseNewMeasure(raw, entry['numerator'], entry['denominator'], 1).replace([np.inf, -np.inf], np.nan).round(entry['roundTo']).replace(-9999, 'suppressed')
        tempDf = reconcileDf(pd.read_csv(os.path.join(repo_root, f'public/csv/{entry["csv"]}.csv')), tempDf)
        tempDf.to_csv(os.path.join(repo_root, f'public/csv/{entry["csv"]}.csv'), index=False)

    for entry in colsToNormalize:
        tempDf = parsePopulationNormalized(raw, entry['column']).replace([np.inf, -np.inf], np.nan).round(entry['roundTo']).replace(-9999, 'suppressed')
        tempDf = reconcileDf(pd.read_csv(os.path.join(repo_root, f'public/csv/{entry["csv"]}.csv')), tempDf)
        tempDf.to_csv(os.path.join(repo_root, f'public/csv/{entry["csv"]}.csv'), index=False)
