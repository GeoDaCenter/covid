import os
import pandas as pd

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def parseTexasCases():
    countyData = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_usafacts.csv'))
    stateData = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_usafacts_state.csv'))

    texasData = stateData[stateData.StateFIPS == 48]
    texasData = texasData[texasData.columns[2:]]

    texasData['countyFIPS'] = 48
    texasData['State'] = 'TX'
    texasData['County Name'] = 'Texas'
    texasData['StateFIPS'] = 48

    return pd.concat([countyData, texasData])

def parseTexasDeaths():
    countyData = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_deaths_usafacts.csv'))
    stateData = pd.read_csv(os.path.join(repo_root, 'public/csv/covid_deaths_usafacts_state.csv'))

    texasData = stateData[stateData.StateFIPS == 48]
    texasData = texasData[texasData.columns[2:]]

    texasData['countyFIPS'] = 48
    texasData['State'] = 'TX'
    texasData['County Name'] = 'Texas'
    texasData['StateFIPS'] = 48

    return pd.concat([countyData, texasData])

def parseTexasVaccine():
    countyData = pd.read_csv(os.path.join(repo_root, 'public/csv/vaccine_fully_vaccinated_cdc.csv'))
    stateData = pd.read_csv(os.path.join(repo_root, 'public/csv/vaccination_fully_vaccinated_cdc.csv'))
    texasData = stateData[stateData.fips == 48][[column for column in countyData.columns if column in stateData.columns]]
    texasData['2021-05-14'] = texasData['2021-05-13']

    return pd.concat([countyData, texasData])

if __name__ == "__main__":
    parseTexasCases().to_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_usafacts_h.csv'), index=False)
    parseTexasDeaths().to_csv(os.path.join(repo_root, 'public/csv/covid_deaths_usafacts_h.csv'), index=False)
    parseTexasVaccine().to_csv(os.path.join(repo_root, 'public/csv/vaccine_fully_vaccinated_cdc_h.csv'), index=False)
    