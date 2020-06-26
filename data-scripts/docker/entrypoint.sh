
export GIT_SSH_COMMAND="ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"

git clone git@github.com:GeoDaCenter/covid.git && cd covid
git checkout etl_test

case $DATA_SOURCE in

	berkeley_predictions)
		python data-scripts/berkeley_predictions/berkeley_predictions.py
		;;

esac

git push --dry-run
