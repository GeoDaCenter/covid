import pandas as pd
from datetime import datetime, date, timedelta
from bs4 import BeautifulSoup
from glob import glob
import json, requests

def downloadCDCdata():
    # front end CDC page with links
    URL = 'https://beta.healthdata.gov/National/COVID-19-Community-Profile-Report/gqxm-d9w9'

    # download Page as HTML
    page = requests.get(URL)

    # parse HTML with BS4
    soup = BeautifulSoup(page.content, 'html.parser')

    # find the script block with the URLs we need
    for a in soup.find_all('script'):
        if 'initialState' in str(a):
            linkBlock = str(a)[69:-17].split('},{')

    # declare list to be populated
    cleanedLinks = []

    # pull out clean links to list
    # the reason for this is that the links are not just dates --
    # each has a UUID we need to scrape in order to download the excel
    for link in linkBlock:
        cleaned = link.split('"href":"')[-1].split(',"link"')[0]
        if ('Community_Profile_Report' in cleaned) and ('/api/views/' in cleaned) and ('Public.xlsx' in cleaned) and (len(cleaned) < 300):
            cleanedLinks.append(f"https://beta.healthdata.gov{cleaned}")

    # check out current excel files
    downloadFiles = glob('./xlsx/*.xlsx')

    # download any files we're missing in the xlsx folder
    for url in cleanedLinks:
        r = requests.get(url)
        date = url[-21:-13]
        if f"./xlsx\\CDC_{url[-21:-13]}.xlsx" not in downloadFiles:
            with open(f"./xlsx/CDC_{date}.xlsx", 'wb') as f:
                f.write(r.content)

def findColumn(columns, search):
    for column in columns:
        if search.lower() in column.lower():
            return column
    return None

def parseCDCdata(fileList):
    for index, file in enumerate(fileList):
        # import excel sheets
        raw = pd.read_excel(file, sheet_name="Counties")
        # snag case and testing dates -- these are different each day 
        # typically the testing weekly data is 2 days behind  ¯\_(ツ)_/¯
        endOfWeekCases = f"{raw.columns[14].split('(')[-1].split(' ')[0]} {raw.columns[14].split('-')[-1][:-1]}"
        endofWeekCases = datetime.strptime(endOfWeekCases, '%B %d')
        endOfWeekTesting = f"{raw.columns[32].split('(')[-1].split(' ')[0]} {raw.columns[32].split('-')[-1][:-1]}"
        endOfWeekTesting = datetime.strptime(endOfWeekTesting, '%B %d')
        year = file[-13:-9]
        # set second row as column index
        # this is to handle the CDC excel formatting
        raw.columns = list(raw.iloc[0])
        raw = raw.drop(index=0)
        columns = list(raw.columns)

        # grab and format the data we want into separate DFs
        cases = raw[['FIPS code', findColumn(list(raw.columns), 'cumulative cases')]]
        cases.columns = ['FIPS', f"{endofWeekCases.month}/{endofWeekCases.day}/{year}"]   
        
        deaths = raw[['FIPS code',findColumn(list(raw.columns), 'cumulative deaths')]]
        cases.columns = ['FIPS', f"{endofWeekCases.month}/{endofWeekCases.day}/{year}"]

        testingPos = raw[['FIPS code',  findColumn(list(raw.columns), 'test positivity rate - last 7 day')]]
        testingPos.columns = ['FIPS', f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{year}"]

        testing = raw[['FIPS code', findColumn(list(raw.columns), 'Total RT-PCR diagnostic tests - last 7 days')]]
        testing.columns = ['FIPS', f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{year}"]

        testingCap = raw[['FIPS code', findColumn(list(raw.columns), 'RT-PCR tests per 100k - previous 7 days')]]
        testingCap.columns = ['FIPS', f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{year}"]

        testingCcpt = raw[['FIPS code',  findColumn(list(raw.columns), 'cases - last 7 days'),  findColumn(list(raw.columns), 'Total RT-PCR diagnostic tests - last 7 days')]]
        testingCcpt.columns = ['FIPS', 'Cases', 'Tests']

        # filter and calculate CCPT
        testingCcptFiltered = testingCcpt.query('Tests > 0')
        testingCcptFiltered['CCPT'] = testingCcptFiltered['Cases']/testingCcptFiltered['Tests']

        testingCcpt = testingCcpt.merge(testingCcptFiltered, on=['FIPS','Cases','Tests'], how="left")[['FIPS','CCPT']]
        testingCcpt.columns = ['FIPS', f"{endOfWeekTesting.month}/{endOfWeekTesting.day}/{year}"]

        # join data on FIPS, check for duplicated columns
        if index == 0:
            prevCases = cases.copy()
            prevDeaths = deaths.copy()
            prevTesting = testing.copy()
            prevTestingPos = testingPos.copy()
            prevTestingCap = testingCap.copy()
            prevTestingCcpt = testingCcpt.copy()
        else:
            if list(cases.columns)[1] not in list(prevCases.columns):
                prevCases = prevCases.merge(cases, on="FIPS", how="outer")
            if list(deaths.columns)[1] not in list(prevDeaths.columns):
                prevDeaths = prevDeaths.merge(deaths, on="FIPS", how="outer")
            if list(testing.columns)[1] not in list(prevTesting.columns):
                prevTesting = prevTesting.merge(testing, on="FIPS", how="outer")
            if list(testingPos.columns)[1] not in list(prevTestingPos.columns):
                prevTestingPos = prevTestingPos.merge(testingPos, on="FIPS", how="outer")
            if list(testingCap.columns)[1] not in list(prevTestingCap.columns):
                prevTestingCap = prevTestingCap.merge(testingCap, on="FIPS", how="outer")
            if list(testingCcpt.columns)[1] not in list(prevTestingCcpt.columns):
                prevTestingCcpt = prevTestingCcpt.merge(testingCcpt, on="FIPS", how="outer")
    
    # after loop, export to CSV
    prevCases.to_csv('./csv/covid_confirmed_cdc.csv',index=False)
    prevDeaths.to_csv('./csv/covid_deaths_cdc.csv',index=False)
    prevTesting.to_csv('./csv/covid_testing_cdc.csv',index=False)
    prevTestingPos.to_csv('./csv/covid_wk_pos_cdc.csv',index=False)
    prevTestingCap.to_csv('./csv/covid_tcap_cdc.csv',index=False)
    prevTestingCcpt.to_csv('./csv/covid_ccpt_cdc.csv',index=False)

if __name__ == '__main__':
    downloadCDCdata()
    parseCDCdata(glob('./xlsx/*.xlsx'))