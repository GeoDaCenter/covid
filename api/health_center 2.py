import urllib.request, json 



points = {
	"main":{"lat": [24, 50], "lon": [-124, -67]},
	"hawaii": {"lat": [18, 29], "lon": [-180, -156]},
	"alaska": {"lat": [50, 72], "lon": [-172, -129]}
}

clinic = {}


# with urllib.request.urlopen("https://findahealthcenter.hrsa.gov//healthcenters/find?lon=-74.0060&lat=40.7128&radius=10") as url:
# 	data = json.loads(url.read().decode())



# manually iterate over three regions
state = "alaska"

lon = points[state]["lon"][0]
lat = points[state]["lat"][0]

eastmost = points[state]["lon"][1]
northmost = points[state]["lat"][1]
westmost = points[state]["lon"][0]
southmost = points[state]["lat"][0]

i = 0

while lon <= eastmost:
	lat = southmost
	while lat <= northmost:
		with urllib.request.urlopen("https://findahealthcenter.hrsa.gov//healthcenters/find?lon={}&lat={}&radius=50".format(lon, lat)) as url:
			data = json.loads(url.read().decode())


		data_key =  ["Id", "CtrNm", "Shape", "CtrCity", "CtrStateAbbr", "CountyNm"]
		new_key = ["id", "name", "location", "city", "st_abbr", "county"]
		for d in data:
			if d["Id"] not in clinic.keys():
				value =[v for k, v in d.items() if k in data_key]
				clinic[d["Id"]] = dict(zip(new_key, value))
		i += 1
		print(i, lon, lat, len(data))
		lat = round(lat+1, 3)
	lon = round(lon+1, 3)


with open('health_center.json', 'w') as fp:
    json.dump(clinic, fp)
