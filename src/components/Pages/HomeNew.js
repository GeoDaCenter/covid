import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import Grid from '@material-ui/core/Grid';

import { StaticNavbar, Geocoder, HeroMap, Footer, FastTrackInsights } from '../../components';
import { colors, MAPBOX_ACCESS_TOKEN } from '../../config';
import { Gutter } from '../../styled_components';

const HomePage = styled.div`
    h1 {    
        font-family: 'Playfair Display', serif;
        font-size: 49px;
        font-weight: 300;
        text-align: left;
        font-style: italic;
        color: #d8d8d8;
        width: 80vw;
        max-width: 940px;
        margin: 0;
        font-size:4rem;
        @media (max-width:960px){
            font-size:2rem;
            width:100%;
        }
    }
    .h1, .h2, .h3, .h4, .h5, .h6, h1, h2, h3, h4, h5, h6 {
        margin-bottom: .5rem;
        font-weight: 500;
        line-height: 1.2;
    }
    hr {
        max-width:1140px;
        margin:6em auto;
        border: 0;
        border-top: 1px solid ${colors.skyblue};
    } 
    p {
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
    }
`

const HomePageContent = styled.div`
    width:100%;
    margin:0 auto;
`

const Hero = styled.div`
    width:100%;
    max-width:1140px;
    position:relative;
    text-align:center;
    color: ${colors.lightgray};
    margin:0 auto;
    padding:50px 10px 0 10px;
    z-index:1;
    min-height:calc(80vh - 93px);
    p {
        
        font-family: 'Lato', sans-serif;
        font-size: 1.1rem;
        font-weight: 300;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.4;
        letter-spacing: normal;
        color: #ededed;
        text-align:left;
        &.orText {
            padding:0;
            margin:0;
            width:100%;
            height:50px;
            text-align:center;
            line-height:2.5;
        }
    }
    #button-cta {
        flex:auto;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 1.75px;
        line-height:3;
        text-align: center;
        text-transform:uppercase;
        background-color: ${colors.orange};
        color: #0d0d0d;
        padding: 0 1.5rem;
        margin:0;
        border-radius: .3rem;
        text-decoration:none;
        height:50px;
        @media (max-width:960px){
            max-width:50%;
            margin:0 auto;
        }
        @media (max-width:600px){
            max-width:75%;
            margin:0 auto;
        }
    }
    #HomeGeocoder{
        @media (max-width:960px){
            max-width:56%;
            margin:0 auto;
        }
        @media (max-width:600px){
            max-width:85%;
            margin:0 auto;
        }
    }
    .small-text {
        font-size:0.75rem;
        a {
            font-size:0.75rem;
            color:${colors.orange};
            text-decoration:none;
        }
    }
    video {
        margin-bottom:20px;
        width:100%;
        max-width:600px;
    }
    .map-caption {
        font-size:0.9rem;
        text-align:left;

    }

`

const Features = styled.div`
    max-width:1140px;
    width:100%;
    margin: 0 auto 60px auto;
    h2 {
        font-family: 'Playfair Display', serif;
        font-size: 28px;
        text-align:center;
        font-weight: normal;
        font-stretch: normal;
        font-style: italic;
        line-height: 1.5;
        letter-spacing: normal;
        text-align: center;
        color: ${colors.skyblue};
        margin-bottom:40px;
    }
`

const Feature = styled(Grid)`
    text-align:center;
    h5 {
        font-family: 'Playfair Display', serif;
        font-size: 19px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        color: ${colors.skyblue};
        margin-bottom:20px;
    }
    img {
        margin:20px auto;
        width:100%;
        max-width:130px;
    }
    p {
        color:white;
        font-family: Lato;
        font-size: 16px;
        font-weight: 300;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.63;
        letter-spacing: normal;
        color: ${colors.white};
        @media(max-width:960px) {
            max-width:400px;
            margin:0 auto 40px auto;
        }
    }
`

const BreakQuestion = styled.div`
    width:100%;
    background-color:${colors.skyblue};
    padding:20px;
    h3 {
        font-family: 'Playfair Display', serif;
        font-size: 28px;
        font-weight: normal;
        font-stretch: normal;
        font-style: italic;
        line-height: 1.5;
        letter-spacing: normal;
        text-align: center;
        color: ${colors.gray};
    }
`

const Arrow = styled.div`
    width: 35px;
    height: 35px;
    background-color: ${colors.skyblue};
    position:absolute;
    left:50%;
    transform: translate(-50%, 0px) rotate(-45deg);
`

const UseCasesContainer = styled.div`
    background:white;
    width:100%;
    padding: 40px 20px;
    padding-top:40px;
`
const UseCases = styled.div`
    width:100%;
    max-width:1140px;
    margin:0 auto;
    @media (max-width:960px){
        text-align:center;
    }
    video, img {
        width:100%;
        max-width:400px;
        margin:0 auto;
        display:block;
    }
    h5 {
        font-size:1.5rem;
    }
    p {
        max-width:600px;
        font-size:16px;
        line-height:1.7;
        @media (max-width:960px){
            margin: 0 auto;
        }
    }
`

const NoBreak = styled.span`
    white-space: nowrap;
`

const Usage = styled.span`
    background:${props => colors[props.color]};
    padding:10px 15px;
    border-radius:15px;
    font-weight:bold;
    line-height:4;
    font-size:1rem;
    transform:translateY(-100%);
`

const CenteredGrid = styled(Grid)`
    display:flex;
    align-centers:center;
`

const MapWrapper = styled.div`
    position:absolute;
    top:calc(8vh + 93px);
    right:15px;
    z-index:0;
`

function Home(){

    const handleGeocoder = (e) => {
        let url = '';
        
        if ((`${window.location.href}`).includes('index')) {
            url += (`${window.location.href}`).split('index')[0]
        } else {
            url += window.location.href
        }
        url += `map?lat=${e.center[1]}&lon=${e.center[0]}&z=6.5&v=2`
        window.location.href = url        
    }

    return (
       <HomePage>
           <StaticNavbar/>
           <HomePageContent>
                <Hero>
                    <Gutter vh={5}/>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <h1>Near Real-Time Exploration of the <NoBreak>COVID-19</NoBreak> Pandemic</h1>
                        </Grid>
                        
                        <Gutter vh={5}/>

                        <Grid item xs={12} md={5}> 
                            <p>
                                The US COVID Atlas is a visualization tool led by a <br/><b>University of Chicago research coalition.</b>
                                <br/><br/>
                                In a quickly changing pandemic landscape, our tool connects COVID case data and community indicators 
                                across the United States from its beginning to today. The Atlas helps you access current, 
                                validated county-level data and spatial analysis to better understand the spread in communities 
                                and to bolster planning efforts.
                            </p>
                        </Grid>
                        <Grid item xs={12} md={7}></Grid>
                        
                        <Gutter vh={10}/>

                        <CenteredGrid item xs={12} md={5} id="HomeGeocoder">
                            <Geocoder 
                                // id="HomeGeocoder"
                                placeholder={"Find your county..."}
                                API_KEY={MAPBOX_ACCESS_TOKEN}
                                onChange={handleGeocoder}
                                style={{
                                    border: '6px solid white', 
                                    boxSizing:'content-box',
                                    borderRadius:0
                                }}
                            />
                        </CenteredGrid>
                        <CenteredGrid item xs={12} md={2}>
                            <p className="orText">or</p>
                        </CenteredGrid>
                        <CenteredGrid item xs={12} md={5}>
                            <NavLink to="/map" id="button-cta">Start Exploring the Atlas</NavLink>
                        </CenteredGrid>
                    </Grid>
                    
                    <MapWrapper>
                        <HeroMap/>
                    </MapWrapper>
                    <Gutter h={20}/>
                </Hero>
                <FastTrackInsights />
                <Features>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <h2>Atlas Features</h2>
                        </Grid>
                        <Feature item xs={12} md={3}>
                            <img src={`${process.env.PUBLIC_URL}/icons/regional-hot-spots.png`} alt="Regional Hotspots" loading="lazy"/>
                            <h5>Track regional hotspots <NoBreak>in real-time</NoBreak></h5>
                            <p>
                                Statistical clusters of both confirmed and daily new COVID cases &amp; deaths, 
                                with and without population adjustment.
                            </p>
                        </Feature>
                        <Feature item xs={12} md={3}>
                            <img src={`${process.env.PUBLIC_URL}/icons/spread-over-time-2@2x.png`} alt="COVID Spread" loading="lazy" />
                            <h5>Watch COVID-19 spread across the country</h5>
                            <p>
                                Watch the spread of accumulated or daily new COVID cases using a time slider and live time-animation.
                            </p>
                        </Feature>
                        <Feature item xs={12} md={3}>
                            <img src={`${process.env.PUBLIC_URL}/icons/county-level-data@2x.png`} alt="County COVID Map" loading="lazy"/>
                            <h5>Zoom in to focus down to the county level</h5>
                            <p>
                                Uncover trends of the pandemic by comparing different data sources, variables, and spatial analytic insights.
                            </p>
                        </Feature>
                        <Feature item xs={12} md={3}>
                            <img src={`${process.env.PUBLIC_URL}/icons/comm-health-context@2x.png`} alt="Community Health Contexts" loading="lazy"/>
                            <h5>Tap into community and health contexts</h5>
                            <p>
                                Connect to relevant social, economic, and health indicators to provide meaningful community context.
                            </p>
                            
                        </Feature>
                    </Grid>
                </Features>
                <BreakQuestion>
                    <h3>
                        How can the Atlas better equip you to respond to the pandemic?
                    </h3>
                    <Arrow/>
                </BreakQuestion>
                <UseCasesContainer>
                    <UseCases>
                        <Grid container spacing={5}>
                            <Grid item xs={12} md={6}>
                                <video autoPlay={true} muted={true} loop={true}> 
                                    <source src={`${process.env.PUBLIC_URL}/img/use_case1.mp4`} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Usage color="yellow">Usage #1</Usage>
                                <h5>Identify Regional Hotspots for Mitigation</h5>
                                <p>
                                    Use spatial statistics to detect hot spots with raw case data or by adjusting for population. 
                                    Because of the infectious nature of COVID, high numbers of cases anywhere will be of concern. 
                                    At the same time, identifying areas that have a disporotionately high number of cases 
                                    within the population is necessary to locate areas hit hardest by the pandemic.
                                </p>
                            </Grid>
                            <Gutter h={80}/>
                            <Grid item xs={12} md={6}>
                                <Usage color="orange">Usage #2</Usage>
                                <h5>Track patterns to better plan ahead</h5>
                                <p>
                                    Visualize change over time to better understand the distribution and spread of COVID in the US throughout the pandemic. 
                                    Move the time slider yourself or click the play button and watch the spread of COVID. 
                                    Analyze patterns of the spread to support planning for resource allocation.
                                </p>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <img src={`${process.env.PUBLIC_URL}/img/Landingpage_usage2.gif`} alt="Use Case 2: Tracking COVID Patterns over time" loading="lazy"/>
                            </Grid>
                            <Gutter h={80}/>
                            <Grid item xs={12} md={6}>
                                <img src={`${process.env.PUBLIC_URL}/img/Landingpage_usage3.gif`} alt="Use Case 3: Forecasting viral spreads" loading="lazy"/>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Usage color="yellow">Usage #3</Usage>
                                <h5>Interact and forecast viral spread at state and county levels</h5>
                                <p>
                                    Switch between the state and county thematic maps (ie. choropleth maps) to find COVID at a local level. 
                                    Then, select and track hotspots over time using the Local Moran's I statistic. 
                                    Use a powerful visual analytic tool to find COVID spillovers along state borders, emerging from one county to areas nearby, and more.
                                </p>
                            </Grid>
                            <Gutter h={80}/>
                            <Grid item xs={12} md={6}>
                                <Usage color="orange">Usage #4</Usage>
                                <h5>Make visible vulnerable communities</h5>
                                <p>
                                    Click on counties to get more information about community health factors and socioeconomic indicators 
                                    like average length of life in an area, percent uninsured, or income inequality metrics. 
                                    In the main selection panel, overlay segregated cities or Native American Reservation boundaries to identify uniquely vulnerable locales.
                                </p>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <img src={`${process.env.PUBLIC_URL}/img/Landingpage_usage4.gif`} alt="Use Case 4: Make visible vulnerable communities" loading="lazy"/>
                            </Grid>
                            <Gutter h={80}/>
                            <Grid item xs={12} md={6}>
                                <img src={`${process.env.PUBLIC_URL}/img/Landingpage_usage5.gif`} alt="Use Case 5: Forecasting viral spreads" loading="lazy"/>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Usage color="yellow">Usage #5</Usage>
                                <h5>Identify emerging risk</h5>
                                <p>
                                    Watch hotspots progress or diminish over time, and identify areas of emerging risk early. Some hotspots begin as spatial outliers -- 
                                    shown as pink in the map, meaning cases are high in that county but low in neighboring counties. 
                                    If cases continue to grow and spillover nearby counties, the areas will turn red. 
                                    Mature hotspots are clusters of counties that remain red over time and continue to grow.
                                </p>
                            </Grid>
                        </Grid>
                    </UseCases>
                </UseCasesContainer>
           </HomePageContent>
           <Footer signUp={true} />
       </HomePage>
    );
}
 
export default Home;