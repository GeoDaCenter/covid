import urllib.request, json 
import pandas as pd



def scrap_data():
	'''
	Scrap health center data from HRSA using center and radius from search_list

	'''

	search_param = pd.read_csv("search_list.csv")
	clinic = {}
	i = 0

	radius = {
	15.625: 15,
	31.25: 30,
	62.5: 50,
	125.0: 125,
	250.0: 250
	}

	key_dict = {
	"Id": "id",
	"Shape": "location", 
	"CtrNm": "name",
	"CtrStateAbbr": "st_abbr",
	"CountyNm": "county",
	"CtrCity": "city", 
	"CtrAddress": "address",
	"CtrPhoneNum": "phone",
	"Covid19TestStatus": "testing_status"
	}

	for idx, row in search_param.iterrows():
		lon = row.lon
		lat = row.lat
		r = radius[row.radius]

		with urllib.request.urlopen("https://findahealthcenter.hrsa.gov//healthcenters/find?lon={}&lat={}&radius={}".format(lon, lat, r)) as url:
			data = json.loads(url.read().decode())

		for d in data:
			if d["Id"] not in clinic.keys():
				value = {key_dict[k]:d[k] for k in key_dict.keys()}
				clinic[d["Id"]] = value
		i += 1
		print(i, round(lon,2), round(lat,2), len(data))
		if len(data) == 500:
			print("		####### EXCEED MAXIMUM ######	")
	return clinic


def save_data(clinic):
	with open('health_center.json', 'w') as fp:
		json.dump(clinic, fp)


if __name__ == '__main__':
	clinic = scrap_data()
	save_data(clinic)


