setwd("~/Documents/qlcovid/docs")
library(sf)
library(tidyverse)
library(dplyr)

testing <- NULL

testing_state[,3:223][is.na(testing_state[,3:223])] <- -1 
write.csv(testing_state, "testing_state.csv")


 x <- paste("tpos", substr(names(state_testing_posrate)[3], 1, 4), "-",
  substr(names(state_testing_posrate)[3], 5, 6), "-",
  substr(names(state_testing_posrate)[3], 7, 8), sep = "")

 for (i in 3:223) {
   names(state_testing_posrate)[i] <- 
     paste("tpos", substr(names(state_testing_posrate)[i], 1, 4), "-",
           substr(names(state_testing_posrate)[i], 5, 6), "-",
           substr(names(state_testing_posrate)[i], 7, 8), sep = "")
 }


state_testing_posrate <- state_testing_posrate %>%
   mutate_if(is.logical,as.numeric) 
state_testing_posrate[,3:223][is.na(state_testing_posrate[,3:223])] <- -1

write.csv(state_testing_posrate, "testingpos_state.csv")

county_hist <- read.csv("Testing_Data/county_hist 0926.csv")

x <- paste("t", substr(names(county_hist)[10], 2, 5), "-",
            substr(names(county_hist)[10], 7, 8), "-",
             substr(names(county_hist)[10], 10, 11), sep = "")


for (i in 10:248) {
   names(county_hist)[i] <- 
      paste("t", substr(names(county_hist)[i], 2, 5), "-",
            substr(names(county_hist)[i], 7, 8), "-",
            substr(names(county_hist)[i], 10, 11), sep = "")
}

write.csv(county_hist, "testing_county.csv")

county_1p3a <- read_csv("county_1p3a.csv")
county_1p3a$geoid <- as.numeric(county_1p3a$GEOID)
county_hist$geoid <- as.numeric(county_hist$geoid)

county_1p3a <- left_join(county_1p3a, county_hist, by = "geoid")
county_1p3a$"t2020-01-21" <- -1
county_1p3a$"t2020-01-24" <- -1
county_1p3a$"t2020-01-26" <- -1
county_1p3a$"t2020-01-30" <- -1
county_1p3a$"t2020-01-31" <- -1

for (i in 1:201){
den <- names(county_1p3a)[15+i-1]
for (j in 1:3216){
if (county_1p3a[j,paste("t",den, sep = "")]==-1) {
   county_1p3a[j,671+i] <- -1
} else {
   yesterday_den <- as.Date(den)-1
   if (county_1p3a[j,paste("t",yesterday_den, sep = "")]==-1) {
      county_1p3a[j,671+i] <- -1
   } else if (county_1p3a[j,paste("t",den, sep = "")]-county_1p3a[j,paste("t",yesterday_den, sep = "")] <= 0){
      county_1p3a[j,671+i] <- -1
      } else {
      county_1p3a[j,671+i] <- county_1p3a[j,den]/
         (county_1p3a[j,paste("t",den, sep = "")]-county_1p3a[j,paste("t",yesterday_den, sep = "")])
      }
}
if (county_1p3a[j,671+i]>1) {
      county_1p3a[j,671+i] <- -1
   }  
}
print(i)
names(county_1p3a)[671+i] <- paste("tpos",den, sep = "")
}

County_State_Criteria <- read_excel("Testing_Data/County_State Criteria.xlsx")
county_criteria <- County_State_Criteria[,1:2]
county_1p3a <- left_join(county_1p3a, county_criteria, by = c("state_abbr"="State"))
county_1p3a$criteria <- NULL

write.csv(county_1p3a, "testing_1p3a.csv")

## usafacts
county_usafacts <- left_join(county_usafacts, county_criteria, by = c("state_abbr"="State"))
write.csv(county_usafacts, "county_usafacts.csv")

# read in usafacts case data
covid_confirmed_usafacts <- read_csv("covid_confirmed_usafacts.csv")

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
names(covid_usafacts)[224]


for (i in 1:219){
   den <- names(covid_usafacts)[6+i-1]
   new_case <- covid_usafacts[,6+i-1]-covid_usafacts[,6+i-2]
   if (nchar(den) == 7) {
      den <- paste("2020-0",substr(den, 1, 1),"-",
                   substr(den, 3, 4), sep = "")
   }
   if (nchar(den) == 6) {
      den <- paste("2020-0",substr(den, 1, 1),"-0",
                   substr(den, 3, 3), sep = "")
   }
   for (j in 1:3142){
      if (covid_usafacts[j,paste("t",den, sep = "")]==-1) {
         covid_usafacts[j,480+i] <- -1
      } else {
         yesterday_den <- as.Date(den)-1
         if (covid_usafacts[j,paste("t",yesterday_den, sep = "")]==-1) {
            covid_usafacts[j,480+i] <- -1
         } else if (covid_usafacts[j,paste("t",den, sep = "")]-covid_usafacts[j,paste("t",yesterday_den, sep = "")] <= 0){
            covid_usafacts[j,480+i] <- -1
         } else {
            covid_usafacts[j,480+i] <- new_case[j,]/
               (covid_usafacts[j,paste("t",den, sep = "")]-covid_usafacts[j,paste("t",yesterday_den, sep = "")])
         }
      }
      if (covid_usafacts[j,480+i]>1) {
         covid_usafacts[j,480+i] <- -1
      }  
   }
   print(i)
   names(covid_usafacts)[480+i] <- paste("tpos",den, sep = "")
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
