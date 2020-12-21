import pandas as pd
from datetime import datetime, date, timedelta
import urllib.request

def getCdcData():
    # get today's date
    today = date.today() - timedelta(days=1)

    # read in current CDC excel
    # sheet name is "Counties"
    url = f"https://beta.healthdata.gov/api/views/gqxm-d9w9/files/df6ad32a-2fe8-4878-ae3d-a9d972c85ea8?download=true&filename=Community_Profile_Report%{today.year}{today.month}{today.day}_Public.xlsx"
    raw = pd.read_excel(url, sheet_name="Counties")
    urllib.request.urlretrieve(url, f"./xlsx/Community_Profile_Report_{today.year}{today.month}{today.day}_Public.xlsx")

    # parse date ranges from Excel
    endOfWeekCases = f"{raw.columns[14].split('(')[-1].split(' ')[0]} {raw.columns[14].split('-')[-1][:-1]}"
    endofWeekCases = datetime.strptime(endOfWeekCases, '%B %d')

    endOfWeekTesting = f"{raw.columns[32].split('(')[-1].split(' ')[0]} {raw.columns[32].split('-')[-1][:-1]}"
    endOfWeekTesting = datetime.strptime(endOfWeekTesting, '%B %d')

    endOfWeekForecasting = f"{raw.columns[65].split('(')[-1].split(' ')[0]} {raw.columns[65].split(' ')[-1][:-1]}"
    endOfWeekForecasting = datetime.strptime(endOfWeekForecasting, '%B %d')

    # Read in past data
    prevCases = pd.read_csv('./csv/covid_confirmed_cdc.csv')
    prevDeaths = pd.read_csv('./csv/covid_deaths_cdc.csv')
    prevTesting = pd.read_csv('./csv/covid_testing_cdc.csv')
    prevTestingPos = pd.read_csv('./csv/covid_wk_pos_cdc.csv')
    prevTestingCap = pd.read_csv('./csv/covid_tcap_cdc.csv')
    prevTestingCcpt = pd.read_csv('./csv/covid_ccpt_cdc.csv')

    # Assign column names 
    # Raw Excel is styled with names in row 2
    raw.columns = list(raw.iloc[0])
    raw = raw.drop(index=0)

    # Pull in relevant data and name columns based on date
    cases = raw[['FIPS code', 'Cumulative cases']]
    cases.columns = ['FIPS', f"{endofWeekCases.month}/{endofWeekCases.day}/{today.year}"]

    deaths = raw[['FIPS code', 'Cumulative deaths']]
    deaths.columns = ['FIPS', f"{endofWeekCases.month}/{endofWeekCases.day}/{today.year}"]

    testingPos = raw[['FIPS code',  'Viral (RT-PCR) lab test positivity rate - last 7 days (may be an underestimate due to delayed reporting)']]
    testingPos.columns = ['FIPS', f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}"]

    testing = raw[['FIPS code', 'Total RT-PCR diagnostic tests - last 7 days (may be an underestimate due to delayed reporting)']]
    testing.columns = ['FIPS', f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}"]

    testingCap = raw[['FIPS code', 'RT-PCR tests per 100k - previous 7 days(may be an underestimate due to delayed reporting)']]
    testingCap.columns = ['FIPS', f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}"]

    # Calculate Ccpt
    testingCcpt = raw[['FIPS code', 'Cases - last 7 days', 'Total RT-PCR diagnostic tests - last 7 days (may be an underestimate due to delayed reporting)']]
    testingCcpt.columns = ['FIPS', 'Cases', 'Tests']
    testingCcptFiltered = testingCcpt.query('Tests > 0')
    testingCcptFiltered['CCPT'] = testingCcptFiltered['Cases']/testingCcptFiltered['Tests']
    testingCcpt = testingCcpt.merge(testingCcptFiltered, on=['FIPS','Cases','Tests'], how="left")[['FIPS','CCPT']]
    testingCcpt.columns = ['FIPS', f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}"]


    # Test for column duplicates, drop if duplicated
    if f"{endofWeekCases.month}/{endofWeekCases.day}/{today.year}" in prevCases.columns: 
        prevCases = prevCases.drop(columns=[f"{endofWeekCases.month}/{endofWeekCases.day}/{today.year}"])

    if f"{endofWeekCases.month}/{endofWeekCases.day}/{today.year}" in prevDeaths.columns: 
        prevDeaths = prevDeaths.drop(columns=[f"{endofWeekCases.month}/{endofWeekCases.day}/{today.year}"])

    if f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}" in prevTesting.columns: 
        prevTesting = prevTesting.drop(columns=[f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}"])
        
    if f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}" in prevTestingPos.columns: 
        prevTestingPos = prevTestingPos.drop(columns=[f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}"])
        
    if f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}" in testingCap.columns: 
        testingCap = testingCap.drop(columns=[f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}"])
        
    if f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}" in testingCcpt.columns: 
        testingCcpt = testingCcpt.drop(columns=[f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{today.year}"])


    # Merge historic data with current
    cases = prevCases.merge(cases, on="FIPS", how="outer")
    deaths = prevDeaths.merge(deaths, on="FIPS", how="outer")
    testing = prevTesting.merge(testing, on="FIPS", how="outer")
    testingPos = prevTestingPos.merge(testingPos, on="FIPS", how="outer")
    testingCap = prevTestingCap.merge(testingCap, on="FIPS", how="outer")
    testingCcpt = prevTestingCcpt.merge(testingCcpt, on="FIPS", how="outer")

    # export to CSV
    cases.to_csv('./csv/covid_confirmed_cdc.csv',index=False)
    deaths.to_csv('./csv/covid_deaths_cdc.csv',index=False)
    testingPos.to_csv('./csv/covid_wk_pos_cdc.csv',index=False)
    testing.to_csv('./csv/covid_testing_cdc.csv',index=False)
    testingCap.to_csv('./csv/covid_tcap_cdc.csv',index=False)
    testingCcpt.to_csv('./csv/covid_ccpt_cdc.csv',index=False)

if __name__ == '__main__':
    getCdcData()