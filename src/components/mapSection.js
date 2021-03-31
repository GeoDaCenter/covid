// general imports, state
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import {fromJS} from 'immutable';
import { find, findIndex } from 'lodash';

// deck GL and helper function import
import DeckGL from '@deck.gl/react';
import {MapView, FlyToInterpolator} from '@deck.gl/core';
import { PolygonLayer, ScatterplotLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import {fitBounds} from '@math.gl/web-mercator';
import MapboxGLMap from 'react-map-gl';

// component, action, util, and config import
import { MapTooltipContent, Geocoder } from '../components';
import { setMapLoaded, setSelectionData, appendSelectionData, removeSelectionData, openContextMenu, setNotification, setTooltipContent } from '../actions';
import { mapFn, dataFn, getVarId, getCSV, getCartogramCenter, getDataForCharts, getURLParams } from '../utils';
import { colors, colorScales, MAPBOX_ACCESS_TOKEN } from '../config';
import MAP_STYLE from '../config/style.json';
import * as SVG from '../config/svg'; 

// US bounds
const bounds = fitBounds({
    width: window.innerWidth,
    height: window.innerHeight,
    bounds: [[-130.14, 53.96],[-67.12, 19]]
})

// Inset map bounds
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

// hospital and clinic icon mapping
const ICON_MAPPING = {
    hospital: {x: 0, y: 0, width: 128, height: 128},
    clinic: {x: 128, y: 0, width: 128, height: 128},
    invitedVaccineSite: {x: 0, y: 128, width: 128, height: 128},
    participatingVaccineSite: {x: 128, y: 128, width: 128, height: 128},
    megaSite: {x: 256, y: 128, width: 128, height: 128},
  };

// mapbox default style from Json
const defaultMapStyle = fromJS(MAP_STYLE);

// component styling
const MapContainer = styled.div`
    position:absolute;
    left:0;
    top:0;
    width:100%;
    height:100%;
    background:${colors.darkgray};
    overflow:hidden;
    @media (max-width:600px) {
        div.mapboxgl-ctrl-geocoder {
            display:none;
        }
    }
`

const MapButtonContainer = styled.div`
    position: absolute;
    right: ${props => props.infoPanel ? 317 : 10}px;
    bottom: 30px;
    z-index: 10;
    transition: 250ms all;
    @media (max-width:768px) {
        bottom:100px;
    }
    @media (max-width: 400px) {
        transform:scale(0.75) translate(20%, 20%);
    }
`

const NavInlineButtonGroup = styled.div`
    margin-bottom:10px;
    border-radius:4px;
    overflow:hidden;
    -moz-box-shadow: 0 0 2px rgba(0,0,0,.1);
    -webkit-box-shadow: 0 0 2px rgba(0,0,0,.1);
    box-shadow: 0 0 0 2px rgba(0,0,0,.1);
`

const NavInlineButton = styled.button`
    width:29px;
    height:29px;
    padding:5px;
    display:block;
    fill:rgb(60,60,60);
    background-color: ${props => props.isActive ? colors.lightblue : colors.buttongray};
    outline:none;
    border:none;
    transition:250ms all;
    cursor:pointer;
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
    svg {
        transition:250ms all;
        transform:${props => props.tilted ? 'rotate(30deg)' : 'none' };
    }
`

const ShareURL = styled.input`
    position:fixed;
    left:110%;
`

const IndicatorBox = styled.div`
    position:fixed;
    border:1px dashed #FFCE00;
    background:rgba(0,0,0,0.25);
    z-index:5;
`

const GeocoderContainer = styled.div`
    position:fixed;
    right:7px;
    top:7px;
    z-index:500;
    width:250px;
    @media (max-width:600px) {
        display:none;
    }
`

//create your forceUpdate hook
function useForceUpdate(){
    const [, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
}

function MapSection(props){ 
    // fetch pieces of state from store    
    const storedData = useSelector(state => state.storedData);
    const storedGeojson = useSelector(state => state.storedGeojson);
    const currentData = useSelector(state => state.currentData);
    const storedLisaData = useSelector(state => state.storedLisaData);
    const dateIndices = useSelector(state => state.dateIndices);
    const storedCartogramData = useSelector(state => state.storedCartogramData);
    const panelState = useSelector(state => state.panelState);
    const dates = useSelector(state => state.dates);
    const dataParams = useSelector(state => state.dataParams);
    const mapParams = useSelector(state => state.mapParams);
    const urlParams = useSelector(state => state.urlParams);

    // component state elements
    // hover and highlight geographibes
    const [hoverInfo, setHoverInfo] = useState({x:null, y:null, object:null});
    const [highlightGeog, setHighlightGeog] = useState([]);

    // mapstyle and global map mode (WIP)
    // const [globalMap, setGlobalMap] = useState(false);
    const globalMap = false;
    const [mapStyle, setMapStyle] = useState(defaultMapStyle);

    // map view location
    const [viewState, setViewState] = useState({
        latitude: +urlParams.lat || bounds.latitude,
        longitude: +urlParams.lon || bounds.longitude,
        zoom: +urlParams.z || bounds.zoom,
        bearing:0,
        pitch:0
    })
    
    // locally stored data and color values
    // const [currVarId, setCurrVarId] = useState(null);
    
    // async fetched data and cartogram center
    const [resourceLayerData, setResourceLayerData] = useState({
        clinics: [],
        hospitals: [],
        vaccineSites: []
    });
    const [storedCenter, setStoredCenter] = useState(null);
    // share button notification
    const [shared, setShared] = useState(false);
    
    // interaction states
    const [multipleSelect, setMultipleSelect] = useState(false);
    const [boxSelect, setBoxSelect] = useState(false);
    const [boxSelectDims, setBoxSelectDims] = useState({});
    const forceUpdate = useForceUpdate();
    // const [resetSelect, setResetSelect] = useState(null);
    // const [mobilityData, setMobilityData] = useState([]);

    // local data store for parsed data
    const [currentMapData, setCurrentMapData] = useState({
        data: [],
        params: {}
    })

    const dispatch = useDispatch();

    let hidden = null;
    let visibilityChange = null;
    if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support 
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
        hidden = 'msHidden';
        visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
    }

    // shared view broadcast
    useEffect(() => { 

        document.addEventListener(visibilityChange, () => {
            setBoxSelect(false);
            setMultipleSelect(false);
        });

        window.addEventListener('storage', () => {
            // When local storage changes, dump the list to
            // the console.
            const SHARED_GEOID =  localStorage.getItem('SHARED_GEOID').split(',').map(d => parseInt(d))
            
            if (SHARED_GEOID !== null) {
                setHighlightGeog(SHARED_GEOID); 
            }
            
            const SHARED_VIEW =  JSON.parse(localStorage.getItem('SHARED_VIEW'));
            
            if (SHARED_VIEW !== null && SHARED_VIEW.hasOwnProperty('latitude')) {
                setViewState({
                        longitude: SHARED_VIEW.longitude,
                        latitude: SHARED_VIEW.latitude,
                        zoom: SHARED_VIEW.zoom,
                        transitionDuration: 1000,
                        transitionInterpolator: new FlyToInterpolator()
                    })
            }
        });

        window.addEventListener('contextmenu', (e) => {
            dispatch(openContextMenu({
                x:e.pageX,
                y:e.pageY
            }))
        })
    },[])

    // create unique var id -- used only for cartogram data
    // TODO: swap this out...
    // useEffect(() => {
    //     setCurrVarId(getVarId(currentData, dataParams))
    // }, [dataParams, mapParams, currentData, storedLisaData])

    // change map center on viztype change
    useEffect(() => {
        const currMapView = GetMapView();
        switch(mapParams.vizType) {
            case '2D': 
                setViewState({
                    ...currMapView,
                    latitude: +urlParams.lat || bounds.latitude,
                    longitude: +urlParams.lon || bounds.longitude,
                    zoom: +urlParams.z || bounds.zoom,
                    bearing:0,
                    pitch:0
                });
                setStoredCenter(null)
                break
            case '3D':
                setViewState({
                    ...currMapView,
                    latitude: +urlParams.lat || bounds.latitude,
                    longitude: +urlParams.lon || bounds.longitude,
                    zoom: +urlParams.z || bounds.zoom,
                    bearing:-30,
                    pitch:30
                });
                setStoredCenter(null)
                break
            default:
                //
        }
    }, [mapParams.vizType])
    
    // recenter on cartogram 
    // needs a separate rule from the above effect due to state and county cartograms
    // having separate locations
    useEffect(() => {
        if (mapParams.vizType !== 'cartogram') return;
        
        if (storedCartogramData){
            let center = getCartogramCenter(storedCartogramData);

            let roundedCenter = [Math.floor(center[0]),Math.floor(center[1])];
            if (storedCenter === null || roundedCenter[0] !== storedCenter[0]) {
                setViewState({
                    latitude: center[1],
                    longitude: center[0],
                    zoom: currentData.includes('state') ? 6 : 5,
                    bearing:0,
                    pitch:0
                });
                setStoredCenter(roundedCenter)
            }
        }
    }, [storedCartogramData, currentData, mapParams.vizType])

    // change mapbox layer on viztype change or overlay/resource change
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

    }, [mapParams.overlay, mapParams.mapType, mapParams.vizType])
    
    // load in Hospital and clinic data when called
    useEffect(() => {
        if (mapParams.resource.includes('hospital') || mapParams.resource.includes('clinic')) {
            if (!resourceLayerData.hospitals.length) {
                getCSV(`${process.env.PUBLIC_URL}/csv/context_hospitals_covidcaremap.csv`)
                .then(values => setResourceLayerData(prev => ({...prev, hospitals: values})))
            }

            if (!resourceLayerData.clinics.length) {
                getCSV(`${process.env.PUBLIC_URL}/csv/context_fqhc_clinics_hrsa.csv`)
                .then(values => setResourceLayerData(prev => ({...prev, clinics: values})))
            }
        }

        if (mapParams.resource.includes('vaccination')) {
            if (!resourceLayerData.vaccineSites.length) {
                getCSV(`${process.env.PUBLIC_URL}/csv/context_vaccination_sites_hrsa_wh.csv`)
                .then(values => setResourceLayerData(prev => ({...prev, vaccineSites: values})))
                dispatch(setNotification(`
                    <h2>COVID19 Vaccine Access</h2>
                    <p>
                        <br/>
                        Federal Vaccination Sites only include White House/FEMA large vaccination centers and HRSA-supported clinics (FQHCs).
                        <br/><br/>
                        For a more complete listing of places to get the COVID19 vaccine please visit the <a href="https://vaccinefinder.org/search/" target="_blank" rel="noopener noreferrer">CDC VaccineFinder</a> or check your local jurisdiction.
                    </a>
                    </p>
                `))
            }
        }
        
    },[mapParams.resource, resourceLayerData.clinics[0], resourceLayerData.hospitals[0], resourceLayerData.vaccineSites[0]])

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

    // clean and set map data after parameter change
    // TODO: swap
    useEffect(() => {
        switch(mapParams.vizType) {
            case 'cartogram':
                if (storedCartogramData !== undefined) {
                    setCurrentMapData(prev => ({
                        params: getVarId(currentData, dataParams),
                        data: cleanData({
                            data: storedCartogramData,
                            bins: {bins: mapParams.bins.bins, breaks:mapParams.bins.breaks}, 
                            mapType: mapParams.mapType, 
                            vizType: mapParams.vizType
                        })
                    }))
                }
                break;
            default:
                if (storedData[currentData] !== undefined) {
                    setCurrentMapData(prev => ({
                        params: getVarId(currentData, dataParams),
                        data: cleanData({
                            data: storedData[currentData],
                            bins: {bins: mapParams.bins.bins, breaks:mapParams.bins.breaks}, 
                            mapType: mapParams.mapType, 
                            vizType: mapParams.vizType
                        })
                    }))
                }
        }
    },[mapParams.mapType, mapParams.vizType, mapParams.bins.bins, mapParams.bins.breaks, mapParams.binMode, mapParams.fixedScale, mapParams.vizType, mapParams.colorScale, mapParams.customScale, dataParams.nIndex, dataParams.nRange, storedLisaData, storedGeojson[currentData], storedCartogramData, currentData])
    
    useEffect(() => {
        forceUpdate()
    }, [currentMapData.params])
    const GetFillColor = (f, bins, mapType, varID) => {
        if ((!bins.hasOwnProperty("bins")) || (!f.hasOwnProperty(dataParams.numerator))) {
            return [240,240,240,120]
        } else if (mapType === 'lisa') {
            return colorScales.lisa[storedLisaData[storedGeojson[currentData]['geoidOrder'][f.properties.GEOID]]]
        } else {
            return mapFn(dataFn(f[dataParams.numerator], f[dataParams.denominator], dataParams), bins.breaks, mapParams.colorScale, mapParams.mapType, dataParams.numerator);
        }
    }

    const GetSimpleFillColor = (value, geoid, bins, mapType) => {
        if (value===null) {
            return [240,240,240,120]
        } else if (mapType === 'lisa') {
            return colorScales.lisa[storedLisaData[storedGeojson[currentData]['geoidOrder'][geoid]]]
        } else {
            return mapFn(value, bins, mapParams.colorScale, mapParams.mapType, dataParams.numerator);
        }
    }
    
    // const GetFillColors = (data, bins, mapType, varID) => {
    //     let tempObj = {}
    //     for (let i=0; i < data.length; i++) {
    //         tempObj[data[i].properties.GEOID] = GetFillColor(data[i], bins, mapType, varID)
    //     }
    //     return tempObj
    // };

    const cleanData = ( parameters ) => {
        const {data, bins, mapType, varID, vizType} = parameters; //dataName, dataType, params, colorScale
        if ((data === undefined) || (mapType !== 'lisa' && bins.breaks === undefined)) return [];
        var returnArray = [];
        let i = 0;
        switch(vizType) {
            case 'cartogram':
                if (storedGeojson[currentData] === undefined) break;
                while (i < data.length) {
                    const tempGeoid = storedGeojson[currentData]['indexOrder'][data[i].properties?.id]
                    const tempColor = GetSimpleFillColor(data[i].value, tempGeoid, bins.breaks, mapType);
                    returnArray.push({
                        GEOID: tempGeoid,
                        position: data[i].position,
                        color: tempColor,
                        radius: data[i].radius
                    })
                    i++;
                }
                break
            default:
                while (i < data.length) {
                    let tempColor = GetFillColor(data[i], bins, mapType, varID);
                    let tempHeight = GetHeight(data[i]);
                    for (let n=0; n<data[i].geometry.coordinates.length; n++) {
                        returnArray.push({
                            GEOID: data[i].properties.GEOID,
                            geom: data[i].geometry.coordinates[n],
                            color: tempColor,
                            height: tempHeight
                        })
                    }
                    i++;
                }
        }
        return returnArray
    }

    const GetHeight = (f) => dataFn(f[dataParams.numerator], f[dataParams.denominator], dataParams)*(dataParams.scale3D/((dataParams.nType === "time-series" && dataParams.nRange === null) ? (dataParams.nIndex)/10 : 1))

    const GetMapView = () => {
        try {
            const currView = deckRef.current.deck.viewState.MapView
            return currView || {...viewState}
        } catch {
            return {...viewState}
        }
    }
    
    const mapRef = useRef();
    const deckRef = useRef({
        deck: {
            viewState: {
                MapView: {
                    ...viewState
                }
            }
        }
    });

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
        if (e.target.selectionStart === undefined){
            if (e.ctrlKey) setMultipleSelect(true);
            if (e.shiftKey) setBoxSelect(true);
        }
    }

    const handleKeyUp = (e) => {
        if (e.target.selectionStart === undefined){
            if (!e.ctrlKey) setMultipleSelect(false);
            if (!e.shiftKey) setBoxSelect(false);
        }
    }

    const handleMapHover = ({x, y, object, layer}) => {
        dispatch(setTooltipContent(x, y, Object.keys(layer?.props).indexOf('getIcon')!==-1 ? object : find(storedData[currentData],o => o.properties.GEOID === object?.GEOID)))
        // setHoverInfo(
        //     {
        //         x, 
        //         y, 
        //         object: Object.keys(layer?.props).indexOf('getIcon')!==-1 ? object : find(storedData[currentData],o => o.properties.GEOID === object?.GEOID) //layer.props?.hasOwnProperty('getIcon') ? object : 
        //     }
        // )
    }

    const handleMapClick = (info, e) => {
        if (e.rightButton) return;
        let tempData = storedData[currentData][storedData[currentData].findIndex(o => o.properties.GEOID === info.object?.GEOID)]        
        const dataName = tempData.properties.hasOwnProperty('state_abbr') ? `${tempData.properties.NAME}, ${tempData.properties.state_abbr}` : `${tempData.properties.NAME}`
        
        if (multipleSelect) {
            try {
                if (highlightGeog.indexOf(info.object?.GEOID) === -1) {
                    let GeoidList = [...highlightGeog, info.object?.GEOID]
                    setHighlightGeog(GeoidList); 
                    dispatch(
                        appendSelectionData({
                            values: getDataForCharts(
                                [tempData], 
                                'cases', 
                                dateIndices[currentData]['cases'], 
                                dates, 
                                dataName
                            ),
                            name: dataName,
                            index: findIndex(storedData[currentData], o => o.properties.GEOID === info.object?.GEOID)
                        })
                    );
                    window.localStorage.setItem('SHARED_GEOID', GeoidList);
                    window.localStorage.setItem('SHARED_VIEW', JSON.stringify(GetMapView()));
                } else {
                    if (highlightGeog.length > 1) {
                        let tempArray = [...highlightGeog];
                        let geogIndex = tempArray.indexOf(info.object?.GEOID);
                        tempArray.splice(geogIndex, 1);
                        setHighlightGeog(tempArray);
                        dispatch(
                            removeSelectionData({
                                name: dataName,
                                index: findIndex(storedData[currentData], o => o.properties.GEOID === info.object?.GEOID)
                            })
                        )
                        window.localStorage.setItem('SHARED_GEOID', tempArray);
                        window.localStorage.setItem('SHARED_VIEW', JSON.stringify(GetMapView()));
                    }
                }
            } catch {}
        } else {
            try {
                setHighlightGeog([info.object?.GEOID]); 
                dispatch(
                    setSelectionData({
                        values: getDataForCharts(
                            [tempData], 
                            'cases', 
                            dateIndices[currentData]['cases'], 
                            dates, 
                            dataName
                        ),
                        name: dataName,
                        index: findIndex(storedData[currentData], o => o.properties.GEOID === info.object?.GEOID)
                    })
                );
                window.localStorage.setItem('SHARED_GEOID', info.object?.GEOID);
                window.localStorage.setItem('SHARED_VIEW', JSON.stringify(GetMapView()));
            } catch {}
        }
    }

    const handleGeolocate = async () => {
        navigator.geolocation.getCurrentPosition( position => {
            setViewState({
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude,
                    zoom:7,
                    transitionDuration: 1000,
                    transitionInterpolator: new FlyToInterpolator()
                })
        }) 
    }

    const handleZoom = (zoom) => {
        const currMapView = GetMapView()
        setViewState({
                ...currMapView,
                zoom: currMapView.zoom + zoom,
                transitionDuration: 250,
                transitionInterpolator: new FlyToInterpolator()
            })
    }
    
    const resetTilt = () => {
        const currMapView = GetMapView()
        setViewState({
                ...currMapView,
                bearing:0,
                pitch:0,
                transitionDuration: 250,
                transitionInterpolator: new FlyToInterpolator()
            })
    }
    const handleGeocoder = useCallback(location => {
        if (location.center !== undefined) {
            let center = location.center;
            let zoom = 6;

            if (location.bbox) {
                let bounds = fitBounds({
                    width: window.innerWidth,
                    height: window.innerHeight,
                    bounds: [[location.bbox[0],location.bbox[1]],[location.bbox[2],location.bbox[3]]]
                })
                center = [bounds.longitude, bounds.latitude];
                zoom = bounds.zoom*.9;
            };

            setViewState({
                longitude: center[0],
                latitude: center[1],
                zoom: zoom,
                bearing:0,
                pitch:0,
                transitionDuration: 'auto',
                transitionInterpolator: new FlyToInterpolator()
            })
        }  
      }, []);

    const FullLayers = {
        choropleth: new PolygonLayer({
            id: 'choropleth',
            data: currentMapData.data,
            getFillColor: d => d.color,
            getPolygon: d => d.geom,
            getElevation: d => d.height,
            pickable: true,
            stroked: false,
            filled: true,
            wireframe: mapParams.vizType === '3D',
            extruded: mapParams.vizType === '3D',
            opacity: 0.8,
            material:false,
            onHover: handleMapHover,
            onClick: handleMapClick,            
            updateTriggers: {
                getPolygon: [currentMapData.params, dataParams.variableName, mapParams.mapType, mapParams.bins.bins, mapParams.bins.breaks, mapParams.binMode, mapParams.fixedScale, mapParams.vizType, mapParams.colorScale, mapParams.customScale, dataParams.nIndex, dataParams.nRange, storedLisaData, currentData],
                getElevation: [currentMapData.params, dataParams.variableName, mapParams.mapType, mapParams.bins.bins, mapParams.bins.breaks, mapParams.binMode, mapParams.fixedScale, mapParams.vizType, mapParams.colorScale, mapParams.customScale, dataParams.nIndex, dataParams.nRange, storedLisaData, currentData],
                getFillColor: [currentMapData.params, dataParams.variableName, mapParams.mapType, mapParams.bins.bins, mapParams.bins.breaks, mapParams.binMode, mapParams.fixedScale, mapParams.vizType, mapParams.colorScale, mapParams.customScale, dataParams.nIndex, dataParams.nRange, storedLisaData, currentData],
            }
        }),
        choroplethHighlight:  new PolygonLayer({
            id: 'highlightLayer',
            data: currentMapData.data,
            getPolygon: d => d.geom,
            getLineColor: d => highlightGeog.indexOf(d.GEOID)!==-1 ? [0, 104, 109] : [0, 104, 109, 0], 
            opacity: 0.8,
            material:false,
            pickable: false,
            stroked: true,
            filled:false,
            lineWidthScale: 500,
            getLineWidth:  5, 
            lineWidthMinPixels: 1,
            lineWidthMaxPixels: 10,
            updateTriggers: {
                getPolygon: currentData,
                getLineColor: highlightGeog
            }
        }),
        choroplethHover: new PolygonLayer({
            id: 'hoverHighlightlayer',    
            data: currentMapData.data,
            getPolygon: d => d.geom,
            getLineColor: d => hoverInfo?.object?.properties?.GEOID === d.GEOID ? [50, 50, 50] : [50, 50, 50, 0], 
            getElevation: d => d.height,
            pickable: false,
            stroked: true,
            filled:false,
            wireframe: mapParams.vizType === '3D',
            extruded: mapParams.vizType === '3D',
            lineWidthScale: 500,
            getLineWidth: 5,
            lineWidthMinPixels: 2,
            lineWidthMaxPixels: 10,
            updateTriggers: {
                getPolygon: currentData,
                getLineColor: hoverInfo.object,
                getElevation: [currentMapData.data, mapParams.mapType, mapParams.bins.bins, mapParams.bins.breaks, mapParams.binMode, mapParams.fixedScale, mapParams.vizType, mapParams.colorScale, mapParams.customScale, dataParams.nIndex, dataParams.nRange, storedLisaData, currentData],
                extruded: mapParams.vizType
            }
        }),
        hospitals: new IconLayer({
            id: 'hospital-layer',
            data: resourceLayerData.hospitals,
            pickable:true,
            iconAtlas: `${process.env.PUBLIC_URL}/assets/img/icon_atlas.png`,
            iconMapping: ICON_MAPPING,
            getIcon: d => 'hospital',
            getPosition: d => [d.Longitude, d.Latitude],
            sizeUnits: 'meters',
            getSize: 20000,
            sizeMinPixels:12,
            sizeMaxPixels:24,
            updateTriggers: {
                data: [mapParams.resource, resourceLayerData]
            },
            onHover: handleMapHover,
        }),
        clinic: new IconLayer({
            id: 'clinics-layer',
            data: resourceLayerData.clinics,
            pickable:true,
            iconAtlas: `${process.env.PUBLIC_URL}/assets/img/icon_atlas.png`,
            iconMapping: ICON_MAPPING,
            getIcon:  d => 'clinic',
            getSize: 20000,
            getPosition: d => [d.lon, d.lat],
            sizeUnits: 'meters',
            sizeMinPixels:7,
            sizeMaxPixels:20,
            updateTriggers: {
                data: [mapParams.resource, resourceLayerData.clinics]
            },
            onHover: handleMapHover,
        }),
        vaccinationSites: new IconLayer({
            id: 'vaccine-sites-layer',
            data: resourceLayerData.vaccineSites,
            pickable:true,
            iconAtlas: `${process.env.PUBLIC_URL}/assets/img/icon_atlas.png`,
            iconMapping: ICON_MAPPING,
            getIcon: d => d.type === 0 ? 'invitedVaccineSite' : d.type === 1 ? 'participatingVaccineSite' : d.type === 3 ? 'megaSite' : '',
            getSize: d => d.type === 3 ? 200000 : 1000,
            getPosition: d => [d.lon, d.lat],
            sizeUnits: 'meters',
            sizeMinPixels:20,
            sizeMaxPixels:60,
            updateTriggers: {
                data: resourceLayerData.vaccineSites
            },
            onHover: handleMapHover,
        }),
        cartogramBackground: new PolygonLayer({
            id: 'background',
            data: [
                // prettier-ignore
                [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]
            ],
            opacity: 1,
            getPolygon: d => d,
            stroked: false,
            filled: true,
            getFillColor: [10,10,10],
        }),
        cartogram: new ScatterplotLayer({
            id: 'cartogram layer',
            data: currentMapData.data,
            pickable:true,
            getPosition: f => f.position,
            getFillColor: f => f.color,
            getRadius: f => f.radius,  
            onHover: handleMapHover,
            radiusScale: currentData.includes('state') ? 9 : 6,
            updateTriggers: {
                getPosition: currentMapData,
                getFillColor: currentMapData,
                getRadius: currentMapData
            },
          }),
        cartogramText: new TextLayer({
            id: 'cartogram text layer',
            data: currentMapData.data,
            getPosition: f => f.position,
            getSize: f => f.radius,
            sizeScale: 4,
            backgroundColor: [240,240,240],
            pickable:false,
            visible: currentData.includes('state'),
            sizeUnits: 'meters',
            fontWeight: 'bold',
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center',
            maxWidth: 500,
            wordBreak: 'break-word',
            getText: f => find(storedData[currentData], o => o.properties.GEOID === f.GEOID)?.properties?.NAME,
            updateTriggers: {
                getPosition: [storedCartogramData, mapParams.vizType],
                getFillColor: [storedCartogramData, mapParams.vizType],
                getize: [storedCartogramData, mapParams.vizType],
                getRadius: [storedCartogramData, mapParams.vizType]
            },
        }),
    }

    const getLayers = useCallback((layers, vizType, overlays, resources, currData) => {
        var LayerArray = []

        if (vizType === 'cartogram') {
            LayerArray.push(layers['cartogramBackground'])
            LayerArray.push(layers['cartogram'])
            LayerArray.push(layers['cartogramText'])
            return LayerArray
        } else if (vizType === '2D') {
            LayerArray.push(layers['choropleth'])
            LayerArray.push(layers['choroplethHighlight'])
            LayerArray.push(layers['choroplethHover'])
        } else if (vizType === '3D') {
            LayerArray.push(layers['choropleth'])
            LayerArray.push(layers['choroplethHover'])
        }

        if (resources && resources.includes('hospital')) LayerArray.push(layers['hospitals'])
        if (resources && resources.includes('clinic')) LayerArray.push(layers['clinic'])
        if (resources && resources.includes('vaccinationSites')) LayerArray.push(layers['vaccinationSites'])
        
        return LayerArray

    })

    const view = new MapView({repeat: true});
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
        setBoxSelectDims({
            x:-50,
            y:-50,
            ox:0,
            oy:0,
            width:0,
            height:0
        })
        setBoxSelect(false)
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
                    if (GeoidList.indexOf(features[i].object?.GEOID) !== -1) continue
                    const tempGEOID = features[i].object?.GEOID
                    const tempData = storedData[currentData][storedData[currentData].findIndex(o => o.properties.GEOID === tempGEOID)]        
                    const dataName = tempData.properties.hasOwnProperty('state_abbr') ? `${tempData.properties.NAME}, ${tempData.properties.state_abbr}` : `${tempData.properties.NAME}`
                    GeoidList.push(tempGEOID)                    
                    
                    if (i===0){
                        dispatch(
                            setSelectionData({
                                values: getDataForCharts(
                                    [tempData], 
                                    'cases', 
                                    dateIndices[currentData]['cases'], 
                                    dates, 
                                    dataName
                                ),
                                name: dataName,
                                index: findIndex(storedData[currentData], o => o.properties.GEOID === tempGEOID)
                            })
                        );
                    } else {
                        dispatch(
                            appendSelectionData({
                                values: getDataForCharts(
                                    [tempData], 
                                    'cases', 
                                    dateIndices[currentData]['cases'], 
                                    dates, 
                                    dataName
                                ),
                                name: dataName,
                                index: findIndex(storedData[currentData], o => o.properties.GEOID === tempGEOID)
                            })
                        );
                    }
                }
                setHighlightGeog(GeoidList); 
                window.localStorage.setItem('SHARED_GEOID', GeoidList);
                window.localStorage.setItem('SHARED_VIEW', JSON.stringify(GetMapView()));
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
                <IndicatorBox style={{
                    left:boxSelectDims.x, 
                    top:boxSelectDims.y, 
                    width: boxSelectDims.width,
                    height: boxSelectDims.height}}
                    />
            }
            <DeckGL
                layers={getLayers(FullLayers, mapParams.vizType, mapParams.overlay, mapParams.resource, currentData)}
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
                        scrollZoom: true,
                        // inertia: 50
                    }
                }
                views={view}
                pickingRadius={20}
                onAfterRender={() => console.log('rendered')}

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
                    // onViewportChange={() => hoverInfo.x !== null ? setHoverInfo({x:null, y:null, object:null}) : ''}
                    // onViewportChange={viewState  => console.log(mapRef.current.props.viewState)} 
                    onLoad={() => {
                        dispatch(setMapLoaded(true))
                    }}
                    >
                </MapboxGLMap >
            </DeckGL>
            <MapButtonContainer 
                infoPanel={panelState.info}
            >
                <NavInlineButtonGroup>
                    <NavInlineButton
                        title="Selection Box"
                        id="boxSelect"
                        isActive={boxSelect}
                        onClick={() => handleSelectionBoxStart()}
                    >
                        {SVG.selectRect}
                    </NavInlineButton>
                </NavInlineButtonGroup>
                <NavInlineButtonGroup>
                    <NavInlineButton
                        title="Geolocate"
                        id="geolocate"
                        onClick={() => handleGeolocate()}
                    >
                        {SVG.locate}
                    </NavInlineButton>
                </NavInlineButtonGroup>
                
                <NavInlineButtonGroup>
                    <NavInlineButton
                    
                        title="Zoom In"
                        id="zoomIn"
                        onClick={() => handleZoom(0.5)}
                    >
                        {SVG.plus}
                    </NavInlineButton>
                    <NavInlineButton
                        title="Zoom Out"
                        id="zoomOut"
                        onClick={() => handleZoom(-0.5)}
                    >
                        {SVG.minus}
                    </NavInlineButton>
                    <NavInlineButton
                        title="Reset Tilt"
                        id="resetTilt"
                        tilted={deckRef.current?.deck.viewState?.MapView?.bearing !== 0 || deckRef.current?.deck.viewState?.MapView?.pitch !== 0}
                        onClick={() => resetTilt()}
                    >
                        {SVG.compass}
                    </NavInlineButton>
                </NavInlineButtonGroup>
                <NavInlineButtonGroup>
                    <NavInlineButton
                        title="Share this Map"
                        id="shareButton"
                        shareNotification={shared}
                        onClick={() => handleShare({mapParams, dataParams, currentData, coords: GetMapView(), lastDateIndex: dateIndices[currentData][dataParams.numerator]})}
                    >
                        {SVG.share}
                    </NavInlineButton>
                </NavInlineButtonGroup>
                <ShareURL type="text" value="" id="share-url" />
            </MapButtonContainer>
            <GeocoderContainer>
                <Geocoder 
                    id="Geocoder"
                    placeholder={"Search by location"}
                    API_KEY={MAPBOX_ACCESS_TOKEN}
                    onChange={handleGeocoder}
                />
            </GeocoderContainer>
        </MapContainer>
    ) 
}

export default MapSection