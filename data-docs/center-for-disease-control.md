**Meta Data Name**: Center for Disease Control COVID Data

**Last Modified**: 2/23/2021

**Author**: Dylan Halpern

### Data Location: 
[GeoDaCenter/covid/public/csv](https://github.com/GeoDaCenter/covid/tree/master/public/csv)

* Cases
    * County Cases: [covid_confirmed_cdc.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_confirmed_cdc.csv)
* Deaths
    * County Deaths: [covid_deaths_cdc.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_deaths_cdc.csv)
* Testing
    * County Testing Count: [covid_testing_cdc.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_testing_cdc.csv)
    * County Testing Capacity Per 100k Population: [covid_tcap_cdc.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_tcap_cdc.csv)
    * County Weekly Positivity: [covid_wk_pos_cdc.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_wk_pos_cdc.csv)
    * County Confirmed Cases Per Testing: [covid_ccpt_cdc.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/covid_ccpt_cdc.csv)
* Vaccination (State-level)
    * First Dose Administered: [vaccine_admin1_cdc.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/vaccine_admin1_cdc.csv)
    * Second Dose Administered: [vaccine_admin2_cdc.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/vaccine_admin2_cdc.csv)
    * Doses Distributed but not administered: [vaccine_dist_cdc.csv](https://github.com/GeoDaCenter/covid/blob/master/public/csv/vaccine_dist_cdc.csv)

### Data Source(s) Description:  
This data is sourced from the CDC's [Covid Data Tracker](https://covid.cdc.gov/covid-data-tracker/) on the [County](https://covid.cdc.gov/covid-data-tracker/#county-view) and [Vaccination](https://covid.cdc.gov/covid-data-tracker/#vaccinations) views. The CDC publishes **7-day rolling average** aggregations of testing, case, and death data and **daily snapshots** of vaccination data.

Both state and county datasets can be joined to [Census Cartographic Boundary Files](https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html). The Atlas uses a resolution of 20M.

### Key Variable and Definitions:

**County** 

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

covid_confirmed_cdc.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Covid Cases (Time series) | ISO Format Date (eg.`2020-01-22`) | 7-day rolling average of new confirmed cases of Covid-19. |

covid_deaths_cdc.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Covid Deaths (Time series) | ISO Format Date (eg.`2020-01-22`) | 7-day rolling average of new deaths attributed to Covid-19. |

___

**Vaccination**
vaccine_admin1_cdc.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips` | State level fips code to join to county geospatial data |
| First doses administered | ISO Format Date (eg.`2020-01-22`) | Daily snapshot of total first doses administered in this state. |

vaccine_admin2_cdc.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips` | State level fips code to join to county geospatial data |
| Second doses administered | ISO Format Date (eg.`2020-01-22`) | Daily snapshot of total second doses (full vaccinations) administered in this state. |


vaccine_dist_cdc.csv

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips` | State level fips code to join to county geospatial data |
| Doses distributed and not administered | ISO Format Date (eg.`2020-01-22`) | Daily snapshot of doses distributed, **but not administered** in this state. |

### Description of Data Processing: 
* Cases and Deaths: 7-day rolling averages of **Cases** and **Deaths** are taken directly from the CDC endpoint and transposed into time-series data.
* Testing Count: Testing count is taken from the 7-day rolling average of new test results (`new_test_results_reported_7_day_rolling_average`)
* Testing Capacity: Testing capacity is taken from the testing county above divided by the county population.
* Testing Positivity: Testing positivity is taken from the 7-day rolling average of positive of new test results (`percent_new_test_results_reported_positive_7_day_rolling_average`)
* Testing Confirmed Cases Per Testing(CCPT): Testing CCPT is taken from the 7-day average of new confirmed cases divided by the 7-day average testing count.
* Vaccination First and Second Doses Administered: The first and second doses administered are taken directly from the `Administered_Dose1` field and transposed into time-series. On the frontend of the Atlas, this is presented as a numerator on top of the State population.
* Vaccination Dose Distributed but not administered: This metric is taken from the total doses distributed (`Doses_Distributed`) subtracted by the total doses administered (`Doses_Administered`). This gives an estimation of the number of doses "on hand" for each state. On the frontend of the Atlas, this is presented as a numerator per 100,000 population.

### Description of Data Source Tables: 
County Data: CDC County data is available from two API endpoints. One for the latest [county snapshot](https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=integrated_county_latest_external_data) and another for state-specific [historical time-series data](https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=integrated_county_timeseries_state_HI_external). The URL format for the second endpoint is `https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=integrated_county_timeseries_state_{**STATE-2-LETTER-CODE**}_external`.

The below data fields are available in the historical data from each state endpoint.

* `fips_code` County FIPS code geographic identifier
* `state` Two letter state name
* `state_name` Full state name 
* `cbsa_code` [Core-Based Statistical Areas](https://www.census.gov/topics/housing/housing-patterns/about/core-based-statistical-areas.html) name
* `county` County name
* `new_cases_week_over_week_percent_change` Week over week percent change in cases
* `new_cases_7_day_rolling_average` 7-day rolling average of new cases
* `new_cases_per_100k_7_day_rolling_average` 7-day rolling average of new cases per 100,000 population
* `new_deaths_7_day_rolling_average` 7-day rolling average of new deaths 
* `new_deaths_week_over_week_percent_change` Week over week percent change in deaths
* `new_deaths_per_100k_7_day_rolling_average` 7-day rolling average of new deaths per 100,000 population 
* `daily_cli_7_day_rolling_average` Daily, 7-day rolling average of "COVID like illnesses" 
* `daily_cli_percentage_7_day_rolling_average` *Usage Unclear.* Percentage of daily, 7-day rolling average of "COVID like illnesses" 
* `daily_ili_percentage_7_day_rolling_average` *Usage Unclear.* Percentage of daily, 7-day rolling average of "Influenza like illnesses" 
* `new_test_results_reported` New test results reported in this data window
* `new_test_results_reported_7_day_rolling_average` 7-day rolling average of new tests reported 
* `percent_new_test_results_reported_positive_7_day_rolling_average` 7-day rolling average of positive test results reported on new tests 
* `percent_positive_7_day` Overall positivity for tests in the past 7 day
* `total_test_results_reported_week_over_week_count_change` Week over week change in test results reported
* `testing_suppressed` *Usage Unclear.* Potentially tests suppressed for anonymity or inconclusive tests.
* `total_hospitals_reporting` Number of hospital facilities reporting data in this county
* `admissions_covid_confirmed_last_7_days` Total hospital admissions for COVID-19 in the past 7 day
* `admissions_covid_confirmed_7_day_rolling_average` 7-day rolling average of confirmed hospital COVID admissions
* `admissions_covid_confirmed_last_7_days_per_100_beds` Number of confirmed hospital COVID admissions in the past 7 days per 100 hospital beds
* `admissions_covid_confirmed_week_over_week_percent_change` Week over week percent change of COVID admissions to hospitals
* `percent_adult_inpatient_beds_used_confirmed_covid` Percentage of adult inpatient hospital beds confirmed occupied by COVID patients
* `percent_adult_inpatient_beds_used_confirmed_covid_week_over_week_absolute_change` Change in number of hospital beds used for COVID-19 patients
* `hospitals_included_in_percent_adult_inpatient_beds_used_confirmed_covid` Data coverage for number of hospitals reporting data adult inpatient bed usage 
* `percent_adult_icu_beds_used_confirmed_covid` Percent of adult ICU beds used for COVID-19 patients
* `percent_adult_icu_beds_used_confirmed_covid_week_over_week_absolute_change` Week over week change in number of ICU hospital beds used for COVID-19 patients
* `hospitals_included_in_percent_adult_icu_beds_used_confirmed_covid` Data coverage for number of hospitals reporting data adult inpatient bed usage
* `cbsa_daily_cli_7_day_rolling_average` 7-day rolling average of Covid-like illnesses reported in the [Core-Based Statistical Areas](https://www.census.gov/topics/housing/housing-patterns/about/core-based-statistical-areas.html) 
* `cbsa_daily_cli_percentage_7_day_rolling_average` *Usage Unclear.* Percent of 7-day rolling average of Covid-like illnesses reported in the [Core-Based Statistical Areas](https://www.census.gov/topics/housing/housing-patterns/about/core-based-statistical-areas.html) 
* `cbsa_daily_ili_7_day_rolling_average` 7-day rolling average of Influenza-like illnesses reported in the [Core-Based Statistical Areas](https://www.census.gov/topics/housing/housing-patterns/about/core-based-statistical-areas.html) 
* `cbsa_daily_ili_percentage_7_day_rolling_average` *Usage Unclear.* Percent of 7-day rolling average of influenza-like illnesses reported in the [Core-Based Statistical Areas](https://www.census.gov/topics/housing/housing-patterns/about/core-based-statistical-areas.html) 
* `date` Date reported
* `report_date_window_start` ISO date format start of reporting window
* `report_date_window_end` ISO date format end of reporting window


___

Vaccination Data: The most recent CDC Vaccination data reports across 4 dimensions. They report:
* Total Doses vs People: **Total Doses** includes doses administered (shots given) or distributed (delivered) in that state, but not necessarily to residents of that state. **People** includes only people from that state.
* 1st or 2nd dose: Number of first or second doses administered.
* Total Population or 18 years or older: Population normalization for the whole population or only individuals 18 years or older.
* Count of doses vs percent of population: Doses administered as a count (or population normalized count) or as a percentage of the state population.

Field descriptions are inferred from CDC descriptions on the Covid Data Tracker and variable names in the page's [source bundle](https://covid.cdc.gov/covid-data-tracker/index.bundle.js).

For direct access to the data, see the [CDC Api Endpoint](https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_data).

*Note: In the future, the CDC may make available time-series vaccination data, which should be used instead of these snapshots. See also Our World in Data's repo [here](https://github.com/owid/covid-19-data/tree/master/public/data/vaccinations).*

**Current Field and Descriptions**

* `Date` Date for data report in ISO Format
* `Location` Two letter state name
* `ShortName` Three letter state name
* `LongName` Full state name
* `Census2019` 2019 Census population count
* `Doses_Distributed` Total doses distributed to this state
* `Doses_Administered` Total doses administered in this state
* `Dist_Per_100K` Doses distributed in this state per 100,000 population
* `Admin_Per_100K` Doses administered in this state per 100,000 population
* `Administered_Dose1` Total number of **first** doses administered in this state
* `Administered_Dose1_Per_100K` First doses administered in this state per 100,000 population
* `Administered_Dose2`Total number of **second** doses administered in this state
* `Administered_Dose2_Per_100K` Second doses administered in this state per 100,000 population
* `Administered_Dose1_Pop_Pct` Percent of population in this state who have received the first dose
* `Administered_Dose2_Pop_Pct` Percent of population in this state who have received the second dose
* `date_type` Type of date for this entry, usually "Report"
* `Recip_Administered` Doses administered to people from this state
* `Administered_Dose1_Recip` First doses administered to people from this state
* `Administered_Dose2_Recip` Second doses administered to people from this state
* `Administered_Dose1_Recip_18Plus` First doses administered to people from this state 18 years or older
* `Administered_Dose2_Recip_18Plus` Second doses administered to people from this state 18 years or older
* `Administered_Dose1_Recip_18PlusPop_Pct` Percent of population of this state who have received a first dose aged 18 years or older
* `Administered_Dose2_Recip_18PlusPop_Pct` Percent of population of this state who have received a second dose aged 18 years or older
* `Census2019_18PlusPop` Population in this state 18 years or older as of the 2019 Census
* `Distributed_Per_100k_18Plus` Doses distributed to this state per 100,000 population 18 years or older
* `Administered_18Plus` Doses administered in this state to people 18 years or older
* `Admin_Per_100k_18Plus` Doses distributed in this state per 100,000 population 18 years or older

### Data Limitations:
The data is pre-aggregated to 7-day rolling averages. Currently, we utilize the state dose totals and not the people totals, as the available data history is longer.

### Comments/Notes:
n/a
