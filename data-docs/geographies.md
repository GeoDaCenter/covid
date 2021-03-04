**Meta Data Name**: Geographies

**Last Modified**: 3/3/2021

**Author**: Dylan Halpern

### Data Location: 
All geospatial data used in the Atlas are available under [GeoDaCenter/covid/public/geojson](https://github.com/GeoDaCenter/covid/tree/master/public/geojson).
* County Geographies
    * 1 Point 3 Acres [county_1p3a.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/county_1p3a.geojson)
    * New York Times [county_nyt.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/county_nyt.geojson)
    * USA Facts [county_usfacts.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/county_usfacts.geojson)
    * Centers for Disease Control [cdc.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/cdc.geojson)
* State Geographies
    * 1 Point 3 Acres [state_1p3a.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/state_1p3a.geojson)
    * New York Times [state_nyt.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/state_nyt.geojson)
    * USA Facts [state_usafacts.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/state_usafacts.geojson)
* Congressional District Geographies
    * District Centroids (Labels) [district_centroids.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/district_centroids.geojson)
    * District Boundaries [districts.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/districts.geojson)
* Overlay Highlights
    * Black Belt Counties [blackbelt_highlight.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/blackbelt_highlight.geojson)
    * Native American or American Indian Reservations [reservations.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/reservations.geojson)
    * Hypersegregated City Counties [segregated_cities.geojson](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/geojson/segregated_cities.geojson)

### Data Source(s) Description:  
County and state boundaries are sourced from the US Census [Cartographic Boundary Files](https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html) at the 20m resolution. Native American or American Indian reservation boundaries come from the [TIGER/line 2017 dataset](https://catalog.data.gov/dataset/tiger-line-shapefile-2017-nation-u-s-current-american-indian-alaska-native-native-hawaiian-area). Congressional district boundaires come from the 2018 [National Congressional District Boundaries](https://catalog.data.gov/dataset/tiger-line-shapefile-2018-nation-u-s-116th-congressional-district-national). 
<!-- 
Black belt counties and hypersegregated cities are based on -->

### Description of Data Source Tables: 
Source geospatial data provide boundaries and a geospatial identifier (GEOID or FIPS code).

### Description of Data Processing: 
State and county boundaries are joined with basic information for normalization (population and beds). Highlight layers are generated using a symmetrical difference operation against a dissolved US geography. 


### Key Variable and Definitions:

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| Geographic ID (Join Column) | `GEOID` | County and state level GEOID code to join to tabular data |
| Population Count | `population` | 2019 ACS 5-year estiamte of population in each county or state |
| Licensed Beds | `beds` | Number of licensed hospitals beds in each county or state |
| Testing Criteria (Depricated) | `criteria` | *No longer used:* State or county COVID testing criteria |

### Data Limitations:


### Comments/Notes:
n/a
