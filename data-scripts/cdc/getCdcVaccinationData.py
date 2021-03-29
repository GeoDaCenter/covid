import pandas as pd
import requests, json, os
from glob import glob
from bs4 import BeautifulSoup
import numpy as np

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def downloadCDCVaccinationData():
    raw = requests.get('https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_data')
    loadedJson = raw.json()['vaccination_data']
    vaccinationData = pd.DataFrame(loadedJson)
    outputDate = loadedJson[0]["Date"].replace('/','-')
    with open(os.path.join(repo_root, f'data-scripts/cdc/vaccination_state/cdc_vaccine_data_{outputDate}.json'), 'w') as outfile:
        json.dump(loadedJson, outfile)

    return glob(os.path.join(repo_root, 'data-scripts/cdc/vaccination_state/*.json'))

def parseVaccinationData(vaccinationDataList):
    geoidTable = pd.read_csv(os.path.join(repo_root,'data-scripts/cdc/statename_geoid.csv'))
    vaccineAdministered1 = ''

    for idx, file in enumerate(vaccinationDataList):
        with open(file) as f:
            data = json.load(f)
            if (type(data)==dict):
                data = data['vaccination_data']

        # Pull report date from first row of data
        currDate = data[0]['Date']
        # Try to load in JSON to dataframe, pass iteration if fail
        try:
            vaccinationDf = pd.DataFrame(data) \
                .merge(geoidTable, left_on="Location", right_on="STUSPS", how="inner")
        except:
            continue

        # Older data has only the number of second doses administered (before J+J vaccine)
        # Series_Complete_Yes is a more robust measure of the total vaccine series completed
        fullyVaccinatedColumn = False
        firstDoseColumn = False
        if 'Series_Complete_Yes' in vaccinationDf.columns:
            fullyVaccinatedColumn = 'Series_Complete_Yes'
        elif 'Administered_Dose2_Recip' in vaccinationDf.columns:
            fullyVaccinatedColumn = 'Administered_Dose2_Recip'
        else: 
            fullyVaccinatedColumn = 'Administered_Dose2'

        
        if 'Administered_Dose1_Recip' in vaccinationDf.columns:
            firstDoseColumn = 'Administered_Dose1_Recip'
        else:
            firstDoseColumn = 'Administered_Dose1'

        if 'Doses_Administered' not in vaccinationDf.columns:
            vaccinationDf['Doses_Administered'] = vaccinationDf[firstDoseColumn] + vaccinationDf[fullyVaccinatedColumn]

        # Defensive: skip if missing dose1 recip column
        # This column is defined as number of individuals residing in a state, not crossing over the get doses
        if not isinstance(fullyVaccinatedColumn, str) or not isinstance(firstDoseColumn, str):
            continue

        # on first iteration, define new data frames
        # After that, define temporary dataframe sna dmerge below
        if len(vaccineAdministered1) == 0:
            vaccineAdministered1 = vaccinationDf[['GEOID',firstDoseColumn]]
            vaccineAdministered1.columns = ['fips',currDate]

            vaccineAdministered2 = vaccinationDf[['GEOID',fullyVaccinatedColumn]]
            vaccineAdministered2.columns = ['fips',currDate]

            vaccineDistributed = vaccinationDf[['GEOID','Doses_Administered','Doses_Distributed']].reset_index(drop=True)
            vaccineDistributed.loc[:,'remaining'] = vaccineDistributed['Doses_Distributed'] - vaccineDistributed['Doses_Administered']
            vaccineDistributed = vaccineDistributed[['GEOID','remaining']]            
            vaccineDistributed.columns = ['fips',currDate]

        else:
            dailyVaccineAdministered1 = vaccinationDf[['GEOID',firstDoseColumn]]
            dailyVaccineAdministered1.columns = ['fips',currDate]
            
            dailyVaccineAdministered2 = vaccinationDf[['GEOID',fullyVaccinatedColumn]]
            dailyVaccineAdministered2.columns = ['fips',currDate]
            
            dailyVaccineDistributed = vaccinationDf[['GEOID','Doses_Administered','Doses_Distributed']].reset_index(drop=True)
            dailyVaccineDistributed.loc[:,'remaining'] = dailyVaccineDistributed['Doses_Distributed'] - dailyVaccineDistributed['Doses_Administered']
            dailyVaccineDistributed = dailyVaccineDistributed[['GEOID','remaining']]
            dailyVaccineDistributed.columns = ['fips',currDate]

            # Merge
            vaccineAdministered1 = vaccineAdministered1.merge(dailyVaccineAdministered1, on=["fips"])
            vaccineAdministered2 = vaccineAdministered2.merge(dailyVaccineAdministered2, on=["fips"])
            vaccineDistributed = vaccineDistributed.merge(dailyVaccineDistributed, on=["fips"])

    return { 'vaccineAdministered1': vaccineAdministered1, 'vaccineAdministered2': vaccineAdministered2, 'vaccineDistributed': vaccineDistributed }

def getCdcData():    
    # read in data from HealthData.gov API endpoint (god bless them allows CORS)
    raw = pd.read_csv('https://healthdata.gov/api/views/j8mb-icvb/rows.csv?accessType=DOWNLOAD')[['state_fips','overall_outcome','date','new_results_reported','total_results_reported']]
    raw['date'] = raw['date'].str.slice(0,10)

    totalNew = raw[['state_fips','date','new_results_reported']].groupby(['state_fips','date']).sum().reset_index().rename(columns={'new_results_reported':'total'})
    positiveNew = raw[raw['overall_outcome']=='Positive'][['state_fips','date','new_results_reported']].rename(columns={'new_results_reported':'positive'})

    return { 'totalNew': totalNew, 'positiveNew': positiveNew}

def parseCsvOutput(df, colName, operation=None):
    # thanks to @piRSquared on stackoverflow for this nifty pivot expressions
    # https://stackoverflow.com/questions/54915215/expressing-time-series-data-in-the-columns-rather-than-the-rows-of-a-dataframe
    tempDf = df[['state_fips','date',colName]]
    tempDf = tempDf.pivot_table(index='state_fips', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    tempDf.columns = [column[0].replace('/','-') for column in list(tempDf.columns)]

    return tempDf

def parse7dayRolling(df, colName, preLoaded=False, normalize=False):
    if preLoaded:
        tempDf = df
    else:
        tempDf = parseCsvOutput(df, colName)

    colList = list(tempDf.columns[1:])
    colList.sort()

    for i in range(len(colList), 0, -1):
        if i >= 7:
            n = i-7
            length = 7
        else:
            n = 0
            length = i
        tempDf.loc[:,colList[i-1]] = round(tempDf[colList[n:i]].sum(axis=1)/length,2)
    
    if normalize: 
        popDf = pd.read_csv(os.path.join(repo_root, 'data-scripts/cdc/state_populations.csv'))[["FIPS","population"]]
        tempDf = tempDf.merge(popDf, left_on="state_fips", right_on="FIPS", how="left")
    
        for column in colList:
            tempDf[column] = tempDf[column]/tempDf['population']*100000
    
    return tempDf[['state_fips']+colList]

if __name__ == "__main__":

    ## Vaccination Data
    fileList = downloadCDCVaccinationData()
    parsedData = parseVaccinationData(fileList)

    parsedData['vaccineDistributed'].to_csv(os.path.join(repo_root, 'public/csv/vaccination_to_be_distributed_cdc.csv'), index=False)
    parsedData['vaccineAdministered1'].to_csv(os.path.join(repo_root, 'public/csv/vaccination_one_or_more_doses_cdc.csv'), index=False)
    parsedData['vaccineAdministered2'].to_csv(os.path.join(repo_root, 'public/csv/vaccination_fully_vaccinated_cdc.csv'), index=False)

    ## State Testing Data
    currentData = getCdcData()

    totalTesting = parseCsvOutput(currentData['totalNew'], 'total')
    testingPer100Rolling = parse7dayRolling(currentData['totalNew'], 'total', normalize=True).round(2).replace([np.inf, -np.inf], np.nan)

    positiveTestsRolling = parse7dayRolling(currentData['positiveNew'], 'positive')
    testingRolling = parse7dayRolling(currentData['totalNew'], 'total')

    testingPositivityRolling = positiveTestsRolling.div(testingRolling, axis='columns').round(2).replace([np.inf, -np.inf], np.nan)
    testingPositivityRolling['state_fips'] = positiveTestsRolling['state_fips']
   
    casesRolling = parse7dayRolling(pd.read_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_1p3a_state.csv'))\
                                .rename(columns={"GEOID":"state_fips"})\
                                [testingRolling.columns], '', preLoaded=True)\
                                .sort_values('state_fips')
    casesRolling = casesRolling[casesRolling.state_fips.isin(testingRolling.state_fips)].reset_index().drop(columns=['index'])
                                    

    ccptRolling = casesRolling.div(testingRolling, axis='columns').round(2).replace([np.inf, -np.inf], np.nan)
    ccptRolling['state_fips'] = casesRolling['state_fips']
    
    totalTesting.to_csv(os.path.join(repo_root, 'public/csv/covid_testing_cdc_state.csv'), index=False)
    testingPer100Rolling.to_csv(os.path.join(repo_root, 'public/csv/covid_tcap_cdc_state.csv'), index=False)
    ccptRolling.to_csv(os.path.join(repo_root, 'public/csv/covid_ccpt_cdc_state.csv'), index=False)
    testingPositivityRolling.to_csv(os.path.join(repo_root, 'public/csv/covid_wk_pos_cdc_state.csv'), index=False)
