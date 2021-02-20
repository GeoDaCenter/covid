import os
import pandas as pd

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def parseNYT(url):
    # read in CORS compatible CSV
    NYTData = pd.read_csv(url)
    # filter for features missing FIPS at the county level
    if 'county' in NYTData.columns:
        NYTData.loc[NYTData.county == 'New York City', 'fips'] = 36061
    NYTData = NYTData[NYTData.fips.notnull()]

    # convert columns to int type
    NYTData['fips'] = NYTData['fips'].astype(int, errors = 'ignore')
    NYTData['cases'] = NYTData['cases'].astype(int, errors = 'ignore')
    NYTData['deaths'] = NYTData['deaths'].astype(int, errors = 'ignore')
    NYTData = NYTData.sort_values('date')

    #sort based on fips
    NYTData = NYTData.sort_values('fips')
    # get list of uniqFips for iterating and uniqDates for placeholder DF
    uniqFips = NYTData['fips'].unique()
    uniqDates = NYTData['date'].unique()

    deaths = NYTData[['fips','date','deaths']]
    cases = NYTData[['fips','date','cases']]

    # thanks to @piRSquared on stackoverflow for this nifty pivot expressions
    # https://stackoverflow.com/questions/54915215/expressing-time-series-data-in-the-columns-rather-than-the-rows-of-a-dataframe
    deaths = deaths.pivot_table(index='fips', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    deaths.columns = [column[0] for column in list(deaths.columns)]

    cases = cases.pivot_table(index='fips', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    cases.columns = [column[0] for column in list(cases.columns)]

    return {
        'cases': cases,
        'deaths': deaths
    }

if __name__ == '__main__':
    # return CSV ready DataFrames for State and County Data
    stateData = parseNYT("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv")
    countyData = parseNYT("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")

    # export CSVs to local folder and public
    # countyData['cases'].to_csv('./covid_confirmed_nyt.csv', index=False)
    # countyData['deaths'].to_csv('./covid_deaths_nyt.csv', index=False)
    countyData['cases'].to_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_nyt.csv'), index=False)
    countyData['deaths'].to_csv(os.path.join(repo_root, 'public/csv/covid_deaths_nyt.csv'), index=False)

    # stateData['cases'].to_csv('./covid_confirmed_nyt_state.csv', index=False)
    # stateData['deaths'].to_csv('./covid_deaths_nyt_state.csv', index=False)
    stateData['cases'].to_csv(os.path.join(repo_root, 'public/csv/covid_confirmed_nyt_state.csv'), index=False)
    stateData['deaths'].to_csv(os.path.join(repo_root, 'public/csv/covid_deaths_nyt_state.csv'), index=False)
