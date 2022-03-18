import React, { useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import useMapData from "../../../../hooks/useMapData";
import useGetReportViewport from "../../../../hooks/useGetReportViewport";
import {
  ControlPopover,
  LegendInner,
  MapSection,
} from "../../../../components";
import {
  PanelItemContainer,
  GrabTarget,
  DeleteBlock,
  // widthOptions,
  // heightOptions,
} from "./PageComponentsLayout";
import { findIn } from "../../../../utils";
import colors from "../../../../config/colors";
import countyNames from "../../../../meta/countyNames";
import { colorScales } from "../../../../config/scales";

const defaultMapParams = {
  mapType: "natural_breaks",
  bins: {
    bins: [],
    breaks: [],
  },
  binMode: "",
  fixedScale: null,
  nBins: 8,
  vizType: "2D",
  activeGeoid: "",
  overlay: "",
  resource: "",
  dotDensityParams: {
    raceCodes: {
      1: true,
      2: true,
      3: true,
      4: true,
      5: false,
      6: false,
      7: false,
      8: true,
    },
    colorCOVID: false,
    backgroundTransparency: 0.01,
  },
};

const MapTitle = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 500;
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  padding: 0.25rem 0.5rem;
  font-size:1rem;
`;
const MapAttribution = styled(MapTitle)`
  left:initial;
  top: initial;
  right:0;
  bottom:0;
  width:auto;
  font-size:0.65rem;
`
const NoInteraction = ({ children }) => (
  <div style={{ pointerEvents: "none !important", width: "100%", height: "100%" }}>
    {children}
  </div>
);

const getColorScale = (mapType, dataParams) => {
  switch (mapType) {
    case "natural_breaks":
      return colorScales[dataParams.colorScale] || colorScales.natural_breaks;
    case "hinge15_breaks":
      return colorScales.hinge15_breaks;
    case "lisa":
      return colorScales.lisa;
    default:
      return [];
  }
};

function ReportMap({
  geoid = 17031,
  pageIdx = 0,
  itemId = '',
  // variable = "Percent Fully Vaccinated",
  // mapType = "natural_breaks",
  // scale = "county",
  handleChange,
  handleRemove,
  // width,
  // height,
  date,
  dateIndex,
  reportName='',
  variable="Percent Fully Vaccinated",
  mapType="natural_breaks",
  scale="county",
}) {
  const dates = useSelector(({ params }) => params.dates);
  const variableTree = useSelector(({ params }) => params.variableTree);
  const variables = useSelector(({ params }) => params.variables);

  const variableList = Object.keys(variableTree)
    .filter((f) => !f.includes("HEADER"))
    .map((f) => ({ label: f, value: f }));
    
  const dataParams = {
    ...(findIn(variables, "variableName", variable) || {}),
    nIndex: dateIndex,
  };

  const mapParams = {
    ...defaultMapParams,
    mapType,
    binMode: "dynamic",
    colorScale: getColorScale(mapType, dataParams),
  };

  const mapContainerRef = useRef(null);
  const { width: mapWidth, height: mapHeight } =
    mapContainerRef?.current?.getBoundingClientRect() || {};

  const currentData = "county_usfacts.geojson";
  const mapIdCol = "GEOID";

  const [
    currentMapGeography,
    currentMapData,
    currentMapID,
    currentBins,
    currentHeightScale,
    isLoading,
    geojsonData,
    currIndex,
  ] = useMapData({
    dataParams,
    mapParams,
    currentData,
  });
  const [
    countyViewport,
    neighborsViewport,
    secondOrderNeighborsViewport,
    stateViewport,
    nationalViewport
    // neighbors,
    // secondOrderNeighbors,
    // stateNeighbors,
  ] = useGetReportViewport({
    geoid,
    currentData,
    geojsonData,
    mapIdCol,
    mapWidth,
    mapHeight,
  });

  const currViewport = {
    county: countyViewport,
    neighbors: neighborsViewport,
    region: secondOrderNeighborsViewport,
    state: stateViewport,
    national: nationalViewport
  }[scale];

  const mapInner = useMemo(
    () => (
      <NoInteraction>
        <MapSection
          currentMapGeography={currentMapGeography}
          currentMapData={currentMapData}
          currentMapID={currentMapID}
          currentHeightScale={currentHeightScale}
          isLoading={isLoading}
          mapParams={mapParams}
          currentData={currentData}
          currIdCol={mapIdCol}
          theme={"light"}
          manualViewport={currViewport}
          hoverGeoid={geoid}
          highlightGeoids={[geoid]}
        />
      </NoInteraction>
    ),
    [JSON.stringify(neighborsViewport), currentMapID]
  );
  return (
    <PanelItemContainer
      ref={mapContainerRef}
    >
      <MapTitle>
        <h4>{dataParams.variableName}</h4>
        <LegendInner
          colorScale={mapParams.colorScale}
          currentBins={currentBins?.bins || []}
          fixedScale={dataParams.fixedScale}
        />
      </MapTitle>
      <MapAttribution>
        Source: USA Facts via US Covid Atlas :: Date: {dates[currIndex]}
      </MapAttribution>
      {mapInner}
      <ControlPopover
        top="0"
        left="0"
        className="hover-buttons"
        iconColor={colors.strongOrange}
        controlElements={[
          {
            type: "header",
            content: "Controls for Text Report Block",
          },
          {
            type: "helperText",
            content: "Select the data to display on the chart.",
          },
          {
            type: "comboBox",
            content: {
              label: "Search County",
              items: countyNames,
            },
            action: ({ value }) =>
              handleChange({ geoid: value }),
            value: geoid,
          },
          {
            type: "select",
            content: {
              label: "Change Variable",
              items: variableList,
            },
            action: (e) =>
              handleChange({ variable: e.target.value }),
          },
          {
            type: "select",
            content: {
              label: "Change Map Type",
              items: [{
                label: "Natural Breaks",
                value: "natural_breaks",
              },{
                label: "Box Map",
                value: "hinge15_breaks",
              },{
                label: "Hotspot",
                value: "lisa",
              }],
            },
            action: (e) =>
              handleChange({ mapType: e.target.value }),
          },
          {
            type: "select",
            content: {
              label: "Change View Scale",
              items: [
                {
                  value: "county",
                  label: "County",
                },
                {
                  value: "neighbors",
                  label: "Neighboring Counties",
                },
                {
                  value: "region",
                  label: "Region",
                },
                {
                  value: "state",
                  label: "State",
                },
                {
                  value: "national",
                  label: "National (Lower 48)",
                },
              ],
            },
            action: (e) =>
              handleChange({ scale: e.target.value }),
          }
        ]}
      />
      <GrabTarget iconColor={colors.strongOrange} className="hover-buttons" />

      <DeleteBlock
        iconColor={colors.strongOrange}
        className="hover-buttons"
        onClick={() => handleRemove(pageIdx, itemId)}
      />
    </PanelItemContainer>
  );
}

export default React.memo(ReportMap);
