""" Problem: 
* Turn cases.csv into wide format
467,2020-03-10,WA,Island,1,0
702,2020-03-12,WA,Island,2,0
958,2020-03-13,WA,Island,3,0
1677,2020-03-16,WA,Island,1,0
2015,2020-03-17,WA,Island,7,0
2445,2020-03-18,WA,Island,2,0

County, State, 2020-03-10, 2020-03-11, 2020-03-12, 2020-03-13, 2020-03-14, 2020-03-15, 2020-03-16, 2020-03-17, 2020-03-18
Island, WA, 1, 1, 3, 6, 6, 6, 7, 14, 16

* Log County & State Pages & Generate Wide Data Format
** Scrape data
** append to log:  Island, WA, 2020-03-16, 1, 0
** log_to_wide()

* generate Valid tags
* Write cases_wide.csv
* Write cases_valid.cs

"""
import local_scrapers as lsc
import time
import pandas as pd

CASES_FROM_1P3A = "../../data/cases.csv"
STATE_LOGS = "../../data/state_logs.csv"
VALIDATION_OUT = "../../data/validation.csv"
LOCAL_PAGES = {"WI": "", "IL": "", "RI": ""}
SCRAPER_MAP = {
    "WI": lsc.WI_scraper,
    "IL": lsc.IL_scraper,
    "RI": lsc.RI_scraper,
}


def get_wide_df_from_cases():
    """ use CASES_FROM_1P3A"""
    wide = pd.DataFrame()
    return wide


def get_wide_df_from_local():
    """ use CASES_FROM_1P3A"""
    wide = pd.DataFrame()
    return wide


def log_states(state, scraper):
    """
    * get date
    * get data
    * for country in data:
         append county, state, date, data
    """


def do_validation(ip3a_cases, local_cases):
    """
    * make sure we have matching columns - add dates if we need to 
    * write (ip3a_cases - local_cases == 0).to_csv() to VALIDATION_OUT
    """
    pass


def main():
    while True:
        ip3a_cases = get_wide_df_from_cases()
        for state, scraper in SCRAPER_MAP:
            log_states(state, scraper)
        local_cases = get_wide_df_from_local()
        do_validation(ip3a_cases, local_cases)

        time.sleep(3600)


if __name__ == "__main__":
    main()
