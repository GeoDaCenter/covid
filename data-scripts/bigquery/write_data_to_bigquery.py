from google.cloud import bigquery
import pandas as pd
import pandas_gbq

# Construct a BigQuery client object.
client = bigquery.Client()


'''
TODO: 
- Probably we could import this module when scraping data to dataframes so no csv write/read time
- All data could be stored in county level--can be group by state fips code in SQL (example code needed)
- Probably we could unify the column name of fips_code (not necessary because we may have to change frontend code too?)
- The path of local table needs no be specified in future (now this script runs in the same directory of data)

'''

 
def write_table_to_bq(input_file, project_id, dataset_id):
    table_id = dataset_id + '.' + input_file[:-4]
    df = pd.read_csv(input_file)

    # CDC column name
    if 'fips_code' in df.columns:
        var = 'fips_code'

    # NYT column name
    elif 'fips' in df.columns:
        var = 'fips'

    # USAFacts column name
    elif 'countyFIPS' in df.columns:
        var = 'countyFIPS'
        df = df.drop(labels=['County Name','State','StateFIPS'],axis='columns')

    # 1P3A column name (only for county)
    elif 'GEOID' in df.columns:
        var = 'GEOID'
        df = df.drop(labels=['STATEFP','COUNTYFP','COUNTYNS','AFFGEOID','NAME','LSAD'],
                    axis='columns')

    # Safegraph column name
    elif 'county' in df.columns:
        var = 'county'

    df = df.melt(id_vars=[var],value_name='count')

    # TODO: we could also rename all fips code with one same name
    df.columns = [var, 'date', 'count']
    # df['date'] = pd.to_datetime(df['date'])
    pandas_gbq.to_gbq(df, table_id, 
                    project_id=project_id, 
                    if_exists='replace',
                    table_schema=[{'name':var, 'type':'INT64'},
                                  {'name':'date', 'type':'DATE'},
                                  {'name':'count', 'type':'FLOAT64'}]
                    )

# County level data (except for vaccination)

# from covid/data-scripts/cdc/getCdcCountyData.py & getCdcVaccinationData.py
# All data are 7 day rolling average 
CDC_county_lst = ['covid_confirmed_cdc.csv', 'covid_deaths_cdc.csv']

CDC_testing_lst = ['covid_testing_cdc.csv','covid_wk_pos_cdc.csv', 
                    'covid_ccpt_cdc.csv','covid_tcap_cdc.csv']

CDC_vaccination_lst = ['vaccination_fully_vaccinated_cdc.csv',
                            'vaccination_one_or_more_doses_cdc.csv', 
                            'vaccination_to_be_distributed_cdc_state.csv',
                            'vaccination_one_or_more_doses_cdc_state.csv',
                            'vaccination_fully_vaccinated_cdc_state.csv']

# from covid/data-scripts/cdc/_1P3A.py
_1P3A_county_lst = ['covid_deaths_1p3a.csv', 'covid_confirmed_1p3a.csv']

# from covid/data-scripts/usafacts/_1P3A.py
USAFacts_county_lst = ['covid_confirmed_usafacts.csv', 'covid_deaths_usafacts.csv']


# from covid/data-scripts/nyt/nyt.py 
NYT_county_lst = ['covid_confirmed_nyt.csv', 'covid_deaths_nyt.csv']

# from covid/data-scripts/safegraph/parseSafegraphSocialDistancing.py
safegraph_lst = ['mobility_fulltime_workdays_safegraph.csv', 
                 'mobility_home_workdays_safegraph.csv',
                 'mobility_parttime_workdays_safegraph.csv']


if __name__ == "__main__":

    public_lst = CDC_county_lst + CDC_testing_lst + CDC_vaccination_lst \
                + USAFacts_county_lst + NYT_county_lst 

    project_id = 'covid-atlas'

    for table in public_lst:
        # TODO: USE THE CORRECT PATH OF CSV FILES
        print('writing: ', table)
        input_file = table
        dataset_id = 'covid_atlas_test'
        write_table_to_bq(input_file, project_id, dataset_id)

    for table in _1P3A_county_lst:
        print('writing: ', table)
        dataset_id = '1P3A'
        input_file = table 
        write_table_to_bq(input_file, project_id, dataset_id)

    for table in safegraph_lst:
        print('writing: ', table)
        dataset_id = 'safegraph'
        input_file = table 
        write_table_to_bq(input_file, project_id, dataset_id)