import pandas as pd

# read in CORS compatible CSV
NYTData = pd.read_csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")

# filter for features missing FIPS at the county level
NYTData = NYTData[NYTData.fips.notnull()]

# convert columns to int type
NYTData['fips'] = NYTData['fips'].astype(int)
# NYTData['cases'] = NYTData['cases'].astype(int)
# NYTData['deaths'] = NYTData['deaths'].astype(int)

#sort based on fips 
NYTData = NYTData.sort_values('fips')
print('NYT sorted')
# get list of uniqFips for iterating and uniqDates for placeholder DF
uniqFips = NYTData['fips'].unique()
uniqDates = NYTData['date'].unique()

# create an empty data frame with a placeholder index and columns for all valid dates 
parsedData = pd.DataFrame([uniqDates, [i for i in range(0,len(uniqDates))]]).T.sort_values(0).set_index(0).T
parsedData.insert(loc=0, column='fips', value=[0])

# loop through fips, orient to columns, append to parsed DF
# todo - think more about data transformations here to speed this up. 
for i in range(0, len(uniqFips)):
    print(f"{i}/{len(uniqFips)}")
    tempDf = NYTData[NYTData.fips==uniqFips[i]].sort_values('date')[['date','cases','deaths']].set_index('date').T.reset_index()
    tempDf.insert(loc=0, column='fips', value=[uniqFips[i],uniqFips[i]])
    parsedData = parsedData.append(tempDf)

print('data parsed')
# clean up column names to lead with FIPS and Index
cols = parsedData.columns.tolist()[:-2]
# cols.insert(0, 'fips') 
cols.insert(0, 'index') 

# remove placeholder index column
parsedData = parsedData[cols].iloc[1:]

parsedData[parsedData['index']=="cases"].to_csv('./NYT_county_cases.csv', index=False)
parsedData[parsedData['index']=="deaths"].to_csv('./NYT_county_deaths.csv', index=False)
parsedData[parsedData['index']=="cases"].to_csv('../../docs/csv/NYT_county_cases.csv', index=False)
parsedData[parsedData['index']=="deaths"].to_csv('../../docs/csv/NYT_county_deaths.csv', index=False)