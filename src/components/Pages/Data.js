import React from 'react';
import styled from 'styled-components';
import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer, DataDetails, CsvDownloader } from '../'; 

const DataPage = styled.div`
    background:white;
`
 
function Data(){
    return (
       <DataPage>
           <StaticNavbar/>
           <ContentContainer>
                <h1>Data</h1>
                <br/><br/>
                <h2>CURRENT RELEASE</h2>
                <hr/>
                <h3>Confirmed COVID Cases and Deaths</h3>
                <p>
                    Because there is no one single validated source for county-level COVID cases and deaths for real-time analysis, 
                    we incorporate multiple datasets from multiple projects to allow for comparisons.
                </p>
                <br/>
                <ul>
                    <li>
                        <a href="https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/?utm_source=MailChimp&utm_campaign=census-covid2" target="_blank" rel="noopener noreferrer">USAFacts.</a> This dataset is provided by a non-profit organization. The data are aggregated from CDC, state- and local-level public health agencies. 
                        County-level data is confirmed by referencing state and local agencies directly.
                    </li>
                    <li>
                        <a href="https://coronavirus.1point3acres.com/en" target="_blank" rel="noopener noreferrer">1P3A.</a>This was the initial, crowdsourced data project that served as a volunteer project led by 1P3acres.com and 
                        Dr. Yu Gao, Head of Machine Learning Platform at Uber. We access this data stream using a token provided by the group.
                    </li>
                    <li>
                        <a href="https://github.com/nytimes/covid-19-data" target="_blank" rel="noopener noreferrer">New York Times.</a> The New York Times has made data available aggregated from dozens of journalists working to collect and monitor data from new conferences. They communicate with public officials to clarify and categorize cases.
                    </li>
                    <li>
                        <a href="https://covid.cdc.gov/covid-data-tracker/" target="_blank" rel="noopener noreferrer">CDC.</a> CDC data includes detailed historic testing data and case data aggregated to rolling 7-day averages.
                    </li>
                </ul>
                <Gutter h={40}/>
                <h3>Health System Capacity</h3>
                <br/>
                <p>
                    <a href="https://github.com/covidcaremap/covid19-healthsystemcapacity/tree/v0.2/data" target="_blank" rel="noopener noreferrer">COVIDCareMap.</a> Healthcare System Capacity includes Staffed beds, Staffed ICU beds, Licensed Beds by County. 
                    The data is from 2018 facility reports with additions/edits allowed in real-time.
                </p>
                <Gutter h={40}/>
                <h3>Community Characteristics, Health Context, and Health Factors</h3>
                <br/>
                <p>
                    <a href="https://www.census.gov/programs-surveys/acs" target="_blank" rel="noopener noreferrer">American Community Survey.</a> We incorporate population data used to generate rates and occupation estimates for essential worker percentages. We will add more information as needed in future iterations.
                    <br/><br/>
                    <a href="https://www.countyhealthrankings.org/explore-health-rankings/rankings-data-documentation" target="_blank" rel="noopener noreferrer">County Health Rankings &amp; Roadmaps (CHR&amp;R).</a> The CHR&amp;R is a 
                    collaboration between the Robert Wood Johnson Foundation and the University of Wisconsin Population Health Institute. 
                    The goal is to improve health outcomes for all and to close the health gaps between those with the most and least opportunities for good health.
                    <br/><br/>
                    Based on our discussion with CHR&amp;R, we include following focus areas and related measures for inclusion in the Atlas: 
                    income and economic hardship, children living in poverty, food insecurity, median household income, income inequality, access to health care, 
                    uninsured, preventable hospital stays, ratio of population to primary care physicians, housing cost and quality, Black/White residential segregation, 
                    percentage of 65 and older, obesity and diabetes prevalance, adult smoking, excessive drinking, drug overdose deaths, life expectancy and self-rated health condition.
                </p>
                <Gutter h={40}/>
                <h3>Forecasting statistics</h3>
                <br/>
                <p>
                    <a href="https://github.com/Yu-Group/covid19-severity-prediction" target="_blank" rel="noopener noreferrer">Hospital Severity Index.</a> The <a href="https://www.stat.berkeley.edu/~yugroup/people.html" target="_blank" rel="noopener noreferrer">Yu Group</a> at UC Berkeley Statistics and EECS has compiled, cleaned and continues to update a large corpus of hospital- and county-level 
                    data from a variety of public sources to aid data science efforts to combat COVID-19 (see <a href="http://covidseverity.com/" target="_blank" rel="noopener noreferrer">covidseverity.com</a>).
                    <br/><br/>
                    At the hospital level, their data include the location of the hospital, the number of ICU beds, the total number of employees, and the hospital type. 
                    At the county level, their data include COVID-19 cases/deaths from USA Facts and NYT, automatically updated every day, along with demographic information, 
                    health resource availability, COVID-19 health risk factors, and social mobility information.
                    <br/><br/>
                    An overview of each data set in this corpus is provided <a href="https://github.com/Yu-Group/covid-19-geographic-risk-prediction" target="_blank" rel="noopener noreferrer">here.</a> We will be adding more relevant data sets as they are found. 
                    We prepared this data to support healthcare supply distribution efforts through short-term (days) prediction of COVID-19 deaths (and cases) at the county level. 
                    We are using the predictions and hospital data to arrive at a covid Pandemic Severity Index (c-PSI) for each hospital. This project is in partnership with <a href="https://response4life.org/" target="_blank" rel="noopener noreferrer">Response4Life.</a>
                    A paper on the current approaches can be found <a href="https://arxiv.org/abs/2005.07882" target="_blank" rel="noopener noreferrer">at this link.</a> The more detailed information with data source descriptions is provided <a href="https://github.com/Yu-Group/covid19-severity-prediction" target="_blank" rel="noopener noreferrer">on the github.</a>
                </p>
                <Gutter h={40}/>                
                <h3>Mobility Data</h3>
                <br/>
                <p>
                    <a href="https://docs.safegraph.com/docs/neighborhood-patterns-2020" target="_blank" rel="noopener noreferrer">Safegraph Social Distancing.</a> Safegraph has provided Census Block Group level data that reports mobile phone device activity 
                    reported from apps that collect locations data. This data has been made available to for COVID-19 related research projects. The data is generated from a series of location pings throughout the day, which determine various behaviors, such as 
                    staying completely home, full time work (at a workplace outside of home for 6-8 hours), part time work (at a workplace outside of home for 3-6 hours), and delivery (multiple, short visits). Access to the data consortium is available <a href="https://www.safegraph.com/covid-19-data-consortium" target="_blank" rel="noopener noreferrer">here</a>.
                </p>
                <Gutter h={40}/>
                <CsvDownloader/>
                <Gutter h={40}/>
                {/* <h2>DATA DETAILS</h2>
                <hr />
                <DataDetails /> */}
               
            </ContentContainer>
            <Footer/>
       </DataPage>
    );
}
 
export default Data;