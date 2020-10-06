setwd("~/Documents/GitHub/lqycovid/data-scripts/_usafacts/_working")



#Change Field Names, Change

county_hist <- read.csv("~/Documents/GitHub/covid-atlas-research/Testing_Data/python/county_hist.csv")

testing_usafacts <- county_hist %>% 
  rename("countyFIPS" = "geoid", "County Name" = "name", "State" = "st_abbr") %>%
  select("countyFIPS", "County Name", "State", starts_with("X2020"))
for (i in 4:ncol(testing_usafacts)){
  names(testing_usafacts)[i] <- paste(as.character(as.numeric(substr(names(testing_usafacts)[i],7,8))), "/",
                                      as.character(as.numeric(substr(names(testing_usafacts)[i],10,11))), "/", "20", sep = "")
}

testing_usafacts$"1/22/20" <- -1
testing_usafacts$"1/23/20" <- -1
testing_usafacts$"1/24/20" <- -1
testing_usafacts$"1/25/20" <- -1
testing_usafacts$"1/26/20" <- -1
testing_usafacts$"1/27/20" <- -1
testing_usafacts$"1/28/20" <- -1
testing_usafacts$"1/29/20" <- -1
testing_usafacts$"1/30/20" <- -1
testing_usafacts$"1/31/20" <- -1

write.csv(testing_usafacts,'testing_usafacts.csv')

#USAFacts delete index!!!

#Run this script first before Python
library(dplyr)
library(sf)

state_testing_count <- read.csv("/Users/ryan/Documents/GitHub/covid-atlas-research/Testing_Data/python/state_testing.csv")
for (i in 3:259) {#update this number every day
  names(state_testing_count)[i] <- 
    paste("t", substr(names(state_testing_count)[i], 2, 5), "-",
          substr(names(state_testing_count)[i], 6, 7), "-",
          substr(names(state_testing_count)[i], 8, 9), sep = "")
}

state_testing_count[,3:259][is.na(state_testing_count[,3:259])] <- -1  #update this number every day

# Read in states_update_processing.geojson
states_update <- as.data.frame(st_read("/Users/ryan/Documents/GitHub/lqycovid/docs/states_update_processing.geojson"))
for (i in 17:254) {#update this number every day
  names(states_update)[i] <- 
    paste(substr(names(states_update)[i], 2, 5), "-",
          substr(names(states_update)[i], 7, 8), "-",
          substr(names(states_update)[i], 10, 11), sep = "")
}

for (i in 255:492) {#update this number every day 254-17+255
  names(states_update)[i] <- 
    paste("d", substr(names(states_update)[i], 2, 5), "-",
          substr(names(states_update)[i], 7, 8), "-",
          substr(names(states_update)[i], 10, 11), sep = "")
}

state_testing_count$"t2020-01-21" <- -1
state_testing_count$"t2020-01-24" <- -1
state_testing_count$"t2020-01-26" <- -1
state_testing_count$"t2020-01-30" <- -1
state_testing_count$"t2020-01-31" <- -1

for (i in 1:233){ #+1 everyday
  den <- names(states_update)[22 + i-1]
  for (j in 1:56){
    if (is.na(state_testing_count[j,paste("t",den, sep = "")])) {
      state_testing_count[j,paste("t",den, sep = "")]==-1
      states_update[j,495+i] <- -1
    } else {
      yesterday_den <- as.Date(den)-1
      if (is.na(state_testing_count[j,paste("t",den, sep = "")])) {
        state_testing_count[j,paste("t",den, sep = "")] <- -1
        states_update[j,495+i] <- -1
      } else if (state_testing_count[j,paste("t",den, sep = "")]-state_testing_count[j,paste("t",yesterday_den, sep = "")] <= 0){
        states_update[j,495+i] <- -1
      } else {
        states_update[j,495+i] <- states_update[j,den]/
          (state_testing_count[j,paste("t",den, sep = "")]-state_testing_count[j,paste("t",yesterday_den, sep = "")])
      }
    }
    if (states_update[j,495+i]>1) {
      states_update[j,495+i] <- -1
    }  
  }
  print(i)
  names(states_update)[495+i] <- paste("tpos",den, sep = "")
}

states_update$"tpos2020-01-21" <- -1
states_update$"tpos2020-01-24" <- -1
states_update$"tpos2020-01-26" <- -1
states_update$"tpos2020-01-30" <- -1
states_update$"tpos2020-01-31" <- -1

#states_update_geometry <- states_update %>% select(STUSPS, geometry)
states_update <- left_join(states_update, state_testing_count, by = c("STUSPS" = "state")) %>% st_as_sf() %>% st_set_crs(4326)
st_write(states_update, "~/Documents/GitHub/lqycovid/docs/states_update.geojson")





state_testing_posrate <- read.csv("/Users/ryan/Documents/GitHub/covid-atlas-research/Testing_Data/python/state_testing_posrate.csv")

for (i in 3:259) { # add one
  names(state_testing_posrate)[i] <- 
    paste("tpos", substr(names(state_testing_posrate)[i], 2, 5), "-",
          substr(names(state_testing_posrate)[i], 6, 7), "-",
          substr(names(state_testing_posrate)[i], 8, 9), sep = "")
}

write.csv(state_testing_count, "~/Documents/GitHub/lqycovid/data-scripts/_1p3a/_working/state_testing_count.csv")
write.csv(state_testing_posrate, "~/Documents/GitHub/lqycovid/data-scripts/_1p3a/_working/state_testing_posrate.csv")