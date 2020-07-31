# README

[![Netlify Status](https://api.netlify.com/api/v1/badges/f97601fe-2d82-482a-befe-b58f1bd7aa90/deploy-status)](https://app.netlify.com/sites/hardcore-wozniak-6dbde2/deploys)

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
+ [County Health Rankings & Roadmaps](https://www.countyhealthrankings.org/explore-health-rankings/rankings-data-documentation): social, economic, and health indicators by County. 
+ [Bin Yu Group](https://github.com/Yu-Group/covid19-severity-prediction): Predicted death counts and Severity index by County
+ [Native American Reservations](https://hifld-geoplatform.opendata.arcgis.com/datasets/54cb67feef5746e8ac7c4ab467c8ae64): boundary for Native American Reservations.
+ [Hypersegregated Cities](https://www.princeton.edu/news/2015/05/18/hypersegregated-cities-face-tough-road-change): boundary for historical and current hypersegregated cities. 

### Future Release
We have multiple datasets planned for future inclusion in the atlas, including:
+ [Bin Yu Group](https://github.com/Yu-Group/covid19-severity-prediction): Hospital Severity Index forecasting by hospital location
+ [Data.gov](http://data.gov): Indian Reservation Boundaries
+ [DesCartes Lab](https://github.com/descarteslabs/DL-COVID-19): Mobility index by County
+ [NYTimes](https://github.com/nytimes/covid-19-data): Confirmed Cases and Deaths by County & State
+ [PlaceIQ, Couture et al](https://github.com/COVIDExposureIndices/COVIDExposureIndices): Limited Exposure Index by County 

### Data Details
#### USAFacts
You can download the most updated county level data merged with USAFacts [here](https://github.com/GeoDaCenter/covid/tree/master/): 
+ usafacts_confirmed_*date*.geojson: the county level data (confirmed cases) using [*USAFacts*](https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/?utm_source=MailChimp&utm_campaign=census-covid2), together with population and number of hospital beds. 
+ usafacts_deaths_*date*.geojson: the county level data (death counts) using [*USAFacts*](https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/?utm_source=MailChimp&utm_campaign=census-covid2), together with population and number of hospital beds. 
+ *date*_confirm_per10K_usafacts.gif: the animation (.gif) showing how the pandemic has been changing over time (using confirmed cases per 10K population), which is also displayed in the Atlas. The GIF is updated weekly. If you would like to get a more timely gif, send us an email (qinyunlin@uchicago.edu) and we can prepare that for you.  

#### 1P3A
To access raw 1P3A data, you must contact the 1P3A for a token directly.  

Not all cases from 1P3A data can be assigned to a particular county, see following (the list is being updated as new data comes in everyday) 
+ 1P3A does NOT assign cases in New York to specific counties, which includes New York City, Kings, Bronx, and Richmond.   
+ Cases reported for US Virgin Islands, Guam are NOT included.   
+ Cases in the following areas can NOT be assigned and hence are NOT included: Southwest Utah; Southeast Utah; Central Utah; Tri County, Utah; Kansas City, MO; Benton and Franklin, WA. 
+ Other unassigned cases (or “cases to be assigned”) are NOT included.
+ Cases reported in the Military and some Correctional Centers are NOT included. 

## METHOD

For a complete breakdown about the methods used in the Atlas, see our [Methods](https://geodacenter.github.io/covid/methods.html) page.

The hotspot detection ( a Local Indicator of Spatial Autocorrelation) is powered by **Geoda**. We also use many other features from **GeoDa** including natural breaks classification and cartogram techniques. See below for how one can apply these methods to reproduce the results using above datasets.  

+ [Natural breaks choropleth map](http://geodacenter.github.io/workbook/3a_mapping/lab3a.html#natural-breaks-map)
+ [Cartogram](http://geodacenter.github.io/workbook/3a_mapping/lab3a.html#cartogram)
+ [Queen contiguity spatial weights creation](http://geodacenter.github.io/workbook/4a_contig_weights/lab4a.html#queen-contiguity)
+ [Local Moran statistics](http://geodacenter.github.io/workbook/6a_local_auto/lab6a.html#local-moran)
+ [Univariate Local Indicator of Spatial Autocorrelation (LISA)](http://geodacenter.github.io/workbook/6a_local_auto/lab6a.html)

More information about the Geoda project can be found [here](https://geodacenter.github.io/).

## COLLABORATORS

We are growing a coalition of research partners that have been integral to developing and expanding the Covid Atlas to meet the needs of health practitioners, planners, researchers, and the public. This is an open-source collaborative project. 

### Research Partners: 
+ [Center for Spatial Data Science](https://spatial.uchicago.edu/) (CSDS) at the University of Chicago. The Atlas was originally developed as a project co-led by Marynia Kolak, Xun Li, and Qinyun Lin at the Center for Spatial Data Science, where it remains as its home institution. CSDS leads the development and management of the atlas with developers Robert Martin and Arianna Israel.
+ [The Yu Group](https://www.stat.berkeley.edu/~yugroup/people.html) at UC Berkeley’s Department of Statistics is working with [Response4Life](https://response4life.org/) to develop a [severity index](https://github.com/Yu-Group/covid19-severity-prediction) for each hospital to help distribute supplies when they become available. The Yu Group generates daily updates of COVID data and contributes both hospital and county-level severity index data for the Atlas. 
+ [County Health Rankings & Roadmaps (CHR&R)](https://www.countyhealthrankings.org/) led by Lawrence Brown. CHR’s goal is to improve health outcomes for all and to close the health gaps between those with the most and least opportunities for good health. CHR leads efforts to connect socioeconomic and health vulnerability indicators to the Atlas to better contextualize and inform findings.
+ [CSI Solutions](https://spreadinnovation.com/) led by Roger L. Chaufournier and Kathy Reims are critical to connecting the Atlas with rural health partners across the country to define and prioritize needs for care management during the pandemic. CSI leads efforts in developing and refining this “Communities of Practice” forum.
+ [AFI DSI COVID-19 Research Group](https://datascience.wisc.edu/covid19/) at UW-Madison. This group led by [Brian Yandell](https://datascience.wisc.edu/covid19) was an early institutional partner to amplify regional efforts to respond to the pandemic. Kevin Little of [Informing Ecological Design](https://www.iecodesign.com) was critical in connecting the Atlas team with a nationwide network and leading user-group sessions to review the atlas, align priorities, and ensure it was effective for a wide audience. [Steve Goldstein](https://biostat.wiscweb.wisc.edu/staff/goldstein-steve/) continues to work with our team in data validation efforts.

### Contributors:
We highly appreciate our many contributors and volunteers, including: 

+ Erin Abbott (CSDS) 
+ [Sihan Mao](https://www.linkedin.com/in/sihan-mao/) (CSDS Alumni, City of Pittsburgh)
+ Karina Acoste (CSDS) 
+ Julia Koschinsky (CSDS) 
+ [Luc Anselin](https://spatial.uchicago.edu/directory/luc-anselin-phd) (CSDS)
+ Bibind Vasu (CSDS)
+ [John Steill](https://www.linkedin.com/in/johnsteill/) (UW-Madison)
+ [Sean Kent](http://pages.cs.wisc.edu/~kent/) (UW-Madison) 
+ [Steven Wangen](https://www.linkedin.com/in/steven-wangen/) (UW-Madison) 
+ [Yuetian Luo](https://www.linkedin.com/in/yuetian-luo-3b394b113/) (UW-Madison)
+ Fletcher Barryman (CSDS)

## CONTACT US
If you have a question regarding a specific dataset, please contact the dataset author(s) directly. If you have any questions regarding the Atlas, feel free to pose an issue here or contact us by: mkolak@uchicago.edu or qinyunlin@uchicago.edu.  





