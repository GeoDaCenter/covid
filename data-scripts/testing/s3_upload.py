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
        s3.Object('geoda-covid-atlas', filename).put(Body=open(os.path.join(dir_path, filename), 'rb'))
        print('Write to S3 complete.')

    except Exception as e:
        print(e)

if __name__ == '__main__':

    files_to_upload = ['state_testing.csv', 'state_testing_posrate.csv', 'county_hist.csv', 'county_positivity.csv']

    upload_files(files_to_upload)
