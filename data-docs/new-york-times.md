**Meta Data Name**: New York Times

**Last Modified**: 2/23/2021

**Author**: Dylan Halpern

### Data Location: 
[GeoDaCenter/covid/public/csv](https://github.com/GeoDaCenter/covid/tree/master/public/csv)

* County
    * Cases: [covid_confirmed_nyt.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/covid_confirmed_nyt.csv)
    * Deaths: [covid_deaths_nyt.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/covid_deaths_nyt.csv)
* State
    * Cases: [covid_confirmed_nyt_state.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/covid_confirmed_nyt_state.csv)
    * Deaths: [covid_deaths_nyt_state.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/covid_deaths_nyt_state.csv)

### Data Source(s) Description:  
The New York Times is publishing their on-going COVID-19 data, available [here](https://github.com/nytimes/covid-19-data). 

Direct links: [States](https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv) | [Counties](https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv)

### Description of Data Processing: 
* State and county confirmed case and death data are taken directly from the NYT data and transposed into time-series.

### Key Variable and Definitions:


covid_confirmed_nyt.csv
| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips` | County level fips code to join to county geospatial data |
| Confirmed Cases (Time series) | ISO Format Date (eg.`2020-01-22`) | Cumulative cases for given geography (county) |


covid_confirmed_nyt_state.csv
| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips` | County level fips code to join to county geospatial data |
| Confirmed Cases (Time series) | ISO Format Date (eg.`2020-01-22`) | Cumulative cases for given geography (state) |


covid_deaths_nyt.csv
| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips` | County level fips code to join to county geospatial data |
| COVID-19 Deaths (Time series) | ISO Format Date (eg.`2020-01-22`) | Cumulative deaths attributed to COVID for given geography (county) |


covid_confirmed_nyt_state.csv
| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips` | County level fips code to join to county geospatial data |
| COVID-19 Deaths (Time series) | ISO Format Date (eg.`2020-01-22`) | Cumulative deaths attributed to COVID for given geography (state)  |

### Description of Data Source Tables: 
See the [New York Times Repo](https://github.com/nytimes/covid-19-data) for additional information.

### Data Limitations:
No limitations to report.

### Comments/Notes:
n/a
