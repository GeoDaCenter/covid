import React, { useState } from 'react';
import styled from 'styled-components';
import { ContentContainer, Gutter } from '../../components';
import Grid from '@mui/material/Grid';
import { NavBar, Footer } from '..';
import colors from '../../config/colors';
// import colors from '../../config/colors';

const MethodsPage = styled.div`
  background: white;
  img#workflow,
  img.hotspot {
    width: 100%;
    max-width: 800px;
    margin: 20px auto;
    display: block;
  }
  img.jenks {
    display: block;
  }
  img.hotspot {
    margin-bottom: 0;
  }

  img.half-width {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    display: block;
  }

  p.caption {
    text-align: center;
    opacity: 0.7;
    margin-top: 0;
  }
  iframe {
    margin: 20px;
    max-width: 100%;
    width: calc(100% - 40px);
    box-shadow: -2px 0px 5px rgba(0, 0, 0, 0.7);
    height: 800px;
    max-height: 80vh;
  }
`;

const TabBar = styled.div``;

const Tab = styled.button`
  background: ${(props) => (props.active ? colors.yellow : colors.white)};
  outline: none;
  border: none;
  border-bottom: 1px solid ${colors.gray};
  padding: 5px 10px;
  margin: 0 10px;
  cursor: pointer;
  transition: 250ms all;
  font-size: ${(props) => (props.big ? '1.5rem' : '1rem')};
  font-family: ${(props) =>
    props.big ? 'Playfair Display, script' : 'Lato, sans-serif'};
`;

const TabPanel = styled.div`
  display: ${(props) => (props.display ? 'initial' : 'none')};
  table {
    border-collapse: collapse;
    margin: 1em 0;
  }
  td,
  th {
    text-align: left;
    border: 1px solid black;
    padding: 0.25em 0.5em;
  }
  .container {
    margin: 20px;
    max-width: 100%;
    width: calc(100% - 40px);
    box-shadow: -2px 0px 5px rgba(0, 0, 0, 0.7);
    padding: 1em;
    code {
      font-size: 1rem;
    }
  }
`;

const JenksEx = styled.div`
  display: flex;
  margin: 2em;
  text-align: center;
  div {
    width: 25%;
    max-width: 150px;
    svg {
      width: 50%;
      margin: 0 auto;
      display: block;
    }
  }
`;

const RenderJenksEx = ({ fills = [] }) => (
  <JenksEx>
    <div>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="20" fill={fills[0] || colors.lightgray} />
      </svg>
      <p>DuPage County</p>
    </div>
    <div>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="20" fill={fills[1] || colors.lightgray} />
      </svg>
      <p>Will County</p>
    </div>
    <div>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="20" fill={fills[2] || colors.lightgray} />
        <circle cx="25" cy="75" r="20" fill={fills[2] || colors.lightgray} />
        <circle cx="75" cy="25" r="20" fill={fills[2] || colors.lightgray} />
        <circle cx="75" cy="75" r="20" fill={fills[2] || colors.lightgray} />
      </svg>
      <p>Cook County</p>
    </div>
  </JenksEx>
);

const StyledEq = styled.code`
  padding-left: 0.5em;
  border-left: 4px solid ${(props) => props.color};
`;

function a11yProps(index, tabset) {
  return {
    id: `${tabset}-tab-${index}`,
    'aria-controls': `${tabset}--tabpanel-${index}`,
  };
}

export default function Methodology() {
  const [tabValue, setTabValue] = useState(0);
  const [jenksTab, setJenksTab] = useState(0);
  return (
    <MethodsPage>
      <NavBar light />
      <ContentContainer>
        <h1>Methods</h1>
        <hr />

        <TabBar position="static">
          <Tab
            big={true}
            {...a11yProps(0)}
            active={tabValue === 0}
            onClick={() => setTabValue(0, 'methodology')}
          >
            Mapping
          </Tab>
          <Tab
            big={true}
            {...a11yProps(1)}
            active={tabValue === 1}
            onClick={() => setTabValue(1, 'methodology')}
          >
            Infrastructure
          </Tab>
          <Tab
            big={true}
            {...a11yProps(2)}
            active={tabValue === 2}
            onClick={() => setTabValue(2, 'methodology')}
          >
            Data Collection
          </Tab>
        </TabBar>
        <TabPanel display={tabValue === 0}>
          <h2>Choropleth Mapping: Natural Breaks</h2>
          <p>
            For geo-visualization, we adopt jenks natural breaks maps to
            classify the values of the pandemic data for each state/county. A
            natural breaks map uses a nonlinear algorithm to create groups where
            within-group homogeneity is maximized, grouping and highlighting
            extreme observations.
            <br />
            <br />
            The Jenks break is a method designed by Jenks (1957) which assigns
            each observation to the best classification it could possibly belong
            to. It aims to find the best possible arrangement of the
            geographical units into classes, such that the deviation from the
            mean within classes is minimize, while the differences between
            classes in maximized. In other words, it aims to group more alike
            geographical units, while trying to maximize the differences between
            the groups created.
            <br />
            <br />
            Here's the Jenks strategy in action:
          </p>
          <Gutter h={20} />
          <TabBar position="static">
            <Tab
              {...a11yProps(0)}
              active={jenksTab === 0}
              onClick={() => setJenksTab(0, 'natural-jenks-explainer')}
            >
              Goal
            </Tab>
            <Tab
              {...a11yProps(1)}
              active={jenksTab === 1}
              onClick={() => setJenksTab(1, 'natural-jenks-explainer')}
            >
              Step 1
            </Tab>
            <Tab
              {...a11yProps(2)}
              active={jenksTab === 2}
              onClick={() => setJenksTab(2, 'natural-jenks-explainer')}
            >
              Step 2
            </Tab>
            <Tab
              {...a11yProps(3)}
              active={jenksTab === 3}
              onClick={() => setJenksTab(3, 'natural-jenks-explainer')}
            >
              Step 3
            </Tab>
            <Tab
              {...a11yProps(4)}
              active={jenksTab === 4}
              onClick={() => setJenksTab(4, 'natural-jenks-explainer')}
            >
              Step 4
            </Tab>
          </TabBar>
          <TabPanel display={jenksTab === 0}>
            <div className="container">
              <h4>
                For illustration purposes only, assume that we want to classify
                three counties based on its number of covid19 cases into two
                groups:
              </h4>
              <RenderJenksEx />
              <p>
                Suppose DuPage and Will Counties have 1 case, and Cook County
                has 4 cases.
              </p>
            </div>
          </TabPanel>
          <TabPanel display={jenksTab === 1}>
            <div className="container">
              <h4>
                To start, calculate the average of all counties and the sum of
                square deviations from that average:
              </h4>
              <RenderJenksEx />
              <code>
                Average: 6 / 3 = <b>2</b>
              </code>
              <br />
              <br />
              <code>
                Sum of squares: (4<sup>2</sup>+1<sup>2</sup>+1<sup>2</sup>) -
                ((4+1+1)<sup>2</sup> / 3) = <b>6</b>
              </code>
            </div>
          </TabPanel>
          <TabPanel display={jenksTab === 2}>
            <div className="container">
              <h4>
                Next, try all possible arrangements of counties into groupings,
                and then calculate the sum of squares for each possible
                grouping.
              </h4>
              <br />
              <br />
              <h4>Option 1</h4>
              <RenderJenksEx
                fills={[colors.yellow, colors.yellow, colors.lightblue]}
              />
              <code>Sum of squares:</code>
              <br />
              <StyledEq color={colors.yellow}>
                (1<sup>2</sup>+1<sup>2</sup>) - ((1+1)<sup>2</sup> / 2) ={' '}
                <b>0</b>
              </StyledEq>
              <br />
              <StyledEq color={colors.lightblue}>
                (4<sup>2</sup>) - ((4)<sup>2</sup> / 1) = <b>0</b>
              </StyledEq>
              <br />
              <code>0 + 0 = 0</code>
              <br />
              <br />
              <h4>Option 2</h4>
              <RenderJenksEx
                fills={[colors.lightblue, colors.yellow, colors.lightblue]}
              />
              <code>Sum of squares:</code>
              <br />
              <StyledEq color={colors.yellow}>
                (1<sup>2</sup>) - ((1)<sup>2</sup> / 1) = <b>0</b>
              </StyledEq>
              <br />
              <StyledEq color={colors.lightblue}>
                (1<sup>2</sup>+4<sup>2</sup>) - ((1+4)<sup>2</sup> / 2) ={' '}
                <b>4.5</b>
              </StyledEq>
              <br />
              <code>0 + 4.5 = 4.5</code>
              <br />
              <br />
              <h4>Option 2</h4>
              <RenderJenksEx
                fills={[colors.lightblue, colors.yellow, colors.yellow]}
              />
              <code>Sum of squares: </code>
              <br />
              <StyledEq color={colors.yellow}>
                (1<sup>2</sup>+4<sup>2</sup>) - ((1+4)<sup>2</sup> / 2) ={' '}
                <b>4.5</b>
              </StyledEq>
              <br />
              <StyledEq color={colors.lightblue}>
                (1<sup>2</sup>) - ((1)<sup>2</sup> / 1) = <b>0</b>
              </StyledEq>
              <br />
              <code>4.5 + 0 = 4.5</code>
            </div>
          </TabPanel>
          <TabPanel display={jenksTab === 3}>
            <div className="container">
              <h4>
                Calculate the difference between each option's sum of squares
                and the total overall sum of squares. The higher this value is,
                the greater the difference between groups. We'll choose the
                option that best maximizes difference.
              </h4>
              <br />
              <br />
              <h4>Option 1</h4>
              <RenderJenksEx
                fills={[colors.yellow, colors.yellow, colors.lightblue]}
              />
              <code>Difference:</code>
              <br />
              <code>Option sum of squares = 0</code>
              <br />
              <code>Overall sum of squares = 6</code>
              <br />
              <code>(6 - 0)/6 = 1</code>
              <br />
              <br />
              <br />
              <h4>Option 2</h4>
              <RenderJenksEx
                fills={[colors.lightblue, colors.yellow, colors.lightblue]}
              />
              <code>Difference:</code>
              <br />
              <code>Option sum of squares = 4.5</code>
              <br />
              <code>Overall sum of squares = 6</code>
              <br />
              <code>(6 - 4.5)/6 = .25</code>
              <br />
              <br />
              <br />
              <h4>Option 2</h4>
              <RenderJenksEx
                fills={[colors.lightblue, colors.yellow, colors.yellow]}
              />
              <code>Difference:</code>
              <br />
              <code>Option sum of squares = 4.5</code>
              <br />
              <code>Overall sum of squares = 6</code>
              <br />
              <code>(6 - 4.5)/6 = .25</code>
              <br />
            </div>
          </TabPanel>
          <TabPanel display={jenksTab === 4}>
            <div className="container">
              <h4>
                In this case, option 1 maximizes difference, and these are the
                selected bins:
              </h4>
              <br />
              <br />
              <RenderJenksEx
                fills={[colors.yellow, colors.yellow, colors.lightblue]}
              />
              <StyledEq color={colors.lightblue}>Class 1</StyledEq>
              <br />
              <StyledEq color={colors.yellow}>Class 2</StyledEq>
              <br />
              <br />
              <p>
                A formal description of the Jenks break could be found here:
                Jenks, GF (1967). The Data Model Concept in Statistical Mapping.
                International Yearbook of Cartography. 7: 186–190.
              </p>
            </div>
          </TabPanel>
          <Gutter h={40} />
          <h2>Hotspot Map: Local Moran's I</h2>
          <p>
            The CSDS team identifies hot spots two ways: using the total number
            of confirmed cases and by adjusting for population. Because of the
            infectious nature of COVID, high numbers of cases anywhere will be
            of concern. At the same time, identifying areas that have a
            disproportionately high number of cases within the population is
            needed to locate areas hit hardest by the pandemic. The team further
            differentiates hot spot clusters and outliers: clusters are counties
            that have a high number of cases, and are surrounded by counties
            with a high number of cases. Outliers are areas that have a high
            number of cases within the county and fewer cases in neighboring
            counties, highlighting an emerging risk or priority for containment.
            We utilize local spatial autocorrelation statistics (LISA) using
            queen-contiguity spatial weights and 999 Monte Carlo permutations to
            generate these metrics.
          </p>
          <br />
          <p>
            The Local Clustering maps identify clusters or collections of
            geographical units similar, in statistical terms, based on the
            indicator used. They can be used to identify hot spots of cold spots
            across space. Hot spots are of particular interests in
            epidemiological analysis such as the spread of covid19, as it allows
            the identification of “hot” groups of areas (e.g. States, counties)
            significantly affected by the virus. It is, collection of counties,
            for instance, with a relatively high indicator which are also
            surrounded by areas of high indicators. In the maps, such areas are
            represented by the red colors.
          </p>

          <Gutter h={40} />
          <h2>Interactive Local Moran's I Tutorial</h2>
          <p>
            Use the interactive below to learn more about how spatial contiguity
            weights and LISA statistics are calculated:
          </p>
          <iframe
            frameborder="0"
            src="https://observablehq.com/embed/@michelleeesi/local-spatial-autocorrelation-interactive-tutorial?cell=*"
          ></iframe>
          <br />
          <ul>
            <li>
              For more details:
              <ul>
                <li>
                  <a
                    href="https://geodacenter.github.io/glossary.html#lisa2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GeoDa Glossary
                  </a>
                </li>
                <li>
                  <a
                    href="https://geodacenter.github.io/workbook/6a_local_auto/lab6a.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GeoDa: Local Spatial Autocorrelation
                  </a>
                </li>
                <li>
                  Anselin, Luc. 1995. “Local Indicators of Spatial Association —
                  LISA.” Geographical Analysis 27: 93–115.
                </li>
                <li>
                  Anselin, Luc. 2018. “A Local Indicator of Multivariate Spatial
                  Association, Extending Geary’s c.” Geographical Analysis.
                </li>
                <li>
                  Anselin, Luc, and Xun Li. 2019. “Operational Local Join Count
                  Statistics for Cluster Detection.” Journal of Geographical
                  Systems.
                </li>
              </ul>
            </li>
          </ul>
          <Gutter h={40} />

          <h3>Interaction</h3>
          <br />
          <p>
            COVID cases are commonly visualized across multiple dashboards as
            quantile choropleth maps or graduated points around state centroids.
            County-level visualizations are rare but when viewed, show a
            dramatically more nuanced and detailed pandemic landscape. We
            visualize data at both state and county-scale as total cases,
            deaths, and population-weighted rates to provide a richer
            understanding of the pandemic. Case information can be explored by
            clicking on county or state areas to generate pop-up windows, or to
            change graphs of confirmed cases.
          </p>
          <img
            id="workflow"
            src={`${process.env.PUBLIC_URL}/img/workflow_fig1.png`}
            alt="Interactive Workflow"
          />
          <p className="caption">
            Figure displays the options available at the current state of the
            project and the steps required to display each map available
          </p>
          <Gutter h={40} />
          <h3>Temporal Exploration</h3>
          <br />
          <p>
            A temporal slider allows the current view to be updated over time,
            providing users the ability to watch the pandemic emerge over time.
            {/* See this animation of COVID population centered clusters over time as an example here. */}
          </p>
          <Gutter h={40} />
          <h3>GeoStack</h3>
          <br />
          <p>
            The app is made using Libgeoda as a lightweight C/C++ library that
            acts as a wrapper to the core features of GeoDa, an open source
            spatial analysis software developed by the Center. For this web map,
            it’s customized and compiled to WebAssembly, a format supported by
            most modern web browsers, and bound to the geo-visualization module
            via Javascript, which is implemented using deck.gl, d3.js and
            Mapbox.
          </p>
          <Gutter h={40} />
          <br />
          <h3>Free and Open Source Software (GPL-3)</h3>
          <br />
          <p>
            The Github for our project is public and available at{' '}
            <a
              href="https://github.com/GeoDaCenter/covid"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/GeoDaCenter/covid.
            </a>{' '}
            Contributions are welcome. Volunteers are encouraged to start on the
            “Issues” page and identify “good first issues” to maximize help
            efforts. A public release of the application will continue to be
            updated with new data and features on a regular basis.
          </p>
          <Gutter h={40} />
          <h3>Limitations</h3>
          <br />
          <p>
            Known limitations exist regarding actual fatality rates, for
            example, as we may not be aware of the total population infected
            until testing is expanded. County estimates are in the process of
            being validated across multiple sources, and may still not be the
            most updated. Local health departments continue to serve as the most
            accurate, up-to-date sources. Our team continues to grow new
            collaborations to better identify the metrics needed for this
            rapidly changing situation. Issues are encouraged to be posted at{' '}
            <a
              href="https://github.com/geodacenter/covid/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/geodacenter/covid/issues
            </a>{' '}
            and/or by emailing{' '}
            <a
              href="mkolak@uchicago.edu"
              target="_blank"
              rel="noopener noreferrer"
            >
              mkolak@uchicago.edu
            </a>{' '}
            directly.
          </p>
        </TabPanel>
        <TabPanel display={tabValue === 1}>
          <h2>Data Infrastructure: How the Atlas Manages Data</h2>
          <p>
            The US COVID Atlas uses novel analytics-in-the-browser
            infrastructure combined with simple static data files and serverless
            SQL-based data warehousing. Our data is stored in Google BigQuery
            and accessed via serverless AWS Lambda functions as a proxy for
            direct access. Our API uses a similar structure, enabling users to
            query our data tables with a familiar REST API format. Below is an
            overview of our current infrastructure:
          </p>
          <img
            className="half-width"
            src={`${process.env.PUBLIC_URL}/img/data-infrastructure.jpg`}
            alt="A diagram of how data is managed in the US COVID Atlas website"
          />
        </TabPanel>
        <TabPanel display={tabValue === 2}>Notes on data collection</TabPanel>
      </ContentContainer>
      <Footer />
    </MethodsPage>
  );
}
