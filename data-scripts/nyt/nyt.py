import pandas as pd

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

    #sort based on fips 
    NYTData = NYTData.sort_values('fips')
    # get list of uniqFips for iterating and uniqDates for placeholder DF
    uniqFips = NYTData['fips'].unique()
    uniqDates = NYTData['date'].unique()

    # create an empty data frame with a placeholder index and columns for all valid dates 
    parsedData = pd.DataFrame([uniqDates, [i for i in range(0,len(uniqDates))]]).T.sort_values(0).set_index(0).T
    parsedData.insert(loc=0, column='fips', value=[0])

    # loop through fips, orient to columns, append to parsed DF
    # todo - think more about data transformations here to speed this up. 
    for i in range(0, len(uniqFips)):
        tempDf = NYTData[NYTData.fips==uniqFips[i]].sort_values('date')[['date','cases','deaths']].set_index('date').T.reset_index()
        tempDf.insert(loc=0, column='fips', value=[uniqFips[i],uniqFips[i]])
        parsedData = parsedData.append(tempDf)

    # clean up column names to lead with FIPS and Index
    cols = parsedData.columns.tolist()[:-2]
    cols.insert(0, 'index') 

    # remove placeholder index column
    parsedData = parsedData[cols].iloc[1:]

    return parsedData

if __name__ == '__main__':
    # return CSV ready DataFrames for State and County Data
    stateData = parseNYT("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv")
    countyData = parseNYT("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")

    # export CSVs to local folder and docs
    countyData[countyData['index']=="cases"].to_csv('./covid_confirmed_nyt.csv', index=False)
    countyData[countyData['index']=="deaths"].to_csv('./covid_deaths_nyt.csv', index=False)
    countyData[countyData['index']=="cases"].to_csv('../../docs/csv/covid_confirmed_nyt.csv', index=False)
    countyData[countyData['index']=="deaths"].to_csv('../../docs/csv/covid_deaths_nyt.csv', index=False)

    stateData[stateData['index']=="cases"].to_csv('./covid_confirmed_nyt_state.csv', index=False)
    stateData[stateData['index']=="deaths"].to_csv('./covid_deaths_nyt_state.csv', index=False)
    stateData[stateData['index']=="cases"].to_csv('../../docs/csv/covid_confirmed_nyt_state.csv', index=False)
    stateData[stateData['index']=="deaths"].to_csv('../../docs/csv/covid_deaths_nyt_state.csv', index=False)