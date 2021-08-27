import os
import pandas as pd
import regex as re
from google.cloud import bigquery
import pandas_gbq
import json
import time

'''
Destination table on Bigquery
Safegraph and 1P3A are stored in private dataset: safegraph and 1P3A
All other public datasets: public 

Source: https://github.com/GeoDaCenter/covid/tree/master/public/csv
If any data file's name/path is updated, please make change here accordingly.

Local: run `export GOOGLE_APPLICATION_CREDENTIALS="/path-to-credentials/credentials.json" ` 
       before running this script
'''


# Construct a BigQuery client object.
client = bigquery.Client()

dir_path = os.path.dirname(os.path.realpath(__file__)) # /path-to-repo/covid/data-scripts/bigquery
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..')) # /path-to-repo/covid/

print('dir_path: ', dir_path)
print('repo_root: ', repo_root)

def write_table_to_bq(table, project_id, dataset_id, columns_dic, id_col=False):
    '''
    Write table to bigquery and append columns to a dictionary
    '''
    table_id = dataset_id + '.' + table[:-4]
    input_file = os.path.join(repo_root, 'public/csv', table)
    print('writing: ', input_file)
    df = pd.read_csv(input_file).replace('suppressed',-9999)
    if id_col != False:
        df.columns = ['fips_code' if col == id_col else col for col in list(df.columns)]

    for col in df.columns:
        new_col = re.sub(r'\-',r' ', col)
        new_col = re.sub(r'\s+',r'_', new_col)
        new_col = re.sub(r'(\d{4})-(\d{2})-(\d{2})',r'_\1_\2_\3', new_col)
        if table != 'berkeley_predictions.csv': 
            new_col = re.sub(r'(\d{4})_(\d{2})_(\d{2})',r'_\1_\2_\3', new_col)
        df.rename(columns={col:new_col},inplace=True)

    columns_dic[table_id] = list(df.columns)

    pandas_gbq.to_gbq(df, table_id, 
                    project_id=project_id, 
                    if_exists='replace'
                    )

berkeley_predictions_lst = ['berkeley_predictions.csv']

chr_health_lst = ['chr_health_context.csv', 
                  'chr_health_context_state.csv',
                  'chr_health_factors.csv',
                  'chr_health_factors_state.csv',
                  'chr_life.csv',
                  'chr_life_state.csv'
                    ]

context_lst = ['context_essential_workers_acs.csv',
                'context_fqhc_clinics_hrsa.csv',
                'context_hospitals_covidcaremap.csv',
                'context_vaccination_sites_hrsa_wh.csv'
                ]

covid_confirmed_lst = ['covid_confirmed_cdc.csv', 'covid_confirmed_cdc_state.csv',
                       'covid_confirmed_nyt.csv', 'covid_confirmed_nyt_state.csv',
                       'covid_confirmed_usafacts.csv', 'covid_confirmed_usafacts_h.csv', 'covid_confirmed_usafacts_state.csv'
                       ]

covid_deaths_lst = ['covid_deaths_cdc.csv', 'covid_deaths_cdc_state.csv',
                    'covid_deaths_nyt.csv', 'covid_deaths_nyt_state.csv',
                    'covid_deaths_usafacts.csv', 'covid_deaths_usafacts_h.csv', 'covid_deaths_usafacts_state.csv'
                    ]


covid_testing_lst = ['covid_ccpt_cdc.csv', 'covid_ccpt_cdc_state.csv', 
                     'covid_tcap_cdc.csv', 'covid_tcap_cdc_state.csv',
                     'covid_testing_cdc.csv', 'covid_testing_cdc_state.csv',
                     'covid_wk_pos_cdc.csv', 'covid_wk_pos_cdc_state.csv'
                    ]

covid_vaccination_lst = ['vaccination_fully_vaccinated_cdc.csv',
                         'vaccination_fully_vaccinated_cdc_h.csv',
                         'vaccination_fully_vaccinated_cdc_state.csv',
                         'vaccination_one_or_more_doses_cdc.csv', 
                         'vaccination_one_or_more_doses_cdc_h.csv', 
                         'vaccination_one_or_more_doses_cdc_state.csv', 
                         'vaccination_to_be_distributed_cdc.csv',
                         'vaccination_to_be_distributed_cdc_state.csv',
                         'vaccine_fully_vaccinated_cdc.csv',
                         'vaccine_fully_vaccinated_cdc_h.csv'
                         ]

_1P3A_lst = ['covid_confirmed_1p3a.csv', 'covid_confirmed_1p3a_state.csv',
             'covid_deaths_1p3a.csv', 'covid_deaths_1p3a_state.csv']


safegraph_lst = ['mobility_fulltime_workdays_safegraph.csv', 
                 'mobility_home_workdays_safegraph.csv',
                 'mobility_parttime_workdays_safegraph.csv']

id_col_dict = {
    'berkeley_predictions.csv':'fips',
    'chr_health_context.csv':'FIPS', 
    'chr_health_context_state.csv':'FIPS',
    'chr_health_factors.csv':'FIPS',
    'chr_health_factors_state.csv':'FIPS',
    'chr_life.csv':'FIPS',
    'chr_life_state.csv':'FIPS',
    'context_essential_workers_acs.csv':'fips',
    'context_fqhc_clinics_hrsa.csv':False,
    'context_hospitals_covidcaremap.csv':False,
    'context_vaccination_sites_hrsa_wh.csv':False,
    'covid_confirmed_cdc.csv':'fips_code', 
    'covid_confirmed_cdc_state.csv':'fips_code',
    'covid_confirmed_nyt.csv':'fips', 
    'covid_confirmed_nyt_state.csv':'fips',
    'covid_confirmed_usafacts.csv':'countyFIPS', 
    'covid_confirmed_usafacts_h.csv':'countyFIPS', 
    'covid_confirmed_usafacts_state.csv':'stateFIPS',
    'covid_deaths_cdc.csv':'fips_code', 
    'covid_deaths_cdc_state.csv':'fips_code',
    'covid_deaths_nyt.csv':'fips', 
    'covid_deaths_nyt_state.csv':'fips',
    'covid_deaths_usafacts.csv':'countyFIPS', 
    'covid_deaths_usafacts_h.csv':'countyFIPS', 
    'covid_deaths_usafacts_state.csv':'stateFIPS',
    'covid_ccpt_cdc.csv':'state_fips',
    'covid_ccpt_cdc_state.csv':'fips_code', 
    'covid_tcap_cdc.csv':'fips_code', 
    'covid_tcap_cdc_state.csv':'state_fips',
    'covid_testing_cdc.csv':'fips_code', 
    'covid_testing_cdc_state.csv':'state_fips',
    'covid_wk_pos_cdc.csv':'fips_code', 
    'covid_wk_pos_cdc_state.csv':'state_fips',
    'vaccination_fully_vaccinated_cdc.csv':'fips',
    'vaccination_fully_vaccinated_cdc_h.csv':'fips',
    'vaccination_fully_vaccinated_cdc_state.csv':'fips',
    'vaccination_one_or_more_doses_cdc.csv':'fips', 
    'vaccination_one_or_more_doses_cdc_h.csv':'fips', 
    'vaccination_one_or_more_doses_cdc_state.csv':'fips', 
    'vaccination_to_be_distributed_cdc.csv':'fips',
    'vaccination_to_be_distributed_cdc_state.csv':'fips',
    'vaccine_fully_vaccinated_cdc.csv':'fips',
    'vaccine_fully_vaccinated_cdc_h.csv':'fips',
    'covid_confirmed_1p3a.csv':'GEOID',
    'covid_confirmed_1p3a_state.csv':'GEOID',
    'covid_deaths_1p3a.csv':'GEOID', 
    'covid_deaths_1p3a_state.csv':'GEOID',
    'mobility_fulltime_workdays_safegraph.csv':'county', 
    'mobility_home_workdays_safegraph.csv':'county', 
    'mobility_parttime_workdays_safegraph.csv':'county'
}

if __name__ == "__main__":

    t0 = time.time()

    project_id = 'covid-atlas'

    with open(os.path.join(repo_root,'functions/meta/columns.json')) as json_file:
        columns_dic = json.load(json_file)

    #chr_health_lst and context_lst are static data, would not be updated daily
    public_lst = berkeley_predictions_lst \
                + covid_confirmed_lst + covid_deaths_lst \
                + covid_testing_lst + covid_vaccination_lst

    for table in public_lst:
        dataset_id = 'public'
        write_table_to_bq(table, project_id, dataset_id, columns_dic, id_col_dict[table])

    for table in _1P3A_lst:
        dataset_id = '1P3A'
        write_table_to_bq(table, project_id, dataset_id, columns_dic, id_col_dict[table])

    for table in safegraph_lst:
        dataset_id = 'safegraph'
        write_table_to_bq(table, project_id, dataset_id, columns_dic, id_col_dict[table])

    with open(os.path.join(repo_root,'functions/meta/columns.json'), 'w') as write_file:
        json.dump(columns_dic, write_file, indent=4)

    print('Updating all data costs: ', time.time() - t0)