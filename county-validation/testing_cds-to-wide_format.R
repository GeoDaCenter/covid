# library(readr)
library(tidyr)
library(dplyr)
library(stringr)
library(usmap)

url <- "https://coronadatascraper.com/timeseries-tidy.csv"

timeseries_tidy <- 
  # read.csv("data/timeseries-tidy.csv") %>%
  # read.csv(url) %>%
  as_tibble()

# filter data and go from long to wide format
cds_wide <- 
  timeseries_tidy %>% 
  filter(country == "USA" & city == "" & county != "") %>% 
  filter(type == "cases") %>% 
  pivot_wider(names_from = "date",
              values_from = "value") %>% 
  select(-city, -population, -lat, -long, -url)

## append countyFIPS and state FIPS and re-order columns
cds_wide_2 <- 
  cds_wide %>% 
  left_join(data.frame(state.abb, 
                       state.name = stringr::str_to_lower(state.name)), 
            by = c("state" = "state.abb")) %>% 
  mutate(county.lower = county %>% 
           str_remove(" County") %>% 
           str_remove(" Parish") %>% 
           str_remove_all("\\.") %>% 
           str_to_lower()) %>% 
  mutate(county.state = paste0(state.name, ",", county.lower)) %>% 
  left_join(county.fips, 
            by = c("county.state" = "polyname")) %>% 
  mutate(stateFIPS = usmap::fips(state),
         countyFIPS = fips) %>% 
  select(countyFIPS, county, state, stateFIPS, contains("-")) %>% 
  arrange(stateFIPS, countyFIPS)

cds_wide_2

## IGNORE BELOW
## The code below attempts to get better countyFIPS since there's still about
## 100 counties without a given FIPS code.  




# tmp2 %>% 
#   filter(is.na(countyFips)) %>% 
#   select(countyFips, county, state) %>% 
#   arrange(state) %>% 
#   print(n = Inf)


# county.fips[str_detect(county.fips$polyname, "virginia"),]

## attempt2: see if the names match up between this data and usafacts
# potential problem, I think the cds data has more counties


# usafacts <- read_csv("data/covid_confirmed_usafacts.csv")
# 
# state_of_interest <- "GA"
# 
# tmp %>% 
#   left_join(usafacts %>% select(countyFIPS, `County Name`),
#             by = c("county" = "County Name")) %>% 
#   filter(is.na(countyFIPS)) %>% 
#   select(countyFIPS, county, state) %>% 
#   arrange(state) %>% 
#   filter(state == state_of_interest) %>% 
#   print(n = Inf)
# 
# tmp %>%
#   filter(state == state_of_interest) %>%
#   select(county, state) %>% 
#   arrange(county)
# 
# usafacts %>% 
#   filter(State == state_of_interest) %>% 
#   select(`County Name`, State) %>% 
#   arrange(`County Name`)
# 
# skimr::skim(tmp)
# 
# tmp %>% 
#   filter(county != "") %>% 
#   group_by(county, state) %>% 
#   summarize(n = n()) 
# 
# 
# 
# ## attempt 3: use usmaps::fips 
# 
# tmp %>% 
#   mutate(countyFIPS = map2_chr(state, county, ~usmap::fips(.x, .y))) 
# 
# # errors out...
#   
#   
#   
#   
# # TODO: what to do with unassigned?
# # TODO: what do to with "out of state"?
# 
# 
# tmp %>% filter(county == "(unassigned)") %>% 
#   select(county, state, country, type, `2020-03-23`)
# 
# 
# 
# tmp %>% 
#   filter(state == "TN") %>% 
#   select(county, state, `2020-03-23`) %>% 
#   print(n = Inf)
# 
# 
# 
# 
