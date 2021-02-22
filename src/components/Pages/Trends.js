import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer } from '..';
import { colors } from '../../config';

const TrendsPage = styled.div`
    background:white;
    ul li {
        margin-bottom:16px;
    }
`

const TutorialBox = styled.div`
    border:1px solid ${colors.lightgray};
    padding:20px;

    ol {
        padding-left:40px;
    }
    ol li {
        line-height:2.5;        
    }
`

const Trends = () => {

    return (
       <TrendsPage>
           <StaticNavbar/>
           <ContentContainer>

                <h1>Emerging Trends</h1>
                <hr/>
                <p>
                    We can make educated guesses about the future spread of the pandemic by using data from the past and present. It is important to look at several variables together when looking for emerging virus trends.
                    <br/><br/>
                    Use Choropleth maps, Hotspots, and the Time Animated Slider and Graph to find areas that may soon be significantly affected by Covid-19.
                </p>
                <Gutter h={20}/>
                <TutorialBox>

                    <h3>Choropleth: Map Today’s Data for Individual Counties</h3>
                    <Gutter h={20}/>
                    <ol>
                        <li>Select By <b>County (USAFacts.com)</b> as the data source.</li>
                        <li>Select <b>Confirmed Count</b> as the variable.</li>
                        <li>Click on the <b>Choropleth</b> button. Bright red counties have a high number of Covid-19 cases.</li>
                        <li>Change the variable to <b>Confirmed Count per 100K Population</b>. Now bright red counties show populations with a high percentage of cases. The percentage is useful for looking at counties with small populations and the severity of the virus in a place.
                            <Gutter h={20}/>
                            The count and the percentage of cases in a county are important for understanding the impact of the virus, but they only show one day of data. Next, use Local Clustering to map how cases compare across counties.</li>
                    </ol>
                    <Gutter h={20}/>
                    <h3>Hotspots: Map Today’s Data Across Counties</h3>
                    <Gutter h={20}/>
                    <ol>
                        <li>Select <b>By County (USAFacts.com)</b> as the data source.</li>
                        <li>Select <b>Confirmed Count</b> as the variable.</li>
                        <li>Click on the <b>Hotspots</b> button. Bright red counties have high case counts and are surrounded by similar areas. These regions are currently significantly affected by Covid-19.</li>
                        <li>Find counties in pale blue. These are outlier counties: they have a low number of cases compared to the high number of cases in neighboring counties. This means that pale blue counties may soon be affected by Covid-19 through spread from nearby counties.</li>
                        <li>Find counties in pale red. These are also outlier counties, but they have a high case count compared to neighboring counties. Areas close to pale red counties may soon be affected by Covid-19 as the virus spreads.</li>
                        <li>
                            Change the variable to Confirmed Count per 100K Population and explore clusters of high virus percentages and outliers. The percentage is useful for looking at counties with small populations and for comparing counties.
                            <Gutter h={20}/>
                            Explore the variables <b>Daily New Confirmed Count</b> and <b>Daily New Confirmed per 100K Pop</b>. Clusters of high counts and percentages of new cases may also mean that nearby areas will soon see an increase in virus spread.
                            <Gutter h={20}/>
                            Local clustering shows current groups of counties that are significantly affected and nearby places that may soon see an increase in virus spread. Next, use the Time Graph to see the history of the virus spread to learn about the trajectory of new cases.</li>
                    </ol>
                    <h3>Time Graph: See Trajectory of New Case Counts</h3>
                    <Gutter h={20}/>
                    <ol>
                        <li>Select <b>Confirmed Count</b> as the variable.</li>
                        <li>Click on the <b>Hotspot</b> button.
                            <Gutter h={20}/>
                            The <b>Time Graph</b> at the bottom of the left panel shows the number of new cases each day. The default graph shows new cases in the United States.</li>
                        <li>Click on a county in the map to see the number of new cases each day since March 2020.
                            <Gutter h={20}/>
                            The red line rises when more cases exist than did the previous day. The red line falls when there are fewer new cases than the previous day.
                            <Gutter h={20}/>
                            This pattern of rising, falling, or staying flat is the trajectory of the virus. Use the trajectory to estimate how many new cases will be diagnosed in the following days. Next, bring together these lines of evidence to interpret emerging trends.</li>
                    </ol>
                </TutorialBox>
                <Gutter h={20}/>
                <h3>Interpreting Emerging Trends</h3>
                <br/>
                <p>By looking at choropleth maps, local clustering, and the time graph we can predict which counties may soon see higher rates of new Covid-19 cases and how severe those increases may be. These steps can be repeated with the 1point3acres data and may result in different clusters because data sources are collected in different ways. Read the Data page for information about how the data sets are different.
                    <br/><br/>
                    Remember:
                    <br/><br/>
                    <ul>
                        <li><b>Choropleth Maps:</b> Shows data from one day for individual places. Looking at the percentage of confirmed and new cases is useful for small populations and knowing the severity of the virus in a place.</li>
                        <li><b>Hotspots:</b> Shows neighboring groups of counties that are significantly affected by the virus and their neighbors. Pale blue outlier counties are at risk for new cases in the following weeks. Pale red outlier counties may be the source of new cases in surrounding counties.</li>
                        <li><b>Time Graph:</b> Shows new case counts over time. The direction of the line shows the trajectory of the disease.</li>
                    </ul>
                    <NavLink to="/faq">Back to Help Topics</NavLink>
                </p>
           </ContentContainer>
           <Footer/>
       </TrendsPage>
    );
}
 
export default Trends;