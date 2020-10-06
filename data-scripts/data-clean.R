#run 1p3a.py, save county geojson as csv file in /docs

setwd("~/Documents/GitHub/lqycovid/docs")
library(sf)
library(tidyverse)
library(dplyr)

testing <- NULL
county_hist <- read.csv("~/Documents/GitHub/covid-atlas-research/Testing_Data/python/county_hist.csv")
county_hist$geoid <- as.numeric(as.character(county_hist$geoid))
   

x <- paste("t", substr(names(county_hist)[10], 2, 5), "-",
            substr(names(county_hist)[10], 7, 8), "-",
             substr(names(county_hist)[10], 10, 11), sep = "")


for (i in 9:255) {#update this number every day
   names(county_hist)[i] <- 
      paste("t", substr(names(county_hist)[i], 2, 5), "-",
            substr(names(county_hist)[i], 7, 8), "-",
            substr(names(county_hist)[i], 10, 11), sep = "")
}

county_hist <- county_hist[, -c(1:7)]


# write.csv(county_hist, "testing_county.csv")

county_1p3a <- read_csv("county_1p3a.csv")
county_1p3a$geoid <- as.numeric(county_1p3a$GEOID)
county_hist$geoid <- as.numeric(as.character(county_hist$geoid))

county_1p3a <- left_join(county_1p3a, county_hist, by = "geoid")
county_1p3a$"t2020-01-21" <- -1
county_1p3a$"t2020-01-24" <- -1
county_1p3a$"t2020-01-26" <- -1
county_1p3a$"t2020-01-30" <- -1
county_1p3a$"t2020-01-31" <- -1

#county_1p3a(is.numeric(county_1p3a))[is.na(county_1p3a)[, is.numeric(county_1p3a)]] = -1
#testing_state[,3:223][is.na(testing_state[,3:223])] <- -1 
names(county_1p3a)[14]
names(county_1p3a)[258]

for (i in 1:233){ # increase +1 everyday
den <- names(county_1p3a)[20+i-1]
for (j in 1:3216){
if (is.na(county_1p3a[j,paste("t",den, sep = "")])) {
   county_1p3a[j,paste("t",den, sep = "")]==-1
   county_1p3a[j,745+i] <- -1 # this number +3 everyday
} else {
   yesterday_den <- as.Date(den)-1
   if (is.na(county_1p3a[j,paste("t",yesterday_den, sep = "")])) {
      county_1p3a[j,paste("t",yesterday_den, sep = "")] <- -1 
      county_1p3a[j,745+i] <- -1
   } else if (county_1p3a[j,paste("t",den, sep = "")]-county_1p3a[j,paste("t",yesterday_den, sep = "")] <= 0){
      county_1p3a[j,745+i] <- -1
      } else {
      county_1p3a[j,745+i] <- county_1p3a[j,den]/
         (county_1p3a[j,paste("t",den, sep = "")]-county_1p3a[j,paste("t",yesterday_den, sep = "")])
      }
}
if (county_1p3a[j,745+i]>1) {
      county_1p3a[j,745+i] <- -1
   }  
}
print(i)
names(county_1p3a)[745+i] <- paste("tpos",den, sep = "")
}

county_1p3a$"tpos2020-01-21" <- -1
county_1p3a$"tpos2020-01-24" <- -1
county_1p3a$"tpos2020-01-26" <- -1
county_1p3a$"tpos2020-01-30" <- -1
county_1p3a$"tpos2020-01-31" <- -1

write.csv(county_1p3a, "testing_1p3a.csv")


merge <- read.csv("testing_1p3a.csv")
for (i in 1:ncol(merge)) {#update this number every day
   if (grepl("d2020", names(merge)[i]) == T) {
      names(merge)[i] <-
            paste("d", substr(names(merge)[i], 2, 5), "-",
            substr(names(merge)[i], 7, 8), "-",
            substr(names(merge)[i], 10, 11), sep = "")}
   if (grepl("t2020", names(merge)[i]) == T) {
      names(merge)[i] <-
         paste("t", substr(names(merge)[i], 2, 5), "-",
               substr(names(merge)[i], 7, 8), "-",
               substr(names(merge)[i], 10, 11), sep = "")}
   if (grepl("tpos2020", names(merge)[i]) == T) {
      names(merge)[i] <-
         paste("tpos", substr(names(merge)[i], 5, 8), "-",
               substr(names(merge)[i], 10, 11), "-",
               substr(names(merge)[i], 13, 14), sep = "")}
}

merge_geometry <- st_read("/Users/ryan/Documents/GitHub/lqycovid/docs/counties_update_processing.geojson") %>% 
   select(GEOID, geometry)
merge <- left_join(merge_geometry, merge, by = "GEOID")
st_write(merge, "~/Documents/GitHub/lqycovid/docs/counties_update.geojson")


## usafacts
#county_usafacts <- read.csv()
#county_usafacts <- left_join(county_usafacts, county_criteria, by = c("state_abbr"="State"))
#write.csv(county_usafacts, "county_usafacts.csv")

# read in usafacts case data
covid_confirmed_usafacts <- read_csv("~/Documents/GitHub/lqycovid/docs/covid_confirmed_usafacts.csv")

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
names(covid_usafacts)[263]


for (i in 1:247){ #Update Daily
   den <- names(covid_usafacts)[15+i-1]
   new_case <- covid_usafacts[,15+i-1]-covid_usafacts[,15+i-2]
   if (nchar(den) == 7) {
      den <- paste("2020-0",substr(den, 1, 1),"-",
                   substr(den, 3, 4), sep = "")
   }
   if (nchar(den) == 6) {
      den <- paste("2020-0",substr(den, 1, 1),"-0",
                   substr(den, 3, 3), sep = "")
   }
   if (nchar(den) == 8) {
      den <- paste("2020-",substr(den, 1, 1),"-",
                   substr(den, 3, 5), sep = "")
   }
   for (j in 1:3142){
      if (is.na(covid_usafacts[j,paste("t",den, sep = "")])) {
         covid_usafacts[j,paste("t",den, sep = "")]==-1
         covid_usafacts[j,518+i] <- -1 #Update Daily
      } else {
         yesterday_den <- as.Date(den)-1
         if (is.na(covid_usafacts[j,paste("t",den, sep = "")])) {
            covid_usafacts[j,paste("t",yesterday_den, sep = "")]==-1
            covid_usafacts[j,518+i] <- -1
         } else if (covid_usafacts[j,paste("t",den, sep = "")]-covid_usafacts[j,paste("t",yesterday_den, sep = "")] <= 0){
            covid_usafacts[j,518+i] <- -1
         } else {
            covid_usafacts[j,518+i] <- new_case[j,]/
               (covid_usafacts[j,paste("t",den, sep = "")]-covid_usafacts[j,paste("t",yesterday_den, sep = "")])
         }
      }
      if (covid_usafacts[j,518+i]>1) {
         covid_usafacts[j,518+i] <- -1
      }  
   }
   print(i)
   names(covid_usafacts)[508+i] <- paste("tpos",den, sep = "")
}

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
testingpos_usafacts$"1/22/20" <- -1

write.csv(testingpos_usafacts,'testingpos_usafacts.csv')
