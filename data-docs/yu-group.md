**Meta Data Name**: Yu Group at UC Berkeley

**Last Modified**: 02/28/2021

**Author**: Laura Chen

### Data Location:
* Berkeley Severity Forecasting [berkeley_predictions.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/berkeley_predictions.csv)

### Data Source(s) Description:
The Yu group at UC Berkeley Statistics and EECS has compiled, 
cleaned and documented a large corpus of hospital- and county-level 
data from a variety of public sources to aid data science efforts to 
combat COVID-19. 

### Description of Data Processing:
Data are taken directly from the output of the Yu Group at UC Berkeley's model.
    
### Key Variable and Definitions:
berkeley_predictions.csv

| Variable | Variable ID in .csv | Description|
|:---------|:--------------------|:------------|
| FIPS (Join Column | fips | County geophraphic identifier to join to geospatial data |
| COVID Hospital Severity Index | severity_index | A scale of 1-3 indiciating the severity of COVID currently in each county. |
| Projected Deaths (5 day forecast) | deaths_YYYY_MM_DD (time-series)| The number of deaths estimated to occur in the next five days. |


### Description of Data Source Tables:
At the hospital level, the data includes the location 
of the hospital, the number of ICU beds, the total number of employees, 
and the hospital type. At the county level, the data includes COVID-19 
cases/deaths from USA Facts and NYT, automatically updated every day, 
along with demographic information, health resource availability, 
COVID-19 health risk factors, and social mobility information. 

See the [Yu-Group/covid19-severity-prediction](https://github.com/Yu-Group/covid19-severity-prediction) for more information.

- **Hospital Level Data**
    - [cms_cmi](https://www.cms.gov/Medicare/Medicare-Fee-for-Service-Payment/AcuteInpatientPPS/FY2020-IPPS-Final-Rule-Home-Page-Items/FY2020-IPPS-Final-Rule-Data-Files): Case Mix Index for hospitals from CMS 
    - [cms_hospitalpayment](https://www.cms.gov/OpenPayments/About/Resources): Teaching Hospital info from CMS
    - [DH_hospital](https://coronavirus-resources.esri.com/datasets/definitivehc::definitive-healthcare-usa-hospital-beds): US Hospital info from Definitive Healthcare
    - [dhhs_hospitalcapacity](https://healthdata.gov/dataset/covid-19-reported-patient-impact-and-hospital-capacity-facility): US hopsital capcity data, updated weekly, from US DHHS
    - [hifld_hospital](https://hifld-geoplatform.opendata.arcgis.com/datasets/6ac5e325468c4cb9b905f1728d6fbf0f_0): Hospital info from homeland infrastructue foundation level data
- **Nursing Homes Level Data**
	- [nyt_nursinghomes](https://www.nytimes.com/interactive/2020/05/09/us/coronavirus-cases-nursing-homes-us.html): number of COVID-19-related cases and deaths from nursing homes, as reported by NYT
	- [hifld_nursinghomes](https://hifld-geoplatform.opendata.arcgis.com/datasets/78c58035fb3942ba82af991bb4476f13_0): database of nursing homes/assisted living facilities, populated via open source authoritative sources
- **County Level Data**
    - **COVID-19 Cases/Deaths Data**
        - [nytimes_infections](https://github.com/nytimes/covid-19-data): COVID-19-related death/case counts per day per county from NYT
        - [usafacts_infections](https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/): COVID-19-related death/case counts per day per county from USA Facts
        - [ccd_daily](https://covidcountydata.org/data): COVID-19-related deaths, cases, hospitalizations, and testing statistics
    - **Demographics and Health Resource Availability**
        - [ahrf_health](https://data.hrsa.gov/data/download): contains county-level information on health facilities, health professions, measures of resource scarcity, health status, economic activity, health training programs, and socioeconomic and environmental characteristics from Area Health Resources Files
        - [cdc_svi](https://svi.cdc.gov/): Social Vulnerability Index for counties from CDC
        - [hpsa_shortage](https://data.hrsa.gov/data/download): information on areas with shortages of primary care, as designated by the Health Resources & Services Administration (HRSA)
        - [khn_icu](https://khn.org/news/as-coronavirus-spreads-widely-millions-of-older-americans-live-in-counties-with-no-icu-beds/): information on number of ICU beds and hospitals per county from Kaiser Health News
        - [usda_poverty](https://www.ers.usda.gov/data-products/county-level-data-sets/download-data/): county-level poverty estimates from the United States Department of Agriculture, Economic Research Service
    - **Health Risk Factors**
        - [chrr_health](https://www.countyhealthrankings.org/): contains estimates of various health outcomes and health behaviors (e.g., percentage of adult smokers) for each county from County Health Rankings & Roadmaps
        - [dhdsp_heart](https://www.cdc.gov/dhdsp/maps/atlas/index.htm): cardiovascular disease mortality rates from CDC DHDSP
        - [dhdsp_stroke](https://www.cdc.gov/dhdsp/maps/atlas/index.htm): stroke mortality rates from CDC DHDSP
        - [ihme_respiratory](http://ghdx.healthdata.org/record/ihme-data/united-states-chronic-respiratory-disease-mortality-rates-county-1980-2014): chronic respiratory disease mortality rates from IHME
        - [medicare_chronic](https://www.cms.gov/Research-Statistics-Data-and-Systems/Statistics-Trends-and-Reports/Chronic-Conditions/CC_Main): Medicare claims data for 21 chronic conditions
        - [nchs_mortality](https://wonder.cdc.gov/cmf-icd10.html): overall mortality rates for each county from National Center for Health Statistics
        - [usdss_diabetes](https://gis.cdc.gov/grasp/diabetes/DiabetesAtlas.html#): diagnosed diabetes in each county from CDC USDSS
        - [kinsa_ili](https://www.kinsahealth.co/): measures of anomalous influenza-like illness incidence (ILI) outbreaks in real-time using Kinsa’s county-level illness signals, developed from real-time geospatial thermometer data (private data)
        - [cmu_covidcast](https://cmu-delphi.github.io/delphi-epidata/api/covidcast.html): epidemiological data from the CMU Delphi COVIDcast, which includes data on COVID-like symptoms from Facebook surveys, estimated COVID-related doctor visits and hospital admissions, and other indicators
    - **Social Distancing and Mobility/Miscellaneous**
    	- [nytimes_masks](https://github.com/nytimes/covid-19-data/tree/master/mask-use): mask-wearing survey data from NYT and Dynata
        - [google_mobility](https://www.google.com/covid19/mobility/): community mobility reports from Google
    	- [apple_mobility](https://www.apple.com/covid19/mobility): mobility trends from Apple maps direction requests
        - [unacast_mobility](https://www.unacast.com/covid19/social-distancing-scoreboard): county-level estimates of the change in mobility from pre-COVID-19 baseline from Unacast (private data)
        - [streetlight_vmt](https://www.streetlightdata.com/VMT-monitor-by-county/): estimates of total vehicle miles travelled (VMT) by residents of each county, each day; provided by Streetlight Data (private data)
        - [safegraph_socialdistancing](https://www.safegraph.com/covid-19-data-consortium): aggregated daily views of USA foot-traffic summarizing movement between counties from SafeGraph (private data)
        - [safegraph_weeklypatterns](https://www.safegraph.com/covid-19-data-consortium): place foot-traffic and demographic aggregations that answer: how often people visit, where they came from, where else they go, and more; from SafeGraph (private data)
        - [jhu_interventions](https://github.com/JieYingWu/COVID-19_US_County-level_Summaries): contains the dates that counties (or states governing them) took measures to mitigate the spread by restricting gatherings (e.g., travel bans, stay at home orders)
        - [mit_voting](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ): county-level returns for presidential elections from 2000 to 2016 according to official state election data records
- **Miscellaneous Data**
	- [bts_airtravel](https://transtats.bts.gov/Databases.asp?Mode_ID=1&Mode_Desc=Aviation&Subject_ID2=0): survey data including origin, destination, and itinerary details from a 10% sample of airline tickets from the Bureau of Transportation Statistics
    - [fb_socialconnectedness](https://data.humdata.org/dataset/social-connectedness-index): an anonymized snapshot of all active Facebook users and their friendship networks as a measure of social connectedness between two different places

### Data Limitations:
No limitations to report.

### Comments/Notes:
n/a
