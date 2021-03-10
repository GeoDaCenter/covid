**Meta Data Name**: USAFacts

**Last Modified**: 2/28/2021

**Author**: Stephanie Yang

### Data Location: 
[GeoDaCenter/covid/public/csv](https://github.com/GeoDaCenter/covid/tree/master/public/csv)

* County
    * Cases: [covid_confirmed_usafacts.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_confirmed_usafacts.csv)
    * Deaths: [covid_deaths_usafacts.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_deaths_usafacts.csv)
* State
    * Cases: [covid_confirmed_usafacts_state.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_confirmed_usafacts_state.csv)
    * Deaths: [covid_deaths_usafacts_state.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_deaths_usafacts_state.csv)

### Data Source(s) Description:  
[USAFacts](https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/) publishes COVID-19 data confirmed cases and death data on county and state level. All data are updated on a daily basis. USAFacts also provide various data visualization [here](https://usafacts.org/issues/coronavirus/).

Direct links: [Confirmed Cases](https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_confirmed_usafacts.csv) | [Deaths](https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_deaths_usafacts.csv)

### Description of Data Processing: 
* Data are directly downloaded from USAFacts.

### Key Variable and Definitions:


covid_confirmed_usafacts_state.csv
| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| State| `State` | State abbreviation |
| State FIPS | `StateFIPS` | State level fips code to join to county geospatial data (2-digit) |
| Confirmed Cases (Time series)| ISO Format Date (eg.`2020-01-22`) | Cumulative cases for given geography |


covid_deaths_usafacts_state.csv
| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| State| `State` | State abbreviation |
| State FIPS | `StateFIPS` | State level fips code to join to county geospatial data (2-digit) |
| Deaths (Time series)| ISO Format Date (eg.`2020-01-22`) | Cumulative deaths for given geography |


covid_confirmed_usafacts.csv
| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| County Name| `County Name` | County Name |
| County FIPS | `countyFIPS` | County level fips code to join to county geospatial data (5-digit) |
| State| `State` | State abbreviation |
| State FIPS | `StateFIPS` | State level fips code to join to county geospatial data (2-digit)  |
| Confirmed Cases (Time series)| ISO Format Date (eg.`2020-01-22`) | Cumulative cases for given geography |


covid_deaths_usafacts.csv
| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| County Name| `County Name` | County Name |
| County FIPS | `countyFIPS` | County level fips code to join to county geospatial data (5-digit) |
| State| `State` | State abbreviation |
| State FIPS | `StateFIPS` | State level fips code to join to county geospatial data (2-digit)  |
| COVID-19 Deaths (Time series) | ISO Format Date (eg.`2020-01-22`) | Cumulative deaths attributed to COVID for given geography (state)  |

### Description of Data Source Tables: 
See the [Detailed Methodology and Sources: COVID-19 Data](https://usafacts.org/articles/detailed-methodology-covid-19-data/) for additional information.

### Data Limitations:
No limitations to report.

### Comments/Notes:
n/a
