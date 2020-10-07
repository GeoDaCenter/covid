#run 1p3a.py, save county geojson as csv file in /docs

setwd("~/Documents/qlcovid/docs")
library(sf)
library(tidyverse)
library(dplyr)

#1p3aState
state_testing_count <- read.csv("~/Documents/covid-atlas-research/Testing_Data/python/state_testing.csv")
nc <- ncol(state_testing_count)
for (i in 3:nc) {
   names(state_testing_count)[i] <- 
      paste("t", substr(names(state_testing_count)[i], 2, 5), "-",
            substr(names(state_testing_count)[i], 6, 7), "-",
            substr(names(state_testing_count)[i], 8, 9), sep = "")
}

state_testing_count[,3:nc][is.na(state_testing_count[,3:nc])] <- -1  

# Read in states_update_processing.geojson
states_update <- as.data.frame(st_read("~/Documents/qlcovid/docs/states_update_processing.geojson"))
for (i in 17:256) {#update this number every day
   names(states_update)[i] <- 
      paste(substr(names(states_update)[i], 2, 5), "-",
            substr(names(states_update)[i], 7, 8), "-",
            substr(names(states_update)[i], 10, 11), sep = "")
}

for (i in 257:(ncol(states_update)-3)) {#update this number every day 254-17+255
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

states_update <- left_join(states_update, state_testing_count, by = c("STUSPS"="state"))

ncolstart <- ncol(states_update)
for (i in 1:235){ #+1 everyday
   # from 2020-02-01 to the most recent date
   den <- names(states_update)[21 + i]
   for (j in 1:56){
      if (is.na(states_update[j,paste("t",den, sep = "")])) {
         states_update[j,paste("t",den, sep = "")]==-1
         states_update[j,ncolstart+i] <- -1 
      } else {
         yesterday_den <- as.character(as.Date(den)-1)
         if (is.na(states_update[j,paste("t",den, sep = "")])) {
            states_update[j,paste("t",den, sep = "")] <- -1
            states_update[j,ncolstart+i] <- -1
         } else if (states_update[j,paste("t",den, sep = "")]-states_update[j,paste("t",yesterday_den, sep = "")] <= 0){
            states_update[j,ncolstart+i] <- -1
         } else {
            states_update[j,ncolstart+i] <- states_update[j,den]/
               (states_update[j,paste("t",den, sep = "")]-states_update[j,paste("t",yesterday_den, sep = "")])
         }
      }
      if (states_update[j,ncolstart+i]>1) {
         states_update[j,ncolstart+i] <- -1
      }  
   }
   print(i)
   names(states_update)[ncolstart+i] <- paste("tpos",den, sep = "")
}

states_update$"tpos2020-01-21" <- -1
states_update$"tpos2020-01-24" <- -1
states_update$"tpos2020-01-26" <- -1
states_update$"tpos2020-01-30" <- -1
states_update$"tpos2020-01-31" <- -1

# seven day/weekly testing positivity 
colstart <- ncol(states_update)
for (i in 1:235){ #+1 everyday
   den <- names(states_update)[21+i]
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
   print(i)
   names(states_update)[colstart+i] <- paste("wtpos",den, sep = "")
}

states_update$"wtpos2020-01-21" <- -1
states_update$"wtpos2020-01-24" <- -1
states_update$"wtpos2020-01-26" <- -1
states_update$"wtpos2020-01-30" <- -1
states_update$"wtpos2020-01-31" <- -1

st_write(states_update, "~/Documents/qlcovid/docs/states_update.geojson")
# need to move the previous states_update.geojson before writing
# need to update the zip file accordingly

#1p3aCounty

testing <- NULL
county_hist <- read.csv("~/Documents/covid-atlas-research/Testing_Data/python/county_hist.csv")
county_hist$geoid <- as.numeric(county_hist$geoid)
county_hist <- county_hist[-c(201:212)] #update this number every day

for (i in 9:257) {#update this number every day
   names(county_hist)[i] <- 
      paste("t", substr(names(county_hist)[i], 2, 5), "-",
            substr(names(county_hist)[i], 7, 8), "-",
            substr(names(county_hist)[i], 10, 11), sep = "")
}

county_hist <- county_hist[, -c(1:7)]

# write.csv(county_hist, "testing_county.csv")

county_1p3a <- as.data.frame(st_read("~/Documents/qlcovid/docs/counties_update_processing.geojson"))
county_1p3a$geoid <- as.numeric(county_1p3a$GEOID)
county_hist$geoid <- as.numeric(as.character(county_hist$geoid))

for (i in 15:254) {#update this number every day
   names(county_1p3a)[i] <- 
      paste(substr(names(county_1p3a)[i], 2, 5), "-",
            substr(names(county_1p3a)[i], 7, 8), "-",
            substr(names(county_1p3a)[i], 10, 11), sep = "")
}

for (i in 255:494) {#update this number every day 254-17+255
   names(county_1p3a)[i] <- 
      paste("d", substr(names(county_1p3a)[i], 2, 5), "-",
            substr(names(county_1p3a)[i], 7, 8), "-",
            substr(names(county_1p3a)[i], 10, 11), sep = "")
}


county_1p3a <- left_join(county_1p3a, county_hist, by = "geoid")

county_1p3a$"t2020-01-21" <- -1
county_1p3a$"t2020-01-24" <- -1
county_1p3a$"t2020-01-26" <- -1
county_1p3a$"t2020-01-30" <- -1
county_1p3a$"t2020-01-31" <- -1

county_1p3a$"t2020-01-22" <- -1
county_1p3a$"t2020-01-23" <- -1
county_1p3a$"t2020-01-25" <- -1
county_1p3a$"t2020-01-27" <- -1
county_1p3a$"t2020-01-28" <- -1
county_1p3a$"t2020-01-29" <- -1

#county_1p3a(is.numeric(county_1p3a))[is.na(county_1p3a)[, is.numeric(county_1p3a)]] = -1
#testing_state[,3:223][is.na(testing_state[,3:223])] <- -1 
names(county_1p3a)[14]
names(county_1p3a)[15]
names(county_1p3a)[258]

ncolstart <- ncol(county_1p3a)
for (i in 1:235){ # increase +1 everyday
   den <- as.character(names(county_1p3a)[19+i])
   for (j in 1:3216){
      if (county_1p3a[j, paste("t",den, sep = "")]==-1) {
         county_1p3a[j,ncolstart+i] <- -1 # this number +3 everyday
      } else {
         yesterday_den <- as.character(as.Date(den)-1)
         if (county_1p3a[j, paste("t",yesterday_den, sep = "")]==-1) {
            county_1p3a[j,ncolstart+i] <- -1
         } else if (county_1p3a[j,paste("t",den, sep = "")]-county_1p3a[j,paste("t",yesterday_den, sep = "")] <= 0){
            county_1p3a[j,ncolstart+i] <- -1
         } else {
            county_1p3a[j,ncolstart+i] <- county_1p3a[j,den]/
               (county_1p3a[j,paste("t",den, sep = "")]-county_1p3a[j,paste("t",yesterday_den, sep = "")])
         }
      }
      if (county_1p3a[j,ncolstart+i]>1) {
         county_1p3a[j,ncolstart+i] <- -1
      }  
   }
   print(i)
   names(county_1p3a)[ncolstart+i] <- paste("tpos",den, sep = "")
}

county_1p3a$"tpos2020-01-21" <- -1
county_1p3a$"tpos2020-01-24" <- -1
county_1p3a$"tpos2020-01-26" <- -1
county_1p3a$"tpos2020-01-30" <- -1
county_1p3a$"tpos2020-01-31" <- -1

# seven day/weekly testing positivity 
colstart <- ncol(county_1p3a)
for (i in 1:235){ #+1 everyday
   den <- names(county_1p3a)[19+i]
   for (j in 1:nrow(county_1p3a)){
      if (county_1p3a[j,paste("t", den, sep = "")]==-1) {
         county_1p3a[j,colstart+i] <- -1
      } else {
         svn_den <- as.character(as.Date(den)-7)
         sx_den <- as.character(as.Date(den)-6)
         if (county_1p3a[j, paste("t", svn_den, sep = "")]==-1 |
             is.null(county_1p3a[j, sx_den]) |
             county_1p3a[j,paste("t",den, sep = "")]-county_1p3a[j,paste("t",svn_den, sep = "")] <= 0){
            county_1p3a[j, colstart+i] <- -1
            } else {
            cases <- 0
            for (k in which(colnames(county_1p3a)==sx_den) : which(colnames(county_1p3a)==den)){
               cases <- cases + county_1p3a[j, k]
            }
            county_1p3a[j, colstart+i] <- cases/
               (county_1p3a[j,paste("t",den, sep = "")]-county_1p3a[j,paste("t",svn_den, sep = "")])
         }
      }
      if (county_1p3a[j, colstart+i]>1) {
         county_1p3a[j, colstart+i] <- -1
      }  
   }
   print(i)
   names(county_1p3a)[colstart+i] <- paste("wtpos",den, sep = "")
}

county_1p3a$"wtpos2020-01-21" <- -1
county_1p3a$"wtpos2020-01-24" <- -1
county_1p3a$"wtpos2020-01-26" <- -1
county_1p3a$"wtpos2020-01-30" <- -1
county_1p3a$"wtpos2020-01-31" <- -1

# need to move the previous counties_update.geojson before writing
st_write(county_1p3a, "~/Documents/qlcovid/docs/counties_update.geojson")
# to add -  merge in the criteria column in the data file - county_criteria_1p3a.csv in the research repo
# need to update the zip file accordingly

#write.csv(county_1p3a, "testing_1p3a.csv")

# merge <- read.csv("testing_1p3a.csv")
# for (i in 1:ncol(merge)) {#update this number every day
#   if (grepl("d2020", names(merge)[i]) == T) {
#      names(merge)[i] <-
#         paste("d", substr(names(merge)[i], 2, 5), "-",
#               substr(names(merge)[i], 7, 8), "-",
#               substr(names(merge)[i], 10, 11), sep = "")}
#   if (grepl("t2020", names(merge)[i]) == T) {
#      names(merge)[i] <-
#         paste("t", substr(names(merge)[i], 2, 5), "-",
#               substr(names(merge)[i], 7, 8), "-",
#               substr(names(merge)[i], 10, 11), sep = "")}
#   if (grepl("tpos2020", names(merge)[i]) == T) {
#      names(merge)[i] <-
#         paste("tpos", substr(names(merge)[i], 5, 8), "-",
#               substr(names(merge)[i], 10, 11), "-",
#               substr(names(merge)[i], 13, 14), sep = "")}
#}




## usafacts
#county_usafacts <- read.csv()
#county_usafacts <- left_join(county_usafacts, county_criteria, by = c("state_abbr"="State"))
#write.csv(county_usafacts, "county_usafacts.csv")

# read in usafacts case data
covid_confirmed_usafacts <- read_csv("~/Documents/qlcovid/docs/covid_confirmed_usafacts.csv")

# merge testing data into usafacts data - see if missing rows/counties
covid_usafacts <- left_join(covid_confirmed_usafacts, county_hist, by = c("countyFIPS"="geoid"))

# calculate testing positivity rate
covid_usafacts$"t2020-01-22" <- -1
covid_usafacts$"t2020-01-23" <- -1
covid_usafacts$"t2020-01-24" <- -1
covid_usafacts$"t2020-01-25" <- -1
covid_usafacts$"t2020-01-26" <- -1
covid_usafacts$"t2020-01-27" <- -1
covid_usafacts$"t2020-01-28" <- -1
covid_usafacts$"t2020-01-29" <- -1
covid_usafacts$"t2020-01-30" <- -1
covid_usafacts$"t2020-01-31" <- -1
covid_usafacts$criteria <- NULL
ncol(covid_usafacts)
names(covid_usafacts)[5]
names(covid_usafacts)[261]

## define a function to change date format
change_date <- function(den){
   if (nchar(den) == 7) {
      if (substr(den,2,2) == "/") {
         den <- paste("2020-0",substr(den, 1, 1),"-",
                      substr(den, 3, 4), sep = "")
      }else{
         den <- paste("2020-",substr(den, 1, 2),"-0",
                      substr(den, 4, 4), sep = "")
      }
   }
   if (nchar(den) == 6) {
      den <- paste("2020-0",substr(den, 1, 1),"-0",
                   substr(den, 3, 3), sep = "")
   }
   if (nchar(den) == 8) {
      den <- paste("2020-",substr(den, 1, 2),"-",
                   substr(den, 4, 5), sep = "")
   }
   return(den)
}


ncolstart <- ncol(covid_usafacts)
for (i in 1:249){ #Update Daily
   den <- names(covid_usafacts)[14+i]
   # from 2/1 to the most recent date
   new_case <- covid_usafacts[,14+i]-covid_usafacts[,13+i]
   # caution - this relies on the order of the column - the confirmed cases must be in the right ordr 
   den <- change_date(den)
   for (j in 1:3142){
      if (is.na(covid_usafacts[j,paste("t",den, sep = "")])) {
         covid_usafacts[j,paste("t",den, sep = "")]==-1
         covid_usafacts[j,ncolstart+i] <- -1 #Update Daily
      } else {
         yesterday_den <- as.Date(den)-1
         if (is.na(covid_usafacts[j,paste("t",den, sep = "")])) {
            covid_usafacts[j,paste("t",yesterday_den, sep = "")]==-1
            covid_usafacts[j,ncolstart+i] <- -1
         } else if (covid_usafacts[j,paste("t",den, sep = "")]-covid_usafacts[j,paste("t",yesterday_den, sep = "")] <= 0){
            covid_usafacts[j,ncolstart+i] <- -1
         } else {
            covid_usafacts[j,ncolstart+i] <- new_case[j,]/
               (covid_usafacts[j,paste("t",den, sep = "")]-covid_usafacts[j,paste("t",yesterday_den, sep = "")])
         }
      }
      if (covid_usafacts[j,ncolstart+i]>1) {
         covid_usafacts[j,ncolstart+i] <- -1
      }  
   }
   print(i)
   names(covid_usafacts)[ncolstart+i] <- paste("tpos",den, sep = "")
}

# seven day/weekly testing positivity 
colstart <- ncol(covid_usafacts)
for (i in 1:249){ #+1 everyday
   den <- names(covid_usafacts)[14+i]
   cases <- covid_usafacts[,14+i]-covid_usafacts[,7+i]
   # caution - relies on the order of column!!!
   den <- change_date(den)
   svn_den <- as.character(as.Date(den)-7)
   for (j in 1:nrow(covid_usafacts)){
      if (covid_usafacts[j,paste("t", den, sep = "")]==-1) {
         covid_usafacts[j,colstart+i] <- -1
      } else {
         if (covid_usafacts[j, paste("t", svn_den, sep = "")]==-1 |
             covid_usafacts[j,paste("t",den, sep = "")]-covid_usafacts[j,paste("t",svn_den, sep = "")] <= 0){
            covid_usafacts[j, colstart+i] <- -1
         } else {
            covid_usafacts[j, colstart+i] <- cases[j,]/
               (covid_usafacts[j,paste("t",den, sep = "")]-covid_usafacts[j,paste("t",svn_den, sep = "")])
         }
      }
      if (covid_usafacts[j, colstart+i]>1) {
         covid_usafacts[j, colstart+i] <- -1
      }  
   }
   print(i)
   names(covid_usafacts)[colstart+i] <- paste("wtpos",den, sep = "")
}

covid_usafacts$"tpos2020-01-22" <- -1
covid_usafacts$"tpos2020-01-23" <- -1
covid_usafacts$"tpos2020-01-24" <- -1
covid_usafacts$"tpos2020-01-25" <- -1
covid_usafacts$"tpos2020-01-26" <- -1
covid_usafacts$"tpos2020-01-27" <- -1
covid_usafacts$"tpos2020-01-28" <- -1
covid_usafacts$"tpos2020-01-29" <- -1
covid_usafacts$"tpos2020-01-30" <- -1
covid_usafacts$"tpos2020-01-31" <- -1

covid_usafacts$"wtpos2020-01-22" <- -1
covid_usafacts$"wtpos2020-01-23" <- -1
covid_usafacts$"wtpos2020-01-24" <- -1
covid_usafacts$"wtpos2020-01-25" <- -1
covid_usafacts$"wtpos2020-01-26" <- -1
covid_usafacts$"wtpos2020-01-27" <- -1
covid_usafacts$"wtpos2020-01-28" <- -1


testing_usafacts <- covid_usafacts %>% 
   select(countyFIPS, "County Name", State, "stateFIPS", 
          starts_with("t2020"))
for (i in 5:ncol(testing_usafacts)){
   names(testing_usafacts)[i] <- paste(as.character(as.numeric(substr(names(testing_usafacts)[i],7,8))), "/",
                                       as.character(as.numeric(substr(names(testing_usafacts)[i],10,11))), "/", "20", sep = "")
}

write.csv(testing_usafacts,'testing_usafacts.csv')

testingpos_usafacts <- covid_usafacts %>% 
   select(countyFIPS, "County Name", State, "stateFIPS",
          starts_with("tpos2020"))
for (i in 5:ncol(testingpos_usafacts)){
   names(testingpos_usafacts)[i] <- paste(as.character(as.numeric(substr(names(testingpos_usafacts)[i],10,11))), "/",
                                          as.character(as.numeric(substr(names(testingpos_usafacts)[i],13,14))), "/", "20", sep = "")
}

write.csv(testingpos_usafacts,'testingpos_usafacts.csv')

testingwkpos_usafacts <- covid_usafacts %>% 
   select(countyFIPS, "County Name", State, "stateFIPS",
          starts_with("wtpos2020"))
for (i in 5:ncol(testingwkpos_usafacts)){
   names(testingwkpos_usafacts)[i] <- paste(as.character(as.numeric(substr(names(testingwkpos_usafacts)[i],11,12))), "/",
                                          as.character(as.numeric(substr(names(testingwkpos_usafacts)[i],14,15))), "/", "20", sep = "")
}

write.csv(testingwkpos_usafacts,'testingwkpos_usafacts.csv')
