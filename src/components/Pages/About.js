import React, { useState } from 'react';
import styled from 'styled-components';
import { ContentContainer, Gutter } from '../../styled_components';
import Grid from '@material-ui/core/Grid';
import { NavBar, Footer } from '../../components';
import { contributors } from '../../meta/contributors';
import { coreTeam } from '../../meta/coreTeam';
import { colors } from '../../config';

const phases = ['alpha', 'beta', 'v1', 'v2', 'v3']
const phasesPlain = ['Alpha', 'Beta', 'Version 1', 'Version 2', 'Version 3']
const timelineText = [
    <p>
        Kolak, Li, and Lin begin development of the Atlas on March 14, 
        and make it public on March 21. Feedback on initial prototype and 
        approach are provided by colleagues at the Center for Spatial Data Science, 
        UW Madison Data Science Group, and more.
    </p>,
    <p>
        The Atlas is awarded funding by the Robert Wood Johnson Foundation to assist 
        vulnerable communities. County Health Rankings, CSI Solutions, Dr. Yu’s research
        group at Berkeley joined as coalition partners to connect platforms/insights. 
        Graphic design, UI/UX, and help guides developed with support by Studio Akemi, 
        Burness Communications, and the UChicago Libraries. A new Insights blog is launched
        in Medium to synthesize Atlas findings and share COVID experiences from multiple views.
    </p>,
    <p>
        V1 Text.
    </p>,
    <p>
        Halpern and Paykin join the Atlas team. The Atlas infrastructure is optimized and 
        upgraded to more dynamic, interactive design. Communication of insights to various 
        stakeholders is refined. Analysis of COVID disparities across multiple dimensions begins.
    </p>,
    <p>
        Martinez joins the core Atlas team. A second phase of funding is awarded by 
        Robert Wood Johnson Foundation to explore equity and resilient communities. 
        A Community Advisory Board is launched. Read more about our next 
        phase <a href="https://www.rwjf.org/" target="_blank" rel="noopener noreferrer">here.</a>
    </p>
]

const AboutPage = styled.div`
    background:white;
    h2 {
        font-weight:normal;
        letter-spacing:initial;
        border-bottom:1px solid ${colors.darkgray};
        display:table;
        margin-bottom:1em;
    }
    p {
        max-width:75ch;
        margin-bottom:2em;
    }
`
const BioSection = styled.div`
    padding:40px 0;
    text-align:center;
    img {
        width:100%;
        max-width:200px;
        display:block;
        border-radius:50%;
        margin:40px auto 10px auto;
    }
    p.affiliation {
        display:inline;
    } 
    p {
        max-width: 400px;
        margin:0 auto;
    }
`

const CoreTeamContainer = styled(ContentContainer)`
    width:100%;
    max-width:initial;
    padding:1em;
    background:${colors.lightgray}66;
`
const CoreTeam = styled.div`
    width:100%;
    max-width:1140px;
    margin:0 auto;
    display:block;
    padding:20px;
`

const TeamBio = styled(Grid)`
    display:flex;
    img {
        max-width:10em;
        padding-bottom:2em;
    }
    span {
        padding-left:1em;
    }
`

const CoreMemberBio = ({member}) => 
    <TeamBio item xs={12} md={4}>
        <img src={`${process.env.PUBLIC_URL}/img/people/${member.img}`} alt={`Team photo of ${member.name}`}/>
        <span>
            <h4>{member.name}</h4>
            <h5>{member.title}</h5>
        </span>
    </TeamBio>

const ContributorsContainer = styled.div``


const ContributorBio = styled.div`
    overflow:hidden;
    position:relative;  
    width:12.5%;
    aspect-ratio:1;
    display: inline-block;
    background:${props => props.bg};
    background-size:cover;
    margin-bottom:-3px;
    filter: ${props => props.active ? 'grayscale(0)' : 'grayscale(1)'};
    transition:500ms all;
    a {
        opacity:0;
        position:absolute;
        left:0;
        top:0;
        color:white;
        width:100%;
        height:100%;
        padding:0.25em;
        font-size:0.75rem;
        cursor:pointer;
    }
    &:hover {
        a {
            opacity:1;
        }
        &::before {
            background-color:rgba(0,0,0,0.5);
        }
        // background:${props => props.bg};
    }
    &::before {
        transition:500ms all;
        background-color: rgba(0, 0, 0, 0);
        content: '';
        display: block;
        height: 100%;
        position: absolute;
        width: 100%;
        pointer-events:none;
    }

`

const Contributor = ({bio, active}) => 
    <ContributorBio active={active} bg={`url(${process.env.PUBLIC_URL}/img/people/${bio.img})`} active={active}>
        <a href={bio.link} target="_blank" rel="noopener noreferrer">
            {bio.name}<br/>
            {bio.title},{bio.affiliation}
        </a>
    </ContributorBio>

const Timeline = styled.div`
    width:100%;
`

const TimelineButton = styled.button`
    background: ${props => props.active ? colors.yellow : colors.orange}99;
    display:inline-block;
    padding:0.25em 0.5em;
    transition:250ms all;
    cursor:pointer;
    border:none;
    
`

const TimelineDescription = styled.span`
    p {
        border:2px solid ${colors.orange};
        padding:1em;
    }
`

export default function About(){
    const [phaseIndex, setPhaseIndex] = useState(0);
    
    return (
       <AboutPage>
           <NavBar light/>
           <ContentContainer>
               <h1>About Us</h1>
               <hr/>
               {/* <h2>
                    The US COVID Atlas Project is a coalition of research partners and 
                    contributors that have been integral to developing and expanding the 
                    Covid Atlas to meet the needs of health practitioners, planners, researchers, 
                    and the public. The Atlas team leads from The Center for Spatial Data Science 
                    have directed development of the Atlas since its first launch in March of 2020.
                </h2> */}
           </ContentContainer>

           <CoreTeamContainer>
                <CoreTeam>
                <h2>Atlas Team</h2>
                <p>
                    The US COVID Atlas Project is a coalition of research partners and 
                    contributors that have been integral to developing and expanding the 
                    Covid Atlas to meet the needs of health practitioners, planners, researchers,
                    and the public. The Atlas team leads from The Center for Spatial Data Science 
                    have directed development of the Atlas since its first launch in March of 2020.
                </p>
                <Grid container spacing={2}>
                    {coreTeam.map(member => <CoreMemberBio member={member} />)}
                </Grid>
                </CoreTeam>
            </CoreTeamContainer>
            <ContentContainer>
                <h2>Project Timeline</h2>
                <p>
                    A network of volunteers have made the Atlas possible through 
                    their contributions to its open-source code, research collaboration 
                    across institutions. The timeline below highlights team contributions 
                    over the development of the Atlas.
                </p>
                <Timeline>
                    <Grid container spacing={0}>
                        <Grid item xs={12} md={3}>March-April 2020</Grid>
                        <Grid item xs={12} md={3}>May-October 2020</Grid>
                        <Grid item xs={12} md={3}>November 2021- May 2021</Grid>
                        <Grid item xs={12} md={3}>June 2021 +</Grid>
                        <Grid item xs={12}>
                            <hr/>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TimelineButton
                                active={phaseIndex === 0}
                                onClick={() => setPhaseIndex(0)}
                            >
                                Alpha
                            </TimelineButton>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TimelineButton
                                active={phaseIndex === 1}
                                onClick={() => setPhaseIndex(1)}
                            >Beta</TimelineButton>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TimelineButton
                                active={phaseIndex === 2}
                                onClick={() => setPhaseIndex(2)}
                            >Version 2</TimelineButton>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TimelineButton
                                active={phaseIndex === 3}
                                onClick={() => setPhaseIndex(3)}
                            >Version 3</TimelineButton>
                        </Grid>
                    </Grid>
                </Timeline>
                <TimelineDescription>
                    {timelineText[phaseIndex]}
                </TimelineDescription>
                <ContributorsContainer>
                    {contributors.map(bio => <Contributor bio={bio} active={bio.hasOwnProperty(phases[phaseIndex])} />)}
                </ContributorsContainer>
            </ContentContainer>
           <Footer/>
       </AboutPage>
    );
}