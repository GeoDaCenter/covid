import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { ContentContainer } from '../../styled_components';
import Grid from '@mui/material/Grid';
import { MemberGrid, NavBar, Footer } from '../../components';
import { contributors } from '../../meta/contributors';
import { coreTeam } from '../../meta/coreTeam';
import colors from '../../config/colors';

const phases = ['alpha', 'beta', 'v2', 'v3'];
const timelineText = [
  <p>
    Kolak, Li, and Lin begin development of the Atlas on March 14, and make it
    public on March 21. Feedback on initial prototype and approach are provided
    by colleagues at the Center for Spatial Data Science, UW Madison Data
    Science Group, and more.
  </p>,
  <p>
    The Atlas is awarded funding by the Robert Wood Johnson Foundation to assist
    vulnerable communities. County Health Rankings, CSI Solutions, Dr. Yu’s
    research group at Berkeley joined as coalition partners to connect
    platforms/insights. Graphic design, UI/UX, and help guides developed with
    support by Studio Akemi, Burness Communications, and the UChicago Libraries.
    A new Insights blog is launched in Medium to synthesize Atlas findings and
    share COVID experiences from multiple views.
  </p>,
  <p>
    Halpern and Paykin join the Atlas team. The Atlas infrastructure is
    optimized and upgraded to more dynamic, interactive design. Communication of
    insights to various stakeholders is refined. Analysis of COVID disparities
    across multiple dimensions begins.
  </p>,
  <p>
    Martinez joins the core Atlas team. A second phase of funding is awarded by
    Robert Wood Johnson Foundation to explore equity and resilient communities.
    A Community Advisory Board is launched. Read more about our next phase{' '}
    <a href="https://www.rwjf.org/" target="_blank" rel="noopener noreferrer">
      here.
    </a>
  </p>,
];

const coalitionPartners = [
  {
    name: 'University of Chicago',
    img: 'uc.jpg',
    alt: 'The Wordmark logo for the University of Chicago',
    link: 'https://www.uchicago.edu/',
  },
  {
    name: 'County Health Rankings and Roadmaps',
    img: 'chrr.jpg',
    alt: 'The Wordmark logo for the University of Chicago',
    link: 'https://www.countyhealthrankings.org/',
  },
  {
    name: 'Uiversity of Wisconsin Madison',
    img: 'uw-m.jpg',
    alt: 'The Wordmark logo for the University of Wisconsin Madison',
    link: 'https://www.wisc.edu/',
  },
  {
    name: 'University of California Berkeley',
    img: 'uc-berkeley.jpg',
    alt: 'The Wordmark logo for the University of California Berkeley',
    link: 'https://www.berkeley.edu/',
  },
  {
    name: 'CSI Solutions',
    img: 'csi.jpg',
    alt: 'The Wordmark logo for the CSI Solutions',
    link: 'https://www.spreadinnovation.com/',
  },
  {
    name: 'Robert Wood Johnson Foundation',
    img: 'rwjf.jpg',
    alt: 'The Wordmark logo for the Robert Wood Johnson Foundation',
    link: 'https://www.rwjf.org/',
  },
];

const AboutPage = styled.div`
  background: white;
  h2 {
    font-weight: normal;
    letter-spacing: initial;
    border-bottom: 1px solid ${colors.darkgray};
    display: table;
    margin-bottom: 1em;
    padding-bottom: 1em;
    font-size: 1.5rem;
  }
  p {
    max-width: 75ch;
    margin-bottom: 2em;
  }
`;
// const BioSection = styled.div`
//     padding:40px 0;
//     text-align:center;
//     img {
//         width:100%;
//         max-width:200px;
//         display:block;
//         border-radius:50%;
//         margin:40px auto 10px auto;
//     }
//     p.affiliation {
//         display:inline;
//     }
//     p {
//         max-width: 400px;
//         margin:0 auto;
//     }
// `

const CoreTeamContainer = styled(ContentContainer)`
  width: 100%;
  max-width: initial;
  padding: 1em;
  background: ${colors.lightgray}66;
`;
const CoreTeam = styled.div`
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  display: block;
  padding: 20px;
`;

const ContributorsContainer = styled.div``;

const ContributorBio = styled.div`
  overflow: hidden;
  position: relative;
  width: 11.11%;
  @media (max-width: 1024px) {
    width: 20%;
  }
  @media (max-width: 768px) {
    width: 25%;
  }
  @media (max-width: 540px) {
    width: 33%;
  }
  aspect-ratio: 1;
  display: inline-block;
  background: ${(props) => props.bg};
  background-size: cover;
  margin-bottom: -3px;
  filter: ${(props) =>
    props.active
      ? 'grayscale(0) brightness(100%);'
      : 'grayscale(1) brightness(75%);'};
  transition: 500ms all;
  a {
    opacity: 0;
    position: absolute;
    left: 0;
    top: 0;
    color: white;
    width: 100%;
    height: 100%;
    padding: 0.25em;
    font-size: 0.75rem;
    cursor: pointer;
  }
  &:hover {
    a {
      opacity: 1;
    }
    &::before {
      background-color: rgba(0, 0, 0, 0.5);
    }
    // background:${(props) => props.bg};
  }
  &::before {
    transition: 500ms all;
    background-color: rgba(0, 0, 0, 0);
    content: '';
    display: block;
    height: 100%;
    position: absolute;
    width: 100%;
    pointer-events: none;
  }
`;

const Contributor = ({ bio, active }) => (
  <ContributorBio
    bg={`url(${process.env.PUBLIC_URL}/img/people/${bio.img})`}
    active={active}
  >
    <a href={bio.link} target="_blank" rel="noopener noreferrer">
      {bio.name}
      <br />
      {bio.title} {bio.affiliation}
    </a>
  </ContributorBio>
);

const Timeline = styled.div`
  width: 100%;
`;

const TimelineButton = styled.button`
  background: ${(props) => (props.active ? colors.yellow : colors.white)};
  display: inline-block;
  padding: 0.25em 0.5em;
  transition: 250ms all;
  cursor: pointer;
  border-width: 2px;
  border-color: ${(props) => (props.active ? colors.yellow : colors.orange)};
  border-radius: 0.5em;
  border-style: solid;
  box-shadow: 3px 5px 8px -5px rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: 3px 5px 8px -5px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 3px 5px 8px -5px rgba(0, 0, 0, 0.5);
`;

const TimelineDescription = styled.span`
  width: 100%;
  p {
    border: 2px solid ${colors.yellow};
    padding: 1em;
    margin-top: 1em;
    width: 50ch;
    transition: 250ms all;
    margin-left: ${(props) =>
      props.index === 0
        ? 0
        : `calc(${100 * (props.index / 3)}% - ${50 * (props.index / 3)}ch)`};
    @media (max-width: 960px) {
      margin: 1em auto;
      width: 100%;
    }
  }
`;

// const ProgramArea = styled(Grid)`
//     padding-top:1em;
//     text-align:center;
//     h4 {
//         font-size:1rem;
//         padding:1em 0;
//     }
//     img {
//         margin:0 auto;
//         display:block;
//     }
// `

const LogoGrid = styled.div`
  display: block;
  margin: 0 auto;
  span {
    margin: 0.5em 1em;
    display: inline-block;
  }
  img {
    max-width: 100%;
    height: 55px;
    display: inline-block;
    margin: 0 auto;
  }
`;

export default function About() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const teamRef = useRef(null);
  const topRef = useRef(null);

  const handleHashChange = () => {
    if (window.location.hash === '#team') teamRef.current.scrollIntoView();
    if (window.location.hash === '') topRef.current.scrollIntoView();
  };

  useEffect(() => {
    if (window.location.hash === '#team') teamRef.current.scrollIntoView();
    window.addEventListener('hashchange', handleHashChange, false);
  }, []);

  return (
    <AboutPage>
      <NavBar light />
      <ContentContainer>
        <h1 ref={topRef}>About the US COVID Atlas</h1>
        <hr />
        <h2>
          The US Covid Atlas project works to understand, archive, and represent{' '}
          <br /> the often unequal impact of the COVID-19 pandemic in the United
          States.
        </h2>
        {/* <Gutter h={20} />
               <Grid container>
                   <ProgramArea item xs={12} md={4}>
                       <img alt="" src={`${process.env.PUBLIC_URL}/icons/regional-hot-spots.png`} />
                       <h4>Analytics &amp; Spatial Statistics</h4>
                       <p>Placeholder Text</p>
                   </ProgramArea>
                   <ProgramArea item xs={12} md={4}>
                       <img alt="" src={`${process.env.PUBLIC_URL}/icons/spread-over-time-2.png`} />
                       <h4>Community-Engaged Tool Building</h4>
                       <p>Placeholder Text</p>
                   </ProgramArea>
                   <ProgramArea item xs={12} md={4}>
                       <img alt="" src={`${process.env.PUBLIC_URL}/icons/county-level-data.png`} />
                       <h4>Public Health Communication</h4>
                       <p>Placeholder Text</p>
                   </ProgramArea>
               </Grid> */}
      </ContentContainer>

      <CoreTeamContainer>
        <CoreTeam>
          <h2 ref={teamRef}>Atlas Team</h2>
          <p>
            The US COVID Atlas Project is a coalition of research partners and
            contributors that have been integral to developing and expanding the
            Covid Atlas to meet the needs of health practitioners, planners,
            researchers, and the public. The Atlas team leads from The Center
            for Spatial Data Science have directed development of the Atlas
            since its first launch in March of 2020.
          </p>
          <MemberGrid members={coreTeam} columns={{ md: 4 }} />
        </CoreTeam>
      </CoreTeamContainer>
      <ContentContainer>
        <h2>Project Timeline</h2>
        <p>
          A network of volunteers have made the Atlas possible through their
          contributions to its open-source code, research collaboration across
          institutions. The timeline below highlights team contributions over
          the development of the Atlas.
        </p>
        <Timeline>
          <Grid container spacing={0}>
            <Grid item xs={3}>
              March to April 2020
            </Grid>
            <Grid item xs={3}>
              May to October 2020
            </Grid>
            <Grid item xs={3}>
              November to May 2021
            </Grid>
            <Grid item xs={3}>
              June 2021 onward
            </Grid>
            <Grid item xs={12}>
              <hr />
            </Grid>
            <Grid item xs={3}>
              <TimelineButton
                active={phaseIndex === 0}
                onClick={() => setPhaseIndex(0)}
              >
                Alpha
              </TimelineButton>
            </Grid>
            <Grid item xs={3}>
              <TimelineButton
                active={phaseIndex === 1}
                onClick={() => setPhaseIndex(1)}
              >
                Beta
              </TimelineButton>
            </Grid>
            <Grid item xs={3}>
              <TimelineButton
                active={phaseIndex === 2}
                onClick={() => setPhaseIndex(2)}
              >
                v2
              </TimelineButton>
            </Grid>
            <Grid item xs={3}>
              <TimelineButton
                active={phaseIndex === 3}
                onClick={() => setPhaseIndex(3)}
              >
                v3
              </TimelineButton>
            </Grid>
          </Grid>
        </Timeline>
        <TimelineDescription index={phaseIndex}>
          {timelineText[phaseIndex]}
        </TimelineDescription>
        <ContributorsContainer>
          {contributors.map((bio) => (
            <Contributor
              bio={bio}
              active={bio.hasOwnProperty(phases[phaseIndex])}
            />
          ))}
        </ContributorsContainer>
        <hr />
        <h2>Research Coalition Partners</h2>
        <LogoGrid container spacing={2}>
          {coalitionPartners.map((partner) => (
            <span>
              <a
                href={`${partner.link}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`${process.env.PUBLIC_URL}/img/coalition-partners/${partner.img}`}
                  alt={partner.alt}
                />
              </a>
            </span>
          ))}
        </LogoGrid>
        <hr />
        <h2>Awards and Recognition</h2>
        <ul>
          <li>
            <a
              href="https://www.fastcompany.com/90667101/pandemic-response-innovation-by-design-2021"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fast Company Innovation By Design Pandemic Response - Honorable
              Mention
            </a>
          </li>
          <li>
            <a
              href="https://aag-hmgsg.org/awards/health-data-visualization-award/"
              target="_blank"
              rel="noopener noreferrer"
            >
              American Association of Geographers Health Data Visualization
              (Dynamic) - Winner
            </a>
          </li>
        </ul>
        <hr />
        <h2>User Feedback</h2>
        <p>
          <i>
            We are grateful to the invaluable feedback provided in multiple user
            group meetings throughout the Atlas’s development, including
            representatives from the Cincinnati Children's Hospital, Stanford
            University’s Clinical Excellence Research Center, Apple, Harvard
            T.H. Chan School of PH, Henry Ford Health System, Indian Health
            Service, National Association Community Health Centers, and more.
            Thank you:
          </i>
        </p>
        <p>
          Andy Beck, David Hartley, Cole Brokamp, Robert Jahn, Bela Patel, Nirav
          Shah, Elijah Meeks, John Brownstein, Don Goldmann, Maureen Bisognano,
          Don Berwick, Kathy Reims, Roger Chaufournier, Wes Luckey, Annette
          Phillips, Richard Davis, Juliana Sadovich, Bruce Finke, Jeffrey
          McCollum, Don Goldman, Kathy McNamara, Julia Skapik, Ron Yee, Caroline
          Tiller, John Schapman, Linda Parlette, Wendy Brzezny, Sahuara Suval,
          Christal Eshelman, Laura Sisulak, Carly Hood-Ronick, Barry Kling,
          Barbara West, Kim Lepin, Joshua Austin, Jeff Coben, Kathleen Clark
        </p>
      </ContentContainer>
      <Footer />
    </AboutPage>
  );
}
