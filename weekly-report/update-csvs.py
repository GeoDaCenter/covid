import fiona
import geopandas as gpd
import pandas as pd
import pygeoda
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..'))

csvFilePath = 'public/csv/covid_confirmed_usafacts.csv'
stateCountyNumbers = pd.read_csv(os.path.join(repo_root, 'weekly-report/csvs/state-abbr.csv')) \
	.merge(pd.read_csv(os.path.join(repo_root, 'weekly-report/csvs/county-num.csv')), on="state_name")


def getDataFromPeriod(filePath, days, normalized):
	df = pd.read_csv(os.path.join(repo_root, filePath))
	dates = list(df.columns)[-days:]
	df = df[['countyFIPS','County Name','State'] + dates]
	gdf = gpd.read_file(os.path.join(repo_root, 'public/geojson/county_usfacts.geojson'))
	gdf = gdf.merge(df, left_on="GEOID", right_on="countyFIPS")
	gdf['average'] = (gdf[dates[-1]] - gdf[dates[0]]) / days
	if normalized:
		gdf['average'] = (gdf['average']/gdf['population']) * 100000
	gdf['average'] = gdf['average'].round(2)
	return gdf

def calculateLisa(gdf):
	'''Calculate lisa'''
	w = pygeoda.queen_weights(pygeoda.open(gdf))
	gdf['lisa'] = pygeoda.local_moran(w, gdf['average']).lisa_clusters()
	return gdf

def getHighHighPct(gdf, stateCountyNumbers):
	summarized = gdf.groupby('State').count() \
		.reset_index()[['State', 'lisa']]
	merged = summarized.merge(stateCountyNumbers, left_on="State", right_on="state_abbr")
	merged['percentage'] = (merged['lisa']/merged['counties'])*100
	merged['percentage'] = merged['percentage'].round(2)
	merged = merged[['state_name','counties','percentage']]
	merged.columns = ['state_name','number of county','percentage']
	return merged

periodsToCalculate = [
	{
		'name': 'emerging_hotspot',
		'days':7,
		'normalized': False,
	},
	{
		'name': 'emerging_hotspot_adjusted',
		'days':7,
		'normalized': True,
	},
	{
		'name': 'stable_hotspot',
		'days':14,
		'normalized': False,
	},
	{
		'name': 'stable_hotspot_adjusted',
		'days':14,
		'normalized': True,
	}
]

if __name__ == '__main__':
	print(pygeoda.__version__)
	for config in periodsToCalculate:
		data = getDataFromPeriod(csvFilePath, config['days'], config['normalized'])
		lisaGdf = calculateLisa(data)
		
		highHigh = lisaGdf[lisaGdf.lisa == 1]
		
		highHighExtract = highHigh[['countyFIPS','County Name','State','average']]
		highHighExtract = highHighExtract.merge(stateCountyNumbers[['state_abbr','state_name']], left_on="State", right_on="state_abbr").drop(columns=['State'])
		highHighExtract.columns = ['GEOID','NAME','average','state_abbr','state_name']
		highHighExtract.to_csv(os.path.join(repo_root, f'weekly-report/csvs/full_data_{config["name"]}.csv'), index=False)
		
		summary = getHighHighPct(highHigh, stateCountyNumbers)
		summary.to_csv(os.path.join(repo_root, f'weekly-report/csvs/pivot_data_{config["name"]}.csv'), index=False)