import pandas as pd
import requests, json
from glob import glob

def downloadCDCVaccinationData():
    raw = requests.get('https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_data')
    loadedJson = raw.json()['vaccination_data']
    vaccinationData = pd.DataFrame(loadedJson)

    with open(f'./json/cdc_vaccine_data_{loadedJson[0]["Date"]}.json', 'w') as outfile:
        json.dump(loadedJson, outfile)

    return glob('./json/*.json')

def parse1p3aVaccinationData(vaccinationDataList):
    dateDf = pd.read_csv('../../docs/csv/covid_confirmed_1p3a_state.csv')
    geoidTable = pd.read_csv('./statename_geoid.csv')
    datesList = list(dateDf.columns[2:])
    datesList.sort()
    datesList = ['GEOID', 'NAME'] + datesList
    placeholderDf = pd.DataFrame(datesList).set_index(0).T

    for idx, file in enumerate(vaccinationDataList):
        with open(file) as f:
            data = json.load(f)
            if (type(data)==dict):
                data = data['vaccination_data']
        currDate = data[0]['Date']
        vaccinationDf = pd.DataFrame(data) \
            .merge(geoidTable, left_on="Location", right_on="STUSPS", how="inner")[['GEOID','NAME','Doses_Distributed','Doses_Administered']]

        if idx == 0:
            vaccineAdministered = vaccinationDf[['GEOID','NAME','Doses_Administered']]
            vaccineDistributed = vaccinationDf[['GEOID','NAME','Doses_Distributed']]
            vaccineAdministered.columns = ['GEOID','NAME',currDate]
            vaccineDistributed.columns = ['GEOID','NAME',currDate]
        else:
            dailyVaccineAdministered = vaccinationDf[['GEOID','NAME','Doses_Administered']]
            dailyVaccineDistributed = vaccinationDf[['GEOID','NAME','Doses_Distributed']]
            dailyVaccineAdministered.columns = ['GEOID','NAME',currDate]
            dailyVaccineDistributed.columns = ['GEOID','NAME',currDate]

            vaccineAdministered = vaccineAdministered.merge(dailyVaccineAdministered, on=["GEOID","NAME"])
            vaccineDistributed = vaccineDistributed.merge(dailyVaccineDistributed, on=["GEOID","NAME"])

    merged = pd.concat([placeholderDf, vaccineAdministered], sort=True)
    cols = list(merged.columns)[-2:] + list(merged.columns)[:-2]
    merged = merged[cols]
    merged.to_csv()

    merged.to_csv('./csv/vaccine_admin_cdc_1p3a_state.csv', index=False)
    merged.to_csv('../../docs/csv/vaccine_admin_cdc_1p3a_state.csv', index=False)

    merged = pd.concat([placeholderDf, vaccineDistributed], sort=True)
    cols = list(merged.columns)[-2:] + list(merged.columns)[:-2]
    merged = merged[cols]
    merged.to_csv()

    merged.to_csv('./csv/vaccine_dist_cdc_1p3a_state.csv', index=False)
    merged.to_csv('../../docs/csv/vaccine_dist_cdc_1p3a_state.csv', index=False)

def parseNytVaccinationData(vaccinationDataList):
    dateDf = pd.read_csv('../../docs/csv/covid_confirmed_nyt_state.csv')
    geoidTable = pd.read_csv('./statename_geoid.csv')
    datesList = list(dateDf.columns[1:])
    datesList.sort()
    datesList = ['fips'] + datesList
    placeholderDf = pd.DataFrame(datesList).set_index(0).T

    for idx, file in enumerate(vaccinationDataList):
        with open(file) as f:
            data = json.load(f)
            if (type(data)==dict):
                data = data['vaccination_data']
        currDate = data[0]['Date']
        vaccinationDf = pd.DataFrame(data) \
            .merge(geoidTable, left_on="Location", right_on="STUSPS", how="inner")[['GEOID','NAME','Doses_Distributed','Doses_Administered']]

        if idx == 0:
            vaccineAdministered = vaccinationDf[['GEOID','Doses_Administered']]
            vaccineDistributed = vaccinationDf[['GEOID','Doses_Distributed']]
            vaccineAdministered.columns = ['fips',currDate]
            vaccineDistributed.columns = ['fips',currDate]
        else:
            dailyVaccineAdministered = vaccinationDf[['GEOID','Doses_Administered']]
            dailyVaccineDistributed = vaccinationDf[['GEOID','Doses_Distributed']]
            dailyVaccineAdministered.columns = ['fips',currDate]
            dailyVaccineDistributed.columns = ['fips',currDate]

            vaccineAdministered = vaccineAdministered.merge(dailyVaccineAdministered, on=["fips"])
            vaccineDistributed = vaccineDistributed.merge(dailyVaccineDistributed, on=["fips"])

    merged = pd.concat([placeholderDf, vaccineAdministered], sort=True)
    cols = list(merged.columns)[-1:] + list(merged.columns)[:-1]
    merged = merged[cols]
    merged.to_csv()

    merged.to_csv('./csv/vaccine_admin_cdc_nyt_state.csv', index=False)
    merged.to_csv('../../docs/csv/vaccine_admin_cdc_nyt_state.csv', index=False)

    merged = pd.concat([placeholderDf, vaccineDistributed], sort=True)
    cols = list(merged.columns)[-1:] + list(merged.columns)[:-1]
    merged = merged[cols]
    merged.to_csv()

    merged.to_csv('./csv/vaccine_dist_cdc_nyt_state.csv', index=False)
    merged.to_csv('../../docs/csv/vaccine_dist_cdc_nyt_state.csv', index=False)

if __name__ == "__main__":
    fileList = downloadCDCVaccinationData()
    parse1p3aVaccinationData(fileList)
    parseNytVaccinationData(fileList)