import geocoder
import json

with open("hospital.json") as f:
	hospital = json.load(f)

outlier = {}

for k, v in hospital.items():
	if v["lat"] <= 24 or v["lat"] >= 50 or v["lon"] <= -125 or v["lon"] >= -66:
		outlier[k] = v



key = "69b0b463fd204efdaff0b1c444da8d19"

corrected_k = []

i = 0
j = 0
for k, v in outlier.items():
	result = geocoder.opencage(v["hospital_name"], key=key)
	print(i)
	print(result.country, result.city)
	print(v["lat"], result.lat)
	print(v["lon"], result.lng)
	if result.country == "United States" or result.country == "United States of America":
		if v["lat"] != result.lat and v["lon"] != result.lng:
			hospital[k]["lat"] = result.lat
			hospital[k]["lon"] = result.lng
			corrected_k.append(k)
			print("cnt:", j)
			j += 1
	i += 1


outlier = {k:v for k,v in outlier.items() if k not in corrected_k}


# r2 = geocoder.opencage([21.3716056, -158.0270382], key=key, method="reverse")
# r = geocoder.opencage("COVENANT SPECIALTY HOSPITAL", key=key)

unmatched =['010114',
 '050073',
 '050464',
 '100271',
 '140233',
 '143301',
 '192016',
 '220080',
 '222000',
 '230059',
 '240047',
 '270003',
 '292003',
 '330151',
 '330154',
 '330229',
 '360039',
 '370093',
 '390333',
 '430093',
 '450162',
 '452086',
 '461305',
 '500053',
 '500054',
 '500141',
 '530015',
 '670004']


with open("outlier.json") as f:
	new_outlier = json.load(f)

outlier = {}

for k, v in new_outlier.items():
	if k not in unmatched:
		hospital[k] = new_outlier[k]
	else:
		outlier[k] = new_outlier[k]

with open("hospital.json", "w") as f:
	json.dump(hospital, f)

with open("outlier.json", "w") as f:
	json.dump(outlier, f)




