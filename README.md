# README

The U.S. COVID-19 Atlas provides county-level visualizations and analytics to reveal a more detailed pandemic landscape with local hotspots of surging COVID cases that are missed by state-level data. 

The current Atlas is available here: https://geodacenter.github.io/covid/. The Atlas is being updated everyday before 12pm, CT. We are working on releasing regular updates with more data, functions, and analysis.
![screenshot](https://github.com/GeoDaCenter/covid/blob/master/data/screenshot.PNG)

## DATA

For more information about additional datasets used in the Atlas, see our Data page.

### Current Release
Because there is no one single validated source for county-level COVID cases and deaths for real-time analysis, we incorporate multiple datasets from multiple projects to allow for comparisons. For now, two datasets are available. More will be incorporated later. 
+ [*USAFacts*](https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/?utm_source=MailChimp&utm_campaign=census-covid2):this dataset is provided by a non-profit organization. The data are aggregated from CDC, state- and local-level public health agencies. County-level data is confirmed by referencing state and local agencies directly.
+ [*1P3A*](https://coronavirus.1point3acres.com/en): This was the initial, crowdsourced data project that served as a volunteer project led by Dr. Yu Gao, Head of Machine Learning Platform at Uber. We access this data stream using a token provided by the group.

We also include information from the following datasets: 
+ *American Community Survey*. We incorporate population data used to generate rates, and will add more information as needed in future iterations.
+ [*COVIDCareMap*](https://github.com/covidcaremap/covid19-healthsystemcapacity/tree/v0.2/data). Healthcare System Capacity includes Staffed beds, Staffed ICU beds, Licensed Beds by County. This data aggregates information about the healthcare system capacity with additions/edits allowed in real-time.. It sources data from the [Healthcare Cost Report Information System (HCRIS)](https://github.com/covidcaremap/covid19-healthsystemcapacity/tree/v0.2/data#healthcare-cost-report-information-system-hcris-data) and an open hospital facilities dataset by [Definitive Healthcare](https://github.com/covidcaremap/covid19-healthsystemcapacity/tree/v0.2/data#definitive-health-dh-data).

### Future Release
We have multiple datasets planned for future inclusion in the atlas, including:
+ [County Health Rankings & Roadmaps](https://www.countyhealthrankings.org/explore-health-rankings/rankings-data-documentation): social, economic, and health indicators by County. 
+ [Bin Yu Group](https://github.com/Yu-Group/covid19-severity-prediction): Hospital Severity Index forecasting by hospital location, and County
+ [Data.gov](http://data.gov): Indian Reservation Boundaries
+ [DesCartes Lab](https://github.com/descarteslabs/DL-COVID-19): Mobility index by County
+ [NYTimes](https://github.com/nytimes/covid-19-data): Confirmed Cases and Deaths by County & State
+ [PlaceIQ, Couture et al](https://github.com/COVIDExposureIndices/COVIDExposureIndices): Limited Exposure Index by County 
