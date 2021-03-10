#_*_coding: utf-8_*_
import pandas as pd
from multiprocessing import Pool
from bs4 import BeautifulSoup
import requests, time, json
import pandas as pd
import gzip
from glob import glob
from datetime import datetime, timedelta
from dateutil.parser import parse
import numpy as np
from math import floor

def generateWeekdayDateList(startDate, endDate):
    currDate = parse(startDate)
    endDate = parse(endDate)
    counter=0
    tempArray=[]
    while currDate < endDate:
        if currDate.strftime('%A')[0] != 'S':
            tempArray.append({'date': currDate.isoformat()[0:10], 'week':counter})
            currDate += timedelta(days=1)
        else:
            counter += 1
            currDate += timedelta(days=2)

    return pd.DataFrame(tempArray)

weekdays = list(generateWeekdayDateList('2019-01-22', datetime.today().strftime('%Y-%m-%d'))['date'])

def getFiles():
    months = glob(f'E:/SG_SD/2020/*') + glob(f'E:/SG_SD/2021/*')
    files = []

    for month in months:
        days = glob(f"{month}/*")
        for day in days:
            files.append(glob(f"{day}/*.gz")[0])
    
    return files

def handleFile(file):
    try:
        df = pd.read_csv(file)
        date = df.iloc[0].date_range_start[:10]
        print(date)
        if date in weekdays:
            df = df[['origin_census_block_group','device_count','part_time_work_behavior_devices','full_time_work_behavior_devices', 'completely_home_device_count', 'delivery_behavior_devices']]
            df['county'] = df['origin_census_block_group'].astype(str).str.slice(0,-7)
            df = df.groupby('county').sum().reset_index().drop('origin_census_block_group', axis=1)
            df['date'] = date
            return df
    except:
        pass

if __name__ == '__main__':
    fullFiles = getFiles()
    print(f'Handling {len(fullFiles)} files.')
    # for i in range(36741, 36768):
    #     linkList.append([i, 'X'])

    with Pool(12) as p:
        dfs = p.map(handleFile, fullFiles)

    cleanData = []
    for df in dfs:
        if type(df) != 'NoneType':
            cleanData.append(df)

    print(f'Merging {len(cleanData)} tables.')
    fullData = pd.concat(cleanData)
    print(f"Tables merged, shape: {fullData.shape}")
    print(fullData.head())

    fullData.to_csv(f'fullData{weekdays[-1]}.csv')