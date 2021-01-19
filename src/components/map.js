import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import {fromJS} from 'immutable';
import {find, findIndex} from 'lodash';

import DeckGL from '@deck.gl/react';
import {MapView, FlyToInterpolator} from '@deck.gl/core';
import { GeoJsonLayer, PolygonLayer, ScatterplotLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import {fitBounds} from '@math.gl/web-mercator';
// import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
// import {IcoSphereGeometry} from '@luma.gl/engine';

import MapboxGLMap, {NavigationControl, GeolocateControl } from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';

import { MapTooltipContent } from '../components';
import { setMapLoaded, setSelectionData, appendSelectionData, removeSelectionData } from '../actions';
import { mapFn, dataFn, getVarId, getCSV, getCartogramCenter, getDataForCharts, getURLParams } from '../utils';
import { colors, colorScales } from '../config';
import MAP_STYLE from '../config/style.json';
import { selectRect } from '../config/svg'; 

// const cartoGeom = new IcoSphereGeometry({
//   iterations: 1
// });
const bounds = fitBounds({
    width: window.innerWidth,
    height: window.innerHeight,
    bounds: [[-130.14, 53.96],[-67.12, 19]]
})

// const hawaiiBounds = fitBounds({
//     width: window.innerWidth*.15,
//     height: window.innerHeight*.12,
//     bounds: [[-161.13, 23.23],[-152.75, 17.67]]
// })

// const alaskaBounds = fitBounds({
//     width: window.innerWidth*.15,
//     height: window.innerHeight*.12,
//     bounds: [[-167.75, 73.59],[-132.70, 50.09]]
// })

const ICON_MAPPING = {
    hospital: {x: 0, y: 0, width: 128, height: 128},
    clinic: {x: 128, y: 0, width: 128, height: 128},
  };

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg';

const defaultMapStyle = fromJS(MAP_STYLE);

const MapContainer = styled.div`
    position:absolute;
    left:0;
    top:0;
    width:100%;
    height:calc(100% - 50px);
    background:${colors.darkgray};
    @media (max-width:600px) {
        div.mapboxgl-ctrl-geocoder {
            display:none;
        }
    }
`

const HoverDiv = styled.div`
    background:${colors.gray};
    padding:20px;
    color:white;
    box-shadow: 0px 0px 5px rgba(0,0,0,0.7);
    border-radius:0.5vh 0.5vh 0 0;
    transition:0s all;
    h3 {
        margin:2px 0;
    }
`;

const NavInlineButton = styled.button`
    width:29px;
    height:29px;
    padding:5px;
    margin-bottom:10px;
    display:block;
    background-color: ${props => props.isActive ? colors.lightblue : colors.buttongray};
    -moz-box-shadow: 0 0 2px rgba(0,0,0,.1);
    -webkit-box-shadow: 0 0 2px rgba(0,0,0,.1);
    box-shadow: 0 0 0 2px rgba(0,0,0,.1);
    border-radius: 4px;
    outline:none;
    border:none;
    transition:250ms all;
    cursor:pointer;
    &:last-of-type {
        margin-top:10px;
    }
    :after {
        opacity: ${props => props.shareNotification ? 1 : 0};
        content:'Map Link Copied to Clipboard!';
        background:${colors.buttongray};
        -moz-box-shadow: 0 0 2px rgba(0,0,0,.1);
        -webkit-box-shadow: 0 0 2px rgba(0,0,0,.1);
        box-shadow: 0 0 0 2px rgba(0,0,0,.1);
        border-radius: 4px;
        position: absolute;
        transform:translate(-120%, -25%);
        padding:5px;
        width:150px;
        pointer-events:none;
        max-width:50vw;
        transition:250ms all;
    }
`

const MapGeocoder = styled(Geocoder)`
    @media (max-width:600px) {
        display:none !important;
    }
`

const MapButtonContainer = styled.div`
    position: absolute;
    right: ${props => props.infoPanel ? 317 : 10}px;
    bottom: 30px;
    zIndex: 10;
    transition: 250ms all;
    @media (max-width:768px) {
        bottom:100px;
    }
    @media (max-width: 400px) {
        transform:scale(0.75) translate(20%, 20%);
    }
`

const ShareURL = styled.input`
    position:fixed;
    left:110%;
`

const IndicatorBox = styled.div`
    position:fixed;
    top:${props => props.y}px;
    left:${props => props.x}px;
    width:${props => props.width}px;
    height:${props => props.height}px;
    border:1px dashed #FFCE00;
    background:rgba(0,0,0,0.25);
    z-index:5;
`

const Map = () => { 
    
    const { storedData, storedGeojson, currentData, storedLisaData, dateIndices,
        storedCartogramData, panelState, dates, dataParams, mapParams,
        currentVariable, startDateIndex, urlParams } = useSelector(state => state);

    const [hoverInfo, setHoverInfo] = useState(false);
    const [highlightGeog, setHighlightGeog] = useState([]);
    // const [globalMap, setGlobalMap] = useState(false);
    const globalMap = false;
    const [mapStyle, setMapStyle] = useState(defaultMapStyle);
    const [currLisaData, setCurrLisaData] = useState({})
    
    const [viewState, setViewState] = useState({
        latitude: +urlParams.lat || bounds.latitude,
        longitude: +urlParams.lon || bounds.longitude,
        zoom: +urlParams.z || bounds.zoom,
        bearing:0,
        pitch:0
    })

    // const [viewStates, setViewStates] = useState({
    //     'main': {
    //         latitude: +urlParams.lat || bounds.latitude,
    //         longitude: +urlParams.lon || bounds.longitude,
    //         zoom: +urlParams.z || bounds.zoom,
    //         bearing:0,
    //         pitch:0
    //     },
    //     'hawaiiMap': {
    //         latitude: hawaiiBounds.latitude,
    //         longitude: hawaiiBounds.longitude,
    //         zoom: hawaiiBounds.zoom,
    //         bearing:0,
    //         pitch:0
    //     },
    //     'alaskaMap': {
    //         latitude: alaskaBounds.latitude,
    //         longitude: alaskaBounds.longitude,
    //         zoom: alaskaBounds.zoom,
    //         bearing:0,
    //         pitch:0
    //     }
    // });

    // const onViewStateChange = useCallback(({viewId, viewState}) => {
    //     if (viewId === 'main') {
    //       setViewStates(currentViewStates => ({
    //         ...currentViewStates,
    //         main: viewState
    //       }));
    //     } 
    // }, []);

    const [cartogramData, setCartogramData] = useState([]);
    const [currVarId, setCurrVarId] = useState(null);
    const [hospitalData, setHospitalData] = useState(null);
    const [clinicData, setClinicData] = useState(null);
    const [storedCenter, setStoredCenter] = useState(null);
    const [shared, setShared] = useState(false);
    const [multipleSelect, setMultipleSelect] = useState(false);
    const [choroplethInteractive, setChoroplethInteractive] = useState(true);
    const [boxSelect, setBoxSelect] = useState(false);
    const [boxSelectDims, setBoxSelectDims] = useState({});
    // const [resetSelect, setResetSelect] = useState(null);
    // const [mobilityData, setMobilityData] = useState([]);

    const dispatch = useDispatch();

    useEffect(() => { 
        window.addEventListener('storage', () => {
            // When local storage changes, dump the list to
            // the console.
            const SHARED_GEOID =  localStorage.getItem('SHARED_GEOID').split(',').map(d => parseInt(d))
            
            if (SHARED_GEOID !== null) {
                setHighlightGeog(SHARED_GEOID); 
            }
            
            const SHARED_VIEW =  JSON.parse(localStorage.getItem('SHARED_VIEW'));
            
            if (SHARED_VIEW !== null && SHARED_VIEW.hasOwnProperty('latitude')) {
                setViewState(
                    prevView => ({
                        ...prevView,
                        longitude: SHARED_VIEW.longitude,
                        latitude: SHARED_VIEW.latitude,
                        zoom: SHARED_VIEW.zoom,
                        transitionDuration: 1000,
                        transitionInterpolator: new FlyToInterpolator()
                    })
                )   
            }
        });
    },[])

    useEffect(() => {
        let arr = [];
        if (storedData[currentData] && mapParams.vizType === 'cartogram') {
            for (let i=0; i<storedData[currentData].length; i++) {
                arr.push({id:i})
            }
        }
        setCartogramData(arr)
    }, [storedData, currentData, mapParams.vizType])

    useEffect(() => {
        setCurrVarId(getVarId(currentData, dataParams))
    }, [dataParams, mapParams, currentData])


    useEffect(() => {
        switch(mapParams.vizType) {
            case '2D': 
                setViewState(view => ({
                    ...view,
                    latitude: +urlParams.lat || bounds.latitude,
                    longitude: +urlParams.lon || bounds.longitude,
                    zoom: +urlParams.z || bounds.zoom,
                    bearing:0,
                    pitch:0
                }));
                setStoredCenter(null)
                break
            case '3D':
                setViewState(view => ({
                    ...view,
                    latitude: +urlParams.lat || 39.8283,
                    longitude: +urlParams.lon || -98.5795,
                    zoom: +urlParams.z || bounds.zoom,
                    bearing:-30,
                    pitch:30
                }));
                setStoredCenter(null)
                break
            // case 'cartogram':
            //     useCallback(() => {
            //         let center = getCartogramCenter(storedCartogramData[getVarId(currentData, dataParams)])
            //         setViewState(view => ({
            //             ...view,
            //             latitude: center[1],
            //             longitude: center[0],
            //             zoom: 5,
            //             bearing:0,
            //             pitch:0
            //         }));
            //     }, [cartogramData])
            //     break
            default:
                //
        }
    }, [mapParams.vizType, currentData])

    useEffect(() => {
        let tempData = storedLisaData[getVarId(currentData, dataParams)]
        if (tempData !== undefined) setCurrLisaData(tempData);
    }, [storedLisaData, dataParams, mapParams])

    useEffect(() => {
        const defaultLayers = defaultMapStyle.get('layers');
        let tempLayers;

        if (mapParams.vizType === 'cartogram' || globalMap) {
            tempLayers = defaultLayers.map(layer => {
                return layer.setIn(['layout', 'visibility'], 'none');
            });
        } else if (mapParams.vizType === '3D') {
            tempLayers = defaultLayers.map(layer => {
                if ((layer.get('id').includes('label')) && !(layer.get('id').includes('water'))) return layer;
                return layer.setIn(['layout', 'visibility'], 'none');
            });
        } else {
            tempLayers = defaultLayers.map(layer => {
                if (mapParams.resource.includes(layer.get('id')) || mapParams.overlay.includes(layer.get('id'))) {
                    return layer.setIn(['layout', 'visibility'], 'visible');
                } else {
                    return layer;
                }
            });
        }
        setMapStyle(defaultMapStyle.set('layers', tempLayers));

    }, [mapParams.overlay, mapParams.vizType])

    useEffect(() => {
        if (hospitalData === null) {
            getCSV(`${process.env.PUBLIC_URL}/csv/us_healthcare_capacity-facility-CovidCareMap.csv`)
            .then(values => setHospitalData(values))
        }

        if (clinicData === null) {
            getCSV(`${process.env.PUBLIC_URL}/csv/health_centers.csv`)
            .then(values => setClinicData(values))
        }
    },[])

    useEffect(() => {
        if (storedCartogramData[getVarId(currentData, dataParams)]){
            let center = getCartogramCenter(storedCartogramData[getVarId(currentData, dataParams)])
            let roundedCenter = [Math.floor(center[0]),Math.floor(center[1])]
            if (storedCenter === null || roundedCenter[0] !== storedCenter[0]) {
                setViewState(view => ({
                    ...view,
                    latitude: center[1],
                    longitude: center[0],
                    zoom: 5,
                    bearing:0,
                    pitch:0
                }));
                setStoredCenter(roundedCenter)
            }
        }
    }, [storedCartogramData, currentData])

    useEffect(() => {
        setViewState(view => ({
            ...view,
            latitude: +urlParams.lat || bounds.latitude,
            longitude: +urlParams.lon || bounds.longitude,
            zoom: +urlParams.z || bounds.zoom,
            bearing:0,
            pitch:0
        }));
    }, [urlParams])
    
    const GetFillColor = (f, bins, mapType) => {
        if ((!bins.hasOwnProperty("bins")) || (!f.hasOwnProperty(dataParams.numerator))) {
            return [240,240,240,120]
        } else if (mapType === 'lisa') {
            return colorScales.lisa[currLisaData[storedGeojson[currentData]['geoidOrder'][f.properties.GEOID]]]
        } else {
            return mapFn(dataFn(f[dataParams.numerator], f[dataParams.denominator], dataParams), bins.breaks, mapParams.colorScale, mapParams.mapType, dataParams.numerator);
        }
    }
    
    const GetHeight = (f) => dataFn(f[dataParams.numerator], f[dataParams.denominator], dataParams)*(dataParams.scale3D/((dataParams.nType === "time-series" && dataParams.nRange === null) ? (dataParams.nIndex-startDateIndex)/10 : 1))
        // if (dataParams.zAxisParams === null) {
        //     return dataFn(f[dataParams.numerator], f[dataParams.denominator], dataParams)*(dataParams.scale3D)
        // } else {
        //     return dataFn(f[dataParams.zAxisParams.numerator], f[dataParams.zAxisParams.denominator], dataParams.zAxisParams)*(dataParams.zAxisParams.scale3D)
        // }

    const handleGeolocate = (viewState) => {
        setViewState(view => ({
            ...view,
            latitude: viewState.coords.latitude,
            longitude: viewState.coords.longitude,
            zoom: 8,
            transitionInterpolator: new FlyToInterpolator(),
            transitionDuration: 250,
        }))
    }

    const getCartogramFillColor = (val, id, bins, mapType) => {
        
        if (!bins.hasOwnProperty("bins")) {
            return [0,0,0]
        } else if (mapType === 'lisa') {
            return colorScales.lisa[currLisaData[id]]
        } else {
            return mapFn(val, bins.breaks, mapParams.colorScale, mapParams.mapType, dataParams.numerator) 
        }
    }

    const mapRef = useRef();
    const deckRef = useRef();

    const handleShare = async (params) => {
        const shareData = {
            title: 'The US Covid Atlas',
            text: 'Near Real-Time Exploration of the COVID-19 Pandemic.',
            url: `${window.location.href.split('?')[0]}${getURLParams(params)}`,
        }

        try {
            await navigator.share(shareData)
          } catch(err) {
            let copyText = document.querySelector("#share-url");
            copyText.value = `${shareData.url}`;
            copyText.style.display = 'block'
            copyText.select();
            copyText.setSelectionRange(0, 99999);
            document.execCommand("copy");
            copyText.style.display = 'none';
            setShared(true)
            setTimeout(() => setShared(false), 5000);
        }
    }

    const handleKeyDown = (e) => {
        if (e.ctrlKey) setMultipleSelect(true);
        if (e.shiftKey) setBoxSelect(true);
    }

    const handleKeyUp = (e) => {
        if (!e.ctrlKey) setMultipleSelect(false);
        if (!e.shiftKey) setBoxSelect(false);
    }

    
    const handleMapHover = ({x, y, object}) => {
        // let eps = 1
        // if (((x-hoverInfo.x>eps||x-hoverInfo.x<-1*eps)&&(y-hoverInfo.y>eps||y-hoverInfo.y<-1*eps))||hoverInfo === false){
            setHoverInfo({x, y, object})
        // }
    }
    const Layers = [
        // new SolidPolygonLayer({
        //     id: 'background',
        //     data: [
        //       [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]
        //     ],
        //     getPolygon: d => d,
        //     stroked: false,
        //     filled: true,
        //     visible: globalMap,
        //     updateTriggers: {
        //         visible: globalMap
        //     },
        //     getFillColor: [40, 40, 40]
        //   }),
        new GeoJsonLayer({
            id: 'choropleth',
            data: {
                "type": "FeatureCollection",
                "name": currentData,
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                "features": storedData[currentData] ? storedData[currentData] : [],
            },
            visible: mapParams.vizType !== 'cartogram',
            pickable: mapParams.vizType !== 'cartogram' && choroplethInteractive,
            stroked: false,
            filled: true,
            wireframe: mapParams.vizType === '3D',
            extruded: mapParams.vizType === '3D',
            opacity: 0.8,
            material:false,
            getFillColor: f => GetFillColor(f, mapParams.bins, mapParams.mapType),
            getElevation: f => GetHeight(f),
            // getLineColor: [255, 80, 80],
            // getLineWidth:50,
            // minLineWidth:20,
            // lineWidthScale: 20,
            // updateTriggers: {
            //     data: currentData,
            //     pickable: mapParams.vizType,
            //     // getFillColor: [dataParams, mapParams.mapType, mapParams.bins, mapParams.binMode, mapParams.fixedScale, mapParams.vizType, mapParams.colorScale, mapParams.customScale],
            //     // getElevation: [dataParams, mapParams.mapType, mapParams.bins, mapParams.binMode, mapParams.fixedScale, mapParams.vizType, mapParams.colorScale, mapParams.customScale],
            // },
            onHover: handleMapHover,
            onClick: info => {
                let dataName = info?.object?.properties?.state_abbr !== undefined ? `${info.object?.properties?.NAME}, ${info?.object?.properties?.state_abbr}` : `${info.object?.properties?.NAME}`
                if (multipleSelect) {
                    try {
                        if (highlightGeog.indexOf(info.object.properties.GEOID) === -1) {
                            let GeoidList = [...highlightGeog, info.object.properties.GEOID]
                            setHighlightGeog(GeoidList); 
                            dispatch(
                                appendSelectionData({
                                    values: getDataForCharts(
                                        [info.object], 
                                        'cases', 
                                        dateIndices[currentData]['cases'], 
                                        dates, 
                                        dataName
                                    ),
                                    name: dataName,
                                    index: findIndex(storedData[currentData], o => o.properties.GEOID === info.object.properties.GEOID)
                                })
                            );
                            window.localStorage.setItem('SHARED_GEOID', GeoidList);
                            window.localStorage.setItem('SHARED_VIEW', JSON.stringify(mapRef.current.props.viewState));
                        } else {
                            if (highlightGeog.length > 1) {
                                let tempArray = [...highlightGeog];
                                let geogIndex = tempArray.indexOf(info.object.properties.GEOID);
                                tempArray.splice(geogIndex, 1);
                                setHighlightGeog(tempArray);
                                dispatch(
                                    removeSelectionData({
                                        name: dataName,
                                        index: findIndex(storedData[currentData], o => o.properties.GEOID === info.object.properties.GEOID)
                                    })
                                )
                                window.localStorage.setItem('SHARED_GEOID', tempArray);
                                window.localStorage.setItem('SHARED_VIEW', JSON.stringify(mapRef.current.props.viewState));
                            }
                        }
                    } catch {}
                } else {
                    try {
                        setHighlightGeog([info.object.properties.GEOID]); 
                        dispatch(
                            setSelectionData({
                                values: getDataForCharts(
                                    [info.object], 
                                    'cases', 
                                    dateIndices[currentData]['cases'], 
                                    dates, 
                                    dataName
                                ),
                                name: dataName,
                                index: findIndex(storedData[currentData], o => o.properties.GEOID === info.object.properties.GEOID)
                            })
                        );
                        window.localStorage.setItem('SHARED_GEOID', info.object.properties.GEOID);
                        window.localStorage.setItem('SHARED_VIEW', JSON.stringify(mapRef.current.props.viewState));
                        // if (mapParams.overlay === "mobility-county") {
                        //     setMobilityData(parseMobilityData(info.object.properties.GEOID, storedMobilityData.flows[info.object.properties.GEOID], storedMobilityData.centroids));
                        // }
                    } catch {}
                }
            },
                // parameters: {
                //     depthTest: false
                // }
        }),
        new GeoJsonLayer({
            id: 'highlightLayer',
            data: {
                "type": "FeatureCollection",
                "name": currentData,
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                "features": storedData[currentData] ? storedData[currentData] : [],
            },
            pickable: false,
            stroked: true,
            filled:false,
            getLineColor: f => highlightGeog.indexOf(f.properties.GEOID)!==-1 ? [0, 104, 109] : [0, 104, 109, 0], 
            lineWidthScale: 500,
            getLineWidth: 5,
            lineWidthMinPixels: 3,
            lineWidthMaxPixels: 10,
            parameters: {
                depthTest: false
            },
            updateTriggers: {
                data: currentData,
                getLineColor: highlightGeog,
            },
        }),
        // new LineLayer({
        //     id: 'mobility flows',
        //     data: mobilityData,
        //     pickable: false,
        //     visible: mapParams.overlay === "mobility-county",
        //     widthUnits: 'meters',
        //     widthScale: 10000,
        //     getSourcePosition: d => [d[1],d[2]],
        //     getTargetPosition: d => [d[3],d[4]],
        //     getWidth: d => d[5] < 10 ? d[5] : 0,
        //     updateTriggers: {
        //         data: [mobilityData],
        //         visible: [mapParams.overlay]
        //     }
        // }),
        new IconLayer({
            id: 'hospital-layer',
            data: hospitalData,
            pickable:true,
            visible: mapParams.resource?.includes('hospital'),
            iconAtlas: `${process.env.PUBLIC_URL}/assets/img/icon_atlas.png`,
            iconMapping: ICON_MAPPING,
            getIcon: d => 'hospital',
            getPosition: d => [d.Longitude, d.Latitude],
            sizeUnits: 'meters',
            getSize: 20000,
            sizeMinPixels:12,
            sizeMaxPixels:24,
            updateTriggers: {
                data: hospitalData,
                visible: mapParams.resource
            },
            onHover: handleMapHover,
        }),
        new IconLayer({
            id: 'clinics-layer',
            data: clinicData,
            pickable:true,
            visible: mapParams.resource?.includes('clinic'),
            iconAtlas: `${process.env.PUBLIC_URL}/assets/img/icon_atlas.png`,
            iconMapping: ICON_MAPPING,
            getIcon: d => 'clinic',
            getSize: 20000,
            getPosition: d => [d.lon, d.lat],
            sizeUnits: 'meters',
            sizeMinPixels:7,
            sizeMaxPixels:20,
            updateTriggers: {
                data: clinicData,
                visible: mapParams
            },
            onHover: handleMapHover,
        }),
        new PolygonLayer({
            id: 'background',
            data: [
                // prettier-ignore
                [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]
            ],
            opacity: 1,
            getPolygon: d => d,
            stroked: false,
            filled: true,
            visible: mapParams.vizType === 'cartogram',
            getFillColor: [10,10,10],
            updateTriggers: {
                visible: mapParams.vizType,
            }
        }),
        new ScatterplotLayer({
            id: 'cartogram layer',
            data: cartogramData,
            pickable:true,
            visible: mapParams.vizType === 'cartogram',
            getPosition: f => {
                try {
                    return storedCartogramData[currVarId][f.id].position;
                } catch {
                    return [0,0];
                }
            },
            getFillColor: f => {
                try {
                    return getCartogramFillColor(storedCartogramData[currVarId][f.id].value, f.id, mapParams.bins, mapParams.mapType);
                } catch {
                    return [0,0,0];
                }
            },
            getRadius: f => {
                try {
                    return storedCartogramData[currVarId][f.id].radius*10;
                } catch {
                    return 0;
                }
            },
            // transitions: {
            //     getPosition: 1,
            //     getFillColor: 1,
            //     getRadius: 1
            // },   
            onHover: f => {
                try {
                    setHoverInfo(
                        {
                            ...f,
                            object: find(storedData[currentData], o => o.properties.GEOID === storedGeojson[currentData]['indexOrder'][f.object?.id]),
                        }
                    )
                } catch {
                    setHoverInfo(null)
                }
            },
            updateTriggers: {
                getPosition: [cartogramData, mapParams, dataParams, currVarId],
                getFillColor: [cartogramData, mapParams, dataParams, currVarId],
                getRadius: [cartogramData, mapParams, dataParams, currVarId],
                visible: [cartogramData, mapParams, dataParams, currVarId]
            }
          }),
          new TextLayer({
            id: 'cartogram text layer',
            data: cartogramData,
            pickable:false,
            visible: mapParams.vizType === 'cartogram' && currentData.includes('state'),
            getPosition: f => {
                try {
                    return storedCartogramData[currVarId][f.id].position;
                } catch {
                    return [0,0];
                }
            },
            sizeUnits: 'meters',
            fontWeight: 'bold',
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center',
            maxWidth: 500,
            wordBreak: 'break-word',
            getSize: f => {
                try {
                    return storedCartogramData[currVarId][f.id].radius*5;
                } catch {
                    return 0;
                }
            },
            getText: f => {
                try {
                    if (currentData.includes('state')) return find(storedData[currentData], o => +o.properties.GEOID === storedGeojson[currentData].indexOrder[f.id]).properties.NAME;
                    return '';
                } catch {
                    return '';
                }
            },
            updateTriggers: {
                getPosition: [cartogramData, mapParams, dataParams, currVarId],
                getFillColor: [cartogramData, mapParams, dataParams, currVarId],
                getSize: [cartogramData, mapParams, dataParams, currVarId],
                getRadius: [cartogramData, mapParams, dataParams, currVarId],
                visible: [cartogramData, mapParams, dataParams, currVarId]
            }
          }),
        // new SimpleMeshLayer({
        //     id: 'cartogram layer',
        //     data: cartogramData,
        //     // texture: 'texture.png',
        //     sizeScale:10,
        //     visible: mapParams.vizType === 'cartogram',
        //     mesh: cartoGeom,
        //     getPosition: f => {
        //         try {
        //             return storedCartogramData[currVarId][f.id].position;
        //         } catch {
        //             return [0,0];
        //         }
        //     },
        //     getColor: f => getCartogramFillColor(storedCartogramData[currVarId][f.id].value, mapParams.bins, mapParams.mapType),
        //     getScale: f => 500,
        //     // getTranslation: f => getCartogramTranslation(storedCartogramData[currVarId][f.id]),
        //     transitions: {
        //         getPosition: 150,
        //         getColor: 150,
        //         getScale: 150,
        //         getTranslation: 150
        //     },   
        //     updateTriggers: {
        //         getPosition: [mapParams, dataParams, currVarId],
        //         getColor: [mapParams, dataParams, currVarId],
        //         getScale: [mapParams, dataParams, currVarId],
        //         getTranslation: [mapParams, dataParams, currVarId]
        //     }
        //   })
    ]

    // const viewGlobe = new GlobeView({id: 'globe', controller: false, resolution:1});
    const view = new MapView({repeat: true});

    // const views = [
    //     new MapView({id: 'main', controller: true}),
    //     new MapView({id: 'hawaiiMap', x: 0, y: '86%', width: '15%', height: '12%', controller: false}),
    //     new MapView({id: 'alaskaMap', x: '14%', y: '86%', width: '15%', height: '12%', controller: false})
    // ]

    // const [insetMap, setInsetMap] = useState(false)
    
    // try {
        
    // console.log(deckRef.current.pickObjects({x: 200, y: 200, width:500, height:500, layerIds: ['choropleth']}));

    // } catch {

    // }

    const handleSelectionBoxStart = () => {
        setBoxSelect(true)
    }

    const listener = (e) => {

        setBoxSelectDims(prev => {
            let x;
            let y;
            let width;
            let height;

            if (e.clientX < prev.ox) {
                x = e.clientX;
                width = prev.ox - e.clientX
            } else {
                x = prev.x;
                width = e.clientX - prev.x
            }

            if (e.clientY < prev.oy) {
                y = e.clientY;
                height = prev.oy - e.clientY
            } else {
                y = prev.y;
                height = e.clientY - prev.y
            }

            return { ...prev, x, y, width, height }
        })
    }
    
    const touchListener = (e) => {
        // setX(e?.targetTouches[0]?.clientX-15)
        // setY(e?.targetTouches[0]?.clientY-15)
        // console.log(e)
    }

    const removeListeners = () => {
        window.removeEventListener('touchmove', touchListener)
        window.removeEventListener('touchend', removeListeners)
        window.removeEventListener('mousemove', listener)
        window.removeEventListener('mouseup', removeListeners)
    }

    const handleBoxSelect = (e) => {
        try {
            if (e.type === 'mousedown') {
                setBoxSelectDims({
                    x:e.pageX,
                    y:e.pageY,
                    ox:e.pageX,
                    oy:e.pageY,
                    width:0,
                    height:0
                });
                window.addEventListener('touchmove', touchListener);
                window.addEventListener('touchend', removeListeners);
                window.addEventListener('mousemove', listener);
                window.addEventListener('mouseup', removeListeners);
            } else {
    
                const {x, y, width, height } = boxSelectDims;
    
                let layerIds = ['choropleth'];
    
                let features = deckRef.current.pickObjects(
                        {
                            x, y: y-50, width, height, layerIds
                        }
                    )
    
                let GeoidList = [];
                for (let i=0; i<features.length; i++) {
                    GeoidList.push(features[i].object.properties.GEOID)
                    let dataName = features[i]?.object?.properties?.state_abbr !== undefined ? `${features[i].object?.properties?.NAME}, ${features[i]?.object?.properties?.state_abbr}` : `${features[i].object?.properties?.NAME}`
                    
                    if (i===0){
                        dispatch(
                            setSelectionData({
                                values: getDataForCharts(
                                    [features[i].object], 
                                    'cases', 
                                    dateIndices[currentData]['cases'], 
                                    dates, 
                                    dataName
                                ),
                                name: dataName,
                                index: findIndex(storedData[currentData], o => o.properties.GEOID === features[i].object.properties.GEOID)
                            })
                        );
                    } else {
                        dispatch(
                            appendSelectionData({
                                values: getDataForCharts(
                                    [features[i].object], 
                                    'cases', 
                                    dateIndices[currentData]['cases'], 
                                    dates, 
                                    dataName
                                ),
                                name: dataName,
                                index: findIndex(storedData[currentData], o => o.properties.GEOID === features[i].object.properties.GEOID)
                            })
                        );
                    }
                }
                setHighlightGeog(GeoidList); 
                window.localStorage.setItem('SHARED_GEOID', GeoidList);
                window.localStorage.setItem('SHARED_VIEW', JSON.stringify(mapRef.current.props.viewState));
                setBoxSelectDims({});
                removeListeners();
                setBoxSelect(false)
            }
        } catch {
            console.log('bad selection')
        }
    }

    return (
        <MapContainer
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onMouseDown={e => boxSelect ? handleBoxSelect(e) : null}
            onMouseUp={e => boxSelect ? handleBoxSelect(e) : null}
        >
            {
                // boxSelectDims.hasOwnProperty('x') && 
                true && 
                <IndicatorBox 
                    x={boxSelectDims.x} 
                    y={boxSelectDims.y}
                    width={boxSelectDims.width}
                    height={boxSelectDims.height}>
                </IndicatorBox>
            }
            {/* <svg height="0" width="0">
            <defs>
                <clipPath id="window">
                    {!insetMap && <rect y="0" x="0" width={window.innerWidth} height={window.innerHeight}/>}
                    <rect y="0" x="0" width={window.innerWidth} height={window.innerHeight*.8}/>
                    <rect y={window.innerHeight*.8} x={window.innerWidth*.3} width={window.innerWidth*.7} height={window.innerHeight*.2}/>
                </clipPath>
            </defs>
            </svg> */}
            <DeckGL
                layers={Layers}
                ref={deckRef}

                initialViewState={viewState}
                controller={
                    {
                        dragRotate: !boxSelect, 
                        dragPan: !boxSelect, 
                        doubleClickZoom: !boxSelect, 
                        touchZoom: !boxSelect, 
                        touchRotate: !boxSelect, 
                        keyboard: true, 
                        scrollZoom: true
                    }
                }
                views={view}

                // onViewStateChange={onViewStateChange}
                // viewState={viewStates}
                // views={insetMap ? views : views[0]}
            >
                <MapboxGLMap
                    reuseMaps
                    ref={mapRef}
                    mapStyle={mapStyle} //{globalMap || mapParams.vizType === 'cartogram' ? 'mapbox://styles/lixun910/ckhtcdx4b0xyc19qzlt4b5c0d' : 'mapbox://styles/lixun910/ckhkoo8ix29s119ruodgwfxec'}
                    preventStyleDiffing={true}
                    mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                    onViewportChange={() => setHoverInfo(false)}
                    // onViewportChange={viewState  => console.log(mapRef.current.props.viewState)} 
                    onLoad={() => {
                        dispatch(setMapLoaded(true))
                    }}
                    >
                        
                    <MapGeocoder 
                        mapRef={mapRef}
                        id="mapGeocoder"
                        onViewportChange={viewState  => setViewState(viewState)}
                        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                        position="top-right"                        
                        placeholder="Search by Location"
                        clearAndBlurOnEsc={true}
                        style={{position: 'fixed', top:'5px', right:'5px'}}
                    />
                        
                    <MapButtonContainer 
                        infoPanel={panelState.info}
                        onMouseEnter={() => {
                            setHoverInfo(false)
                            setChoroplethInteractive(false)}
                        }
                        onMouseLeave={() => setChoroplethInteractive(true)}
                        >
                        <NavInlineButton
                            title="Selection Box"
                            isActive={boxSelect}
                            onClick={() => handleSelectionBoxStart()}
                        >
                            {selectRect}
                        </NavInlineButton>
                        <GeolocateControl
                            positionOptions={{enableHighAccuracy: false}}
                            trackUserLocation={false}
                            onGeolocate={viewState  => handleGeolocate(viewState)}
                            style={{marginBottom: 10}}
                        />
                        <NavigationControl
                            onViewportChange={viewState  => setViewState(viewState)} 
                        />
                        
                        <NavInlineButton
                            title="Share this Map"
                            shareNotification={shared}
                            onClick={() => handleShare({mapParams, dataParams, currentData, coords: mapRef.current.props.viewState, lastDateIndex: dateIndices[currentData][dataParams.numerator]})}
                        >
                            <svg x="0px" y="0px" viewBox="0 0 100 100">
                                <path d="M22.5,65c4.043,0,7.706-1.607,10.403-4.208l29.722,14.861C62.551,76.259,62.5,76.873,62.5,77.5c0,8.284,6.716,15,15,15   s15-6.716,15-15c0-8.284-6.716-15-15-15c-4.043,0-7.706,1.608-10.403,4.209L37.375,51.847C37.449,51.241,37.5,50.627,37.5,50   c0-0.627-0.051-1.241-0.125-1.847l29.722-14.861c2.698,2.601,6.36,4.209,10.403,4.209c8.284,0,15-6.716,15-15   c0-8.284-6.716-15-15-15s-15,6.716-15,15c0,0.627,0.051,1.241,0.125,1.848L32.903,39.208C30.206,36.607,26.543,35,22.5,35   c-8.284,0-15,6.716-15,15C7.5,58.284,14.216,65,22.5,65z">
                                </path>
                            </svg>

                        </NavInlineButton>

                        <ShareURL type="text" value="" id="share-url" />
                    </MapButtonContainer>
                    <div></div>
                </MapboxGLMap >
                
                {/* <View id="main" className="test" style={{display:'none'}}/> */}
            </DeckGL>
            
            {hoverInfo.object && (
                <HoverDiv style={{transition: '0ms all', position: 'absolute', zIndex: 1, pointerEvents: 'none', left: hoverInfo.x, top: hoverInfo.y}}>
                    <MapTooltipContent content={hoverInfo.object} index={dataParams.nIndex-startDateIndex} />
                </HoverDiv>
                )}
        </MapContainer>
    ) 
}

export default Map