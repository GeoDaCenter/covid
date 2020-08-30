
import pandas as pd
import us
from datetime import datetime, timedelta

def update_date():
	table = pd.read_csv("county_hist.csv")
	last_day = table.columns.tolist()[-1]
	today = datetime.now()
	yesterday = today - timedelta(days=1)
	yesterday = yesterday.strftime('%Y-%m-%d')
	dates =[d.strftime('%Y-%m-%d') for d in pd.date_range(start=last_day,end=today)][1:]
	if dates:
		for d in dates:
			table[d] = 0
		pass
	else:
		print("Already Updated!")
		pass



############ Go! ############

if __name__ == '__main__':
	update_date()