import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer } from '../';
import { colors } from '../../config';

const HotspotsPage = styled.div`
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

const Hotspots = () => {

    return (
       <HotspotsPage>
           <StaticNavbar/>
           <ContentContainer>

                <h1>Hotspots</h1>
                <hr/>
                <p>
                    Local clusters are areas that neighbor one another and share a particular quality, such as high numbers of Covid-19 cases. A hot spot is an area that is significantly different from the areas surrounding it. A hot spot may be one place or a cluster of places.
                    <br/><br/>
                    The Atlas shows patterns in the spread of the disease by displaying hot spots and clusters. See the Methods page for details about detecting clusters.
                    <br/><br/>
                    The Atlas shows four types of hot spots:
                    <br/><br/>
                </p>
                <ul>
                    <li><b>High-High:</b> Areas with high numbers whose neighbors also have high numbers. Bright red counties have a significantly high number of cases or deaths, or significantly fewer hospital beds per case. Neighbors for these areas also have a high number of cases.</li>
                    <li><b>Low-Low:</b> Areas with low numbers whose neighbors also have low numbers. Bright blue counties have significantly fewer cases or deaths, or significantly more hospital beds per case. Neighbors for these areas also have a low number of cases.</li>
                    <li><b>High-Low:</b> Areas with high numbers whose neighbors have low numbers. This type of hot spot is also called an outlier, because it differs so much from its neighbors. Pale red counties have more cases, deaths, or fewer hospital beds per case than do their immediate neighbors. The surrounding areas may experience significant spread of the virus in future weeks.</li>
                    <li><b>Low-High:</b> Areas with low numbers whose neighbors have high numbers. This type of hot spot is also called an outlier, because it differs so much from its neighbors. Pale blue counties have fewer cases, deaths, or more hospital beds per case than do their immediate neighbors. These areas may experience significant spread of the virus from surrounding areas in future weeks.</li>
                </ul>
                <p>Use local clustering to explore geographic patterns of the virus and to help locate areas that will soon be significantly affected by the virus.</p>
                <Gutter h={20}/>
                <TutorialBox>

                <h2>FROM THE LEFT SIDEBAR</h2>
                <ol>
                    <li>Select the data source and variable you would like to map.</li>
                    <li>Click the <b>Hotspot</b> button.</li>
                    <li>Use the color ramp at the bottom of the screen to see if a county falls into a hotspot category.</li>
                    <li>Reds represent high numbers and percentages and blues represent low counts and percentages. Gray represents areas that do not fall into a hotspot.</li>
                </ol>
                <Gutter h={20}/>
                <h2>FROM THE MAP</h2>
                <ol start="4">
                    <li>Use the above hot spot types to determine if a county or state is significantly affected by Covid-19: High-High and High-Low spots.</li>
                    <li>Look for neighboring areas that are significantly affected. High-Low and Low-High spots may show an emerging trend.</li>
                    <li>Click on a county or state in the map for a popup containing all data variables, socioeconomic indicators, and a disease forecast for that area.</li>
                    <li>Move the time slider at the top of the map to see counts and percentages of cases, deaths, or hospital beds on different dates.</li>
                </ol>
                </TutorialBox>
                
                <Gutter h={20}/>
                <p>
                    To explore changes over time use the <NavLink to="/time">Time slider.</NavLink>  To explore data about the virus on a particular day use the <NavLink to="/choropleth">Choropleth</NavLink> display. 
                    <br/><br/>
                    
                    <NavLink to="/faq">Back to Help Topics</NavLink>
                </p>
                <Gutter h={20}/>
           </ContentContainer>
           <Footer/>
       </HotspotsPage>
    );
}
 
export default Hotspots;