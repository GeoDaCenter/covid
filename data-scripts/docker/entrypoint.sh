
export GIT_SSH_COMMAND="ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"
git config --global user.email "spatial@uchicago.edu"
git config --global user.name "COVID Data Bot"

git clone git@github.com:GeoDaCenter/covid.git && cd covid
git checkout master

case $DATA_SOURCE in

	berkeley_predictions)
		export COMMAND_DATA="python data-scripts/berkeley_predictions/berkeley_predictions.py"
		;;

	usafacts)
	  export COMMAND_DATA="python data-scripts/usafacts/usafacts.py"
		;;

	1p3a)
		export COMMAND_DATA="python data-scripts/_1p3a/_1p3a.py"
		;;

	lisa)
		export COMMAND_CALC="python data-scripts/lisa/update_lisa_json.py"
		;;

esac

if $COMMAND_DATA;
		then git add . && git commit -m "Updated: `date +'%Y-%m-%d %H:%M:%S'`"&& git push;
elif $COMMAND_CALC;
		then exit 0;
else
	echo "$DATA_SOURCE script failed."
	exit 1;
fi
