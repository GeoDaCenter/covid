#!bin/bash
export GIT_SSH_COMMAND="ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"
git config --global user.email "theuscovidatlas@gmail.com"
git config --global user.name "theuscovidatlas"

cd /tmp/covid/data-scripts/testing

python ./states_update_testing.py

# Rscript ./states_process_testing_usafacts.R
Rscript ./states_process_testing_1p3a.R


python ./s3_upload.py

cd /tmp/covid

git add ./public/csv/covid_ccpt_1p3a_state.csv \
        ./public/csv/covid_tcap_1p3a_state.csv \
        ./public/csv/covid_wk_pos_1p3a_state.csv \
        ./public/csv/covid_testing_1p3a_state.csv
# git add ./public/csv/covid_ccpt_usafacts_state.csv \
#         ./public/csv/covid_tcap_usafacts_state.csv \
#         ./public/csv/covid_wk_pos_usafacts_state.csv \
#         ./public/csv/covid_testing_usafacts_state.csv

git commit -m"Updated: `date +'%Y-%m-%d %H:%M:%S'`"&& git push
# python s3_upload.py
