# Data Documentation: US Covid Atlas

This folder contains data links and descriptions for all available and archived data for the US Covid Atlas project. The US Covid Atlas aggregates data from a variety of sources to present real-time stats and historic data. No one source or variable holistically captures the pandemic's impact on communities in the US, so providing multi-dimensional snapshots and histories is central to the datasets available on the Atlas.

## Current Datasets

The table below lists the currently available datasets visualized in the Atlas. The Atlas API makes it easy to fetch and analyze data -- data available in the API are marked in the `API Access` column. Links to the in-depth `Data Docs(📄)`, original data publisher `Source Link(🔗)`, and US Covid Atlas `Data Scripts(👩‍💻)` are available for most datasets below.

| Dataset | Variables | Data Docs | Source Link | Data Scripts | API Access | 
|:---------|:-----|:-----|:-----|:-----|:------|
|USA Facts|Cases and Deaths|[📄](http://www.github.com/GeoDaCenter/covid/blob/master/data-docs/usafacts.md)|[🔗](https://usafacts.org/visualizations/coronavirus-covid-19-spread-map)|[👩‍💻](https://github.com/GeoDaCenter/covid/tree/master/data-scripts/usafacts)|✔️|
|1point3acres|Cases and Deaths|[📄](http://www.github.com/GeoDaCenter/covid/blob/master/data-docs/_1p3a.md)|[🔗](http://1points3acres.com/)|[👩‍💻](https://github.com/GeoDaCenter/covid/tree/master/data-scripts/_1p3a)||
|New York Times|Cases and Deaths|[📄](https://github.com/GeoDaCenter/covid/blob/master/data-docs/new-york-times.md)|[🔗](https://github.com/nytimes/covid-19-data)|[👩‍💻](https://github.com/GeoDaCenter/covid/tree/master/data-scripts/nyt)||
|CDC|Testing Positivity and Testing Capacity, Vaccine Doses Administered and Distributed|[📄](https://github.com/GeoDaCenter/covid/blob/master/data-docs/center-for-disease-control.md)|[🔗](https://healthdata.gov/dataset/covid-19-diagnostic-laboratory-testing-pcr-testing-time-series)|[👩‍💻](https://github.com/GeoDaCenter/covid/tree/master/data-scripts/cdc)||
|HHS|State Level Testing|[📄](https://github.com/GeoDaCenter/covid/blob/master/data-docs/health-and-human-services.md)|[🔗](https://covid.cdc.gov/covid-data-tracker/#county-view)|[👩‍💻](https://github.com/GeoDaCenter/covid/tree/master/data-scripts/cdc)||
|Yu Group at UC Berkeley|COVID Severity and Death Forecasting|[📄](http://www.github.com/GeoDaCenter/covid/blob/master/data-docs/yu-group.md)|[🔗](https://covidseverity.com/)|[👩‍💻](https://github.com/GeoDaCenter/covid/tree/master/data-scripts/berkeley_predictions)||
|County Health Rankings| Percent Uninsured, Percent Over 65 Years Old, Life Expectancy, and other Social Determinants of Health|[📄](http://www.github.com/GeoDaCenter/covid/blob/master/data-docs/county-health-rankings.md)|[🔗](https://www.countyhealthrankings.org/)|||
|American Community Survey|Population|[📄](http://www.github.com/GeoDaCenter/covid/blob/master/data-docs/american-community-survey.md)|[🔗](https://www.census.gov/programs-surveys/acs)|||

## Archived Datasets

The below datasets have previously been included in the Atlas, but are not available in the current release.

| Dataset | Variables | Data Docs | Source Link | Data Scripts | API Access | 
|:---------|:-----|:-----|:-----|:-----|:------|
|Covid Tracking Project|State Level Testing Positivity and Capacity, Confirmed Cases Per Testing Positive (CCPT)|[📄](http://www.github.com/GeoDaCenter/covid/tree/master/data-docs/covid-tracking-project.md)|[🔗](https://covidtracking.com/)|[👩‍💻](https://github.com/GeoDaCenter/covid/tree/master/data-scripts/cdc)||

## Experimental / In-Progress Datasets

The below datasets currently being explored and may be available in a future release.

| Dataset | Variables | Data Docs | Source Link | Data Scripts | API Access | 
|:---------|:-----|:-----|:-----|:-----|:------|
|Safegraph Social Distancing|Percent of Devices Completely At Home, Full Time Behavior, Part Time Behavior|[📄](https://github.com/GeoDaCenter/covid/blob/master/data-docs/safegraph_sd.md)|[🔗](https://docs.safegraph.com/docs/social-distancing-metrics)|||
|Safegraph POI Visits|POI Visits by County Totals and Normalized |[📄](https://github.com/GeoDaCenter/covid/blob/master/data-docs/safegraph_poi.md)|[🔗](https://docs.safegraph.com/docs/weekly-patterns)|||

## Geographic Boundaries

The datasets below contain the geographic boundaries used in the COVID Atlas. 

| Dataset | Geographic Scale | Data Docs | Source Link |
|:--------|:-----------------|:----------|:------------|


## A quick reference for data files in `public/csv` folders

File naming rules: data type - data source - suffix (optional) 

Suffix meanings:
- state: the data is at state level. If there is no suffix, the data is at county level
- h: a hybrid of county level data and state level data since 

The following files are ordered alphabetically.

**Prediction datasets**

`berkeley_predictions.csv`: COVID Severity and Death Forecasting data for future 7 days from Yu Group at UC Berkeley


**County Health Rankings**

`chr_health_context.csv`: Health context data such as 65 Years Old Percent, Adult Obesity Percent, Excess Drinking Percent, etc.

`chr_health_context_state.csv`: Health Context data at state level

`chr_health_factors.csv`: Health factors data such as Childhood in Poverty, Income Inequality, Food Insecurity, etc.

`chr_health_factors_state.csv`: Health factors data at state level

`chr_life.csv`: Life expectancy data

`chr_life_state.csv`: Life expectancy data at state level



**Context Data**

`context_essential_workers_acs.csv`: Percentage of essential workers from American Community Survey

`context_fqhc_clinics_hrsa.csv`: Locations of Federally Qualified Health Centers (FQHCs) Clinics from the Health Resources and Services Administration (HRSA)

`context_hospitals_covidcaremap.csv`: Locations and other infomation of hospitals according to COVIDCareMap

`context_vaccination_sites_hrsa_wh.csv`: The locations of vccination sites from the Health Resources and Services Administration (HRSA)


**COVID Cases/Deaths/Testings Data**

`covid_ccpt_cdc.csv`: The Cases Per Testing Positive (CCPT) data from CDC

`covid_ccpt_cdc_state.csv`: The Cases Per Testing Positive (CCPT) data from CDC at state level

`covid_confirmed_1p3a.csv`: The daily new count confirmed cases from 1 Point 3 Acres

`covid_confirmed_1p3a_state.csv`: The daily new count confirmed cases from 1 Point 3 Acres at state level

`covid_confirmed_cdc.csv`: The 7 day average confirmed cases data from CDC

`covid_confirmed_cdc_state.csv`: The 7 day average confirmed cases data from CDC at state level

`covid_confirmed_nyt.csv`: The accumulative confirmed cases data from New York Times

`covid_confirmed_nyt_state.csv`: The accumulative confirmed cases data from New York Times at state level

`covid_confirmed_usafacts.csv`: The accumulative confirmed cases data from USAFacts

`covid_confirmed_usafacts_h.csv`: The accumulative confirmed cases data from USAFacts at hybrid level(for places without county level data, state 
level data are used)

`covid_confirmed_usafacts_state.csv`: The accumulative confirmed cases data from USAFacts at state level

`covid_deaths_1p3a.csv`: The daily new deaths from 1 Point 3 Acres

`covid_deaths_1p3a_state.csv`: The daily new deaths from 1 Point 3 Acres at state level

`covid_deaths_cdc.csv`: The 7 day average new deaths data from CDC

`covid_deaths_cdc_state.csv`: The 7 day average new deaths data from CDC at state level

`covid_deaths_nyt.csv`: The accumulative deaths data from New York Times 

`covid_deaths_nyt_state.csv`: The accumulative deaths data from New York Times at state level

`covid_deaths_usafacts.csv`: The accumulative deaths data from USAFacts

`covid_deaths_usafacts_h.csv`: The accumulative deaths data from USAFacts at hybrid level

`covid_deaths_usafacts_state.csv`: The accumulative deaths data from USAFacts at state level

`covid_tcap_cdc.csv`: The Testing Capacity Per 100k Population from CDC

`covid_tcap_cdc_state.csv`: The Testing Capacity Per 100k Population from CDC at state level

`covid_testing_cdc.csv`: The Testing Count from CDC

`covid_testing_cdc_state.csv`: The Testing Count from CDC at state level

`covid_wk_pos_cdc.csv`: The weekly Positivity from CDC

`covid_wk_pos_cdc_state.csv`: The weekly Positivity from CDC at state level



**Mobility Data**

`mobility_fulltime_workdays_safegraph.csv`: Percentage of full time workers from SafeGraph

`mobility_home_workdays_safegraph.csv`: Percentage of home dwellers from SafeGraph

`mobility_parttime_workdays_safegraph.csv`: Percentage of parttime workers from SafeGraph



**COVID Vaccinations Data**

`vaccination_fully_vaccinated_cdc.csv`: Accumulative Fully Vaccinated Count from CDC

`vaccination_fully_vaccinated_cdc_h.csv`: Accumulative Fully Vaccinated Count from CDC at hybrid level

`vaccination_fully_vaccinated_cdc_state.csv`: Accumulative Fully Vaccinated Count from CDC at state level

`vaccination_one_or_more_doses_cdc.csv`: Accumulative One or More Doses Count from CDC 

`vaccination_one_or_more_doses_cdc_h.csv`: Accumulative One or More Doses Count from CDC at hybrid level

`vaccination_one_or_more_doses_cdc_state.csv`: Accumulative One or More Doses Count from CDC at state level

`vaccination_to_be_distributed_cdc.csv`: The number of vaccines to be distributed 

`vaccination_to_be_distributed_cdc_state.csv`: The number of vaccines to be distributed at state level
