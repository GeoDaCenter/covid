import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

// Helper and Utility functions //
// first row: data loading
// second row: data parsing for specific outputs
// third row: data accessing
import { getDateLists } from '../../utils'; //getVarId

// Actions -- Redux state manipulation following Flux architecture //
// first row: data storage
// second row: data and metadata handling
// third row: map and variable parameters
import { setDates, setNotification, setPanelState } from '../../actions';
import {
  MapSection,
  NavBar,
  VariablePanel,
  Legend,
  TopPanel,
  Preloader,
  DataPanel,
  MainLineChart,
  Scaleable,
  Draggable,
  InfoBox,
  NotificationBox,
  Popover,
  MapTooltipContent,
  PrintLayout,
  DataLoader,
  Icon,
} from '../../components';
import { ViewportProvider } from '../../contexts/Viewport';
import { fitBounds } from '@math.gl/web-mercator';
import colors from '../../config/colors';

import useMapData from '../../hooks/useMapData';

// Main function, App. This function does 2 things:
// 1: App manages the majority of the side effects when the state changes.
//    This takes the form of React's UseEffect hook, which listens
//    for changes in the state and then performs the functions in the hook.
//    App listens for different state changes and then calculates the relevant
//    side effects (such as binning calculations and GeoDa functions, column parsing)
//    and then dispatches new data to the store.
// 2: App assembles all of the components together and sends Props down
//    (as of 12/1 only Preloader uses props and is a higher order component)

const dateLists = getDateLists();
// US bounds

let paramsDict = {};
for (const [key, value] of new URLSearchParams(window.location.search)) {
  paramsDict[key] = value;
}

const defaultViewport = paramsDict.hasOwnProperty('lat')
  ? {
      latitude: +paramsDict.lat,
      longitude: +paramsDict.lon,
      zoom: +paramsDict.z,
      pitch: paramsDict.viz === '3D' ? 30 : 0,
      bearing: paramsDict.viz === '3D' ? -30 : 0,
    }
  : fitBounds({
      width: window.innerWidth,
      height: window.innerHeight,
      bounds: [
        [-130.14, 53.96],
        [-67.12, 19],
      ],
    });

const MapContainer = styled.div``;

const MapOuterContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100vh - 50px);
  overflow: hidden;
`;

export default function Map() {
  const dispatch = useDispatch();
  // // Dispatch helper functions for side effects and data handling
  // Get centroid data for cartogram
  // const getCentroids = (geojson, geoda) =>  dispatch(setCentroids(geoda.GetCentroids(geojson), geojson))

  // After runtime is initialized, this loads in geoda to the context
  useEffect(() => {
    let paramsDict = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams) {
      paramsDict[key] = value;
    }

    if (!paramsDict.hasOwnProperty('v')) {
      // do nothing, most of the time
    } else if (paramsDict['v'] === '1') {
      dispatch(
        setNotification(
          `
          <h2>Welcome to the Atlas v2!</h2>
          <p>
          The share link you have entered is for an earlier release of the US Covid Atlas. 
          Explore the new version here, or continue using your current share link by click below.
          <a href="./vintage/map.html${window.location.search}" target="_blank" rel="noopener noreferrer" style="color:${colors.yellow}; text-align:center;">
            <h3 style="text-align:center">
              US Covid Atlas v1
            </h3>  
          </a>
          </p>
        `,
          'center',
        ),
      );
    }

    if (window.innerWidth <= 1024) {
      dispatch(
        setPanelState({
          variables: false,
          info: false,
          tutorial: false,
          lineChart: false,
        }),
      );
    }

    dispatch(setDates(dateLists.isoDateList));
  }, []);

  return (
    <>
      <div className="Map-App" style={{ overflow: 'hidden', maxHeight: '100vh' }}>
        <NavBar />
        <MapOuterContainer>
          <ViewportProvider defaultViewport={defaultViewport}>
            <MapPageContainer />
          </ViewportProvider>
        </MapOuterContainer>
      </div>
    </>
  );
}

const DockContainerOuter = styled.div``

const DockContainer = styled.div`
  height: calc(100vh - 50px);
  background: lightgray;
  width: 50px;
  position: absolute;
  left: 0;
  top: 0;
  background: ${colors.gray};
  border-right:1px solid black;
  display: flex;
  flex-direction: column;
  z-index: 5;
  button {
    background:none;
    border:none;
    width:100%;
    height:50px;
    padding: 14px 14px 14px 10px;
    cursor:pointer;
    border-left:4px solid rgba(0,0,0,0);
    transition: 125ms all;
    svg {
      fill:white;
      stroke:white;
      stroke-width:0;
      transition:250ms all;
    }
    &.hovered {
      svg {
        fill: ${colors.yellow};
        stroke: ${colors.yellow};
      }
    }
    &.active {
      border-color:${colors.yellow};
    }
    span.mobileText {
      display:none;
      color:white;
      font-size:.75rem;
    }
  }
  #settings-button {
    stroke-width:2px;
    circle.cls-1 {
      fill:none;
    }
  }
  @media (max-width: 768px) {
    width:100%;
    top:0;
    height:80px;
    flex-direction:row;
    overflow-x:scroll;
    overflow-y:hidden;
    button {
      height:50px;
      width:auto;
      text-align:center;
      padding:10px 20px 0 20px;
      svg {
        width:20px;
      }
      span.mobileText {
        display:block;
      }
    }
  }
`;


const DockLabels = styled.div`
  position: absolute;
  left:50px;
  color:red;
  z-index:50;
  opacity:0;
  pointer-events:none;
  transition-delay: 0s;
  transition-duration:125ms;
  transition-property: opacity;
  background: ${colors.darkgray}dd;
  display:flex;
  flex-direction:column;
  button {
    padding: 10px;
    color:white;
    background:none;
    height:50px;
    border:none;
    text-align:left;
    transition:250ms all;
    cursor:pointer;
    font-family:'Lato', sans-serif;
    &.hovered {
      color:${colors.yellow};
    }
  }
  &.active {
    opacity:1;
    pointer-events:initial;
    transition-delay: .3s;
    transition-duration:250ms;
  }
  @media (max-width: 768px) {
    display:none;
  }

`

const IconDock = () => {
  const dispatch = useDispatch();
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const panelState = useSelector(state => state.panelState);
  const buttons = [
    {
      symbol: 'settings',
      id: 'settings-button',
      ariaLabel: 'Data & Variables',
      activeState: panelState.variables,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'variables' }),
    },
    {
      symbol: 'summary',
      id: 'summary-button',
      ariaLabel: 'Data Details',
      activeState: panelState.info,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'info' }),
    },
    {
      symbol: 'lineChart',
      id: 'lineChart-button',
      ariaLabel: 'Line Chart',
      activeState: panelState.lineChart,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'lineChart' }),
    },
    {
      symbol: 'scatterPlot',
      id: 'scatterPlot-button',
      ariaLabel: 'Scatterplot Chart',
      activeState: panelState.scatterPlot,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'scatterPlot' }),
    },
    {
      symbol:'addData',
      id: 'add-data-button',
      ariaLabel: 'Add Custom Data',
      activeState: panelState.dataLoader,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'dataLoader' }),
    },
    {
      symbol: 'report',
      id: 'report-button',
      ariaLabel: 'Report Builder',
      activeState: panelState.builder,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'builder' }),
    },
    {
      symbol: 'sliders',
      id: 'user-preferences-button',
      ariaLabel: 'User Preferences',
      activeState: panelState.preferences,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'preferences' }),
    },
    {
      symbol: 'info',
      id: 'info-button',
      ariaLabel: 'Tutorial and Info',
      activeState: panelState.tutorial,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'tutorial' }),
    },
  ];
  return (
    <DockContainerOuter>
      <DockContainer>
        {buttons.map(({ symbol, id, ariaLabel, onClick, activeState }) => (
          <button
            id={id}
            ariaLabel={ariaLabel}
            onClick={onClick}
            className={`${hoveredIcon === id && 'hovered '}${activeState && ' active'}`}
            onMouseEnter={() => setHoveredIcon(id)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <Icon symbol={symbol} />
            <span className="mobileText">{ariaLabel}</span>
          </button>
        ))}
      </DockContainer>
      <DockLabels className={hoveredIcon ? 'active' : ''}>
        {buttons.map(({ symbol, id, ariaLabel, onClick }) => (
            <button
              id={id}
              ariaLabel={ariaLabel}
              onClick={onClick}
              className={hoveredIcon === id ? 'hovered' : ''}
              onMouseEnter={() => setHoveredIcon(id)}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              {ariaLabel}
            </button>
          ))}
      </DockLabels>
    </DockContainerOuter>
  );
};
const MapPageContainer = () => {
  // These selectors access different pieces of the store. While App mainly
  // dispatches to the store, we need checks to make sure side effects
  // are OK to trigger. Issues arise with missing data, columns, etc.
  const mapParams = useSelector((state) => state.mapParams);
  const dataNote = useSelector((state) => state.dataParams.dataNote);
  const fixedScale = useSelector((state) => state.dataParams.fixedScale);
  const variableName = useSelector((state) => state.dataParams.variableName);
  const panelState = useSelector((state) => state.panelState);

  // geoda is the WebGeoda proxy class. Generally, having a non-serializable
  // data in the state is poor for performance, but the App component state only
  // contains geoda.
  const getDefaultDimensions = () => ({
    defaultX:
      window.innerWidth <= 1024
        ? window.innerWidth * 0.1
        : window.innerWidth <= 1400
        ? window.innerWidth - 400
        : window.innerWidth - 500,
    defaultXLong:
      window.innerWidth <= 1024
        ? window.innerWidth * 0.1
        : window.innerWidth <= 1400
        ? window.innerWidth - 450
        : window.innerWidth - 550,
    defaultY: window.innerWidth <= 1024 ? window.innerHeight * 0.25 : 75,
    defaultWidth: window.innerWidth <= 1024 ? window.innerWidth * 0.8 : 300,
    defaultWidthLong:
      window.innerWidth <= 1024
        ? window.innerWidth * 0.8
        : window.innerWidth <= 1400
        ? 400
        : 500,
    defaultHeight: window.innerWidth <= 1024 ? window.innerHeight * 0.4 : 300,
    defaultHeightManual:
      window.innerWidth <= 1024
        ? window.innerHeight * 0.7
        : window.innerHeight * 0.5,
    defaultWidthManual:
      window.innerWidth <= 1024
        ? window.innerWidth * 0.5
        : window.innerWidth * 0.35,
    defaultXManual:
      window.innerWidth <= 1024
        ? window.innerWidth * 0.25
        : window.innerWidth * 0.25,
    defaultYManual:
      window.innerWidth <= 1024
        ? window.innerHeight * 0.15
        : window.innerHeight * 0.325,
    minHeight: window.innerWidth <= 1024 ? window.innerHeight * 0.5 : 200,
    minWidth: window.innerWidth <= 1024 ? window.innerWidth * 0.5 : 200,
  });
  const [defaultDimensions, setDefaultDimensions] = useState({
    ...getDefaultDimensions(),
  });

  // default width handlers on resize
  useEffect(() => {
    typeof window &&
      window.addEventListener('resize', () =>
        setDefaultDimensions({ ...getDefaultDimensions() }),
      );
  }, []);

  const [
    currentMapGeography,
    currentMapData,
    currentMapID,
    currentBins,
    currentHeightScale,
    isLoading,
  ] = useMapData({});
  
  return (
    <MapContainer>
      {isLoading && (
        <div id="loadingIcon">
          <img
            src={`${process.env.PUBLIC_URL}/assets/img/animated_cluster.svg`}
            role="presentation"
            alt=""
          />
        </div>
      )}
      <IconDock />
      <MapSection
        currentMapGeography={currentMapGeography}
        currentMapData={currentMapData}
        currentMapID={currentMapID}
        currentHeightScale={currentHeightScale}
        isLoading={isLoading}
      />
      <PrintLayout />
      <TopPanel />
      <Legend
        variableName={variableName}
        colorScale={mapParams.colorScale}
        bins={currentBins}
        fixedScale={fixedScale}
        resource={mapParams.resource}
        note={dataNote}
      />
      <VariablePanel />
      <DataPanel />
      <Popover />
      <NotificationBox />
      {panelState.lineChart && (
        <Draggable
          z={9}
          defaultX={defaultDimensions.defaultXLong}
          defaultY={defaultDimensions.defaultY}
          title="lineChart"
          content={
            <Scaleable
              content={<MainLineChart />}
              title="lineChart"
              content={
                <Scaleable
                  content={<MainLineChart />}
                  title="lineChart"
                  defaultWidth={defaultDimensions.defaultWidthLong}
                  defaultHeight={defaultDimensions.defaultHeight}
                  minHeight={defaultDimensions.minHeight}
                  minWidth={defaultDimensions.minWidth}
                />
              }
            />
          }
        />
      )}
      {panelState.tutorial && (
        <Draggable
          z={10}
          defaultX={defaultDimensions.defaultXManual}
          defaultY={defaultDimensions.defaultYManual}
          title="tutorial"
          content={
            <Scaleable
              content={<InfoBox />}
              title="tutorial"
              defaultWidth={defaultDimensions.defaultWidthManual}
              defaultHeight={defaultDimensions.defaultHeightManual}
              minHeight={defaultDimensions.minHeight}
              minWidth={defaultDimensions.minWidth}
            />
          }
        />
      )}
      <MapTooltipContent />
      {panelState.dataLoader && <DataLoader />}
    </MapContainer>
  );
};
