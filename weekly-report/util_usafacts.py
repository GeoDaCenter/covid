
import json
from datetime import datetime,timedelta
import pandas as pd
import numpy as np
import re
import pytz
# from jinja2 import Environment, FileSystemLoader
import geopandas
import pygeoda
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..'))

##### Generate HTML #####


def generate_tables(output):

	'''Generate HTML table strings and save the tables locally'''

	date_list = get_date()

	html_var = {}


	i = 0
	for k, v in output.items():

		df = pd.DataFrame(v)
		df = df.sort_values(by="average", ascending=False)
		if not df.empty:
			with open(os.path.join(repo_root, 'weekly-report/number_county.json')) as f:
				number_county = json.load(f)
			df_pivot = pd.pivot_table(df, index=["state_name"], values=["GEOID"],
								aggfunc=[np.count_nonzero], fill_value=0)
			df_pivot = df_pivot.count_nonzero
			df_pivot["percentage"] = df_pivot["GEOID"]/df_pivot.index.map(number_county)
			df_pivot = df_pivot.sort_values(by="GEOID", ascending=False)
			df_pivot = df_pivot.rename(columns={"GEOID": "number of county"})
			df_pivot['percentage'] = pd.Series(["{0:.2f}%".format(val * 100) for val in df_pivot['percentage']], index = df_pivot.index)
		else:
			df_pivot = pd.DataFrame()
		html_var["subtitle_{}".format(i+1)] = k
		html_var["full_{}".format(i+1)] = df.to_html()
		html_var["pivot_{}".format(i+1)] = df_pivot.to_html()

		df.to_csv(os.path.join(repo_root, f'weekly-report/csvs/full_data_{k}.csv'))
		df_pivot.to_csv(os.path.join(repo_root, f'weekly-report/csvs/pivot_data_{k}.csv'))

		i += 1

	template_vars = {"title" : "Weekly Summary of {} - {}".format(date_list[-1], date_list[0])}
	template_vars.update(html_var)

	return template_vars



# def generate_html(template_vars):

# 	'''Generate HTML page'''

# 	env = Environment(loader=FileSystemLoader('.'))
# 	template = env.get_template("report_template.html")
# 	html_out = template.render(template_vars)

# 	html_file = open('report.html', 'w')
# 	html_file.write(html_out)
# 	html_file.close()


##### Helper Functions #####



def get_date(ndays = 7, date = None):

	'''Get list of dates for n previous days'''

	if not date:
		yesterday = datetime.today()+ timedelta(days=-1)
	else:
		yesterday = datetime.strptime(date, "%Y-%m-%d")
	date = [(yesterday + timedelta(days=-x)).strftime("%Y-%m-%d") for x in range(0,ndays)]
	return date


def rolling_average(gdf, fourteen_dates , seven_dates, adjusted_population):

	'''Calculate 7-day rolling average'''
	df = pd.DataFrame(gdf.loc[:,fourteen_dates+["GEOID"]].set_index("GEOID"))
	new_df = df.diff(periods=-7, axis=1).iloc[:,:-7].div(7)
	# new_df = df.rolling(window=7, axis=1).mean().shift(-6,axis=1).dropna(1).reset_index()
	new_df = pd.merge(new_df, gdf.loc[:,["GEOID", "population", "geometry", "NAME", "state_name", 
		"state_abbr"]], on = "GEOID")
	if not adjusted_population:
		new_df["average"] = new_df.loc[:, seven_dates].mean(axis=1).round(3)
		return new_df
	for day in seven_dates:
		new_df.loc[:,day] = new_df.loc[:,day]/new_df['population']
	new_df["average"] = new_df.loc[:, seven_dates].mean(axis=1)*100000
	new_df['average'] = new_df['average'].round(3)
	new_df['geometry'] = gdf['geometry']
	return new_df



def rolling_sum(gdf, fourteen_dates , seven_dates, adjusted_population):

	'''Calculate 7-day rolling sum'''

	# df = gdf.loc[:,fourteen_dates+["GEOID"]].set_index("GEOID")
	# new_df = df.rolling(window=7, axis=1).sum().shift(-6,axis=1).dropna(1).reset_index()
	# new_df = pd.merge(new_df, gdf.loc[:,["GEOID", "population", "geometry", "NAME", "state_name", 
	# 	"state_abbr"]], left_on = "GEOID", right_on = "GEOID")

	new_df = gdf.loc[:,["GEOID"]+seven_dates+["population", "geometry", "NAME", "state_name", 
		"state_abbr"]].set_index("GEOID").reset_index()

	if not adjusted_population:
		new_df["average"] = new_df.loc[:, seven_dates].mean(axis=1)
		return new_df

	for day in seven_dates:
		new_df.loc[:,day] = new_df.loc[:,day]/new_df['population']
	new_df["average"] = new_df.loc[:, seven_dates].mean(axis=1)
	new_df['geometry'] = gdf['geometry']

	return new_df


def calculate_lisa(lisa_dic, k, seven_dates):
	'''Calculate lisa'''
	
	gdf = geopandas.GeoDataFrame(lisa_dic[k])
	w = pygeoda.queen_weights(pygeoda.open(gdf))
	
	for i, col in enumerate(seven_dates):
		gdf[col] = pygeoda.local_moran(w, gdf[col])
	dic = gdf.to_dict(orient="records")
	dic = {"type": k, "source": "USAFacts", "features": dic}
	lisa_dic[k] = dic
	print(k + " updated!")



def get_high_high_county(data, date_list):

	'''Return counties having high-high indicators in all days'''

	output = []
	info = ["GEOID", "NAME", "state_name", "state_abbr", "confirmed_count", "death_count", "average"]

	for county in data["features"]:
		if all([county[x] == 1 for x in date_list if x in county]):
			dic = {k:v for k,v in county.items() if k in info}
			output.append(dic)
	return output


def get_number_of_county():
	gdf = geopandas.read_file(os.path.join(repo_root, 'public/geojson/county_usfacts.geojson'))
	count = gdf.groupby("state_name")["GEOID"].count().to_dict()
	with open(os.path.join(repo_root, 'weekly-report/number_county.json'), 'w') as fp:
		json.dump(count, fp)
	return



def get_month_day():
    month = str(datetime.now(pytz.timezone('US/Central')).month)
    day   = str(datetime.now(pytz.timezone('US/Central')).day).zfill(2)
    return month + '.' + day



def rename_column_usafacts(colnames):
	for i, n in enumerate(colnames):
		if re.match('^[0-9]+', n):
			n  = datetime.strptime(n, '%m/%d/%y').strftime('%Y-%m-%d')
			colnames[i] = n
	return colnames


def check_latest_date(df):
	latest_update = df.columns[-1]
	yesterday = (datetime.today()+ timedelta(days=-1)).strftime("%Y-%m-%d")
	if latest_update == yesterday:
		return None
	else:
		return latest_update


