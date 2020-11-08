
import json
from datetime import datetime,timedelta
import pandas as pd
import numpy as np

from jinja2 import Environment, FileSystemLoader


def generate_tables():

	dataset = ['lisa_county_confirmed_1P3A.json',
				'lisa_county_death_usafacts.json',
				'lisa_state_death_1P3A.json',
				'lisa_county_death_1P3A.json',
				'lisa_county_confirmed_usafacts.json',
				'lisa_state_confirmed_1P3A.json']


	date_list = get_date()
	output = get_lisa_data(dataset)

	html_var = {}

	for i, d in enumerate(dataset):

		df = pd.DataFrame(output[d])
		if not df.empty:
			df_pivot = pd.pivot_table(df, index=["state_name"], values=["GEOID"],
								aggfunc=[np.count_nonzero], fill_value=0)
			df_pivot = df_pivot.count_nonzero
			df_pivot = df_pivot.sort_values(by="GEOID", ascending=False)
		else:
			df_pivot = pd.DataFrame()
		html_var["subtitle_{}".format(i+1)] = d
		html_var["full_{}".format(i+1)] = df.to_html()
		html_var["pivot_{}".format(i+1)] = df_pivot.to_html()

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



def get_lisa_data(dataset):

	date_list = get_date()

	final_output = {}

	for file in dataset:
		path = "data/" + file
		name = file

		with open(path) as f:
			data = json.load(f)

		final_output[name] = get_high_high_county(data, date_list)
	return final_output



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


if __name__ == '__main__':
	template_vars = generate_tables()
	generate_html(template_vars)
