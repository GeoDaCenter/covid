import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3-dsv';

import Grid from '@mui/material/Grid';
import DeckGL from '@deck.gl/react';
import { MapView } from '@deck.gl/core';
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';
import { fitBounds } from '@math.gl/web-mercator';
import MapboxGLMap from 'react-map-gl';
import MAP_STYLE from '../../config/style.json';
import { MAPBOX_ACCESS_TOKEN } from '../../config';

import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer } from '../';

const view = new MapView({ repeat: true });
const MichiganPage = styled.div`
  background: white;
  min-height: 100vh;
  text-align: center;
  img.errorImg {
    padding: 60px;
  }

  text-align: left;
`;

const DeckContainer = styled.div`
  width: 100%;
  height: 800px;
  max-height: 80vh;
  position: relative;
  border: 1px solid black;
`;

const colors = [
  [255, 255, 212],
  [254, 217, 142],
  [254, 153, 41],
  [204, 76, 2],
];

const maskStatus = [
  {
    name: 'Schools in Michigan - mask policies fall 2021 Decision not announced',
    cleanName: 'To Be Announced',
    color: [189, 189, 189],
  },
  {
    name: 'Schools in Michigan - mask policies fall 2021 Masks not encouraged or just "permitted"',
    cleanName: 'Not Encouraged or just "permitted"',
    color: [0, 0, 0],
  },
  {
    name: 'Schools in Michigan - mask policies fall 2021 Masks recommended/not required',
    cleanName: 'Recommend, not required',
    color: [194, 24, 91],
  },
  {
    name: 'Schools in Michigan - mask policies fall 2021 Partial requirement - higher education (see notes on pin)',
    cleanName: 'Partial Requirement - See Note (Higher Education)',
    color: [255, 234, 0],
  },
  {
    name: 'Schools in Michigan - mask policies fall 2021 Partial requirement K-12 (see notes on each pin)',
    cleanName: 'Partial Requirement - See Note (K-12)',
    color: [251, 192, 45],
  },
  {
    name: 'Schools in Michigan - mask policies fall 2021 Masks required - higher education',
    cleanName: 'Required (Higher Education)',
    color: [15, 157, 88],
  },
  {
    name: 'Schools in Michigan - mask policies fall 2021 Masks required - public, private & charter K-12 schools',
    cleanName: 'Required (K-12)',
    color: [9, 113, 56],
  },
];
const Legend = styled.ul`
  list-style: none;
`;

const LegendLi = styled.li`
  margin-left: -1em;
  padding-left: 0;
  svg {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    transform: translateY(5px);
    display: inline;
    rect {
      stroke: black;
    }
    circle {
      stroke: black;
    }
  }
  p {
    display: inline;
  }
`;

const ActiveSchoolSection = styled.span``;
const getColor = (val, bins, colors) => {
  for (let i = 0; i < bins.length; i++) {
    if (val < bins[i]) return colors[i];
  }
  return colors[colors.length - 1];
};

export default function MichiganMasks() {
  const [geoData, setGeoData] = useState({});
  const [maskData, setMaskData] = useState({});
  const [bins, setBins] = useState([]);
  const [date, setDate] = useState('');
  const [activeSchool, setActiveSchool] = useState([]);
  const deckRef = useRef();
  const mapRef = useRef();

  const getData = async () => {
    const [geo, { data, date }, masks] = await Promise.all([
      fetch(`${process.env.PUBLIC_URL}/geojson/county_nyt.geojson`).then((r) =>
        r.json(),
      ),
      fetch(`${process.env.PUBLIC_URL}/.netlify/functions/michiganQuery`).then(
        (r) => r.json(),
      ),
      fetch(`${process.env.PUBLIC_URL}/csv/michigan-schools.csv`)
        .then((r) => r.text())
        .then((text) => d3.csvParse(text, d3.autoType)),
    ]);
    let weeklyAverages = [];
    let filteredFeatures = [];
    for (let i = 0; i < geo.features.length; i++) {
      if (
        geo.features[i].properties.GEOID >= 26000 &&
        geo.features[i].properties.GEOID < 27000
      ) {
        let weeklyAverage =
          data.find((f) => f.fips === geo.features[i].properties.GEOID)
            ?.weeklyAverage / 7;
        weeklyAverages.push(
          (weeklyAverage / geo.features[i].properties.population) * 1e5,
        );
        filteredFeatures.push({
          ...geo.features[i],
          properties: {
            ...geo.features[i].properties,
            averagePer100k:
              (weeklyAverage / geo.features[i].properties.population) * 1e5,
            weeklyAverage,
          },
        });
      }
    }
    let bins = [];
    weeklyAverages = weeklyAverages.sort((a, b) => a - b);
    for (let i = 1; i < 4; i++) {
      bins.push(weeklyAverages[Math.floor((weeklyAverages.length / 4) * i)]);
    }
    geo.features = filteredFeatures;
    return {
      geo,
      masks,
      bins,
      date,
    };
  };
  useEffect(() => {
    try {
      getData().then(({ geo, masks, bins, date }) => {
        setGeoData(geo);
        setMaskData(masks);
        setBins(bins);
        setDate(date);
      });
    } catch (e) {
      console.log(e);
    }
  }, []);

  const michiganLayers = [
    new GeoJsonLayer({
      id: 'choropleth',
      data: geoData,
      getFillColor: (f) => getColor(f.properties.averagePer100k, bins, colors),
      pickable: true,
      stroked: false,
      filled: true,
      opacity: 0.5,
      updateTriggers: {
        getFillColor: [bins.length],
      },
    }),
    new ScatterplotLayer({
      id: 'masks uderlay',
      data: maskData,
      getPosition: (d) => [d.x, d.y],
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 250,
      radiusMinPixels: 5,
      radiusMaxPixels: 75,
      lineWidthMinPixels: 2,
      autoHighlight: true,
      highlightColor: [255, 0, 0],
      getRadius: (d) => 5,
      onClick: (f) => f.object && setActiveSchool(f.object),
      getFillColor: (d) => maskStatus.find((f) => f.name === d.layer)?.color,
      getLineColor: (d) => [0, 0, 0],
      updateTriggers: {
        getRadius: activeSchool.Name,
      },
    }),
    new ScatterplotLayer({
      id: 'masks',
      data: maskData,
      getPosition: (d) => [d.x, d.y],
      pickable: false,
      opacity: 0.8,
      stroked: false,
      filled: true,
      radiusScale: 25,
      radiusMinPixels: 0,
      radiusMaxPixels: 100,
      getRadius: (d) => 5,
      getFillColor: (d) => [255, 255, 255],
      updateTriggers: {
        getRadius: activeSchool.Name,
      },
    }),
  ];
  const fitMichigan = {
    ...fitBounds({
      width: window.innerWidth < 1140 ? window.innerWidth : 1140,
      height: 800 > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : 800,
      bounds: [
        [-89.274902, 41.14557],
        [-81.485596, 46.75868],
      ],
    }),
    bearing: 0,
    pitch: 0,
  };

  return (
    <MichiganPage>
      <StaticNavbar />
      <ContentContainer>
        <h1>What are mask rules in Michigan schools?</h1>
        <h2>
          A Community Driven Collaboration with Michigan Health Lab{' '}
          <a
            href="https://twitter.com/karag"
            target="_blank"
            rel="noopener noreferrer"
          >
            @karag
          </a>
        </h2>
        <p>
          <i>
            Click dots for more details. Scroll of pinch to zoom, touch or drag
            to pan.
          </i>
        </p>
        <Gutter h={20} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={9}>
            <DeckContainer>
              {bins.length && maskData.length && geoData.features?.length ? (
                <DeckGL
                  layers={michiganLayers}
                  ref={deckRef}
                  views={view}
                  initialViewState={fitMichigan}
                  controller={true}
                  pickingRadius={20}
                >
                  <MapboxGLMap
                    reuseMaps
                    ref={mapRef}
                    mapStyle={MAP_STYLE}
                    preventStyleDiffing={true}
                    mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                  ></MapboxGLMap>
                </DeckGL>
              ) : (
                'Map loading...'
              )}
            </DeckContainer>
          </Grid>
          <Grid item xs={12} md={3}>
            {Object.keys(activeSchool).length ? (
              <ActiveSchoolSection>
                <h2>Selected School</h2>
                <h3>{activeSchool.Name}</h3>
                <p>{activeSchool.layer}</p>
                <p>{activeSchool.description}</p>
              </ActiveSchoolSection>
            ) : null}
          </Grid>
          <Grid item xs={12} md={4}>
            <h3>Background map</h3>
            <p>7-day average of new cases per 100k people</p>
            <p>Data via NYT as of {date?.slice(1).replace(/_/g, '-')}</p>
            <Legend>
              <LegendLi>
                <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                  <rect
                    width="10"
                    height="10"
                    fill={`rgb(${colors[0].join(',')})`}
                  />
                </svg>
                {'<'}
                {Math.round(bins[0] * 10) / 10}
              </LegendLi>
              {bins.map((bin, i) =>
                i < bins.length - 1 ? (
                  <LegendLi>
                    <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                      <rect
                        width="10"
                        height="10"
                        fill={`rgb(${colors[i + 1].join(',')})`}
                      />
                    </svg>
                    {Math.round(bins[i] * 10) / 10}-
                    {Math.round(bins[i + 1] * 10) / 10}
                  </LegendLi>
                ) : null,
              )}
              <LegendLi>
                <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                  <rect
                    width="10"
                    height="10"
                    fill={`rgb(${colors[colors.length - 1].join(',')})`}
                  />
                </svg>
                {'>'}
                {Math.round(bins[bins.length - 1] * 10) / 10}
              </LegendLi>
            </Legend>
          </Grid>
          <Grid item xs={12} md={8}>
            <h3>School Mask Status</h3>
            <Legend>
              {maskStatus.map((entry, i) => (
                <LegendLi>
                  <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                    <circle
                      cx="5"
                      cy="5"
                      r="4"
                      fill={`rgb(${entry.color.join(',')})`}
                    />
                  </svg>
                  <p>{entry.cleanName}</p>
                </LegendLi>
              ))}
            </Legend>
          </Grid>
        </Grid>
        <h6>Data Sources</h6>
        <p>
          COVID-19 case data via{' '}
          <a
            href="https://github.com/nytimes/covid-19-data"
            target="_blank"
            rel="noopener noreferrer"
          >
            New York Times
          </a>
        </p>
        <p>
          School District Policy Data via{' '}
          <a
            href="https://twitter.com/karag"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kara Gavin
          </a>{' '}
          - see also original{' '}
          <a
            href="https://www.google.com/maps/d/u/0/viewer?mid=1acVTJdJqc8hvWscbB69AbWeCSjzdfENW&ll=42.54227340000005%2C-83.48006870000002&z=8"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Map
          </a>
        </p>
      </ContentContainer>
      <Footer />
    </MichiganPage>
  );
}
