// general imports, state
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import * as Pbf from "pbf";

// deck GL and helper function import
import DeckGL from "@deck.gl/react";
import { MapView, FlyToInterpolator } from "@deck.gl/core";
import {
  ScatterplotLayer,
  IconLayer,
  TextLayer,
  GeoJsonLayer,
} from "@deck.gl/layers";
import { DataFilterExtension } from "@deck.gl/extensions";
import { fitBounds } from "@math.gl/web-mercator";
import MapboxGLMap from "react-map-gl";
import { MapboxLayer } from "@deck.gl/mapbox";

// component, action, util, and config import
import { Geocoder, MapButtons } from "../../components";
import {
  setMapLoaded,
  openContextMenu,
  setNotification,
  setTooltipInfo,
  setDotDensityData,
  updateSelectionKeys,
  mapDidPan,
} from "../../actions";
import {
  // findIn,
  getCSV,
  getCartogramCenter,
  parseMapboxLayers,
  shallowCompare,
} from "../../utils";
import { MAPBOX_ACCESS_TOKEN } from "../../config";
import colors from "../../config/colors";
import MAP_STYLE_DARK from "../../config/style.json";
import MAP_STYLE_LIGHT from "../../config/style_light.json";
import { useViewport, useSetViewport } from "../../contexts/Viewport";
// import useFindViewport from "../../hooks/useFindViewport";
// PBF schemas
import * as Schemas from "../../schemas";

const MAP_STYLES = {
  light: MAP_STYLE_LIGHT,
  dark: MAP_STYLE_DARK,
};

const view = new MapView({ repeat: true });

// hospital and clinic icon mapping
const ICON_MAPPING = {
  hospital: { x: 0, y: 0, width: 128, height: 128 },
  clinic: { x: 128, y: 0, width: 128, height: 128 },
  invitedVaccineSite: { x: 0, y: 128, width: 128, height: 128 },
  participatingVaccineSite: { x: 128, y: 128, width: 128, height: 128 },
  megaSite: { x: 256, y: 128, width: 128, height: 128 },
};

// component styling
const MapContainerOuter = styled.div`
  position: relative;
  /* width: 100%; */
  height: ${(props) => (props.isReport ? "100%" : "calc(100vh - 50px)")};
  flex: 1;
  pointer-events: ${props => props.noData || props.isReport ? "none" : "auto"};
`;
const MapContainer = styled.div`
  #deckgl-wrapper {
    width: 100%;
    transition: 125ms all;
  }
  height: 100%;
  background: ${(props) => (props.isReport ? colors.white : colors.darkgray)};
  overflow: hidden;
  @media (max-width: 600px) {
    div.mapboxgl-ctrl-geocoder {
      display: none;
    }
  }
`;
const IndicatorBox = styled.div`
  position: fixed;
  border: 1px dashed #ffce00;
  background: rgba(0, 0, 0, 0.25);
  z-index: 5;
  left: -5px;
  right: -5px;
  width: 0;
  height: 0;
`;
const GeocoderContainer = styled.div`
  position: fixed;
  right: 7px;
  top: 7px;
  z-index: 500;
  width: 250px;
  @media (max-width: 1024px) {
    right: 57px;
  }
  @media (max-width: 600px) {
    display: none;
  }
`;

//create your forceUpdate hook
// function useForceUpdate() {
//   const [, setValue] = useState(0); // integer state
//   return () => setValue((value) => value + 1); // update the state to force render
// }

// parse dot density 1D PBF into 2D
const chunkArray = (data, chunk) => {
  let tempArray = new Array(data.length / chunk).fill([]);
  for (let i = 0; i < data.length; i += chunk) {
    tempArray[i / chunk] = data.slice(i, i + chunk);
  }
  return tempArray;
};

function MapSection({
  currentMapGeography,
  currentMapData,
  currentMapID,
  currentHeightScale,
  currentData,
  mapParams,
  currIdCol,
  manualViewport = false,
  hoverGeoid = null,
  highlightGeoids = [],
  theme = "dark",
}) {
  const noData = Object.keys(currentMapData).length === 0;
  // console.log(noData)
  const isReport = !!manualViewport;
  // fetch pieces of state from store
  // const currentMapData = useSelector(state => state.mapData.data);
  // const currentMapID = useSelector(state => state.mapData.params);
  // const currentHeightScale = useSelector(state => state.mapData.heightScale);
  const dotDensityData = useSelector(({ data }) => data.dotDensityData);
  // const storedGeojson = useSelector(({data}) => data.storedGeojson);
  const storedCartogramData = useSelector(
    ({ data }) => data.storedCartogramData
  );
  // const currentMapGeography = storedGeojson[currentData]?.data||[]
  const colorFilter = useSelector(({ ui }) => ui.colorFilter);
  // const storedLisaData = useSelector((state) => state.storedLisaData);
  const shouldPanMap = useSelector(({ ui }) => ui.shouldPanMap);
  const panelState = useSelector(({ ui }) => ui.panelState);
  const uiLeftPadding = useSelector(({ui}) => ui.panelState.variables ? ui.variableMenuWidth : 0);

  const isPoint = currentMapGeography?.features
    ? currentMapGeography.features[0].geometry.type === "Point"
    : false;

  const contextViewport = useViewport();
  const viewport = manualViewport || contextViewport;
  const setViewport = useSetViewport();
  const currMapViewport = null; //useFindViewport(storedGeojson[currentData]?.mapId);
  // component state elements
  // hover and highlight geographibes
  const [hoverGeog, setHoverGeog] = useState(hoverGeoid);
  const [highlightGeog, setHighlightGeog] = useState(highlightGeoids);
  const [glContext, setGLContext] = useState();
  // async fetched data and cartogram center
  const [resourceLayerData, setResourceLayerData] = useState({
    clinics: [],
    hospitals: [],
    vaccineSites: [],
  });
  const [storedCenter, setStoredCenter] = useState(null);
  // interaction states
  const [multipleSelect, setMultipleSelect] = useState(false);
  const [boxSelect, setBoxSelect] = useState(false);
  const [boxSelectDims, setBoxSelectDims] = useState({});

  const dispatch = useDispatch();

  // fix for alt-tabbing sleep
  let visibilityChange = null;
  if (typeof document.hidden !== "undefined") {
    // Opera 12.10 and Firefox 18 and later support
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    visibilityChange = "webkitvisibilitychange";
  }

  // shared view broadcast
  useEffect(() => {
    if (!isReport) {
      document.addEventListener(visibilityChange, () => {
        setBoxSelect(false);
        setMultipleSelect(false);
      });
      document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });

      window.addEventListener("storage", () => {
        // When local storage changes, dump the list to the console.
        const SHARED_GEOID = localStorage.getItem("SHARED_GEOID");
        if (SHARED_GEOID !== null) {
          setHighlightGeog(SHARED_GEOID.split(",").map((d) => parseInt(d)));
        }
        const SHARED_VIEW = JSON.parse(localStorage.getItem("SHARED_VIEW"));
        if (
          !document.hasFocus() &&
          SHARED_VIEW !== null &&
          shallowCompare(SHARED_VIEW, viewport) &&
          SHARED_VIEW.hasOwnProperty("latitude")
        ) {
          setViewport({
            longitude: SHARED_VIEW.longitude,
            latitude: SHARED_VIEW.latitude,
            zoom: SHARED_VIEW.zoom,
            bearing: SHARED_VIEW.bearing || 0,
            pitch: SHARED_VIEW.pitch || 0,
          });
        }
      });
      window.addEventListener("contextmenu", (e) => {
        dispatch(
          openContextMenu({
            x: e.pageX,
            y: e.pageY,
          })
        );
      });
    }
  }, []);

  // change map center on viztype change
  useEffect(() => {
    switch (mapParams.vizType) {
      case "3D": {
        setViewport((viewState) => {
          return {
            ...viewState,
            bearing: -30,
            pitch: 30,
          };
        });
        setStoredCenter(null);
        break;
      }
      default: {
        setViewport((viewState) => {
          if (
            mapParams.vizType !== "cartogram" &&
            viewState.latitude < 15 &&
            viewState.longitude > -30
          ) {
            return {
              ...fitBounds({
                width: window.innerWidth,
                height: window.innerHeight,
                bounds: [
                  [-130.14, 53.96],
                  [-67.12, 19],
                ],
              }),
              bearing: 0,
              pitch: 0,
            };
          } else {
            return {
              ...viewState,
              bearing: 0,
              pitch: 0,
            };
          }
        });
        setStoredCenter(null);
        break;
      }
    }
  }, [mapParams.vizType]);

  // recenter on cartogram
  // needs a separate rule from the above effect due to state and county cartograms
  // having separate locations
  useEffect(() => {
    if (mapParams.vizType !== "cartogram") return;

    if (storedCartogramData.length) {
      let center = getCartogramCenter(storedCartogramData);
      if (isNaN(center[0])) return;
      let roundedCenter = [Math.floor(center[0]), Math.floor(center[1])];
      if (
        (storedCenter === null || roundedCenter[0] !== storedCenter[0]) &&
        center
      ) {
        setViewport({
          latitude: center[1],
          longitude: center[0],
          zoom: currentData.includes("state") ? 6 : 5,
          bearing: 0,
          pitch: 0,
        });
        setStoredCenter(roundedCenter);
      }
    }
  }, [storedCartogramData, currentData, mapParams.vizType]);

  const getDotDensityData = async () =>
    fetch(`${process.env.PUBLIC_URL}/pbf/dotDensityFlatGeoid.pbf`)
      .then((r) => r.arrayBuffer())
      .then((ab) => new Pbf(ab))
      .then((pbf) => Schemas.Dot.read(pbf).val)
      .then((data) => chunkArray(data, 4))
      .then((chunks) => dispatch(setDotDensityData(chunks)));

  // change mapbox layer on viztype change or overlay/resource change
  useEffect(() => {
    if (mapParams.vizType === "dotDensity") {
      if (!dotDensityData.length) {
        getDotDensityData();
      }
    }
    parseMapboxLayers(MAP_STYLE.layers, mapParams, mapRef);
  }, [mapParams.overlay, mapParams.mapType, mapParams.vizType]);

  // load in Hospital and clinic data when called
  useEffect(() => {
    if (
      mapParams.resource.includes("hospital") ||
      mapParams.resource.includes("clinic")
    ) {
      if (!resourceLayerData.hospitals.length) {
        getCSV(
          `${process.env.PUBLIC_URL}/csv/context_hospitals_covidcaremap.csv`
        ).then((values) =>
          setResourceLayerData((prev) => ({ ...prev, hospitals: values }))
        );
      }

      if (!resourceLayerData.clinics.length) {
        getCSV(
          `${process.env.PUBLIC_URL}/csv/context_fqhc_clinics_hrsa.csv`
        ).then((values) =>
          setResourceLayerData((prev) => ({ ...prev, clinics: values }))
        );
      }
    }

    if (mapParams.resource.includes("vaccination")) {
      if (!resourceLayerData.vaccineSites.length) {
        getCSV(
          `${process.env.PUBLIC_URL}/csv/context_vaccination_sites_hrsa_wh.csv`
        ).then((values) =>
          setResourceLayerData((prev) => ({ ...prev, vaccineSites: values }))
        );
        dispatch(
          setNotification(
            `
                    <h2>COVID19 Vaccine Access</h2>
                    <p>
                        <br/>
                        Federal Vaccination Sites only include White House/FEMA large vaccination centers and HRSA-supported clinics (FQHCs).
                        <br/><br/>
                        For a more complete listing of places to get the COVID19 vaccine please visit the <a href="https://vaccinefinder.org/search/" target="_blank" rel="noopener noreferrer">CDC VaccineFinder</a> or check your local jurisdiction.
                    </a>
                    </p>
                `,
            "center"
          )
        );
      }
    }
  }, [
    mapParams.resource,
    resourceLayerData.clinics[0],
    resourceLayerData.hospitals[0],
    resourceLayerData.vaccineSites[0],
  ]);

  // useEffect(() => {
  //   forceUpdate();
  // }, [currentMapID, storedCartogramData]);

  useEffect(() => {
    if (shouldPanMap) {
      setViewport({
        bearing: 0,
        pitch: 0,
        latitude: 0,
        longitude: 0,
        zoom: 10,
        ...currMapViewport,
      });
      dispatch(mapDidPan());
    }
  }, [currMapViewport]);

  const MAP_STYLE = MAP_STYLES[theme];
  const mapRef = useRef();
  const deckRef = useRef();

  const handleKeyDown = (e) => {
    if (e.target.selectionStart === undefined) {
      if (e.ctrlKey) setMultipleSelect(true);
      if (e.shiftKey) setBoxSelect(true);
    }
  };

  const handleKeyUp = (e) => {
    if (e.target.selectionStart === undefined) {
      if (!e.ctrlKey) setMultipleSelect(false);
      if (!e.shiftKey) setBoxSelect(false);
    }
  };

  const handleMapHover = ({ x, y, object, layer }) => {
    if (object) {
      dispatch(
        setTooltipInfo(
          x,
          y,
          object?.properties ? object.properties[currIdCol] : object
        )
      );
    } else {
      hoverGeog && setHoverGeog(null);
      dispatch(setTooltipInfo(x, y, null));
    }

    if (
      !isPoint &&
      object &&
      object?.properties &&
      object?.properties[currIdCol]
    ) {
      if (object?.properties[currIdCol] !== hoverGeog)
        setHoverGeog(object?.properties[currIdCol]);
    } else {
      setHoverGeog(null);
    }
  };

  const getScatterColor = (geoid) => currentMapData[geoid]?.color;

  const handleMapClick = (info, e) => {
    if (e.rightButton) return;
    const objectID = +info.object?.properties[currIdCol];
    if (!objectID) return;

    if (multipleSelect) {
      try {
        if (highlightGeog.indexOf(objectID) === -1) {
          let GeoidList = [...highlightGeog, objectID];
          setHighlightGeog(GeoidList);
          dispatch(updateSelectionKeys(objectID, "append"));
          window.localStorage.setItem("SHARED_GEOID", GeoidList);
          window.localStorage.setItem("SHARED_VIEW", JSON.stringify(viewport));
        } else {
          if (highlightGeog.length > 1) {
            let tempArray = [...highlightGeog];
            tempArray.splice(tempArray.indexOf(objectID), 1);
            setHighlightGeog(tempArray);
            dispatch(updateSelectionKeys(objectID, "remove"));
            window.localStorage.setItem("SHARED_GEOID", tempArray);
            window.localStorage.setItem(
              "SHARED_VIEW",
              JSON.stringify(viewport)
            );
          }
        }
      } catch {}
    } else {
      try {
        setHighlightGeog([objectID]);
        dispatch(updateSelectionKeys(objectID, "update"));
        window.localStorage.setItem("SHARED_GEOID", objectID);
        window.localStorage.setItem("SHARED_VIEW", JSON.stringify(viewport));
      } catch {}
    }
  };

  const handleGeocoder = useCallback((location) => {
    if (location.center !== undefined) {
      let center = location.center;
      let zoom = 6;

      if (location.bbox) {
        let bounds = fitBounds({
          width: window.innerWidth,
          height: window.innerHeight,
          bounds: [
            [location.bbox[0], location.bbox[1]],
            [location.bbox[2], location.bbox[3]],
          ],
        });
        center = [bounds.longitude, bounds.latitude];
        zoom = bounds.zoom * 0.9;
      }

      setViewport({
        longitude: center[0],
        latitude: center[1],
        zoom: zoom,
        bearing: 0,
        pitch: 0,
        transitionDuration: "auto",
        transitionInterpolator: new FlyToInterpolator(),
      });
    }
  }, []);

  const FullLayers = {
    choropleth: new GeoJsonLayer({
      id: "choropleth",
      data: currentMapGeography,
      getFillColor: (d) =>
        !colorFilter ||
        currentMapData[d.properties[currIdCol]]?.color?.length === 4
          ? currentMapData[d.properties[currIdCol]]?.color || [120, 120, 120]
          : [
              ...(currentMapData[d.properties[currIdCol]]?.color || [0, 0, 0]),
              0 +
                (!colorFilter ||
                  colorFilter ===
                    currentMapData[d.properties[currIdCol]]?.color) *
                  225,
            ],
      getElevation: (d) => currentMapData[d.properties[currIdCol]]?.value || 0,
      elevationScale: currentHeightScale || 1,
      getPointRadius: 250,
      pointRadiusMaxPixels: 50,
      pointRadiusMinPixels: 5,
      pickable: true,
      stroked: false,
      filled: true,
      wireframe: true,
      extruded: mapParams.vizType === "3D",
      opacity: mapParams.vizType === "dotDensity"
        ? mapParams.dotDensityParams.backgroundTransparency
        : 0.8,
      material: false,
      onHover: handleMapHover,
      onClick: handleMapClick,
      // transitions: {
      //   getFillColor: colorFilter ? 250 : 0,
      // },
      getPolygonOffset: 0,
      updateTriggers: {
        transitions: colorFilter,
        opacity: mapParams.overlay,
        getElevation: [currentMapID, currentHeightScale],
        elevationScale: currentHeightScale,
        getFillColor: [currentMapID, colorFilter],
        getPointRadius: viewport.zoom,
      },
    }),
    choroplethHighlight: new GeoJsonLayer({
      id: "highlightLayer",
      data: currentMapGeography,
      getLineColor: () =>
        mapParams.vizType === "dotDensity" ? [240, 240, 240] : [0, 104, 109],
      opacity: 0.8,
      material: false,
      pickable: false,
      stroked: true,
      filled: false,
      lineWidthScale: 500,
      getLineWidth: (d) =>
        highlightGeog.indexOf(d.properties[currIdCol]) !== -1 ? 5 : 0,
      lineWidthMinPixels: 0,
      lineWidthMaxPixels: 10,
      updateTriggers: {
        getLineColor: mapParams.vizType,
        getLineWidth: highlightGeog,
      },
    }),
    choroplethHover: new GeoJsonLayer({
      id: "hoverHighlightlayer",
      data: currentMapGeography,
      getLineColor: () =>
        mapParams.vizType === "dotDensity" ? [200, 200, 200] : [50, 50, 50],
      getElevation: (d) => currentMapData[d.properties[currIdCol]]?.height || 0,
      elevationScale: currentHeightScale || 1,
      pickable: false,
      stroked: true,
      filled: false,
      wireframe: mapParams.vizType === "3D",
      extruded: mapParams.vizType === "3D",
      lineWidthScale: 500,
      getLineWidth: (d) => (hoverGeog === d.properties[currIdCol] ? 8 : 0),
      lineWidthMinPixels: 0,
      lineWidthMaxPixels: 10,
      updateTriggers: {
        getLineColor: mapParams.vizType,
        getElevation: [currentMapID, currentHeightScale],
        elevationScale: currentHeightScale,
        getLineWidth: hoverGeog,
        extruded: mapParams.vizType,
      },
    }),
    cartogram: new ScatterplotLayer({
      id: "cartogram layer",
      data: currentMapGeography?.features || [],
      pickable: true,
      getPosition: (d) => currentMapData[d.properties[currIdCol]].position,
      getFillColor: (d) => currentMapData[d.properties[currIdCol]].color,
      getRadius: (d) => currentMapData[d.properties[currIdCol]].radius,
      onHover: handleMapHover,
      radiusScale: currentData.includes("state") ? 9 : 6,
      updateTriggers: {
        data: currentMapGeography,
        getPosition: [currentMapID, storedCartogramData],
        getFillColor: [currentMapID, storedCartogramData],
        getRadius: [currentMapID, storedCartogramData],
        transitions: [currentMapID, storedCartogramData],
      },
    }),
    cartogramText: new TextLayer({
      id: "cartogram text layer",
      data: currentMapGeography?.features || [],
      getPosition: (d) => currentMapData[d.properties[currIdCol]].position,
      getSize: (d) => currentMapData[d.properties[currIdCol]].radius,
      sizeScale: 4,
      backgroundColor: [240, 240, 240],
      pickable: false,
      sizeUnits: "meters",
      fontWeight: "bold",
      getTextAnchor: "middle",
      getAlignmentBaseline: "center",
      maxWidth: 500,
      wordBreak: "break-word",
      getText: (d) => d.properties.NAME,
      updateTriggers: {
        data: currentMapGeography,
        getPosition: [currentMapID, storedCartogramData],
        getSize: [currentMapID, storedCartogramData],
      },
    }),
    // cartogramBackground: new PolygonLayer({
    //     id: 'background',
    //     data: [
    //         // prettier-ignore
    //         [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]
    //     ],
    //     opacity: 1,
    //     getPolygon: d => d,
    //     stroked: false,
    //     filled: true,
    //     getFillColor: [10,10,10],
    // }),

    dotDensityWhite: new ScatterplotLayer({
      id: "dot density layer white",
      data: dotDensityData,
      pickable: false,
      filled: true,
      getPosition: (f) => [f[1] / 1e5, f[2] / 1e5],
      getFillColor: (f) =>
        mapParams.dotDensityParams.colorCOVID
          ? getScatterColor(f[3])
          : colors.dotDensity[f[0]],
      getRadius: 100,
      radiusMinPixels: Math.sqrt(viewport.zoom) - 1.5,
      getFilterValue: (f) =>
        f[0] === 8 && mapParams.dotDensityParams.raceCodes[f[0]] ? 1 : 0,
      filterRange: [1, 1],
      // Define extensions
      extensions: [new DataFilterExtension({ filterSize: 1 })],
      updateTriggers: {
        getPosition: dotDensityData.length,
        getFillColor: [
          mapParams.dotDensityParams.colorCOVID,
          currentMapID,
          dotDensityData,
        ],
        data: dotDensityData,
        getFilterValue: [
          dotDensityData.length,
          mapParams.dotDensityParams.raceCodes[8],
        ],
        radiusMinPixels: viewport.zoom,
      },
    }),
    dotDensity: new ScatterplotLayer({
      id: "dot density layer",
      data: dotDensityData,
      pickable: false,
      filled: true,
      getPosition: (f) => [f[1] / 1e5, f[2] / 1e5],
      getFillColor: (f) =>
        mapParams.dotDensityParams.colorCOVID
          ? getScatterColor(f[3])
          : colors.dotDensity[f[0]],
      getRadius: 100,
      radiusMinPixels: Math.sqrt(viewport.zoom) - 1.5,
      getFilterValue: (f) =>
        f[0] !== 8 && mapParams.dotDensityParams.raceCodes[f[0]] ? 1 : 0,
      filterRange: [1, 1],
      // Define extensions
      extensions: [new DataFilterExtension({ filterSize: 1 })],
      updateTriggers: {
        getPosition: dotDensityData.length,
        getFillColor: [
          mapParams.dotDensityParams.colorCOVID,
          currentMapID,
          dotDensityData,
        ],
        data: dotDensityData,
        getFilterValue: [
          dotDensityData.length,
          mapParams.dotDensityParams.raceCodes[1],
          mapParams.dotDensityParams.raceCodes[2],
          mapParams.dotDensityParams.raceCodes[3],
          mapParams.dotDensityParams.raceCodes[4],
          mapParams.dotDensityParams.raceCodes[5],
          mapParams.dotDensityParams.raceCodes[6],
          mapParams.dotDensityParams.raceCodes[7],
        ],
        radiusMinPixels: viewport.zoom,
      },
    }),

    hospitals: new IconLayer({
      id: "hospital-layer",
      data: resourceLayerData.hospitals,
      pickable: true,
      iconAtlas: `${process.env.PUBLIC_URL}/assets/img/icon_atlas.png`,
      iconMapping: ICON_MAPPING,
      getIcon: (d) => "hospital",
      getPosition: (d) => [d.Longitude, d.Latitude],
      sizeUnits: "meters",
      getSize: 20000,
      sizeMinPixels: 12,
      sizeMaxPixels: 24,
      updateTriggers: {
        data: [mapParams.resource, resourceLayerData],
      },
      onHover: handleMapHover,
    }),
    clinic: new IconLayer({
      id: "clinics-layer",
      data: resourceLayerData.clinics,
      pickable: true,
      iconAtlas: `${process.env.PUBLIC_URL}/assets/img/icon_atlas.png`,
      iconMapping: ICON_MAPPING,
      getIcon: (d) => "clinic",
      getSize: 20000,
      getPosition: (d) => [d.lon, d.lat],
      sizeUnits: "meters",
      sizeMinPixels: 7,
      sizeMaxPixels: 20,
      updateTriggers: {
        data: [mapParams.resource, resourceLayerData.clinics],
      },
      onHover: handleMapHover,
    }),
    vaccinationSites: new IconLayer({
      id: "vaccine-sites-layer",
      data: resourceLayerData.vaccineSites,
      pickable: true,
      iconAtlas: `${process.env.PUBLIC_URL}/assets/img/icon_atlas.png`,
      iconMapping: ICON_MAPPING,
      getIcon: (d) =>
        d.type === 0
          ? "invitedVaccineSite"
          : d.type === 1
          ? "participatingVaccineSite"
          : d.type === 3
          ? "megaSite"
          : "",
      getSize: (d) => (d.type === 3 ? 200000 : 1000),
      getPosition: (d) => [d.lon, d.lat],
      sizeUnits: "meters",
      sizeMinPixels: 20,
      sizeMaxPixels: 60,
      updateTriggers: {
        data: resourceLayerData.vaccineSites,
      },
      onHover: handleMapHover,
    }),
  };

  const getLayers = useCallback(
    (layers, vizType, overlays, resources, currData) => {
      let LayerArray = [];
      
      if (vizType === "cartogram") {
        // LayerArray.push(layers['cartogramBackground'])
        LayerArray.push(layers["cartogram"]);
        if (currentData.includes("state")) {
          LayerArray.push(layers["cartogramText"]);
        }
        return LayerArray;
      } else if (vizType === "2D") {
        LayerArray.push(layers["choropleth"]);
        LayerArray.push(layers["choroplethHighlight"]);
        LayerArray.push(layers["choroplethHover"]);
      } else if (vizType === "3D") {
        LayerArray.push(layers["choropleth"]);
        LayerArray.push(layers["choroplethHover"]);
      } else if (vizType === "dotDensity") {
        LayerArray.push(layers["choropleth"]);
        LayerArray.push(layers["dotDensity"]);
        LayerArray.push(layers["dotDensityWhite"]);
        LayerArray.push(layers["choroplethHighlight"]);
        LayerArray.push(layers["choroplethHover"]);
      }

      if (resources && resources.includes("hospital"))
        LayerArray.push(layers["hospitals"]);
      if (resources && resources.includes("clinic"))
        LayerArray.push(layers["clinic"]);
      if (resources && resources.includes("vaccinationSites"))
        LayerArray.push(layers["vaccinationSites"]);

      return LayerArray;
    }
  );

  const listener = (e) => {
    setBoxSelectDims((prev) => {
      const [left, width] =
        e.clientX < prev.oLeft
          ? [e.clientX, prev.oLeft - e.clientX]
          : [prev.left, e.clientX - prev.left];

      const [top, height] =
        e.clientY < prev.oTop
          ? [e.clientY, prev.oTop - e.clientY]
          : [prev.top, e.clientY - prev.top];

      return { ...prev, left, top, width, height };
    });
  };

  const touchListener = (e) => {
    // setX(e?.targetTouches[0]?.clientX-15)
    // setY(e?.targetTouches[0]?.clientY-15)
    // console.log(e)
  };

  const removeListeners = () => {
    window.removeEventListener("touchmove", touchListener);
    window.removeEventListener("touchend", removeListeners);
    window.removeEventListener("mousemove", listener);
    window.removeEventListener("mouseup", removeListeners);
    setBoxSelectDims({
      left: -50,
      top: -50,
      oLeft: 0,
      oTop: 0,
      width: 0,
      height: 0,
    });
    setBoxSelect(false);
  };

  const handleBoxSelect = (e) => {
    try {
      if (e.type === "mousedown") {
        setBoxSelectDims({
          left: e.pageX,
          top: e.pageY,
          oLeft: e.pageX,
          oTop: e.pageY,
          width: 0,
          height: 0,
        });
        window.addEventListener("touchmove", touchListener);
        window.addEventListener("touchend", removeListeners);
        window.addEventListener("mousemove", listener);
        window.addEventListener("mouseup", removeListeners);
      } else {
        const { left, top, width, height } = boxSelectDims;

        let layerIds = ["choropleth"];
        let features = deckRef.current.pickObjects({
          x: left - 50 - uiLeftPadding,
          y: top - 50,
          width,
          height,
          layerIds,
        });

        let GeoidList = [];
        for (let i = 0; i < features.length; i++) {
          const objectID = features[i].object?.properties[currIdCol];
          if (!objectID || GeoidList.indexOf(objectID) !== -1) continue;
          GeoidList.push(objectID);
        }

        dispatch(updateSelectionKeys(GeoidList, "bulk-append"));
        setHighlightGeog(GeoidList);

        window.localStorage.setItem("SHARED_GEOID", GeoidList);
        window.localStorage.setItem("SHARED_VIEW", JSON.stringify(viewport));

        setBoxSelectDims({});
        removeListeners();
        setBoxSelect(false);
      }
    } catch {
      console.log("bad selection");
    }
  };

  const onMapLoad = useCallback(() => {
    if (mapRef.current === undefined) return;
    const map = mapRef.current.getMap();
    parseMapboxLayers(MAP_STYLE.layers, mapParams, mapRef);
    const deck = deckRef.current.deck;
    const layerKeys = Object.keys(FullLayers);
    for (let i = 0; i < layerKeys.length; i++) {
      map.addLayer(
        new MapboxLayer({ id: FullLayers[layerKeys[i]].props.id, deck }),
        [
          "dotDensityWhite",
          "dotDensity",
          "vaccinationSites",
          "hospitals",
          "clinic",
        ].includes(layerKeys[i])
          ? "state-label"
          : "water"
      );
    }
  }, []);
  
  return (
    <MapContainerOuter {...{noData, isReport}}>
      <MapContainer
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onMouseDown={(e) => {
          boxSelect && handleBoxSelect(e);
          dispatch(setTooltipInfo(null, null, null));
        }}
        id="mapContainer"
        onMouseUp={(e) => boxSelect && handleBoxSelect(e)}
        panelState={panelState}
        isReport={isReport}
      >
        <IndicatorBox style={{ ...boxSelectDims }} />
        <DeckGL
          layers={getLayers(
            FullLayers,
            mapParams.vizType,
            mapParams.overlay,
            mapParams.resource,
            currentData
          )}
          ref={deckRef}
          views={view}
          viewState={viewport}
          onViewStateChange={({ viewState }) =>
            boxSelect ? null : setViewport(viewState)
          }
          controller={true}
          pickingRadius={20}
          onWebGLInitialized={setGLContext}
          glOptions={{ stencil: true, preserveDrawingBuffer: isReport }}
        >
          <MapboxGLMap
            reuseMaps={!isReport}
            ref={mapRef}
            mapStyle={MAP_STYLE}
            gl={glContext}
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
            onLoad={() => {
              onMapLoad();
              dispatch(setMapLoaded(true));
            }}
          ></MapboxGLMap>
        </DeckGL>
        {!isReport && (
          <MapButtons boxSelect={boxSelect} setBoxSelect={setBoxSelect} />
        )}
        {!isReport && (
          <GeocoderContainer>
            <Geocoder
              id="Geocoder"
              placeholder={"Search by location"}
              API_KEY={MAPBOX_ACCESS_TOKEN}
              onChange={handleGeocoder}
            />
          </GeocoderContainer>
        )}
      </MapContainer>
    </MapContainerOuter>
  );
}

export default React.memo(MapSection);
