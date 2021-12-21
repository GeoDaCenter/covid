# %%
import boto3
import os
import shutil

AWS_ACCESS_KEY_ID = os.getenv('S3_DEPLOYER_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('S3_DEPLOYER_KEY')
covid_bucket = os.getenv('S3_BUCKET')

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))
# %%

def upload_folder(pathToFolder, subfolder, s3, bucket):
    print(f'Upload folder {pathToFolder} to S3 bucket {bucket} with subfolder {subfolder}')
    for filename in os.listdir(pathToFolder):
        write_to_s3(filename, s3, bucket, subfolder, pathToFolder)

def write_to_s3(filename, s3, bucket, subfolder, pathToFolder):
    try:
        print(f'Writing {filename} to S3...')
        s3.meta.client.upload_file(os.path.join(pathToFolder, filename), bucket, f'{subfolder}/{filename}')
        print('Write to S3 complete.')

    except Exception as e:
        print(e)
# %%
def zipAndUpload(folder, s3, bucket, format='zip'):
    shutil.make_archive(os.path.join(repo_root, 'tmp', f'{folder["subfolder"]}'), format, folder['path'])
    write_to_s3(f'{folder["subfolder"]}.{format}', s3, bucket, format, )
    os.remove(os.path.join(repo_root, os.path.join(repo_root, 'tmp', f'{folder["subfolder"]}.{format}')))
#%%
if __name__ == '__main__':

    client = boto3.resource('s3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
    s3 = client.Bucket(covid_bucket)

    foldersToUpload = [
        {
            'path': os.path.join(repo_root, 'public', 'csv'),
            'subfolder': 'csv'
        },
        {
            'path': os.path.join(repo_root, 'public', 'pbf'),
            'subfolder': 'pbf'
        },
        {
            'path': os.path.join(repo_root, 'public', 'geojson'),
            'subfolder': 'geojson'
        }
    ]

    for folder in foldersToUpload:
        ## Individual files
        upload_folder(folder['path'], folder['subfolder'], s3, covid_bucket)
        # Zip!
        zipAndUpload(folder, s3, covid_bucket)
# %%
