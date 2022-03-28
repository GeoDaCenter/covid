import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

// Helper and Utility functions //
// first row: data loading
// second row: data parsing for specific outputs
// third row: data accessing
import { findIn, getDateLists } from "../../utils"; //getVarId

// Actions -- Redux state manipulation following Flux architecture //
// first row: data storage
// second row: data and metadata handling
// third row: map and variable parameters
import { setDates, setNotification, setPanelState } from "../../actions";
import {
  MapSection,
  NavBar,
  VariablePanel,
  Legend,
  TopPanel,
  Preloader,
  DataPanel,
  LineChart,
  Scaleable,
  Draggable,
  InfoBox,
  NotificationBox,
  Popover,
  MapTooltipContent,
  // PrintLayout,
  DataLoader,
  ReportBuilder,
  // Icon,
  IconDock,
  Scatterchart,
} from "../../components";
import { ViewportProvider } from "../../contexts/Viewport";
import { fitBounds } from "@math.gl/web-mercator";
import colors from "../../config/colors";

import useMapData from "../../hooks/useMapData";

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

const defaultViewport = paramsDict.hasOwnProperty("lat")
  ? {
      latitude: +paramsDict.lat,
      longitude: +paramsDict.lon,
      zoom: +paramsDict.z,
      pitch: paramsDict.viz === "3D" ? 30 : 0,
      bearing: paramsDict.viz === "3D" ? -30 : 0,
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

const MapPlaneContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

const RightPaneContainer = styled.div`
  flex: 0 1 auto;
  height: calc(100vh - 50px);
  display: flex;
  position: fixed;
  right: 0;
  top: 50px;
  flex-direction: column;
  overflow: hidden;
  pointer-events: none;
  z-index: 15;
  * {
    pointer-events: auto;
  }
`;

const MapApp = styled.div`
  overflow: hidden;
  max-height: 100vh;
  @media print {
    display: none;
    * {
      display: none;
    }
  }
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

    if (!paramsDict.hasOwnProperty("v")) {
      // do nothing, most of the time
    } else if (paramsDict["v"] === "1") {
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
          "center"
        )
      );
    }

    if (window.innerWidth <= 1024) {
      dispatch(
        setPanelState({
          variables: false,
          info: false,
          tutorial: false,
          lineChart: false,
        })
      );
    }

    dispatch(setDates(dateLists.isoDateList));
  }, []);

  return (
    <>
      <MapApp className="Map-App">
        <NavBar />
        <MapOuterContainer>
          <ViewportProvider defaultViewport={defaultViewport}>
            <MapPageContainer />
          </ViewportProvider>
        </MapOuterContainer>
      </MapApp>
    </>
  );
}

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

const MapContainerInner = () => {
  // These selectors access different pieces of the store. While App mainly
  // dispatches to the store, we need checks to make sure side effects
  // are OK to trigger. Issues arise with missing data, columns, etc.
  const mapParams = useSelector(({ params }) => params.mapParams);
  const dataParams = useSelector(({ params }) => params.dataParams);
  const currentData = useSelector(({ params }) => params.currentData);
  const dataNote = useSelector(({ params }) => params.dataParams.dataNote);
  const fixedScale = useSelector(({ params }) => params.dataParams.fixedScale);
  const variableName = useSelector(
    ({ params }) => params.dataParams.variableName
  );
  const datasets = useSelector(({ params }) => params.datasets);
  const currIdCol = findIn(datasets, "file", currentData).join;
  const [
    currentMapGeography,
    currentMapData,
    currentMapID,
    currentBins,
    currentHeightScale,
    isLoading,
    ,
    ,
    isBackgroundLoading
  ] = useMapData({
    dataParams,
    mapParams,
    currentData,
  });
  
  return <>    
    <Preloader loading={isLoading || isBackgroundLoading} quiet={isBackgroundLoading} message={isBackgroundLoading ? 'Additional data loading' : 'Loading'}/>
    <MapSection
      currentMapGeography={currentMapGeography}
      currentMapData={currentMapData}
      currentMapID={currentMapID}
      currentHeightScale={currentHeightScale}
      isLoading={isLoading}
      mapParams={mapParams}
      currentData={currentData}
      currIdCol={currIdCol}
    />
    <Legend
      variableName={variableName}
      colorScale={mapParams.colorScale}
      bins={currentBins}
      fixedScale={fixedScale}
      resource={mapParams.resource}
      note={dataNote}
    />
  </>
}
const MapPageContainer = () => {
  const panelState = useSelector(({ ui }) => ui.panelState);
  const showTopPanel = useSelector(({params}) => params.dataParams.nType !== "characteristic");
  const [defaultDimensions, setDefaultDimensions] = useState(
    getDefaultDimensions()
  );
  // default width handlers on resize
  useEffect(() => {
    typeof window &&
      window.addEventListener("resize", () =>
        setDefaultDimensions({ ...getDefaultDimensions() })
      );
  }, []);


  return (
    <MapContainer>
      {false && (
        <div id="loadingIcon">
          <img
            src={`${process.env.PUBLIC_URL}/assets/img/animated_cluster.svg`}
            role="presentation"
            alt=""
          />
        </div>
      )}
      <MapPlaneContainer>
        <IconDock />
        <VariablePanel />
        <MapContainerInner />
        <RightPaneContainer>
          {panelState.lineChart && (
            <LineChart defaultDimensions={defaultDimensions} />
          )}
          {panelState.scatterChart && <Scatterchart />}
          <DataPanel />
        </RightPaneContainer>
      </MapPlaneContainer>

      {/* <PrintLayout /> */}
      <ReportBuilder />
      {!!showTopPanel && <TopPanel />}
      <Popover />
      <NotificationBox />
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
