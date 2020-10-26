import urllib.request, json 
import pandas as pd



def scrap_data():

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

	for idx, row in search_param.iterrows():
		lon = row.lon
		lat = row.lat
		r = radius[row.radius]
		with urllib.request.urlopen("https://findahealthcenter.hrsa.gov//healthcenters/find?lon={}&lat={}&radius={}".format(lon, lat, r)) as url:
			data = json.loads(url.read().decode())

		data_key =  ["Id", "CtrNm", "Shape", "CtrStateAbbr", "CountyNm","CtrCity",  "CtrAddress", "CtrPhoneNum", "Covid19TestStatus"]
		new_key = ["id", "name", "location","st_abbr",  "county", "city", "address", "phone", "testing_status",]
		for d in data:
			if d["Id"] not in clinic.keys():
				value =[v for k, v in d.items() if k in data_key]
				clinic[d["Id"]] = dict(zip(new_key, value))
		i += 1
		print(i, round(lon,2), round(lat,2), len(data))
		if len(data) == 500:
			print("		################	")
return clinic


def save_data(clinic):
	with open('health_center_1026.json', 'w') as fp:
		json.dump(clinic, fp)


if __name__ == '__main__':
	clinic = scrap_data()
	save_data(clinic)

# points = {
# 	"main":{"lat": [24, 50], "lon": [-124, -67]},
# 	"hawaii": {"lat": [18, 29], "lon": [-180, -156]},
# 	"alaska": {"lat": [50, 72], "lon": [-172, -129]}
# }

# clinic = {}


# with urllib.request.urlopen("https://findahealthcenter.hrsa.gov//healthcenters/find?lon=-71.238641&lat=41.922833&radius=10") as url:
# 	data = json.loads(url.read().decode())



# # manually iterate over three regions
# state = "alaska"

# lon = points[state]["lon"][0]
# lat = points[state]["lat"][0]

# eastmost = points[state]["lon"][1]
# northmost = points[state]["lat"][1]
# westmost = points[state]["lon"][0]
# southmost = points[state]["lat"][0]

# i = 0

# while lon <= eastmost:
# 	lat = southmost
# 	while lat <= northmost:
# 		with urllib.request.urlopen("https://findahealthcenter.hrsa.gov//healthcenters/find?lon={}&lat={}&radius=50".format(lon, lat)) as url:
# 			data = json.loads(url.read().decode())
# 		print(lat, lon, len(data))


# 		data_key =  ["Id", "CtrNm", "Shape", "CtrStateAbbr", "CountyNm","CtrCity",  "CtrAddress", "CtrPhoneNum", "Covid19TestStatus"]
# 		new_key = ["id", "name", "location","st_abbr",  "county", "city", "address", "phone", "testing_status",]
# 		for d in data:
# 			if d["Id"] not in clinic.keys():
# 				value =[v for k, v in d.items() if k in data_key]
# 				clinic[d["Id"]] = dict(zip(new_key, value))
# 		i += 1
# 		print(i, lon, lat, len(data))
# 		lat = round(lat+1, 3)
# 	lon = round(lon+1, 3)




