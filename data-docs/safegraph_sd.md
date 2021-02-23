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
Source is [here](https://docs.safegraph.com/docs/social-distancing-metrics) via Safegraph. 

### Description of Data Source Tables: 
The data was generated using a panel of GPS pings from anonymous mobile devices. We determine the common nighttime location of each mobile device over a 6 week period to a Geohash-7 granularity (~153m x ~153m). For ease of reference, we call this common nighttime location, the device's "home". We then aggregate the devices by home census block group and provide the metrics set out below for each census block group. [1]

### Description of Data Processing: 
TBD

### Key Variable and Definitions:

Safegraph Data Schema

| Variable | Variable ID in .csv | Description |
|:---------|:--------------------|:------------|
| Readable Name | Column Name | Description |

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
