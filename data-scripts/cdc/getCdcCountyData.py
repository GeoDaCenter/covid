import grequests
from datetime import datetime
import pandas as pd
import numpy as np

# fetches current CDC county level data
def getCdcCountyData():
    # state 2-digit codes
    state2Digit = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']

    # get list of URL endpoints
    urls = [f"https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=integrated_county_timeseries_state_{stateCode}_external" for stateCode in state2Digit]
    
    # fetch data in groups of 12
    # fetching more than 12 causes issues
    breakpoint = 12
    urlDict = []
    for i in range(0,5):
        urlDict.append(urls[breakpoint*i:breakpoint*(i+1)])

    # accumulate API responses in list
    responses = []
    for urlList in urlDict:
        rs = (grequests.get(u,  timeout=120) for u in urlList)
        response = grequests.map(rs)
        responses.append(response)

    # parse responses and concat in single DF
    parsed = ''

    for responseSet in responses:
        for response in responseSet:
            if len(parsed)==0:
                parsed = pd.DataFrame(response.json()['integrated_county_timeseries_external_data'])
            else:
                parsed = pd.concat([parsed, pd.DataFrame(response.json()['integrated_county_timeseries_external_data'])])

    # sort by and clean date
    parsed = parsed.sort_values('date')
    parsed['date'] = parsed['date'].str.slice(0,-9)

    # return sorted DF
    return parsed

# preps specific time-series DF for CSV output
def parseCsvOutput(df, colName, operation=None):
    # thanks to @piRSquared on stackoverflow for this nifty pivot expressions
    # https://stackoverflow.com/questions/54915215/expressing-time-series-data-in-the-columns-rather-than-the-rows-of-a-dataframe
    tempDf = df[['fips_code','date',colName]]
    tempDf = tempDf.pivot_table(index='fips_code', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    tempDf.columns = [column[0] for column in list(tempDf.columns)]

    if operation != None:
        if operation['operator'] == 'divide':
            for column in tempDf.columns[operation['dateIndex']:]:
                tempDf[column] = tempDf[column]/operation['denominator']
    
    return tempDf
    
# calculates numerator and denominator time series DF and returns DF
# for CSV output
def parseNewMeasure(df, colName1, colName2, dateIndex):
    tempDf = df[['fips_code','date',colName1]]
    tempDf = tempDf.pivot_table(index='fips_code', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    tempDf.columns = [column[0] for column in list(tempDf.columns)]

    tempDf2 = df[['fips_code','date',colName2]]
    tempDf2 = tempDf2.pivot_table(index='fips_code', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    tempDf2.columns = [column[0] for column in list(tempDf2.columns)]

    for column in tempDf.columns[dateIndex:]:
        tempDf[column] = tempDf[column] / tempDf2[column]
    
    return tempDf

def parsePopulationNormalized(df, colName):
    tempDf = df[['fips_code','date',colName]]
    tempDf = tempDf.pivot_table(index='fips_code', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    tempDf.columns = [column[0] for column in list(tempDf.columns)]
    outputColumns = list(tempDf.columns).copy()

    popDf = pd.read_csv('./county_populations.csv')
    tempDf = tempDf.merge(popDf, left_on="fips_code", right_on="GEOID", how="left")

    for column in outputColumns[1:]:
        tempDf[column] = tempDf[column]/tempDf['population']*100000

    return tempDf[outputColumns]


if __name__ == "__main__":
    # fetch data
    raw = getCdcCountyData()

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
            'column':'percent_new_test_results_reported_positive_7_day_rolling_average',
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

    # loop through list of column parsing entries
    # output CSV to this folder and docs
    for entry in colsToParse:
        tempDf = parseCsvOutput(raw, entry['column'], entry['operation']).replace([np.inf, -np.inf], np.nan).round(entry['roundTo'])
        tempDf.to_csv(f'./csv/{entry["csv"]}.csv', index=False)

    for entry in colsToCalculate:
        tempDf = parseNewMeasure(raw, entry['numerator'], entry['denominator'], 1).replace([np.inf, -np.inf], np.nan).round(entry['roundTo'])
        tempDf.to_csv(f'./csv/{entry["csv"]}.csv', index=False)
        
    
    for entry in colsToNormalize:
        tempDf = parsePopulationNormalized(raw, entry['column']).replace([np.inf, -np.inf], np.nan).round(entry['roundTo'])
        tempDf.to_csv(f'./csv/{entry["csv"]}.csv', index=False)
        