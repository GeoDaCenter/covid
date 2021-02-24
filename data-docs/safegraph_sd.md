**Meta Data Name**: Safegraph Social Distancing Data

**Last Modified**: 2/22/2021

**Author**: Andres Crucetta Nieto

### Data Location: 
[GeoDaCenter/covid-policy-analysis/tree/master/raw-data/mobility/safegraph](https://github.com/GeoDaCenter/covid-policy-analysis/tree/master/raw-data/mobility/safegraph)
* Daily Percentages
  * [daily_pct_delivery_weekday.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/daily_pct_delivery_weekday.csv)
  * [daily_pct_fulltime_raw.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/daily_pct_fulltime_raw.csv)
  * [daily_pct_fulltime_weekday.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/daily_pct_fulltime_weekday.csv)
  * [daily_pct_home_raw.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/daily_pct_home_raw.csv)
  * [daily_pct_home_weekday.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/daily_pct_home_weekday.csv)
  * [daily_pct_parttime_raw.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/daily_pct_parttime_raw.csv)
  * [daily_pct_parttime_weekday.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/daily_pct_parttime_weekday.csv)
* Change from 2019 (Baseline)
  * [change_from_2019_FULLTIME.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/change_from_2019_FULLTIME.csv)
  * [change_from_2019_HOME.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/change_from_2019_HOME.csv)
  * [change_from_2019_PARTTIME.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/change_from_2019_PARTTIME.csv)
* Percent Home
  * [pct_home.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_home.csv)
  * [pct_home2019.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_home2019.csv)
  * [pct_home2020.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_home2020.csv)
  * [pct_home2021.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_home2021.csv)
* Percent Full-Time
  * [pct_fulltime.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_fulltime.csv)
  * [pct_fulltime2019.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_fulltime2019.csv)
  * [pct_fulltime2020.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_fulltime2020.csv)
  * [pct_fulltime2021.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_fulltime2021.csv)
* Percent Part-Time
  * [pct_parttime.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_parttime.csv)
  * [pct_parttime2019.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_parttime2019.csv)
  * [pct_parttime2020.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_parttime2020.csv)
  * [pct_parttime2021.csv](https://github.com/GeoDaCenter/covid-policy-analysis/blob/master/raw-data/mobility/safegraph/pct_parttime2021.csv)

### Data Source(s) Description:  
Source is [here](https://bphc.hrsa.gov...) via middle-person. 

Geography source. 

### Description of Data Source Tables: 
n/a

### Description of Data Processing: 


### Key Variable and Definitions:

daily_pct_delivery_weekday.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week Day | YYYY-MM-DD | Percentage of delivery workers for that day |

daily_pct_fulltime_raw

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Day | YYYY-MM-DD | Percentage of full-time workers for that day |

daily_pct_fulltime_weekday

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week Day | YYYY-MM-DD | Percentage of full-time workers for that weekday |

daily_pct_home_raw

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Day | YYYY-MM-DD | Percentage of home dwellers for that day |

daily_pct_parttime_raw

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Day | YYYY-MM-DD | Percentage of part-time workers for that day |

daily_pct_parttime_weekday

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week Day | YYYY-MM-DD | Percentage of part-time workers for that weekday |

change_from_2019_FULLTIME

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week | YYYY-MM-DD | Percentage change of full-time workers from 2019 for that week |

change_from_2019_HOME

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week | YYYY-MM-DD | Percentage change of home dwellers from 2019 for that week |

change_from_2019_PARTTIME

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week | YYYY-MM-DD | Percentage change of part-time workers from 2019 for that week |

pct_home

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| Week | YYYY-MM-DD | Percentage of part-time workers for that week |
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Percent of people home | pct_home | Percentage of people home for that week |

pct_fulltime

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| Week | YYYY-MM-DD | Percentage of full-time workers for that week |
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Percent of people full-time | pct_fulltime | Percentage of people working full-time for that week |

pct_parttime

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| Week | YYYY-MM-DD | Percentage of full-time workers for that week |
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Percent of people part-time | pct_parttime | Percentage of people working part-time for that week |

### Data Limitations:
The data has these issues. 

### Comments/Notes:
n/a
