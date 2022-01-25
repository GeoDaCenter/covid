import React, { useReducer, useRef, useMemo } from "react";
import useMapData from "../../../../hooks/useMapData";
import useGetReportViewport from "../../../../hooks/useGetReportViewport";
import { ControlPopover, MapSection } from "../../../../components";
import {
  PanelItemContainer,
  GrabTarget,
  DeleteBlock,
  widthOptions,
  heightOptions,
} from "./PageComponentsLayout";
import colors from "../../../../config/colors";
import countyNames from "../../../../meta/countyNames";
import INITIAL_STATE from "../../../../constants/paramsInitialState";
import reducer from "../../../../reducers/paramsReducer";

const NoInteraction = ({children}) => <div style={{pointerEvents: "none", width: '100%', height:'100%'}}>{children}</div>;
function ReportMap({
  geoid = 17031,
  pageIdx = 0,
  contentIdx = 0,
  handleChange,
  handleRemove,
  width,
  height,
}) {
  const [{ dataParams, mapParams }, dispatch] = useReducer(
    reducer,
    INITIAL_STATE
  );
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
  ] = useMapData({
    dataParams,
    mapParams,
    currentData,
  });

  const [
    neighborsViewport,
    secondOrderNeighborsViewport,
    stateViewport,
    neighbors,
    secondOrderNeighbors,
    stateNeighbors,
  ] = useGetReportViewport({
    geoid,
    currentData,
    geojsonData,
    mapIdCol,
    mapWidth,
    mapHeight,
  });

  console.log(neighborsViewport)
  const mapInner = useMemo(() => 
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
    manualViewport={neighborsViewport}
    hoverGeoid={geoid}
    highlightGeoids={[geoid]}
  /></NoInteraction>, [JSON.stringify(neighborsViewport), currentMapID])
  return (
    <PanelItemContainer
      className={`w${width || 2} h${height || 3}`}
      ref={mapContainerRef}
    >
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
            type: "select",
            content: {
              label: "Change County",
              items: countyNames,
            },
            action: (e) =>
              handleChange(pageIdx, contentIdx, { geoid: e.target.value }),
            value: geoid,
          },
          {
            ...widthOptions,
            action: (e) =>
              handleChange(pageIdx, contentIdx, { width: e.target.value }),
            value: width,
          },
          {
            ...heightOptions,
            action: (e) =>
              handleChange(pageIdx, contentIdx, { height: e.target.value }),
            value: height,
          },
        ]}
      />
      <GrabTarget iconColor={colors.strongOrange} className="hover-buttons" />

      <DeleteBlock
        iconColor={colors.strongOrange}
        className="hover-buttons"
        onClick={() => handleRemove(pageIdx, contentIdx)}
      />
    </PanelItemContainer>
  );
}

export default React.memo(ReportMap);
