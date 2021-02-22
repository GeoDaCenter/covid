import pandas as pd
from glob import glob

def findJoinColumn(columns):
    # check for various options used for join columns in data sets
    # return whicever is present
    # pray no more than 1 is used in the same dataset
    colOptions = ['GEOID', 'fips', 'countyFIPS', 'stateFIPS']
    for option in colOptions:
        if option in columns:
            return option

def findDateIndex(columns):
    for column in columns:
        if column.count('-') > 1 or column.count('/') > 1:
            return columns.index(column)

def convertToUsaFacts(columns):
    mapping = {}
    
    for column in columns:
        if '-' not in column:
            mapping[column] = column
        else:
            parts = column.split('-')
            year = parts[0]
            month = parts[1]
            day = parts[2]
            mapping[column] = f"{int(month)}/{int(day)}/{year[2:]}"
    
    return mapping

def getDexData(geography):
    # 
    if (geography == "county"):
        raw = pd.read_csv("https://raw.githubusercontent.com/COVIDExposureIndices/COVIDExposureIndices/master/dex_data/county_dex.csv")
        joinCol = 'county'
    else:
        raw = pd.read_csv("https://raw.githubusercontent.com/COVIDExposureIndices/COVIDExposureIndices/master/dex_data/state_dex.csv")
        joinCol = 'GEOID'
        geoidTable = pd.read_csv('./statename_geoid.csv')
        raw = raw.merge(geoidTable, left_on="state", right_on="STUSPS", how="left")
        
    raw['dex'] = raw['dex'].round(1)
    raw['dex_a'] = raw['dex_a'].round(1)

    dex = raw[[joinCol,'date','dex']]
    dex_a = raw[[joinCol,'date','dex_a']]

    # thanks to @piRSquared on stackoverflow for this nifty pivot expressions
    # https://stackoverflow.com/questions/54915215/expressing-time-series-data-in-the-columns-rather-than-the-rows-of-a-dataframe
    dex = dex.pivot_table(index=joinCol, columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    dex.columns = [column[0] for column in list(dex.columns)]

    dex_a = dex_a.pivot_table(index=joinCol, columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    dex_a.columns = [column[0] for column in list(dex_a.columns)]

    return { 'dex': dex, 'dex_a': dex_a}

def parseDex(fileName, dataFrame, dexJoinColumn):
    casesDf = pd.read_csv(fileName)

    dateColumnIndex = findDateIndex(list(casesDf.columns))
    nonDateCols = list(casesDf.columns)[:dateColumnIndex]
    dateCols = list(casesDf.columns)[dateColumnIndex:]
    dateCols.sort()

    joinColumn = findJoinColumn(list(casesDf.columns))
    casesDf = casesDf[nonDateCols]
    
    if 'usafacts' in fileName:
        dataFrame = dataFrame.rename(columns=convertToUsaFacts(list(dataFrame.columns)))
        
    mergedDf = dataFrame.merge(casesDf, left_on=dexJoinColumn, right_on=joinColumn)

    for column in dateCols:
        if column not in mergedDf.columns:
            mergedDf[column] = None
    parsedDf = mergedDf[nonDateCols + dateCols]

    fileName = fileName.split('confirmed_')[1].split('.csv')[0]
    
    return {'fileName': fileName, 'df': parsedDf}

if __name__ == "__main__":
    county = getDexData("county")

    dex_county = county['dex']
    dex_a_county = county['dex_a']

    state = getDexData("state")

    dex_state = state['dex']
    dex_a_state = state['dex_a']

    fileList = glob('../../public/csv/*confirmed*.csv')

    for file in fileList:
        if 'state' in file:
            dexJoinColumn = 'GEOID'
            dataFrame1 = dex_state
            dataFrame2 = dex_a_state
        else:
            dexJoinColumn = 'county'
            dataFrame1 = dex_county
            dataFrame2 = dex_a_county
            
        parsed1 = parseDex(file, dataFrame1, dexJoinColumn)
        parsed2 = parseDex(file, dataFrame2, dexJoinColumn)
        
        parsed1['df'].to_csv(f'../../public/csv/covid_county_dex_{parsed1["fileName"]}.csv',index=False)
        parsed2['df'].to_csv(f'../../public/csv/covid_county_dex_a_{parsed2["fileName"]}.csv',index=False)
        parsed1['df'].to_csv(f'./csv/covid_county_dex_{parsed1["fileName"]}.csv',index=False)
        parsed2['df'].to_csv(f'./csv/covid_county_dex_a_{parsed2["fileName"]}.csv',index=False)