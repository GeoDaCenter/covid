import os
import pandas as pd
import requests, json
from glob import glob

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def downloadCDCVaccinationData():
    raw = requests.get('https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_data')
    loadedJson = raw.json()['vaccination_data']
    vaccinationData = pd.DataFrame(loadedJson)
    outputDate = loadedJson[0]["Date"].replace('/','-')
    with open(os.path.join(dir_path, f'json/cdc_vaccine_data_{outputDate}.json'), 'w') as outfile:
        json.dump(loadedJson, outfile)

    return glob(os.path.join(dir_path, 'json/*.json'))

def parseVaccinationData(vaccinationDataList):
    geoidTable = pd.read_csv('./statename_geoid.csv')
    vaccineAdministered1 = ''

    for idx, file in enumerate(vaccinationDataList):
        with open(file) as f:
            data = json.load(f)
            if (type(data)==dict):
                data = data['vaccination_data']
        currDate = data[0]['Date']

        try:
            vaccinationDf = pd.DataFrame(data) \
                .merge(geoidTable, left_on="Location", right_on="STUSPS", how="inner")[['GEOID','NAME','Doses_Distributed', 'Doses_Administered','Administered_Dose1','Administered_Dose2']]
        except:
            continue

        if len(vaccineAdministered1) == 0:
            vaccineAdministered1 = vaccinationDf[['GEOID','Administered_Dose1']]
            vaccineAdministered2 = vaccinationDf[['GEOID','Administered_Dose2']]
            vaccineDistributed = vaccinationDf[['GEOID','Doses_Administered','Doses_Distributed']].reset_index(drop=True)
            vaccineDistributed.loc[:,'remaining'] = vaccineDistributed['Doses_Distributed'] - vaccineDistributed['Doses_Administered']
            vaccineDistributed = vaccineDistributed[['GEOID','remaining']]
            vaccineAdministered1.columns = ['fips',currDate]
            vaccineAdministered2.columns = ['fips',currDate]
            vaccineDistributed.columns = ['fips',currDate]
        else:
            dailyVaccineAdministered1 = vaccinationDf[['GEOID','Administered_Dose1']]
            dailyVaccineAdministered2 = vaccinationDf[['GEOID','Administered_Dose2']]
            dailyVaccineDistributed = vaccinationDf[['GEOID','Doses_Administered','Doses_Distributed']].reset_index(drop=True)
            dailyVaccineDistributed.loc[:,'remaining'] = dailyVaccineDistributed['Doses_Distributed'] - dailyVaccineDistributed['Doses_Administered']
            dailyVaccineDistributed = dailyVaccineDistributed[['GEOID','remaining']]
            dailyVaccineAdministered1.columns = ['fips',currDate]
            dailyVaccineAdministered2.columns = ['fips',currDate]
            dailyVaccineDistributed.columns = ['fips',currDate]

            vaccineAdministered1 = vaccineAdministered1.merge(dailyVaccineAdministered1, on=["fips"])
            vaccineAdministered2 = vaccineAdministered2.merge(dailyVaccineAdministered2, on=["fips"])
            vaccineDistributed = vaccineDistributed.merge(dailyVaccineDistributed, on=["fips"])
    return { 'vaccineAdministered1': vaccineAdministered1, 'vaccineAdministered2': vaccineAdministered2, 'vaccineDistributed': vaccineDistributed }

if __name__ == "__main__":
    fileList = downloadCDCVaccinationData()
    parsedData = parseVaccinationData(fileList)

    parsedData['vaccineDistributed'].to_csv(os.path.join(repo_root, 'docs/csv/vaccine_dist_cdc.csv'), index=False)
    parsedData['vaccineAdministered1'].to_csv(os.path.join(repo_root, 'docs/csv/vaccine_admin1_cdc.csv'), index=False)
    parsedData['vaccineAdministered2'].to_csv(os.path.join(repo_root, 'docs/csv/vaccine_admin2_cdc.csv'), index=False)
