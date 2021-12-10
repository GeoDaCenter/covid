import React from 'react';
import styled from 'styled-components';
import { ContentContainer } from '../../styled_components';
import { NavBar, Footer } from '..';

const PrivacyPage = styled.div`
  background: white;
  img#workflow,
  img.hotspot {
    width: 100%;
    max-width: 800px;
    margin: 20px auto;
    display: block;
  }
`;

const PrivacyPolicy = () => {
  return (
    <PrivacyPage>
      <NavBar light />
      <ContentContainer>
        <h1>Privacy Policy</h1>
        <p>
          Tracking and analytics helps us to sustain funding availability,
          undertstand what data are important to our users, and continue
          improvements to the US Covid Atlas. We do not sell user data, actions,
          or insights.
        </p>
        <h2>What does the US Covid Atlas track?</h2>
        <p>
          The US Covid Atlas tracks:
          <ul>
            <li>The pages you visit</li>
            <li>The state or country you access the Atlas from</li>
            <li>The datasets, variables, and resources you query</li>
            <li>The geographies (state, counties, etc.) that you explore</li>
            <li>When you visit the Atlas, and how long you spend mapping</li>
            <li>Performance statistics, like how long pages take to load</li>
            <li>All standard Google Analytics metrics</li>
          </ul>
        </p>
        <h2>What necessary cookies does the US Covid Atlas use?</h2>
        <p>
          The US Covid Atlas uses necessary cookies to:
          <ul>
            <li>Help save data by caching datasets</li>
            <li>Manage multi-threaded WebApp processes</li>
          </ul>
        </p>
        <h2>
          What external services may also be monitoring my activity on the
          Atlas?
        </h2>
        <p>
          The following external services may use their own privacy policies:
          <ul>
            <li>Mapbox (Map Tiles)</li>
            <li>Google Analytics and Google BigQuery</li>
            <li>Netlify</li>
          </ul>
        </p>
      </ContentContainer>
      <Footer />
    </PrivacyPage>
  );
};

export default PrivacyPolicy;
