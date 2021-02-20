import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';


import { ContentContainer, Gutter } from '../../styled_components';

import Grid from '@material-ui/core/Grid';

import { StaticNavbar, Footer } from '../../components';
import { colors } from '../../config';

const AboutPage = styled.div`
    background:white;
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

const leadershipInfo = [
    {
        name: 'Marynia Kolak, MS, MFA, PhD',
        link: 'https://makosak.github.io/',
        img: `${process.env.PUBLIC_URL}/img/mk.jpg`,
        affiliation: '(CSDS)',
        title: 'Assistant Director for Health Informatics, Health Geographer, GIScientist'
    },
    {
        name:'Xun Li, PhD',
        link:'https://www.linkedin.com/in/xun-li-794a5b18/',
        img: `${process.env.PUBLIC_URL}/img/xunli2.png`,
        affiliation:'(CSDS)',
        title:'Assistant Director for Data Science & principal software engineer of GeoDa'
    },
    {
        name:'Qinyun Lin, PhD',
        link:'https://www.linkedin.com/in/qinyun-lin-b72763112',
        img: `${process.env.PUBLIC_URL}/img/qlin.png`,
        affiliation:'(CSDS)',
        title:'Postdoctoral Fellow specializing in causal inference, social network analysis & multi-level models',
    },
]


const coreTeamInfo = [
    {
        name:'Dylan Halpern, MCP',
        link:'https://dylanhalpern.com/',
        img: `${process.env.PUBLIC_URL}/img/dylan.png`,
        affiliation:'(CSDS)',
        title:'Principal Software Engineer',
    },
    {
       'name': 'Vidal Anguino, MS',
        'link': 'https://spatial.uchicago.edu/directories/full/Research-Assistants',
        'img': `${process.env.PUBLIC_URL}/img/vidal.jpeg`,
        'affiliation': '(CSDS)',
        'title': 'Software Engineer'
    },
    {
        'name': 'Susan Paykin, MPP',
        'link': 'https://www.linkedin.com/in/susanpaykin/',
        'img': `${process.env.PUBLIC_URL}/img/susan.jpg`,
        'affiliation': '(CSDS)',
        'title': 'Senior Research Specialist'
    },
    {
        'name': 'Stephanie Yang',
        'link': 'https://spatial.uchicago.edu/directories/full/Research-Assistants',
        'img': `${process.env.PUBLIC_URL}/img/stephanie.png`,
        'affiliation': '(CSDS)',
        'title': 'Spatial Data Science Fellow Data Engineer'
    },
    {
        'name': 'Ryan Wang',
        'link': 'https://spatial.uchicago.edu/directories/full/Research-Assistants',
        'img': `${process.env.PUBLIC_URL}/img/ryan.jpeg`,
        'affiliation': '(CSDS)',
        'title': 'Spatial Data Science Fellow Data Analyst'
    },
    {
        'name': 'Kenna Camper',
        'link': 'https://kenna-camper.wixsite.com/portfolio',
        'img': `${process.env.PUBLIC_URL}/img/kenna.png`,
        'affiliation': '(CSDS)',
        'title': 'Research Assistant Communications Specialist'
    },
    {
        'name': 'Laura Chen',
        'link': 'https://spatial.uchicago.edu/directories/full/Research-Assistants',
        'img': `${process.env.PUBLIC_URL}/img/laura.png`,
        'affiliation': '(CSDS)',
        'title': 'Research Assistant Communications Specialist'
    }, 
]

const coalitionDesignInfo = [
    {
        'name': 'Akemi Hong',
        'link': 'http://www.studioakemi.com',
        'img': `${process.env.PUBLIC_URL}/img/akemi.jpeg`,
        'affiliation': '',
        'title': 'Principal, Studio Akemi'
    },
    {
        'name': 'Toni Williams',
        'link': 'https://burness.com/our-people/toni',
        'img': `${process.env.PUBLIC_URL}/img/toni.jpg`,
        'affiliation': '',
        'title': 'Vice President, Burness'
    },
    {
        'name': 'Cecilia Smith, MS, PhD',
        'link': 'https://www.lib.uchicago.edu/about/directory/staff/cecilia-smith/',
        'img': `${process.env.PUBLIC_URL}/img/cecilia.jpg`,
        'affiliation': '',
        'title': 'GIS and Maps Librarian, Univesity of Chicago'
    },

]
const coalitionPartnersInfo = [
    {
        'name': 'Lawrence T. Brown, PhD',
        'link': 'https://uwphi.pophealth.wisc.edu/staff/brown-lawrence/',
        'img': `${process.env.PUBLIC_URL}/img/lawrence.png`,
        'affiliation': '(CHR&R)',
        'title': 'Director of County Health Rankings & Roadmaps, Visiting Associate Professor in the University of Wisconsin Population Health Institute'
    },
    {
        'name': 'Marjorie Givens, PhD ',
        'link': 'https://uwphi.pophealth.wisc.edu/staff/givens-phd-marjory/',
        'img': `${process.env.PUBLIC_URL}/img/givens.jpg`,
        'affiliation': ' (CHR&R) ',
        'title': 'Associate Director, Population Health Institute'
    },
    {
        'name': 'Bin Yu, PhD',
        'link': 'https://www.stat.berkeley.edu/~binyu/Site/Welcome.html',
        'img': `${process.env.PUBLIC_URL}/img/bin.jpg`,
        'affiliation': '(Berkeley)',
        'title': "Chancellor's Distinguished Professor, Principal of Yu Research Group, Departments of Statistics and EECS"
    },
    {
        'name': 'Roger L. Chaufournier, MHSA',
        'link': 'https://www.linkedin.com/in/roger-chaufournier-0499a22a',
        'img': `${process.env.PUBLIC_URL}/img/roger.jpg`,
        'affiliation': '',
        'title': 'CEO of CSI Solutions'
    },
    {
        'name': 'Kathy Reims, MD',
        'link': 'https://www.linkedin.com/in/kathy-reims-56279217',
        'img': `${process.env.PUBLIC_URL}/img/kreims.jpg`,
        'affiliation': '',
        'title': 'CMO of CSI Solutions'
    },
    {
        'name': 'Greg Wolverton, FHIMSS',
        'link': 'https://www.linkedin.com/in/greg-wolverton-234057a',
        'img': `${process.env.PUBLIC_URL}/img/greg.jpeg`,
        'affiliation': '',
        'title': 'CTO of CSI Solutions'
    },
    {
        'name': 'Brian Yandell, PhD ',
        'link': 'https://datascience.wisc.edu/covid19',
        'img': `${process.env.PUBLIC_URL}/img/yandell.jpg`,
        'affiliation': '(UW-Madison)',
        'title': 'Interim Director at the American Family Insurance Data Science Institute, lead of the UW-Madison COVID Data Science Team'},
    {
        'name': 'Steve Goldstein, PhD ',
        'link': 'https://biostat.wiscweb.wisc.edu/staff/goldstein-steve/',
        'img': `${process.env.PUBLIC_URL}/img/steveg.jpeg`,
        'affiliation': '(UW-Madison)',
        'title': 'Botany, Biostatistics and Medical Informatics'
    },
    {
        'name': 'Kevin Little, PhD',
        'link': 'https://www.iecodesign.com/about-us',
        'img': `${process.env.PUBLIC_URL}/img/kevin.png`,
        'affiliation': '',
        'title': 'Principal, Informing Ecological Design, LLC'
    },
    
]
const contributorsInfo = [
    {
        'name': 'Julia Koschinsky',
        'link': 'https://www.linkedin.com/in/julia-koschinsky-657599b1',
        'img': `${process.env.PUBLIC_URL}/img/julia.jpeg`,
        'affiliation': '(CSDS)',
        'title': 'Executive Director of the Center for Spatial Data Science at the University of Chicago.'
    },
    {
        'name': 'Luc Anselin',
        'link': 'https://spatial.uchicago.edu/directory/luc-anselin-phd',
        'img': `${process.env.PUBLIC_URL}/img/luc.png`,
        'affiliation': '(CSDS) ',
        'title': 'Stein-Freiler Distinguished Service Professor of Sociology at the College, Director of the Center for Spatial Data Science, & a Senior Fellow at NORC.'
    },
    {
        'name': 'John Steill ',
        'link': 'https://www.linkedin.com/in/johnsteill/',
        'img': `${process.env.PUBLIC_URL}/img/johns.png`,
        'affiliation': '(UW-Madison)',
        'title': 'Computational Biologist Morgridge Institute of Research'
    },
    {
        'name': 'Steven Wangen ',
        'link': 'https://www.linkedin.com/in/steven-wangen/',
        'img': `${process.env.PUBLIC_URL}/img/steve.png`,
        'affiliation': '(UW-Madison) ',
        'title': 'Assistant Scientist at the Wisconsin Institute for Discovery, and Data Scientist at the American Family Insurance Data Science Institute.'
    },
    {
        'name': 'Erin Abbott',
        'link': 'https://spatial.uchicago.edu/directories/full/Research-Assistants',
        'img': `${process.env.PUBLIC_URL}/img/erin.jpeg`,
        'affiliation': '(CSDS)',
        'title': '3rd year Environmental & Urban Studies major, Geographic Information Science minor, and Pre-health at the University of Chicago.'
    },
    {
        'name': 'Karina Acosta Ordonez',
        'link': 'https://spatial.uchicago.edu/directories/full/all',
        'img': `${process.env.PUBLIC_URL}/img/karina.jpg`,
        'affiliation': '(CSDS)',
        'title': 'PhD Student, Visiting Scholar'
    },
    {
        'name': 'Sihan Mao ',
        'link': 'https://www.linkedin.com/in/sihan-mao/',
        'img': `${process.env.PUBLIC_URL}/img/sihano.jpeg`,
        'affiliation': '(CSDS Alumni)',
        'title': 'Senior Data & Policy Analyst, Department of Innovation & Performance, City of Pittsburgh'
    },
    {
        'name': 'Arianna Israel',
        'link': '',
        'img': `${process.env.PUBLIC_URL}/img/ari.jpg`,
        'affiliation': '',
        'title': 'UX Engineer'
    },
    {
        'name': 'Robert Martin',
        'link': '',
        'img': `${process.env.PUBLIC_URL}/img/robert.jpeg`,
        'affiliation': '',
        'title': 'Software Engineer'
    },
    {
        'name': 'Dan Snow, MS',
        'link': '',
        'img': `${process.env.PUBLIC_URL}/img/Dan.png`,
        'affiliation': '(CSDS)',
        'title': 'Software Engineer'
    },
    {
    'name': 'Moksha Menghaney',
    'link': '',
    'img': `${process.env.PUBLIC_URL}/img/Moksha.jpeg`,
    'affiliation': '(CSDS)',
    'title': 'Community Mapping Analyst'
    }
]



const formatBio = (person) => 
    <Grid item xs={12} md={4}>
        <img src={person.img} alt={`${person.name} photo`} />
        <p>
            {person.link ? 
                <a href={person.link} target="noopener noreferrer">{person.name}</a>
                :
                person.name
            }
            {person.affiliation && ` ${person.affiliation}`}
        </p>
        <p>
            {person.title}
        </p>
    </Grid>

const about = () => {
    return (
       <AboutPage>
           <StaticNavbar/>
           <ContentContainer>
               <h1>About Us</h1>
               <hr/>
               <h2>
                   The U.S. COVID-19 Atlas is a county-level clustering surveillance tool to provide quick access to county-level COVID-19 estimates, 
                   longitudinal exploration, and statistical cluster detection. It reveals a more detailed pandemic landscape with local hotspots of 
                   surging COVID cases that are missed by state-level data.
                </h2>
                <p>
                    In addition to basic visualizations at county &amp; state scales, the Atlas also provides statistical hotspots to support surveillance and 
                    decision-making that have helped a wide range of users, from rural health department officials to businesses across the country planning to re-open safely.
                    <br/><br/>
                    It was started in early March and launched less than two weeks later by the University of Chicago’s Center for Spatial Data Science (CSDS) based on its GeoDaWeb platform. 
                    A network of volunteers activated to contribute to its development, and the atlas has since expanded as a research coalition across multiple institutions.
                    <br/><br/>
                    Today, the US COVID Atlas Project is a coalition of research partners and contributors that have been integral to developing and expanding the Covid Atlas to meet the needs 
                    of health practitioners, planners, researchers, and the public, with support in part by the Robert Wood Johnson Foundation. The project remains a free and opensource GIS platform, 
                    building on GeoDa libraries.
                </p>
                <BioSection>
                    <h3>Leadership</h3>
                    <Grid container spacing={1} justify="center">
                        {leadershipInfo.map(person => formatBio(person))}
                    </Grid>
                    <Gutter h={60}/>
                    <h3>Core Development Team</h3>
                    <Grid container spacing={1} justify="center">
                        {coreTeamInfo.map(person => formatBio(person))}
                    </Grid>
                    <Gutter h={60}/>
                    <h3>Coalition Design &amp; Communications Team</h3>
                    <Grid container spacing={1} justify="center">
                        {coalitionDesignInfo.map(person => formatBio(person))}
                    </Grid>
                    <Gutter h={60}/>
                    <h3>Coalition Partners</h3>
                    <Grid container spacing={1} justify="center">
                        {coalitionPartnersInfo.map(person => formatBio(person))}
                    </Grid>
                    <Gutter h={60}/>
                    <h3>Contributors</h3>
                    <Grid container spacing={1} justify="center">
                        {contributorsInfo.map(person => formatBio(person))}
                    </Grid>
                </BioSection>
           </ContentContainer>
           <Footer/>
       </AboutPage>
    );
}
 
export default about;