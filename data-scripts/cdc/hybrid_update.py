import os
import pandas as pd

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def parseStateCases():
    countyData = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_usafacts.csv'))
    stateData = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_usafacts_state.csv'))

    tempData = stateData[stateData.StateFIPS == 48]
    tempData = tempData[tempData.columns[2:]]

    tempData['countyFIPS'] = 48
    tempData['State'] = 'TX'
    tempData['County Name'] = 'Texas'
    tempData['StateFIPS'] = 48

    merged = pd.concat([countyData, tempData], sort=True)

    tempData = stateData[stateData.StateFIPS == 15]
    tempData = tempData[tempData.columns[2:]]

    tempData['countyFIPS'] = 15
    tempData['State'] = 'HI'
    tempData['County Name'] = 'Hawaii'
    tempData['StateFIPS'] = 15

    merged = pd.concat([merged, tempData], sort=True)
    
    return merged[list(countyData.columns)] 

def parseStateDeaths():
    countyData = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_deaths_usafacts.csv'))
    stateData = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_deaths_usafacts_state.csv'))


    tempData = stateData[stateData.StateFIPS == 48]
    tempData = tempData[tempData.columns[2:]]

    tempData['countyFIPS'] = 48
    tempData['State'] = 'TX'
    tempData['County Name'] = 'Texas'
    tempData['StateFIPS'] = 48

    merged = pd.concat([countyData, tempData], sort=True)

    tempData = stateData[stateData.StateFIPS == 15]
    tempData = tempData[tempData.columns[2:]]

    tempData['countyFIPS'] = 15
    tempData['State'] = 'HI'
    tempData['County Name'] = 'Hawaii'
    tempData['StateFIPS'] = 15

    merged = pd.concat([merged, tempData], sort=True)
    
    return merged[list(countyData.columns)] 

def parseStateVaccine():
    countyData = pd.read_csv(os.path.join(repo_root, 'public/csv/vaccination_fully_vaccinated_cdc.csv'))
    stateData = pd.read_csv(os.path.join(repo_root, 'public/csv/vaccination_fully_vaccinated_cdc_state.csv')).rename(columns={'GEOID': 'fips'})

    tempData = stateData[stateData.fips == 48][[column for column in countyData.columns if column in stateData.columns]]
    mergedFullyVaccinated = pd.concat([countyData, tempData], sort=True)

    tempData = stateData[stateData.fips == 15][[column for column in countyData.columns if column in stateData.columns]]
    mergedFullyVaccinated = pd.concat([mergedFullyVaccinated, tempData], sort=True)

    countyData = pd.read_csv(os.path.join(repo_root, 'public/csv/vaccination_one_or_more_doses_cdc.csv'))
    stateData = pd.read_csv(os.path.join(repo_root, 'public/csv/vaccination_one_or_more_doses_cdc_state.csv')).rename(columns={'GEOID': 'fips'})
    
    tempData = stateData[stateData.fips == 48][[column for column in countyData.columns if column in stateData.columns]]
    mergedOneDose = pd.concat([countyData, tempData], sort=True)

    tempData = stateData[stateData.fips == 15][[column for column in countyData.columns if column in stateData.columns]]
    mergedOneDose = pd.concat([mergedOneDose, tempData], sort=True)
    
    return {
        'fullyVaccinated': mergedFullyVaccinated[list(countyData.columns)],
        'atLeastOneDose': mergedOneDose[list(countyData.columns)]
    }

if __name__ == "__main__":
    parseStateCases().to_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_usafacts_h.csv'), index=False)
    parseStateDeaths().to_csv(os.path.join(repo_root, 'public/csv/covid_deaths_usafacts_h.csv'), index=False)
    vaccineData = parseStateVaccine()
    vaccineData['fullyVaccinated'].to_csv(os.path.join(repo_root, 'public/csv/vaccination_fully_vaccinated_cdc_h.csv'), index=False)
    vaccineData['atLeastOneDose'].to_csv(os.path.join(repo_root, 'public/csv/vaccination_one_or_more_doses_cdc_h.csv'), index=False)
    