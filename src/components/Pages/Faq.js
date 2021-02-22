import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';

import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer } from '../';
import { colors } from '../../config';

const FaqPage = styled.div`
    background:white;
    ul li {
        margin-bottom:16px;
    }
`

const ButtonContainer = styled(Grid)`
`

const TutorialButton = styled.button`
    width:100%;
    border:1px solid ${colors.lightgray};
    text-align:left;
    padding:10px 20px;
    background:white;
    transition:250ms all;
    cursor:pointer;
    &:hover {
        background:${colors.lightgray}55;
    }
    p {
        padding:10px 0;
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

const Accordion = styled(MuiAccordion)`
`

const AccordionSummary = styled(MuiAccordionSummary)`
`

const AccordionDetails = styled(MuiAccordionDetails)`
`

const faqQuestions = [
    {
        'header': 'What data do you use for COVID cases?',
        'content': 'Because there is no single, authoritative source of COVID case data in the United States, we use multiple sources. We include 1P3A data, a crowdsourced dataset from international volunteers that offered the first available county-level data for public use in early March. We also include USAFacts data, a journalistic dataset that made county-level data available in March. In future releases, we may also incorporate county-level reports by NYT and John Hopkins University. We recommend checking across multiple data sources, and validating against local health department numbers.'
    },
    {
        'header': 'When will you add hospitalization data?',
        'content': 'At this time, hospitalization data is not available in a single data source for all counties across the United States. If this changes, we will be certain to incorporate it.'
    },
    {
        'header': 'When will you add COVID case data by race, age, and demographics?',
        'content': 'At this time, data is not available by race, age, and demographics in a single data source for all counties across the United States. If this changes, we will be certain to incorporate it. There are several projects we recommend for state-wide metrics for race and ethniciy data, including the <a href="https://covidtracking.com/race/dashboard/" target="_blank" rel="noopener noreferrer">Racial Dashboard</a> by CovidTracking.com and <a href="http://d4bl.org/" target="_blank" rel="noopener noreferrer">Data 4 Black Lives</a>.'
    },
    {
        'header': 'Do you have a 7-day average?',
        'content': 'Yes, we recently added 7-Day Average Daily Confirmed Count. We calculated this variable by taking the difference between the current day’s confirmed count and the confirmed count 7 days ago, and then dividing this difference by 7. For example, we took the difference between the confirmed count as of June 30th and that as of June 23rd, divided the difference by 7, then used this as an estimate for 7 Day Average Daily Confirmed Count for June 30th. Technically speaking, this measures the daily average growth for the week right before June 30th. Also note that this calculation is only available with USAFacts data because of data completeness (1P3A has several days’ data missing in January and February).'
    },
    {
        'header': 'Why do you have multiple data sources available? ',
        'content': 'Because there is no one single authoratative, validated source for county-level COVID cases and deaths for real-time analysis, we incorporate multiple datasets from multiple projects to allow for comparisons. For more information about each data source see our <a href="/data">Data</a> page.'
    },
    {
        'header': 'Should I be concerned about other areas than in High-High clusters?',
        'content': 'High-Low & Low-High clusters refer to Outliers. These are areas that have a high (and low in Low-High) number of cases within the county and a low (and high in High-Low) number of cases in neighboring counties, highlighting an emerging risk or priority for containment.'
    },
    {
        'header': 'Why do you focus on county-level and not state-level changes?',
        'content': 'County-level visualizations show a dramatically more detailed pandemic landscape, while aggregate data alone can miss local hot spots of surging COVID cases. If one only looks at state-level data, a county cluster would have to be extreme to show up, and by then it might be too late for prevention measures to be enacted.'
    },
    {
        'header': 'What is the difference betweeen Natural Breaks (fixd bins) and Natural Breaks under Choropleth?',
        'content': `With the fixed bins option, the legend stays the same as you go back in time. This makes it easier to watch the spread of COVID over time. In the other option, the legend changes each day, adjusting for the optimal classification according to how many cases exist for that day. <br/><br/>
        For a more technical response; both use a non-linear algorithm to group observations such that within-group homogeneity is maximized. However, the Natural Breaks (fixed bins) option applies the algorithm to the data for the most recent date and uses the same bins to group observations for historical data. This allows us to better visualize the pandemic spread over time. The Natural Breaks option, on the other hand, uses a non-linear algoritm to group observations for every day's data, which results in maxized within-group homogeneity for every day's data, but difficult to visualize changes over time.
        `
    }   
]   

const Faq = () => {

    const [expanded, setExpanded] = useState('panel0');
  
    const handleChange = (panel) => (event, newExpanded) => {
      setExpanded(newExpanded ? panel : false);
    };

    const goTo = (page) => window.location.href = page;
    return (
       <FaqPage>
           <StaticNavbar/>
           <ContentContainer>
               <h1>Help</h1>
               <hr/>
               <ButtonContainer container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TutorialButton onClick={() => goTo('choropleth')}>
                            <h3>Choropleth Maps</h3>
                            <p>Explore counts and percentages of cases, deaths, and hospital beds.</p>
                        </TutorialButton> 
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TutorialButton onClick={() => goTo('hotspot')}>
                            <h3>Hotspots</h3>
                            <p>Find groups of counties and states affected by the virus.</p>
                        </TutorialButton> 
                    </Grid>
                    <Grid item xs={12} md={6}>  
                    <TutorialButton onClick={() => goTo('trends')}>
                            <h3>Emerging Trends</h3>
                            <p>Locate areas that will soon be significantly affected by virus.</p>
                        </TutorialButton> 
                    </Grid>
                    <Grid item xs={12} md={6}>
                    <TutorialButton onClick={() => goTo('time')}>
                            <h3>Change Over Time</h3>
                            <p>See the history of the virus by county and state.</p>
                        </TutorialButton> 
                    </Grid>
                </ButtonContainer>
                <Gutter h={20}/>
                <h2>FREQUENTLY ASKED QUESTIONS</h2>
                <hr/>
                {faqQuestions.map((question, index) => 
                    <Accordion square expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)}>
                        <AccordionSummary aria-controls={`panel${index}d-content`} id={`panel${index}d-header`}>
                        <Typography>{question.header}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <Typography>
                            <p dangerouslySetInnerHTML={{__html: question.content}}></p>
                        </Typography>
                        </AccordionDetails>
                    </Accordion>
                )}
                <Gutter h={20}/>
                <h2>LEARNING COMMUNITY</h2>
                <hr/>
                <p>
                        The <a href="https://covidatlas.healthcarecommunities.org/" target="_blank" rel="noopener noreferrer">Atlas Learning Community</a> is project by <a href="https://www.spreadinnovation.com/" target="_blank" rel="noopener noreferrer">CSI Solutions</a> to provide Atlas super-users, health practioners, and planners a place to interact. 
                        It is moderated by coalition members. Ask questions, provide feedback, and help make the Atlas Coalition stronger!
                </p>
                <Gutter h={40}/>
           </ContentContainer>
           <Footer/>
       </FaqPage>
    );
}
 
export default Faq;