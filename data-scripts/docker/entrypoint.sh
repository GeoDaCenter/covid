
export GIT_SSH_COMMAND="ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"
git config --global user.email "spatial@uchicago.edu"
git config --global user.name "COVID Data Bot"

git clone git@github.com:GeoDaCenter/covid.git && cd covid
git checkout etl_test

case $DATA_SOURCE in

	berkeley_predictions)
		python data-scripts/berkeley_predictions/berkeley_predictions.py
		;;

esac

git add . && git commit -m "Updated: `date +'%Y-%m-%d %H:%M:%S'`"
git push --dry-run
