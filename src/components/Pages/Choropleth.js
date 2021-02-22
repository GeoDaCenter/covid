import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer } from '../';
import { colors } from '../../config';

const ChoroplethPage = styled.div`
    background:white;
    min-height:100vh;
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

const Choropleth = () => {

    return (
       <ChoroplethPage>
           <StaticNavbar/>
           <ContentContainer>

                <h1>Choropleth Maps</h1>
                <hr/>
                <p>
                    Choropleth maps use color to show the count or percentage of a variable.
                    <br/><br/>
                    The Atlas uses color to show the count and percentage of all coronavirus cases, daily new cases, deaths, and hospital beds. Use choropleth maps to see data about the virus on a particular day.
                    <br/><br/>
                    For more details on how the Atlas created the choropleth maps, please see the Methods page.
                </p>
                <Gutter h={40}/>
                <TutorialBox>

                <h2>FROM THE LEFT SIDEBAR</h2>
                <ul>
                    <li>The choropleth map is the default display for the atlas webpage. To return to the choropleth display, first select the data source and variable you would like to map.</li>
                    <li>Click on the Choropleth button.</li>
                    <li>Use the color ramp at the bottom of the screen to interpret the count or percentage for each county or state.</li>
                    <li>Brighter reds represent larger counts and percentages. Paler yellows represent smaller counts and percentages.</li>
                </ul>
                </TutorialBox>
                
                <Gutter h={40}/>
            <p>
                To explore changes over time use the <NavLink to="/time">Time slider.</NavLink> To explore emerging trends and patterns use the <NavLink to="/hotspot">Hotspot</NavLink> display.
                <br/><br/>
                
                <NavLink to="/faq">Back to Help Topics</NavLink>
            </p>
           </ContentContainer>
           <Footer/>
       </ChoroplethPage>
    );
}
 
export default Choropleth;