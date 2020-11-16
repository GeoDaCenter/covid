
import json
from datetime import datetime,timedelta
import pandas as pd
import numpy as np
import re
import pytz
from jinja2 import Environment, FileSystemLoader


##### Generate HTML #####


def generate_tables(output):


	date_list = get_date()

	html_var = {}

	i = 0
	for k, v in output.items():

		df = pd.DataFrame(v)
		if not df.empty:
			df_pivot = pd.pivot_table(df, index=["state_name"], values=["GEOID"],
								aggfunc=[np.count_nonzero], fill_value=0)
			df_pivot = df_pivot.count_nonzero
			df_pivot = df_pivot.sort_values(by="GEOID", ascending=False)
		else:
			df_pivot = pd.DataFrame()
		html_var["subtitle_{}".format(i+1)] = k
		html_var["full_{}".format(i+1)] = df.to_html()
		html_var["pivot_{}".format(i+1)] = df_pivot.to_html()
		i += 1

	template_vars = {"title" : "Weekly Summary of {} - {}".format(date_list[-1], date_list[0])}
	template_vars.update(html_var)

	return template_vars



def generate_html(template_vars):

	env = Environment(loader=FileSystemLoader('.'))
	template = env.get_template("report_template.html")
	html_out = template.render(template_vars)

	html_file = open('report.html', 'w')
	html_file.write(html_out)
	html_file.close()


##### Helper Functions #####


def rename_column_usafacts(colnames):

	for i, n in enumerate(colnames):
		if re.match('^[0-9]+', n):
			n  = datetime.strptime(n, '%m/%d/%y').strftime('%Y-%m-%d')
			colnames[i] = n
	return colnames



def get_date(ndays = 8):

	yesterday = datetime.today()+ timedelta(days=-1)
	return [(yesterday + timedelta(days=-x)).strftime("%Y-%m-%d") for x in range(0,ndays)]



def get_high_high_county(data, date_list):

	output = []
	info = ["GEOID", "NAME", "state_name", "state_abbr", "confirmed_count", "death_count"]

	for county in data["features"]:
		if all([county[x] == 1 for x in date_list if x in county]):
			dic = {k:v for k,v in county.items() if k in info}
			output.append(dic)
	return output



def get_month_day():
    month = str(datetime.now(pytz.timezone('US/Central')).month)
    day   = str(datetime.now(pytz.timezone('US/Central')).day).zfill(2)

    return month + '.' + day
