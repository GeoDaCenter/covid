* **Meta Data Name**: Health and Human Services Data

**Last Modified**: 2/23/2021

**Author**: Dylan Halpern

### Data Location: 
[GeoDaCenter/covid/public/csv](https://github.com/GeoDaCenter/covid/tree/master/public/csv)

* Testing: [covid_testing_cdc_state.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_testing_cdc_state.csv)
* Testing Capacity: [covid_tcap_cdc_state.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_tcap_cdc_state.csv)
* Testing Positivity: [covid_wk_pos_cdc_state.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_wk_pos_cdc_state.csv)
* Testing Confirmed Cases Per Testing: [covic_ccpt_cdc_state.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covic_ccpt_cdc_state.csv)

### Data Source(s) Description:  
HHS State Level COVID-19 Diagnostic Laboratory Testing (PCR Testing) Time Series is available [here](https://healthdata.gov/dataset/covid-19-diagnostic-laboratory-testing-pcr-testing-time-series). It is updated daily and sourced from  CDC COVID-19 Electronic Laboratory Reporting (CELR), Commercial Laboratories, State Public Health Labs, In-House Hospital Labs. A full data dictionary is available [here](https://healthdata.gov/covid-19-diagnostic-laboratory-testing-pcr-testing-time-series-data-dictionary).

### Description of Data Processing: 
* Testing: Total testing volume is taken from a 7-day rolling average of total testing figures each day.
* Testing Capacity: Testing capacity is calculated based on testing divided by population, then multiplied by 100,000.
* Testing Positivity: Testing positivity is taken from the reported positive tests divided by total tests.
* Testing Confirmed Cases Per Testing: USA Facts State-level confirmed cases are divided by total testing volume.

### Key Variable and Definitions:

covid_testing_cdc_state.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `state_fips` | County level fips code to join to county geospatial data |
| Tests Conducted (Time series) | ISO Format Date (eg.`2020-01-22`) | 7-day rolling average of total tests completed  |

covid_tcap_cdc_state.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `state_fips` | County level fips code to join to county geospatial data |
| Tests Conducted Per 100k Population (Time series) | ISO Format Date (eg.`2020-01-22`) | 7-day rolling average of tests completed per 100k population in the county |

covid_wk_pos_cdc_state.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `state_fips` | County level fips code to join to county geospatial data |
| Test Positivity Percentage (0-1 scale) (Time series) | ISO Format Date (eg.`2020-01-22`) | 7-day rolling average percentage of tests conducted that produced a positive result |

covic_ccpt_cdc_state.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `state_fips` | County level fips code to join to county geospatial data |
| Confirmed Cases Per Testing (Time series) | ISO Format Date (eg.`2020-01-22`) | 7-day rolling average of percentage of cases divided by total tests. A high discrepancy between CCPT and Positivity indicates many cases are missed in testing. |

### Description of Data Source Tables: 
Descriptions via [HHS / HealthData.gov](https://healthdata.gov/covid-19-diagnostic-laboratory-testing-pcr-testing-time-series-data-dictionary).

> * `state` (string) - Abbreviation of state associated with the test. Typically patient's state of residence, but provider or lab state used when patient is unavailable.
> * `state_name` (string) - Name of state associated with the test. Typically patient's state of residence, but provider or lab state used when patient is unavailable.
> * `state_fips` (string) - Numerical identifier of state associated with the test. Typically patient's state of residence, but provider or lab state used when patient is unavailable.
> * `fema_region` (string) - Region associated with the test. Typically that of patient's state of residence, but provider or lab state used when patient is unavailable.
> * `overall_outcome` (string) - Outcome of test -- Positive, Negative or Inconclusive.
> * `date (date)` - Typically the date the test completed or the date that the result was reported back to the patient. If neither are available, it can be the date the specimen was collected, arrived at the testing facility, or the date the test was ordered.
> * `new_results_reported` (long) - The number of tests completed with the specified outcome in the specified state on the listed date. (Large spikes may result from states submitting tests for several proceeding days at once with a single date).
> * `total_results_reported` (long) - The cumulative number of tests completed with the specified outcome in the specified state up through the listed date.

### Data Limitations:
No limitations to report.

### Comments/Notes:
n/a
