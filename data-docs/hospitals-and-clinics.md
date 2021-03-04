**Meta Data Name**: Hospital and Clinic Locations

**Last Modified**: 3/3/2021

**Author**: Dylan Halpern

### Data Location: 
[GeoDaCenter/covid/public/csv](https://github.com/GeoDaCenter/covid/tree/master/public/csv)

* Federally Qualified Health Clinics (FQHCs) [context_fqhc_clinics_hrsa.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/context_fqhc_clinics_hrsa.csv)
* National Hospital Locations [context_hospitals_covidcaremap.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/context_hospitals_covidcaremap.csv)

### Data Source(s) Description:  
Federally qualitifed health clinic locations and testing status are sourced from [HRSA's online location finder](https://findahealthcenter.hrsa.gov/). Hospital location and information are sourced from the [CovidCareMap project](https://github.com/covidcaremap/covid19-healthsystemcapacity).

### Description of Data Source Tables: 
n/a

### Description of Data Processing: 
Data from HRSA are taken directly and filtered for the columns listed below. CovidCareMap hospital data is included completely.

### Key Variable and Definitions:

context_fqhc_clinics_hrsa.csv
| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| Clinic Name | `name` | Name of the clinic in HRSA's database |
| State Abbreviation | `st_abbr` | 2-letter state name |
| City Name | `city` | City where the clinic is located |
| Street Address | `address` | Clinic street address | 
| Phone Number | `phone` | Contact phone number for clinic |
| COVID Testing Availability | `testing_status` | Last queried testing availability status |
| Longitude | `lon` | Clinic longitude value in WGS84 |
| Latitude | `lat` | Clinic latitude value in WGS84 |

context_hospitals_covidcaremap.cdc

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| Hospital Name | `Name` |  Hospital Name |
| Hospital Type | `Hospital Type` | Hospital category (eg. Long Term Care, Short Term, Acute) | 
| Street Address | `Address` | Local street address | 
| Street Address (continued) | `Address_2` | Local street address (suite, number, etc.) |
| City | `City` | Hopsital City | 
| State | `State` | Hospital State |
| ZIP Code | `Zipcode` | Hospital ZIP code |
| County | `County` | Hospital County|
| Latitude | `Latitude` | Hospital latitude value in WGS84 | 
| Longitude | `Longitude` | Hospital longitude value in WGS84 |

Additional fields describe hospital bed capacity and occupancy.

### Data Limitations:
n/a

### Comments/Notes:
n/a
