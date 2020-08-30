docs/Tesing_Data
====================

County and state level time-series testing data. These files are output of the python scripts in the data-scripts/Testing_Data folder.

Files
------------
#### county_testing.csv
Contains time-series county level testing data.

#### county_testing_posrate.csv
(Does not exist yet) Contains time-series county level testing positive rate (cumulative) data.

#### state_testing.csv
Contains time-series state level testing data and criterion.

#### state_testing_posrate.csv
Contains time-series state level testing positive rate (cumulative) data.

#### checklist.csv
Contains last update dates, latest available data dates, and data sources for each state.

#### checklist_state.csv
Contains last update dates, latest available data dates, and data sources for each state.

#### unmatched.txt
Contains unmatched counties

#### unmatched_state.txt
Contains unmatched states

#### not_monotonic.txt
Contains county names whose data are not monotonic increasing.
(Recounting issues, mixtures of accumulated and single-day testing, other errors)

KNOWN ISSUES & TO DO
--------------------
* Date formatting and order seems to be weird, will fix
* Add county_testing_posrate.csv
* Add county level testing criterion
* Cleanup
* In COVID Tracking Project, testing criterion has a third level called "testing encounters", which is above both specimens and persons tested; need to investigate further on what this means

### Sources
Corona Data Scraper: https://coronadatascraper.com/#home <br/>
COVID Tracking Project: https://covidtracking.com/data/api <br/>
Worldometer: https://www.worldometers.info/coronavirus/country/us/ <br/>

