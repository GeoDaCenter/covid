import pandas as pd
import requests

def getParseLexData(date):
    df = pd.read_csv(f'https://github.com/COVIDExposureIndices/COVIDExposureIndices/blob/master/lex_data/county_lex_{date}.csv.gz?raw=true', compression='gzip')
    df.columns = [df.columns[0]] + [f'{int(col)}' for col in df.columns[1:]]
    df['COUNTY_PRE'] = df['COUNTY_PRE'].astype(str)
    
    validColumns = {}
    geoidList = list(df.columns[1:])
    for geoid in geoidList:
        tempList = geoidList.copy()
        tempList.remove(geoid)
        validColumns[geoid] = tempList
        
    sumDf = pd.DataFrame(df.sum()).drop_duplicates().reset_index().drop(0)
    sumDf.columns= ['COUNTY_PRE','SUM_IN']
    sumDf = sumDf.merge(df, on="COUNTY_PRE")
    
    df['SUM_OUT'] = df.apply(lambda x: sum(x[validColumns[x.COUNTY_PRE]]), axis=1)
    df['SUM_IN'] = sumDf.apply(lambda x: x.SUM_IN - x[x.COUNTY_PRE], axis=1)
    
    outDf = df[['COUNTY_PRE', 'SUM_OUT']]
    outDf.columns = ['GEOID',date]
    inDf = df[['COUNTY_PRE', 'SUM_IN']]
    inDf.columns = ['GEOID',date]
    
    return {
        'in': outDf,
        'out': inDf
    }
    
if __name__ == "__main__":
    r = requests.get('https://api.github.com/repos/COVIDExposureIndices/COVIDExposureIndices/git/trees/master?recursive=1')
    fileList = pd.DataFrame(r.json()['tree'])
    countyFiles = list(fileList[fileList.path.str.contains('lex_data/county_lex')].path)
    stateFiles = list(fileList[fileList.path.str.contains('lex_data/state_lex')].path)

    combinedOut = pd.read_csv('./county_LEX_out.csv')
    combinedIn = pd.read_csv('./county_LEX_in.csv')

    for file in countyFiles:
        fileDate = file[-17:-7]
        if fileDate in combinedOut.columns:
            continue
        data = getParseLexData(fileDate)
        combinedOut = combinedOut.merge(data['out'], on="GEOID", how="left")
        combinedIn = combinedIn.merge(data['in'], on="GEOID", how="left")

    combinedOut.to_csv('./county_LEX_out.csv', index=False)
    combinedIn.to_csv('./county_LEX_in.csv', index=False)