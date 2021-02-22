import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer } from '../';
import { colors } from '../../config';

const InsightsPage = styled.div`
    background:white;
    min-height:100vh;
    footer {
        position:absolute;
        bottom:0;
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

const Time = () => {

    return (
       <InsightsPage>
           <StaticNavbar/>
           <ContentContainer>

                <h1>Change Over Time</h1>
                <hr/>
                <p>
                    How a variable changed over time offers insights into what will happen next. The Atlas uses the animated slider and the time graph to show the history of Covid-19’s spread. Read the <NavLink to="methods">Methods page</NavLink> for more information on data limitations and reporting lags.
                </p>
                <Gutter h={40}/>
                <TutorialBox>

                <h2>ANIMATED SLIDER</h2>
                <ol>
                    <li>From the left panel, select a data source, variable, and map type.</li>
                    <li>From the map, locate the animated slider at the top.</li>
                    <li>Click and drag your cursor along the slider to change the date of the map display.</li>
                    <li>Click the play arrow to watch the data change over time. You can pan and scroll on the map as it is animating.</li>
                </ol>

                <Gutter h={40}/>

                <h2>TIME GRAPH</h2>
                <ol>
                    <li>The line graph at the bottom of the left panel shows new cases in the US since March 2020.</li>
                    <li>The graph will animate with the slider, adding each new day of data as the slider moves forward in time.</li>
                    <li>Click on a county to show the entire history of daily new cases for that county.</li>
                    <li>Adjusting the animated slider will change the graph back to data from the entire United States.</li>
                </ol>

                </TutorialBox>
                
                <Gutter h={40}/>
            <p>
                To explore data about the virus on a particular day use the <NavLink to="/choropleth">Choropleth</NavLink> display. 
                To explore emerging trends and patterns use the <NavLink to="/hotspot">Hotspot</NavLink> display.
                <br/><br/>
                
                <NavLink to="/faq">Back to Help Topics</NavLink>
            </p>
           </ContentContainer>
           <Footer/>
       </InsightsPage>
    );
}
 
export default Time;