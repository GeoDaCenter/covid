# This script will take the two state level testing scraping output, and the case and population data from the file in the main repo, and then process to output the four testing csv files needed for the front end.
library(dplyr)
library(sf)

### Take Testing Input
new_pos <- read.csv("/tmp/covid/data-scripts/testing/state_testing_positive.csv") %>% select(-criteria)
new_num <- read.csv("/tmp/covid/data-scripts/testing/state_testing_numbers.csv") %>% select(-criteria)

today_date <- sub(".", "", colnames(new_pos[2]))
today_date <- paste(substr(today_date, 1, 4), "-", substr(today_date, 5, 6), "-", substr(today_date, 7, 8), sep = "")
today_date <- as.Date(today_date)
ref <- as.Date("2020-11-21")
diff <- as.numeric(difftime(today_date, ref, units = "days"))

# Rename Columns
nc <- ncol(new_num)
for (i in 2:nc) {
  names(new_num)[i] <-
    paste("t", substr(names(new_num)[i], 2, 5), "-",
          substr(names(new_num)[i], 6, 7), "-",
          substr(names(new_num)[i], 8, 9), sep = "")
}
new_num[,2:nc][is.na(new_num[,2:nc])] <- -1

nc <- ncol(new_pos)
for (i in 2:nc) {
  names(new_pos)[i] <-
    paste("pos", substr(names(new_pos)[i], 2, 5), "-",
          substr(names(new_pos)[i], 6, 7), "-",
          substr(names(new_pos)[i], 8, 9), sep = "")
}
new_pos[,2:nc][is.na(new_pos[,2:nc])] <- -1

new_pos$"pos2020-01-22" <- -1
new_pos$"pos2020-01-23" <- -1
new_pos$"pos2020-01-24" <- -1
new_pos$"pos2020-01-25" <- -1
new_pos$"pos2020-01-26" <- -1
new_pos$"pos2020-01-27" <- -1
new_pos$"pos2020-01-28" <- -1
new_pos$"pos2020-01-29" <- -1
new_pos$"pos2020-01-30" <- -1
new_pos$"pos2020-01-31" <- -1

new_num$"t2020-01-22" <- -1
new_num$"t2020-01-23" <- -1
new_num$"t2020-01-24" <- -1
new_num$"t2020-01-25" <- -1
new_num$"t2020-01-26" <- -1
new_num$"t2020-01-27" <- -1
new_num$"t2020-01-28" <- -1
new_num$"t2020-01-29" <- -1
new_num$"t2020-01-30" <- -1
new_num$"t2020-01-31" <- -1

#Change Data Format
change_date <- function(den){
  if (nchar(den) == 8) {
    if (substr(den,3,3) == ".") {
      den <- paste("2020-0",substr(den, 2, 2),"-",
                   substr(den, 4, 5), sep = "")
    }else{
      den <- paste("2020-",substr(den, 2, 3),"-0",
                   substr(den, 5, 5), sep = "")
    }
  }
  if (nchar(den) == 7) {
    den <- paste("2020-0",substr(den, 2, 2),"-0",
                 substr(den, 4, 4), sep = "")
  }
  if (nchar(den) == 9) {
    den <- paste("2020-",substr(den, 2, 3),"-",
                 substr(den, 5, 6), sep = "")
  }
  return(den)
}


# Take population info
states_update <- as.data.frame(st_read("/tmp/covid/public/geojson/state_1p3a.geojson")) %>% select(-geometry, -GEOID)
names(states_update)[5] <- "State"
states_update <- states_update[-c(17, 53, 54, 55, 56),]
states_cases <- read.csv("/tmp/covid/public/csv/covid_confirmed_usafacts_state.csv")
states_update <- left_join(states_update, states_cases, by = "State")

for (i in 18:(322+diff)) {
  names(states_update)[i] <-
   change_date(names(states_update)[i])
}

datenum = 298 + diff

states_update <- left_join(states_update, new_pos, by = c("State"="state"))
states_update <- left_join(states_update, new_num, by = c("State"="state"))


# Calculations
## old calc positivity(7dMA)
colstart <- ncol(states_update)
for (i in 1:datenum){
  den <- names(states_update)[24+i]
  cases <- states_update[,24+i]-states_update[,17+i]
  svn_den <- as.character(as.Date(den)-7)
  for (j in 1:51){
    if (states_update[j,paste("t", den, sep = "")]==-1) {
      states_update[j,colstart+i] <- -1
    } else {
      if (states_update[j, paste("t", svn_den, sep = "")]==-1 |
          states_update[j,paste("t",den, sep = "")]-states_update[j,paste("t",svn_den, sep = "")] <= 0){
        states_update[j, colstart+i] <- -1
      } else {
        states_update[j, colstart+i] <- cases[j]/
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

states_update$"ccpt2020-01-22" <- -1
states_update$"ccpt2020-01-23" <- -1
states_update$"ccpt2020-01-24" <- -1
states_update$"ccpt2020-01-25" <- -1
states_update$"ccpt2020-01-26" <- -1
states_update$"ccpt2020-01-27" <- -1
states_update$"ccpt2020-01-28" <- -1


## new calc positivity(7dMA)
colstart <- ncol(states_update)
for (i in 1:datenum){
  den <- names(states_update)[24+i]
  for (j in 1:51){
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
states_update$"wktpos2020-01-22" <- -1
states_update$"wktpos2020-01-23" <- -1
states_update$"wktpos2020-01-24" <- -1
states_update$"wktpos2020-01-25" <- -1
states_update$"wktpos2020-01-26" <- -1
states_update$"wktpos2020-01-27" <- -1
states_update$"wktpos2020-01-28" <- -1

## Testing Capacity (7dMA)
colstart <- ncol(states_update)
for (i in 1:datenum){
  den <- names(states_update)[24+i]
  for (j in 1:51){
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

states_update$"tcap2020-01-22" <- -1
states_update$"tcap2020-01-23" <- -1
states_update$"tcap2020-01-24" <- -1
states_update$"tcap2020-01-25" <- -1
states_update$"tcap2020-01-26" <- -1
states_update$"tcap2020-01-27" <- -1
states_update$"tcap2020-01-28" <- -1

states_update <- states_update %>% select(-starts_with("pos2020"))



# Wrting the csv files

usaf_var <- states_update %>%
  select(State, stateFIPS)

testing <- states_update %>%
  select(starts_with("t2020"))
for (i in 1:ncol(testing)){
  names(testing)[i] <- paste(as.character(as.numeric(substr(names(testing)[i],7,8))), "/",
                             as.character(as.numeric(substr(names(testing)[i],10,11))), "/", "20", sep = "")
}
testing <- testing[order(as.Date(colnames(testing), "%m/%d/%y"))]
testing <- cbind(usaf_var, testing)
write.csv(testing,'/tmp/covid/public/csv/covid_testing_usafacts_state.csv', row.names=FALSE)

Testingccpt <- states_update %>%
  select(starts_with("ccpt2020"))
for (i in 1:ncol(Testingccpt)){
  names(Testingccpt)[i] <- paste(as.character(as.numeric(substr(names(Testingccpt)[i],10,11))), "/",
                                 as.character(as.numeric(substr(names(Testingccpt)[i],13,14))), "/", "20", sep = "")
}
Testingccpt <- Testingccpt[order(as.Date(colnames(Testingccpt), "%m/%d/%y"))]
Testingccpt <- cbind(usaf_var, Testingccpt)
write.csv(Testingccpt,'/tmp/covid/public/csv/covid_ccpt_usafacts_state.csv', row.names=FALSE)

Testingtcap <- states_update %>%
  select(starts_with("tcap2020"))
for (i in 1:ncol(Testingtcap)){
  names(Testingtcap)[i] <- paste(as.character(as.numeric(substr(names(Testingtcap)[i],10,11))), "/",
                                 as.character(as.numeric(substr(names(Testingtcap)[i],13,14))), "/", "20", sep = "")
}
Testingtcap <- Testingtcap[order(as.Date(colnames(Testingtcap), "%m/%d/%y"))]
Testingtcap <- cbind(usaf_var, Testingtcap)
write.csv(Testingtcap,'/tmp/covid/public/csv/covid_tcap_usafacts_state.csv', row.names=FALSE)


Testingwktpos <- states_update %>%
  select(starts_with("wktpos2020"))
for (i in 1:ncol(Testingwktpos)){
  names(Testingwktpos)[i] <- paste(as.character(as.numeric(substr(names(Testingwktpos)[i],12,13))), "/",
                                   as.character(as.numeric(substr(names(Testingwktpos)[i],15,16))), "/", "20", sep = "")
}
Testingwktpos <- Testingwktpos[order(as.Date(colnames(Testingwktpos), "%m/%d/%y"))]
Testingwktpos <- cbind(usaf_var, Testingwktpos)
write.csv(Testingwktpos,'/tmp/covid/public/csv/covid_wk_pos_usafacts_state.csv', row.names=FALSE)
