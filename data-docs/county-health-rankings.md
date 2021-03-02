**Meta Data Name**: County Health Rankings & Roadmaps

**Last Modified**: 2/23/2021

**Author**: Dylan Halpern

### Data Location: 
[GeoDaCenter/covid/public/csv](https://github.com/GeoDaCenter/covid/tree/master/public/csv)

* County:
    * Health Context: [chr_health_context.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/chr_health_context.csv)
    * Health Factors: [chr_health_factors.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/chr_health_factors.csv)
    * Life Expectancy: [chr_life.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/chr_life.csv)
* State:
    * Health Context State: [chr_health_context_state.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/chr_health_context_state.csv)
    * Health Factors State: [chr_health_factors_state.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/chr_health_factors_state.csv)
    * Life Expectancy State: [chr_life_state.csv](https://raw.githubusercontent.com/GeoDaCenter/covid/master/public/csv/chr_life_state.csv)

### Data Source(s) Description:  
County Health Rankings and Roadmaps publishes data at the state and county level including "how health is influenced by where we live, learn, work, and play." Data can be accessed via their [website](https://www.countyhealthrankings.org/explore-health-rankings).

### Description of Data Processing: 
n/a

### Key Variable and Definitions:


chr_health_context / chr_health_context_state
| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `FIPS` | County and state level fips code to join to county geospatial data |
| State Name | `State` | Long name of state  |
| County Name | `County` | Long name of county (county-level only)|
| 65 years Old Percent | `OVer65YearsPrc` | Share of the population for a given area older than 65 years of age |
| Adult Obesity Percent | `AdObPrc` | Share of the adult population (20+) with a body mass index (BMI) greater than or equal to 30 kg/m2 |
| Diabetes Prevelance | `AdDibPRc` | Share of adult population (20+) with diagnosed diabetes |
| Percent Smokers | `SmkPrc` | Share of the population who smoke every day or most days and have smoked at least 100 cigarettes |
| Excess Drinking Percentage | `ExcDrkPrc` | Percentage of adults reporting binge or heavy drinking |
| Drug Overdose Mortality Rate | `DrOverdMrtRt` | Number of drug poisoning deaths per 100,000 population |


chr_health_factors / chr_health_factors_state

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `FIPS` | County and state level fips code to join to county geospatial data |
| State Name | `State` | Long name of state |
| County Name | `County` | Long name of county (county-level only) |
| Childhood in Poverty | `PovChldPrc` | Percentage of people under the age of 18 in poverty |
| Income Inequality | `IncRt` | A ratio of the 80th percentile income to the 20th percentile income |
| Median Household Income | `MedianHouseholdIncome` | The median income of a county or state for households |
| Food Insecurity | `FdInsPrc` | Percent of people without adequate food access |
| Unemployment Percent | `UnEmplyPrc` | Percent of people currently unemployed |
| Uninsured Percent | `UnInPrc` | Percent of people who do not have health insurance |
| Primary Care Physican Ratio | `PrmPhysRt` | A ratio of the total population to primary care physicians |
| Preventable Hospital Stays | `PrevHospRt` | A rate of hospital stays per 100,000 Medicare participants in the state or county |
| Racial Segregation | `RsiSgrBlckRt` | An index reflecting segregation in the state or county (higher value is more segregated) |
| Severe Housing Problems | `SvrHsngPrbRt` | Percent of households experiencing at least one of the following (via County Health Rankings): " overcrowding, high housing costs, lack of kitchen facilities, or lack of plumbing facilities." |

chr_life / chr_life_state
| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `FIPS` | County and state level fips code to join to county geospatial data |
| State Name | `State` | Long name of state |
| County Name | `County` | Long name of county (county-level only) |
| Life Expectancy | `LfExpRt` | Average life expectancy of residents in years. |
| Self-Rated Health | `SlfHlthPrc` | Percent of residents self reporting fair or poor health quality. |

### Description of Data Source Tables: 
Detailed descriptions of the included variables with methodology are available from County Health Rankings & Roadmaps:
* [Health Factors and Context](https://www.countyhealthrankings.org/explore-health-rankings/measures-data-sources/county-health-rankings-model/health-factors)
* [Health Outcomes / Life Expectancy](https://www.countyhealthrankings.org/explore-health-rankings/measures-data-sources/county-health-rankings-model/health-outcomes)

### Data Limitations:
No limitations to report.

### Comments/Notes:
n/a
