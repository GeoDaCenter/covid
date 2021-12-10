import React from 'react';
import styled from 'styled-components';
import { ContentContainer, Gutter } from '../../styled_components';
import { NavBar, Footer } from '../';

const DataLoadingPage = styled.div`
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

  p.caption {
    text-align: center;
    opacity: 0.7;
    margin-top: 0;
  }
`;

const DataLoading = () => {
  return (
    <DataLoadingPage>
      <NavBar light />
      <ContentContainer>
        <h1>Bring Your Own Data</h1>
        <hr />
        <h3>Supported Data Formats and Uses</h3>
        <br />
        <p>
          The Atlas enables users to load in their own geospatial data using the{' '}
          <a
            href="https://developer.here.com/blog/an-introduction-to-geojson"
            target="_blank"
            rel="noopener noreferrer"
          >
            GeoJSON
          </a>{' '}
          data format. We specifically support polygon geometries and numerical
          data. By loading data into the Atlas, user can perform simple
          geospatial visualization with the jsgeoda natural breaks binning and
          box map binning schemas. Additionally, users can perform hotspot
          analysis on their data.
        </p>
        <Gutter h={10} />
        <p>
          If you have tabular data (CSV, Excel) and are looking to get started
          with how to visualize your data, visit the{' '}
          <a
            href="https://geojay.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            GeoJay
          </a>{' '}
          alpha website for assistance in finding the geometries for your data.
        </p>
        <Gutter h={10} />
        <h3>Data Privacy</h3>
        <br />
        <p>
          The US Covid Atlas works through in-browser analysis, and loading data
          into the Atlas does not transmit your data to any remote server. The
          Atlas loads your data directly in the browser, and we do not store any
          of your data. For sensitive data, after loading the <b>Map</b> page
          completely, you can safely disconnect from the internet and then load
          your data.
        </p>
        <Gutter h={10} />
        <h3>
          <a href="/map">Return to the map</a>
        </h3>
      </ContentContainer>
      <Footer />
    </DataLoadingPage>
  );
};

export default DataLoading;
