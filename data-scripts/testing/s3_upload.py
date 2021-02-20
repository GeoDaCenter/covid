import os
import boto3

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))
s3 = boto3.resource('s3')


def upload_files(files):
    for file_ in files_to_upload:
        write_to_s3(file_)


def write_to_s3(filename):
    try:
        print('Writing {} to S3...'.format(filename))
        s3.Object('geoda-covid-atlas', filename).put(Body=open(os.path.join('/tmp/covid/public/csv', filename), 'rb'))
        print('Write to S3 complete.')

    except Exception as e:
        print(e)

if __name__ == '__main__':

    files_to_upload = [
                       # 'covid_tcap_1p3a_state.csv', 
                       # 'covid_wk_pos_1p3a_state.csv',
                       # 'covid_testing_1p3a_state.csv',
                       # 'covid_ccpt_1p3a_state.csv'，
                       'covid_tcap_usafacts_state.csv',
                       'covid_wk_pos_usafacts_state.csv',
                       'covid_testing_usafacts_state.csv',
                       'covid_ccpt_usafacts_state.csv']

    upload_files(files_to_upload)
