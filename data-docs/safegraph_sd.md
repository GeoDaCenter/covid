**Meta Data Name**: Safegraph Social Distancing Data

**Last Modified**: 3/03/2021

**Author**: Andres Crucetta Nieto

### Data Location: 

Safegraph Social Distancing data can be accessed via their [COVID-19 data consortium signup](https://www.safegraph.com/covid-19-data-consortium).

### Data Source(s) Description:  
Source is [here](https://docs.safegraph.com/docs/social-distancing-metrics) via Safegraph. 

### Description of Data Source Tables: 
The data was generated using a panel of GPS pings from anonymous mobile devices. We determine the common nighttime location of each mobile device over a 6 week period to a Geohash-7 granularity (~153m x ~153m). For ease of reference, we call this common nighttime location, the device's "home". We then aggregate the devices by home census block group and provide the metrics set out below for each census block group. [1]

### Description of Data Processing: 
The data for Social Distancing was distilled from its raw status into daily and weekday format. We also created a percent change from 2019
dataset to compare trends in the workplace.

### Key Variable and Definitions:

Percentage of Delivery Workers (Daily)

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week Day | YYYY-MM-DD | Percentage of delivery workers for that day |

Percentage of Full-Time Workers (Daily)

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Day | YYYY-MM-DD | Percentage of full-time workers for that day |

Percentage of Full-Time Workers (Weekday)

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week Day | YYYY-MM-DD | Percentage of full-time workers for that weekday |

Percentage of Home Dwellers (Daily)

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Day | YYYY-MM-DD | Percentage of home dwellers for that day |

Percentage of Part-Time Workers (Daily)

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Day | YYYY-MM-DD | Percentage of part-time workers for that day |

Percentage of Part-Time Workers (Weekday)

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week Day | YYYY-MM-DD | Percentage of part-time workers for that weekday |

Change from 2019 - Full-Time

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week | YYYY-MM-DD | Percentage change of full-time workers from 2019 for that week |

Change from 2019 - Home Dwellers

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week | YYYY-MM-DD | Percentage change of home dwellers from 2019 for that week |

Change from 2019 - Part-Time

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Week | YYYY-MM-DD | Percentage change of part-time workers from 2019 for that week |

Percent of People at Home

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| Week | YYYY-MM-DD | Percentage of part-time workers for that week |
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Percent of people home | pct_home | Percentage of people home for that week |

Percent of People Full-Time

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| Week | YYYY-MM-DD | Percentage of full-time workers for that week |
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Percent of people full-time | pct_fulltime | Percentage of people working full-time for that week |

Percent of People Part-Time

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| Week | YYYY-MM-DD | Percentage of full-time workers for that week |
| FIPS Code (Join Column) | `fips_code` | County level fips code to join to county geospatial data |
| Percent of people part-time | pct_parttime | Percentage of people working part-time for that week |


### Data Limitations:
To preserve privacy, we apply differential privacy to all of the device count metrics other than the device_count. This may cause the exact sum of devices to not equal device_count, especially for sparsely populated origin_census_block_group. Differential privacy is applied to all of the following columns: completely_home_device_count, part_time_work_behavior_devices, full_time_work_behavior_devices, delivery_behavior_devices, at_home_by_each_hour, bucketed_away_from_home_time, bucketed_distance_traveled, bucketed_home_dwell_time, bucketed_percentage_time_home. [1]

If as a result of the differential privacy applied:

    device_count < part_time_work_behavior_devices + full_time_work_behavior_devices +completely_home_device_count or
    device_count < sum(counts in bucketed_distance_traveled) or
    device_count < sum(counts in bucketed_home_dwell_count),

we then increase the device_count to the applicable sum (this only occurs in census_block_groups with small device_counts).

### Comments/Notes:

### References:
[1] https://docs.safegraph.com/docs/social-distancing-metrics
