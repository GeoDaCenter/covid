import pandas as pd
from glob import glob
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def parseSG():
    dailyStats = pd.read_csv(os.path.join(repo_root, 'data-scripts/safegraph/fullData2021-04-05.csv')) # just COVID dates

    dailyStats['pct_home'] = round(dailyStats['completely_home_device_count']/dailyStats['device_count'],4)
    dailyStats['pct_fulltime'] = round(dailyStats['full_time_work_behavior_devices']/dailyStats['device_count'],4)
    dailyStats['pct_parttime'] = round(dailyStats['part_time_work_behavior_devices']/dailyStats['device_count'],4)

    pct_home_daily = dailyStats[['county','date','pct_home']].pivot_table(index='county', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    pct_home_daily.columns = [columns[0] for columns in pct_home_daily.columns]
    pct_fulltime_daily = dailyStats[['county','date','pct_fulltime']].pivot_table(index='county', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    pct_fulltime_daily.columns = [columns[0] for columns in pct_fulltime_daily.columns]
    pct_parttime_daily = dailyStats[['county','date','pct_parttime']].pivot_table(index='county', columns='date').swaplevel(0, 1, 1).sort_index(1).reset_index()
    pct_parttime_daily.columns = [columns[0] for columns in pct_parttime_daily.columns]

    # list of holidays based on OPM + reasonable extensions (Xmas Eve, NYE)
    # See https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/#url=2021
    holidays = [ 
        '2020-01-01',
        '2020-01-20',
        '2020-02-12',
        '2020-02-17',
        '2020-03-02',
        '2020-03-25',
        '2020-07-03',
        '2020-09-07',
        '2020-10-12',
        '2020-11-03',
        '2020-11-26',
        '2020-12-24',
        '2020-12-25',
        '2020-12-31',
        '2021-01-01',
        '2021-01-18',
        '2021-01-20',
        '2021-02-15',
        '2021-05-31'
    ]

    goodCols = ["county"]

    for column in pct_home_daily.columns:
        if (column[0:4] == '2020' or column[0:4] == '2021') and column not in holidays:
            goodCols.append(column)

    tempPartTime = (pct_parttime_daily[goodCols]*100).round(0).fillna(0).astype(int)
    tempPartTime['county'] = pct_parttime_daily['county']
    tempPartTime.to_csv(os.path.join(repo_root, "public/csv/mobility_parttime_workdays_safegraph.csv"), index=False)

    tempfulltime = (pct_fulltime_daily[goodCols]*100).round(0).fillna(0).astype(int)
    tempfulltime['county'] = pct_fulltime_daily['county']
    tempfulltime.to_csv(os.path.join(repo_root, "public/csv/mobility_fulltime_workdays_safegraph.csv"), index=False)

    temphome = (pct_home_daily[goodCols]*100).round(0).fillna(0).astype(int)
    temphome['county'] = pct_home_daily['county']
    temphome.to_csv(os.path.join(repo_root, "public/csv/mobility_home_workdays_safegraph.csv"), index=False)

if __name__ == "__main__":
    parseSG()