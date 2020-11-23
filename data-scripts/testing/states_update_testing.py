#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Oct  9 23:05:03 2020

@author: ryan
"""


import pandas as pd

def download_data():

    url = "https://api.covidtracking.com/v1/states/daily.csv"

    # read in data
    data = pd.read_csv(url)
    
        # drop row without testing data
    data = data.dropna(axis=0, subset=['negative'])
    
    return data

def fill_data_positive(data): 
    state = data.state.unique().tolist()
    table = pd.read_csv("state_testing_blank.csv")

    for s in state:        
        
        data_subset = data.loc[(data.state == s)]
        idx = table.index[(table["state"] == s)]
        if idx.tolist():
            print(s, " matched")
            for _, row in data_subset.iterrows():
                date = row.date
                if row.positive >= 0:
                    table.loc[table.index[idx], date] = row.positive
        else:
            print(s, "unmatched")
    table.to_csv("state_testing_positive.csv", index=False)
    
def fill_data_numbers(data):
    state = data.state.unique().tolist()
    table = pd.read_csv("state_testing_blank.csv")

    for s in state:        
        data_subset = data.loc[(data.state == s)]
        idx = table.index[(table["state"] == s)]
        if idx.tolist():
            print(s, " matched")
            for _, row in data_subset.iterrows():
                date = row.date
                if row.totalTestResults >= 0:
                    table.loc[table.index[idx], date] = row.totalTestResults
        else:
            print(s, "unmatched")
    table.to_csv("state_testing_numbers.csv", index=False)


if __name__ == '__main__':
    data = download_data()
    fill_data_positive(data)
    fill_data_numbers(data)


