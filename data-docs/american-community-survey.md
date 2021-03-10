**Meta Data Name**: American Community Survey

**Last Modified**: 2/28/21

**Author**: Kenna Camper

### Data Location: 
[GeoDaCenter/covid/data](https://github.com/GeoDaCenter/covid/tree/13e3bddf8f54734a627200ff2d2eb729504fbd6c/data)

* County Population [county_pop.csv](https://github.com/GeoDaCenter/covid/blob/d689ff0c926b854000764a68aa924798aa36bf9b/data/county_pop.csv)
* Essential Workers [context_essential_workers_acs.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/context_essential_workers_acs.csv)

### Data Source(s) Description:  
Source is [here](https://www.census.gov/acs/www/data/data-tables-and-tools/american-factfinder/) via the United States Census Bureau. 

### Description of Data Processing: 
Population counts are taken directly from 2019 ACS 5-year estimates and joined to geospatial data. Essential worker estimates are generated from 2019 ACS 5-year estimates of workers by "essential" occupations over total workers in each county. We currently use the occupation categories from the [Chicago Metropolitan Agency for Planning](https://github.com/CMAP-REPOS/essentialworkers).

### Key Variable and Definitions:
context_essential_workers_acs
| Variable | Variable ID in .csv | Description | 
|:---------|:--------------------|:------------|
| FIPS (Join Column | `fips` | County geophraphic identifier to join to geospatial data |
| Percent of essential workers | `pct_essential` | Share of workers in essential occupations on a scale of 0-1. |

county_pop.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| GEOID | `GEOID` | County Geographical ID number |
| County and state | `NAME` | County and state name |
| Total population | `total_population` | Total population of a county |
| Males | `male` | Number of males in a county |
| Females| `female` | Number of females in a county |
| Males above 50 | `male_50above` | Number of males above age 50 in a county |
| Females above 50 | `female_50above` | Number of females above age 50 in a county |


### Description of Data Source Tables: 
See the [American Community Survey Data](https://www.census.gov/programs-surveys/acs/data.html) for additional information.

### Data Limitations:
No limitations to report.

### Comments/Notes:
n/a
