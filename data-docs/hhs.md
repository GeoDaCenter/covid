**Meta Data Name**: Health and Human Services Data

**Last Modified**: 2/23/2021

**Author**: Dylan Halpern

### Data Location: 
[GeoDaCenter/covid/docs/csv](https://github.com/GeoDaCenter/covid/tree/master/docs/csv)

* Testing: [covid_testing_cdc_state.csv](https://github.com/GeoDaCenter/covid/blob/master/docs/csv/covid_testing_cdc_state.csv)
* Testing Capacity: [covid_tcap_cdc_state.csv](https://github.com/GeoDaCenter/covid/blob/master/docs/csv/covid_tcap_cdc_state.csv)
* Testing Positivity: [covid_wk_pos_cdc_state.csv](https://github.com/GeoDaCenter/covid/blob/master/docs/csv/covid_wk_pos_cdc_state.csv)
* Testing Confirmed Cases Per Testing: [covic_ccpt_cdc_state.csv](https://github.com/GeoDaCenter/covid/blob/master/docs/csv/covic_ccpt_cdc_state.csv)

### Data Source(s) Description:  
Source is [here](https://bphc.hrsa.gov...) via middle-person. 

Geography source. 


### Description of Data Processing: 
* Testing:
* Testing Capacity

### Key Variable and Definitions:

covid_testing_cdc.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Tests Conducted (Time series) | ISO Format Date (eg.`2020-01-22`) | 7-day rolling average of total tests completed  |

covid_tcap_cdc.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Tests Conducted Per 100k Population (Time series) | ISO Format Date (eg.`2020-01-22`) | 7-day rolling average of tests completed per 100k population in the county |

covid_wk_pos_cdc.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Test Positivity Percentage (0-1 scale) (Time series) | ISO Format Date (eg.`2020-01-22`) | 7-day rolling average percentage of tests conducted that produced a positive result |

covid_ccpt_cdc.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Confirmed Cases Per Testing (Time series) | ISO Format Date (eg.`2020-01-22`) | 7-day rolling average of percentage of cases divided by total tests. A high discrepancy between CCPT and Positivity indicates many cases are missed in testing. |

### Description of Data Source Tables: 
n/a

### Data Limitations:
The data has these issues. 

### Comments/Notes:
n/a
