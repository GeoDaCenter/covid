# This script will take the two state level testing scraping output, and the case and population data from the file in the main repo, and then process to output the four testing csv files needed for the front end.
library(dplyr)
library(sf)

### Take Testing Input
new_pos <- read.csv("/tmp/covid/data-scripts/testing/state_testing_positive.csv")
new_num <- read.csv("/tmp/covid/data-scripts/testing/state_testing_numbers.csv")

today_date <- sub(".", "", colnames(new_pos[3]))
today_date <- paste(substr(today_date, 1, 4), "-", substr(today_date, 5, 6), "-", substr(today_date, 7, 8), sep = "")
today_date <- as.Date(today_date)
ref <- as.Date("2020-11-09")
diff <- as.numeric(difftime(today_date, ref, units = "days"))

# Rename Columns
nc <- ncol(new_num)
for (i in 3:nc) {
  names(new_num)[i] <-
    paste("t", substr(names(new_num)[i], 2, 5), "-",
          substr(names(new_num)[i], 6, 7), "-",
          substr(names(new_num)[i], 8, 9), sep = "")
}

new_num[,3:nc][is.na(new_num[,3:nc])] <- -1

nc <- ncol(new_pos)
for (i in 3:nc) {
  names(new_pos)[i] <-
    paste("pos", substr(names(new_pos)[i], 2, 5), "-",
          substr(names(new_pos)[i], 6, 7), "-",
          substr(names(new_pos)[i], 8, 9), sep = "")
}

new_pos[,3:nc][is.na(new_pos[,3:nc])] <- -1
new_pos$"pos2020-01-21" <- -1
new_pos$"pos2020-01-24" <- -1
new_pos$"pos2020-01-26" <- -1
new_pos$"pos2020-01-30" <- -1
new_pos$"pos2020-01-31" <- -1
new_num <- new_num%>%select(-criteria)
new_num$"t2020-01-21" <- -1
new_num$"t2020-01-24" <- -1
new_num$"t2020-01-26" <- -1
new_num$"t2020-01-30" <- -1
new_num$"t2020-01-31" <- -1


# Take population info
states_update <- as.data.frame(st_read("/tmp/covid/public/state_1p3a.geojson")) %>% select(-geometry)
states_cases <- read.csv("/tmp/covid/public/csv/covid_confirmed_1p3a_state.csv") %>% select(-GEOID)
states_update <- left_join(states_update, states_cases, by = "NAME")

states_update[53, "population"] = 106977
states_update[54, "population"] = 56882
states_update[55, "population"] = 165768
states_update[56, "population"] = 55465

datenum = 269 + diff

for (i in 18:(291+diff)) {
  names(states_update)[i] <-
    paste(substr(names(states_update)[i], 2, 5), "-",
          substr(names(states_update)[i], 7, 8), "-",
          substr(names(states_update)[i], 10, 11), sep = "")
}

states_update <- left_join(states_update, new_pos, by = c("STUSPS"="state"))
states_update <- left_join(states_update, new_num, by = c("STUSPS"="state"))


# Calculations
## old calc positivity(7dMA)
colstart <- ncol(states_update)
for (i in 1:datenum){ #+1 everyday
  den <- names(states_update)[22+i]
  for (j in 1:56){
    if (states_update[j,paste("t", den, sep = "")]==-1) {
      states_update[j,colstart+i] <- -1
    } else {
      svn_den <- as.character(as.Date(den)-7)
      sx_den <- as.character(as.Date(den)-6)
      if  (states_update[j,paste("t", svn_den, sep = "")]==-1 |
           is.null(states_update[j,sx_den]) |
           states_update[j,paste("t",den, sep = "")]-states_update[j,paste("t",svn_den, sep = "")] <= 0){
        states_update[j, colstart+i] <- -1
      } else {
        cases <- 0
        for (k in which(colnames(states_update)==sx_den) : which(colnames(states_update)==den)){
          cases <- cases + states_update[j, k]
        }
        states_update[j, colstart+i] <- cases/
          (states_update[j,paste("t",den, sep = "")]-states_update[j,paste("t",svn_den, sep = "")])
      }
    }
    if (states_update[j, colstart+i]>1) {
      states_update[j, colstart+i] <- -1
    }
  }
  # print(i)
  names(states_update)[colstart+i] <- paste("ccpt",den, sep = "")
}

states_update$"ccpt2020-01-21" <- -1
states_update$"ccpt2020-01-24" <- -1
states_update$"ccpt2020-01-26" <- -1
states_update$"ccpt2020-01-30" <- -1
states_update$"ccpt2020-01-31" <- -1

## new calc positivity(7dMA)
colstart <- ncol(states_update)
for (i in 1:datenum){
  den <- names(states_update)[22+i]
  for (j in 1:56){
    if (states_update[j,paste("t", den, sep = "")]==-1) {
      states_update[j,colstart+i] <- -1
    } else {
      svn_den <- as.character(as.Date(den)-7)
      sx_den <- as.character(as.Date(den)-6)
      if  (states_update[j,paste("t", svn_den, sep = "")]==-1 |
           is.null(states_update[j,sx_den]) |
           states_update[j,paste("t",den, sep = "")]-states_update[j,paste("t",svn_den, sep = "")] <= 0){
        states_update[j, colstart+i] <- -1
      } else {
        states_update[j, colstart+i] <- (states_update[j,paste("pos", den, sep = "")]-states_update[j,paste("pos", svn_den, sep = "")])/
          (states_update[j,paste("t",den, sep = "")]-states_update[j,paste("t",svn_den, sep = "")])
      }
    }
    if (states_update[j, colstart+i]>1) {
      states_update[j, colstart+i] <- -1
    }
  }
  # print(i)
  names(states_update)[colstart+i] <- paste("wktpos",den, sep = "")
}
states_update$"wktpos2020-01-21" <- -1
states_update$"wktpos2020-01-24" <- -1
states_update$"wktpos2020-01-26" <- -1
states_update$"wktpos2020-01-30" <- -1
states_update$"wktpos2020-01-31" <- -1

## Testing Capacity (7dMA)
colstart <- ncol(states_update)
for (i in 1:datenum){
  den <- names(states_update)[22+i]
  for (j in 1:56){
    if (states_update[j,paste("t", den, sep = "")]==-1) {
      states_update[j,colstart+i] <- -1
    } else {
      svn_den <- as.character(as.Date(den)-7)
      sx_den <- as.character(as.Date(den)-6)
      if  (states_update[j,paste("t", svn_den, sep = "")]==-1 |
           is.null(states_update[j,sx_den]) |
           states_update[j,paste("t",den, sep = "")]-states_update[j,paste("t",svn_den, sep = "")] <= 0){
        states_update[j, colstart+i] <- -1
      } else {
        states_update[j, colstart+i] <- (((states_update[j,paste("t",den, sep = "")]-states_update[j,paste("t",svn_den, sep = "")])/7)/
                                           states_update[j, "population"]) * 100000
      }
    }
    if (states_update[j, "population"]==0) {
      states_update[j, colstart+i] <- -1
    }
  }
  # print(i)
  names(states_update)[colstart+i] <- paste("tcap",den, sep = "")
}
states_update$"tcap2020-01-21" <- -1
states_update$"tcap2020-01-24" <- -1
states_update$"tcap2020-01-26" <- -1
states_update$"tcap2020-01-30" <- -1
states_update$"tcap2020-01-31" <- -1

states_update <- states_update %>% select(-starts_with("pos202"))



# Wrting the csv files

testing <- states_update %>%
  select(GEOID, NAME,
         starts_with("t202"))
for (i in 3:ncol(testing)){
  names(testing)[i] <- paste(substr(names(testing)[i],2,11))
}
write.csv(testing,'/tmp/covid/public/csv/covid_testing_1p3a_state.csv', row.names=FALSE)

Testingccpt <- states_update %>%
  select(GEOID, NAME,
         starts_with("ccpt202"))
for (i in 3:ncol(Testingccpt)){
  names(Testingccpt)[i] <- paste(substr(names(Testingccpt)[i],5,14))
}
write.csv(Testingccpt,'/tmp/covid/public/csv/covid_ccpt_1p3a_state.csv', row.names=FALSE)

Testingtcap <- states_update %>%
  select(GEOID, NAME,
         starts_with("tcap202"))
for (i in 3:ncol(Testingtcap)){
  names(Testingtcap)[i] <- paste(substr(names(Testingtcap)[i],5,14))
}
write.csv(Testingtcap,'/tmp/covid/public/csv/covid_tcap_1p3a_state.csv', row.names=FALSE)


Testingwktpos <- states_update %>%
  select(GEOID, NAME,
         starts_with("wktpos202"))
for (i in 3:ncol(Testingwktpos)){
  names(Testingwktpos)[i] <- paste(substr(names(Testingwktpos)[i],7,16))
}
write.csv(Testingwktpos,'/tmp/covid/public/csv/covid_wk_pos_1p3a_state.csv', row.names=FALSE)
