import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Switch from '@material-ui/core/Switch';

import styled from 'styled-components';

import { colLookup } from '../utils'; //getGzipData, getArrayCSV
import Tooltip from './tooltip';
import { StyledDropDown, BinsContainer } from '../styled_components';
import { setVariableParams, setMapParams, setCurrentData, setPanelState, setParametersAndData } from '../actions'; //variableChangeZ, setNotification, storeMobilityData
import { fixedScales, colorScales, colors } from '../config';
import { settings } from '../config/svg';
import { variableTree } from '../config/variableTree'

const VariablePanelContainer = styled.div`
  position:fixed;
  left:0;
  top:50px;
  height:auto;
  min-height:calc(100vh - 50px);
  min-width:200px;
  background-color: ${colors.gray}fa;
  box-shadow: 2px 0px 5px rgba(0,0,0,0.7);
  padding:0;
  box-sizing: border-box;
  transition:250ms all;
  font: 'Lato', sans-serif;
  color:white;
  z-index:50;
  &.hidden {
    transform: translateX(-100%);
  }
  @media (max-width:1024px) {
    min-width:50vw;
  }  
  @media (max-width:600px) {
    width:100%;
    display: ${props => props.otherPanels ? 'none' : 'initial'};
  }
  div.noteContainer {
    position: absolute;
    bottom:0;
    left:0;
    padding:20px;
    box-sizing:border-box;
    background:${colors.gray};
    width:calc(100%);
    box-shadow: 0px -5px 10px rgba(0,0,0,0.25);
    a {  
      color: ${colors.yellow};
      -webkit-text-decoration: none;
      text-decoration: none;
      }
    }
  }
  p.note {
    font-family: 'Lato', sans-serif;
    font-weight:300;
    font-size:90%;
  }
  div.poweredByGeoda {
    color:white;
    width:100%;
    text-align:center;
    @media (max-height:900px){
    }
    a {
      color:white;
      margin:0 auto;
      text-decoration: none;
      letter-spacing: 2px;
      font-size:75%;
      img {
        width:23px;
        height:27px;
        transform: translate(-50%,40%);
      }
    }
  }
  button#showHideLeft {
    position:absolute;
    left:95%;
    top:20px;
    width:40px;
    height:40px;
    box-sizing:border-box;
    padding:0;
    margin:0;
    background-color: ${colors.gray};
    box-shadow: 0px 0px 6px rgba(0,0,0,1);
    outline:none;
    border:none;
    cursor: pointer;
    transition:500ms all;
    svg { 
      width:20px;
      height:20px;
      margin:10px 0 0 0;
      @media (max-width:600px){
        width:20px;
        height:20px;
        margin:5px;
      }
      fill:white;
      transform:rotate(0deg);
      transition:500ms all;
      .cls-1 {
        fill:none;
        stroke-width:6px;
        stroke:white;
      }
    }
    :after {
      opacity:0;
      font-weight:bold;
      content: 'Variables';
      color:white;
      position: relative;
      right:-50px;
      top:-22px;
      transition:500ms all;
      z-index:4;
    }
    @media (max-width:768px){
      top:120px;
    }
    @media (max-width:600px) {
      left:90%;
      width:30px;
      height:30px;
      top:140px;
      :after {
        display:none;
      }
    }
  }
  button#showHideLeft.hidden {
    left:100%;
    svg {
      transform:rotate(90deg);
    }
    :after {
      opacity:1;
    }
  }
`
const StyledButtonGroup = styled(ButtonGroup)`
  color:white;
  padding-bottom:20px;
  .MuiButtonGroup-grouped {
    color:white;
    border-color:${colors.white}77;
    &:hover {
      border-color:white;
    }
    &.active {
      background:white;
      color:${colors.gray};
    }
  }
`

const DateSelectorContainer = styled.div`
  opacity:${props => props.disabled ? 0.25 : 1};
  pointer-events:${props => props.disabled ? 'none' : 'initial'};
`

const TwoUp = styled.div`
  width:100%;
  .MuiFormControl-root {
    width:45%;
    min-width:60px;
    margin-right:5px;
  }
`

const ControlsContainer = styled.div`
  max-height:74vh;
  overflow-y:visible;
  box-sizing:border-box;
  padding:20px;

  @media (max-height:1079px){
    overflow-y:scroll;
    padding:20px 20px 25vh 20px;
  }
  
  @media (max-width:600px) {
    width:100%;
    padding:0 10px 25vh 10px;
  }
`

const ListSubheader = styled(MenuItem)`
  font-variant: small-caps;
  font-weight:800;
`

const VariablePanel = (props) => {

  // const getGzipAndCentroids = async (gzipUrl, centroidsUrl) => {
  //   Promise.all([
  //       getGzipData(gzipUrl),
  //       getArrayCSV(centroidsUrl)
  //     ]).then(
  //       values => dispatch(storeMobilityData({centroids: values[1], flows: values[0]}))
  //   )
  // } 

  const dispatch = useDispatch();    

  const { cols, currentData,  dataParams, mapParams, panelState, urlParams } = useSelector(state => state); 
  // currentVariable, currentZVariable, storedMobilityData
  const [bivariateZ, setBivariateZ] = useState(false);

  const VariablePresets = {
    "HEADER:cases":{},
    "Confirmed Count": {
        variableName:"Confirmed Count",
        numerator: 'cases',
        nType: 'time-series',
        nProperty: null,
        denominator: 'properties',
        dType: null,
        dProperty: null,
        dRange:null,
        dIndex:null,
        scale:1,
        scale3D: 100,
        fixedScale: null,
        colorScale: null,
    },
    "Confirmed Count per 100K Population": {
        variableName:"Confirmed Count per 100K Population",
        numerator: 'cases',
        nType: 'time-series',
        nProperty: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100000,
        scale3D: 1000,
        fixedScale: null,
        colorScale: null,
    },
    "Confirmed Count per Licensed Bed": {
        variableName:"Confirmed Count per Licensed Bed",
        numerator: 'cases',
        nType: 'time-series',
        nProperty: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'beds',
        dRange:null,
        dIndex:null,
        scale:1,
        scale3D: 100000,
        fixedScale: null,
        colorScale: null,
    },
    "HEADER:deaths":{},
    "Death Count":{
      variableName:"Death Count",
      numerator: 'deaths',
      nType: 'time-series',
      nProperty: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      scale3D: 10000,
      fixedScale: null,
      colorScale: null,        
    }, 
    "Death Count per 100K Population":{
      variableName:"Death Count per 100K Population",
      numerator: 'deaths',
      nType: 'time-series',
      nProperty: null,
      denominator: 'properties',
      dType: 'characteristic',
      dProperty: 'population',
      dRange:null,
      dIndex:null,
      scale:100000,
      scale3D: 15000,
      fixedScale: null,
      colorScale: null,
    },
    "Death Count / Confirmed Count":{
      variableName:"Death Count / Confirmed Count",
      numerator: 'deaths',
      nType: 'time-series',
      nProperty: null,
      denominator: 'cases',
      dType: 'time-series',
      dProperty: null,
      scale:1,
      fixedScale: null,
      colorScale: null,
    },
    "HEADER:community health":{},
    "Uninsured %":{
      variableName:"Uninsured %",
      numerator: 'chr_health_factors',
      nType: 'characteristic',
      nProperty: colLookup(cols, currentData, 'chr_health_factors', 'UnInPrc'),
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: null,
      colorScale: 'uninsured',
      scale3D: 15000,
    },
    "Over 65 Years %":{
      variableName:"Over 65 Years %",
      numerator: 'chr_health_context',
      nType: 'characteristic',
      nProperty: colLookup(cols, currentData, 'chr_health_context', 'Over65YearsPrc'),
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: null,
      colorScale: 'over65',
      scale3D: 15000,
    },
    "Life Expectancy":{
      variableName:"Life Expectancy",
      numerator: 'chr_life',
      nType: 'characteristic',
      nProperty: colLookup(cols, currentData, 'chr_life', 'LfExpRt'),
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      colorScale: 'lifeExp',
      fixedScale: null,
      scale3D: 1000
    },
    
    "HEADER:testing":{},
    "7 Day Testing Positivity Rate %": {
      variableName:"7 Day Testing Positivity Rate %",
      numerator: 'testing_wk_pos',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: 'testing',
      colorScale: 'testing',
      scale3D: 10000000
    },
    "7 Day Testing Capacity": {
      variableName:"7 Day Testing Capacity",
      numerator: 'testing_tcap',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: 'testingCap',
      colorScale: 'testingCap',
      scale3D: 3000
    }, 
    "7 Day Confirmed Cases per Testing %":{
      variableName:"7 Day Confirmed Cases per Testing %",
      numerator: 'testing_ccpt',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: 'testing',
      colorScale: 'testing',
      scale3D: 10000000
    },
    "HEADER:cdc vaccination":{},
    "Vaccinations Administered per 100K Population": {
        variableName:"Vaccinations Administered per 100K Population",
        numerator: 'vaccinesAdmin',
        nType: 'time-series',
        nProperty: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100000,
        scale3D: 1000,
        colorScale: 'vaccination',
        fixedScale: null,
    },
    "Vaccinations Distributed per 100K Population": {
        variableName:"Vaccinations Distributed per 100K Population",
        numerator: 'vaccinesDist',
        nType: 'time-series',
        nProperty: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100000,
        scale3D: 1000,
        colorScale: 'vaccination',
        fixedScale: null,
    },
    "HEADER:forecasting":{},
    "Forecasting (5-Day Severity Index)": {
      variableName:"Forecasting (5-Day Severity Index)",
      numerator: 'predictions',
      nType: 'characteristic',
      nProperty: colLookup(cols, currentData, 'predictions', 'severity_index'),
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      colorScale: 'forecasting',
      fixedScale: 'forecasting',
      scale3D: 50000
    },
  }

  // mobility variable overlays

  // const OneP3AVariables = {
  //   "HEADER:mobility":{},
  //   "Dex": {
  //       numerator: 'dex',
  //       nType: 'time-series',
  //       nProperty: null,
  //       denominator: 'properties',
  //       dType: null,
  //       dProperty: null,
  //       dRange:null,
  //       dIndex:null,
  //       scale:1,
  //       scale3D: 1000
  //   },
  //   "Dex Adjusted": {
  //       numerator: 'dex_a',
  //       nType: 'time-series',
  //       nProperty: null,
  //       denominator: 'properties',
  //       dType: null,
  //       dProperty: null,
  //       dRange:null,
  //       dIndex:null,
  //       scale:1,
  //       scale3D: 1000
  //   },
  // }

  // useEffect(() => {
  //   if (urlParams.var) handleVariable({event: { target: { 
  //     value: legacyVariableOrder[urlParams.src||'county_usfacts.geojson'][urlParams.var]
  //     }}})
  // },[])

  // useEffect(() => {
  //   if (mapParams.overlay === "mobility-county" && storedMobilityData === {}) {
  //     getGzipAndCentroids(
  //       `${process.env.PUBLIC_URL}/gz/county_lex_2020-11-28.csv.gz`,
  //       `${process.env.PUBLIC_URL}/csv/county_centroids.csv`
  //     )
  //     console.log('loaded mobility data')
  //   }
  // },[mapParams.overlay])

  // const handleVariable = (event) => {
  //   let variable = event.target.value;
  //   let tempParams = PresetVariables[variable] || CountyVariables[variable] || StateVariables[variable] || OneP3AVariables[variable] || CDCVariables[variable] || null;
    
  //   // dispatch(variableChange({
  //   //   variable,
  //   //   mapParams: {
  //   //     customScale: tempParams.colorScale || '', 
  //   //     fixedScale: tempParams.fixedScale || null
  //   //   },
  //   //   variableParams: {
  //   //     ...tempParams
  //   //   }
  //   // }))

  //   // transitioning from a static characteristic (null time range)
  //   // to a time-series data set 
  //   if (dataParams.nType === 'characteristic' && tempParams.nType === 'time-series') tempParams.nRange = 7;

  //   // if time series over time series, coordinate index and range
  //   if (tempParams.nType === 'time-series' && tempParams.dType === 'time-series') {
  //     tempParams.dIndex = dataParams.nIndex;
  //     tempParams.dRange = tempParams.nRange || dataParams.nRange;
  //   }


  //   dispatch(setVariableParams({...tempParams}))
  //   dispatch(setVariableName(variable))
  //   dispatch(setMapParams({customScale: tempParams.colorScale || '', fixedScale: tempParams.fixedScale || null}))
  // };

  // const handleZVariable = (event) => {
  //   let variable = event.target.value;
  //   let tempParams = PresetVariables[variable] || CountyVariables[variable] || StateVariables[variable] || OneP3AVariables[variable] || CDCVariables[variable] || null;
    
  //   // transitioning from a static characteristic (null time range)
  //   if (dataParams.zAxisParams?.nType === 'characteristic' && tempParams.nType === 'time-series') tempParams.nRange = 7;
    
  //   // to a time-series data set 

  //   // if time series over time series, coordinate index and range
  //   if (tempParams.nType === 'time-series' && tempParams.dType === 'time-series') {
  //     tempParams.dIndex = dataParams.nIndex;
  //     tempParams.dRange = tempParams.nRange || dataParams.nRange;
  //   }
    
  //   dispatch(variableChangeZ(variable, tempParams))
  // };

  // const handleDataSource = (event) => {
  //   let newDataSet = event.target.value
  //   if ((newDataSet.includes("state") && CountyVariables.hasOwnProperty(currentVariable))||(newDataSet.includes("county") && StateVariables.hasOwnProperty(currentVariable))) {

  //     // dispatch(resetVariable({
  //     //   mapParams: {
  //     //     customScale: '', 
  //     //     fixedScale: null
  //     //   },
  //     //   variableParams: {
  //     //     ...PresetVariables["Confirmed Count per 100K Population"]
  //     //   },
  //     //   variable: "Confirmed Count per 100K Population",
  //     //   notification: `${dataPresets[newDataSet].plainName} data do not have ${currentVariable}. The Atlas will default to Confirmed Cases Per 100k People.`
  //     // }))

  //     dispatch(setMapParams({customScale: '', fixedScale: null}))
  //     dispatch(setVariableParams({...PresetVariables["Confirmed Count per 100K Population"]}))
  //     dispatch(setVariableName("Confirmed Count per 100K Population"))
  //     dispatch(setNotification(`${dataPresets[newDataSet].plainName} data do not have ${currentVariable}. The Atlas will default to Confirmed Cases Per 100k People.`))  

  //     setTimeout(() => {dispatch(setCurrentData(newDataSet))}, 250);
  //     setTimeout(() => {dispatch(setNotification(null))},10000);
  //   } else if (newDataSet.includes("cdc")) {
  //     dispatch(setVariableParams({...CDCVariables["7-Day Confirmed Count per 100K Population"]}))
  //     dispatch(setVariableName("7-Day Confirmed Count per 100K Population"))
  //     dispatch(setNotification(`CDC County Data is aggregated to 7-Day rolling averages. The Atlas will default to 7-Day rolling average Confirmed Cases Per 100k People.`))  
  //     setTimeout(() => {dispatch(setCurrentData(newDataSet))}, 250);
  //     setTimeout(() => {dispatch(setNotification(null))},10000);
  //   } else if (currentData.includes('cdc')) {
  //     dispatch(setMapParams({customScale: '', fixedScale: null}))
  //     dispatch(setVariableParams({...PresetVariables["Confirmed Count per 100K Population"]}))
  //     dispatch(setVariableName("Confirmed Count per 100K Population"))
  //     dispatch(setNotification(`Changing to ${dataPresets[newDataSet].plainName} data. CDC County Data is aggregated to 7-Day rolling averages. The Atlas will default to Confirmed Cases Per 100k People.`))  

  //     setTimeout(() => {dispatch(setCurrentData(newDataSet))}, 250);
  //     setTimeout(() => {dispatch(setNotification(null))},10000);
  //   }
    
  //     else {
  //     dispatch(setCurrentData(newDataSet)); 
  //   }
  // };


  const handleMapType = (event, newValue) => {
    let nBins = newValue === 'hinge15_breaks' ? 6 : 8
    if (newValue === 'lisa') {
      dispatch(
        setMapParams(
          {
            mapType: newValue,
            nBins: 4,
            bins: fixedScales[newValue],
            colorScale: colorScales[newValue]
            
          }
        )
      )
    } else {
      dispatch(
        setMapParams(
          {
            nBins,
            mapType: newValue,
            binMode: newValue === 'hinge15_breaks' ? 'dynamic' : ''
          }
        )
      )
    }
  }

  const handleMapOverlay = (event) =>{
    dispatch(
      setMapParams(
        {
          overlay: event.target.value
        }
      )
    )
  }

  const handleMapResource = (event) =>{
    dispatch(
      setMapParams(
        {
          resource: event.target.value
        }
      )
    )
  }

  const handleOpenClose = () => {
    if (panelState.variables) {
      dispatch(setPanelState({variables:false}))
    } else {
      dispatch(setPanelState({variables:true}))
    }
  }

  const handleVizTypeButton = (vizType) => {
    setBivariateZ(false)
    if (mapParams.vizType !== vizType) {
      dispatch(setMapParams({vizType}))
    }
  }

  // const handleZSwitch = () => {
  //   setBivariateZ(prev => !prev )
  // }
  
  const datasetTree = {
    'County': {
      '1point3acres':'county_1p3a.geojson',
      'New York Times':'county_nyt.geojson',
      'USA Facts':'county_usfacts.geojson',
      'CDC':'cdc.geojson',
      'Yu Group at Berkeley':'county_usfacts.geojson',
      'County Health Rankings':'county_usfacts.geojson',
    }, 
    'State': {
      '1point3acres':'state_1p3a.geojson',
      'New York Times':'state_nyt.geojson',
      'CDC':'state_1p3a.geojson',
      'County Health Rankings':'state_1p3a.geojson',
    }
  }

  const urlParamsTree = {
    'county_usfacts.geojson': {
      name: 'USA Facts',
      geography: 'County'
    },
    'county_1p3a.geojson': {
      name: '1point3acres',
      geography: 'County'
    },
    'county_nyt.geojson': {
      name: 'New York Times',
      geography: 'County'
    },
    'state_1p3a.geojson': {
      name: '1point3acres',
      geography: 'State'
    },
    'state_usafacts.geojson': {
      name: 'USA Facts',
      geography: 'State'
    }, 
    'state_nyt.geojson': {
      name: 'New York Times',
      geography: 'State'
    },
    'global_jhu.geojson': {
      name: 'John Hopkins University',
      geography: 'Global'
    },
    'cdc.geojson': {
      name: 'CDC',
      geography: 'County'
    }
  }

  const [newVariable, setNewVariable] = useState("Confirmed Count per 100K Population");
  const [currentGeography, setCurrentGeography] = useState('County');
  const [currentDataset, setCurrentDataset] = useState('1point3acres');

  useEffect(() => {
    if (newVariable !== dataParams.variableName) {
      setNewVariable(dataParams.variableName)
      setCurrentGeography(urlParamsTree[currentData]['geography'])
      if (dataParams.variableName.indexOf('Vaccin') !== -1 || (dataParams.variableName.indexOf('Test') !== -1 && currentData.indexOf('state') === -1)) {
        setCurrentDataset('CDC')
      } else {
        setCurrentDataset(urlParamsTree[currentData]['name'])
      }
    }
  }, [urlParams])
  

  const handleNewVariable = (e) => {
    let tempGeography = currentGeography;
    let tempDataset = currentDataset;

    let resetDateRange = 
    VariablePresets[e.target.value].nType === 'time-series' && 
    (dataParams.nType === 'characteristic' || dataParams.variableName.indexOf("Testing") !== -1) && 
    dataParams.nRange === null &&
    VariablePresets[e.target.value].variableName.indexOf("Testing") === -1 && VariablePresets[e.target.value].nType !== 'characteristic';

    let nIndex = resetDateRange ? 'nRange' : null;
    
    let dIndex = (VariablePresets[e.target.value].dType === 'time-series') ? 'dIndex' : null;
    let dRange = (VariablePresets[e.target.value].dType === 'time-series') ? 'dRange' : null;
    // check if valid combination based on variable tree
    if (!variableTree[e.target.value].hasOwnProperty(tempGeography) || !variableTree[e.target.value][tempGeography].hasOwnProperty(tempDataset)) {
      tempGeography = Object.keys(variableTree[e.target.value])[0]
      tempDataset = Object.keys(variableTree[e.target.value][tempGeography])[0];

      
      dispatch(setParametersAndData({
        params: {
          ...VariablePresets[e.target.value],
          [nIndex]: 7,
          [dIndex]: dataParams.nIndex,
          [dRange]: dataParams.nRange,
        },
        dataset: datasetTree[tempGeography][tempDataset],
        mapParams: {
          customScale: VariablePresets[e.target.value].colorScale || null
        }
      }))
      setCurrentGeography(tempGeography)
      setCurrentDataset(tempDataset)
    } else {
      dispatch(setVariableParams({
        ...VariablePresets[e.target.value],
        [nIndex]: 7,
        [dIndex]: dataParams.nIndex,
        [dRange]: dataParams.nRange,
      }))

    }
    
    setNewVariable(e.target.value)
  }

  const handleGeography = (e) => {
    setCurrentGeography(e.target.value)
    if (!variableTree[newVariable][e.target.value].hasOwnProperty(currentDataset)) {
      let datasetWithGeography = Object.keys(variableTree[newVariable][e.target.value])[0]
      setCurrentDataset(datasetWithGeography)
      dispatch(setCurrentData(datasetTree[e.target.value][datasetWithGeography]))
    } else {
      dispatch(setCurrentData(datasetTree[e.target.value][currentDataset]))
    }

  }

  const handleDataset = (e) => {
    setCurrentDataset(e.target.value)
    dispatch(setCurrentData(datasetTree[currentGeography][e.target.value]))
  }

  
  const handleRangeButton = (event) => {
    let val = event.target.value;

    if (val === 'custom') { // if swapping over to a custom range, which will use a 2-part slider to scrub the range
        if (dataParams.nType === "time-series" && dataParams.dType === "time-series") {
            dispatch(setVariableParams({nRange: 30, dRange: 30, rangeType: 'custom'}))
        } else if (dataParams.nType === "time-series") {
            dispatch(setVariableParams({nRange: 30, rangeType: 'custom'}))
        } else if (dataParams.dType === "time-series") {
            dispatch(setVariableParams({dRange: 30, rangeType: 'custom'}))
        } 
    } else { // use the new value -- null for cumulative, 1 for daily, 7 for weekly
        if (dataParams.nType === "time-series" && dataParams.dType === "time-series") {
            dispatch(setVariableParams({nRange: val, dRange: val, rangeType: 'fixed'}))
        } else if (dataParams.nType === "time-series") {
            dispatch(setVariableParams({nRange: val, rangeType: 'fixed'}))
        } else if (dataParams.dType === "time-series") {
            dispatch(setVariableParams({dRange: val, rangeType: 'fixed'}))
        }    
    }
  }

  const handleSwitch = () => {
    if (mapParams.binMode === 'dynamic') {
        dispatch(setMapParams({binMode:''}))
    } else {
        dispatch(setMapParams({binMode:'dynamic'}))
    }
  }

  const allGeographies = ['County', 'State']
  const allDatasets = ['1point3acres', 'USA Facts', 'New York Times', 'CDC', 'County Health Rankings'] //'Yu Group at Berkeley', 

  return (
    <VariablePanelContainer className={panelState.variables ? '' : 'hidden'} otherPanels={panelState.info} id="variablePanel">
      <ControlsContainer>
        <h2>Data Sources &amp;<br/> Map Variables</h2>
        <StyledDropDown id="newVariableSelect">
          <InputLabel htmlFor="newVariableSelect">Variable</InputLabel>
          <Select
            value={newVariable}
            onChange={handleNewVariable}
            >
            {Object.keys(variableTree).map(variable => {
              if (variable.split(':')[0]==="HEADER") {
                return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
              } else {
                return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
              }
            })
          }
          </Select>
        </StyledDropDown>
        <br/>
        <DateSelectorContainer disabled={dataParams.nType === "characteristic"}>
          <StyledDropDown id="dateSelector">
              <InputLabel htmlFor="date-select">Date Range</InputLabel>
              <Select  
                  id="date-select"
                  value={(dataParams.nRange === null || dataParams.rangeType === 'custom' || dataParams.variableName.indexOf('Testing') !== -1) ? 'x' : dataParams.nRange}
                  onChange={handleRangeButton}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
              >
                  <MenuItem value="x" disabled style={{display:'none'}}>
                      {dataParams.rangeType === 'custom' && <span>Custom Range</span>}
                      {(dataParams.nRange === null && dataParams.variableName.indexOf('Testing') === -1) && <span>Cumulative</span>}
                      {dataParams.variableName.indexOf('Testing') !== -1 && <span>7-Day Average</span>}
                  </MenuItem>
                  <MenuItem value={null} key={'cumulative'} disabled={dataParams.variableName.indexOf('Testing') !== -1}>Cumulative</MenuItem>
                  <MenuItem value={1} key={'daily'} disabled={dataParams.variableName.indexOf('Testing') !== -1}>Daily New</MenuItem>
                  <MenuItem value={7} key={'7-day-ave'} disabled={dataParams.variableName.indexOf('Testing') !== -1}>7-Day Average</MenuItem>
                  <MenuItem value={'custom'} key={'customRange'} disabled={dataParams.variableName.indexOf('Testing') !== -1}>Custom Range</MenuItem>
              </Select>
          </StyledDropDown>
          <BinsContainer id="binModeSwitch" disabled={dataParams.variableName.indexOf('Testing') !== -1 || dataParams.nType === "characteristic"}>
            <Switch
                checked={mapParams.binMode === 'dynamic'}
                onChange={handleSwitch}
                name="bin chart switch"
            />
            <p>{mapParams.binMode === 'dynamic' ? 'Dynamic' : 'Fixed Bins'}<Tooltip id="BinModes"/></p>
          </BinsContainer> 
        </DateSelectorContainer> 
        <br/>
        
        <StyledDropDown id="geographySelect">
          <InputLabel htmlFor="geographySelect">Geography</InputLabel>
          <Select
            value={currentGeography}
            onChange={handleGeography}
            >
            {allGeographies.map(geography => 
              <MenuItem 
              value={geography} 
              key={geography} 
              disabled={!variableTree[newVariable].hasOwnProperty(geography)}
              >
                {geography}
              </MenuItem>
            )}
          </Select>
        </StyledDropDown>
        <StyledDropDown id="datasetSelect">
          <InputLabel htmlFor="datasetSelect">Data Source</InputLabel>
          <Select
            value={currentDataset}
            onChange={handleDataset}
            >
            {allDatasets.map(dataset => 
              <MenuItem 
              value={dataset}
              key={dataset} 
              disabled={variableTree[newVariable][currentGeography] === undefined || !variableTree[newVariable][currentGeography].hasOwnProperty(dataset)}
              >
                {dataset}
              </MenuItem>
            )}
          </Select>
        </StyledDropDown>
        <br/>
        {/* <StyledDropDown id="dataSource">
          <InputLabel htmlFor="data-select">Data Source</InputLabel>
          <Select  
            value={currentData}
            onChange={handleDataSource}
          >
            
          <ListSubheader disabled>county data</ListSubheader>
            <MenuItem value={'county_1p3a.geojson'} key={'county_1p3a.geojson'}>1point3acres (County)</MenuItem>
            <MenuItem value={'county_nyt.geojson'} key={'county_nyt.geojson'}>New York Times (County)</MenuItem>
            <MenuItem value={'county_usfacts.geojson'} key={'county_usfacts.geojson'}>USA Facts (County)</MenuItem>
            <MenuItem value={'cdc.geojson'} key={'cdc.geojson'}>CDC (County)</MenuItem>
          <ListSubheader disabled>state data</ListSubheader>
            <MenuItem value={'state_1p3a.geojson'} key={'state_1p3a.geojson'}>1point3acres (State)</MenuItem>
            <MenuItem value={'state_nyt.geojson'} key={'state_nyt.geojson'}>New York Times (State)</MenuItem>
          </Select>
        </StyledDropDown>
        <br />
        <StyledDropDown id="variableSelect">
          <InputLabel htmlFor="numerator-select">Select Variable</InputLabel>
          <Select 
            value={currentVariable} 
            id="numerator-select"
            onChange={handleVariable}
          >
            {
              !currentData.includes('cdc') && Object.keys(PresetVariables).map((variable) => {
                if (variable.split(':')[0]==="HEADER") {
                  return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                } else {
                  return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                }
              })
            }
            
            {
              currentData.includes('county') && Object.keys(CountyVariables).map((variable) => {
                if (variable.split(':')[0]==="HEADER") {
                  return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                } else {
                  return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                }
              })
            }
            
            {
              (currentData.includes("state")) && Object.keys(StateVariables).map((variable) => {
                if (variable.split(':')[0]==="HEADER") {
                  return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                } else {
                  return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                }
              })
            }
            {
              currentData.includes("1p3a") && Object.keys(OneP3AVariables).map((variable) => {
                if (variable.split(':')[0]==="HEADER") {
                  return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                } else {
                  return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                }
              })
            }
            {
              currentData.includes("cdc") && Object.keys(CDCVariables).map((variable) => {
                if (variable.split(':')[0]==="HEADER") {
                  return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                } else {
                  return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                }
              })
            }
          </Select>
        </StyledDropDown> */}
        <StyledDropDown component="Radio" id="mapType">
          <FormLabel component="legend">Map Type</FormLabel>
          <RadioGroup 
            aria-label="maptype" 
            name="maptype1" 
            onChange={handleMapType} 
            value={mapParams.mapType}
            className="radioContainer"
            >
            <FormControlLabel 
              value="natural_breaks" 
              key="natural_breaks" 
              control={<Radio />} 
              label="Natural Breaks"
            /><Tooltip id="NaturalBreaks"/>
            <br/>
            <FormControlLabel 
              value="hinge15_breaks" 
              key="hinge15_breaks" 
              control={<Radio />} 
              label="Box Map" 
            /><Tooltip id="BoxMap"/>
            <br/>
            <FormControlLabel 
              value="lisa" 
              key="lisa" 
              control={<Radio />} 
              label="Hotspot" 
            /><Tooltip id="Hotspot"/>
            <br/>
          </RadioGroup>
        </StyledDropDown>
        <p>Visualization Type</p>
        <StyledButtonGroup color="primary" aria-label="text button group" id="visualizationType">
          <Button className={mapParams.vizType === '2D' ? 'active' : ''} data-val="2D" key="2D-btn" onClick={() => handleVizTypeButton('2D')}>2D</Button>
          <Button className={mapParams.vizType === '3D' ? 'active' : ''} data-val="3D" key="3D-btn" onClick={() => handleVizTypeButton('3D')}>3D</Button>
          <Button className={mapParams.vizType === 'cartogram' ? 'active' : ''} data-val="cartogram" key="cartogram-btn" onClick={() => handleVizTypeButton('cartogram')}>Cartogram</Button>
        </StyledButtonGroup>
        <br/>
        <br />
        {/* {
          mapParams.vizType === '3D' && 
            <BinsContainer item xs={12} >
                <Switch
                    checked={bivariateZ}
                    onChange={handleZSwitch}
                    name="chart switch z chart switch"
                />
                <p>{bivariateZ ? 'Bivariate Z-Axis' : 'Single Variable Z-Axis'}<Tooltip id="BinModes"/></p>
            </BinsContainer>
        }
        {
          bivariateZ &&           
            <StyledDropDown id="3d-variable-select" style={{minWidth: '125px'}}>
              <InputLabel htmlFor="3d-numerator-select">Z-Axis Variable</InputLabel>
              <Select 
                value={currentZVariable} 
                id="3d-numerator-select"
                onChange={handleZVariable}
              >
                {
                  !currentData.includes('cdc') && Object.keys(PresetVariables).map((variable) => {
                    if (variable.split(':')[0]==="HEADER") {
                      return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                    } else {
                      return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                    }
                  })
                }
                
                {
                  currentData.includes('county') && Object.keys(CountyVariables).map((variable) => {
                    if (variable.split(':')[0]==="HEADER") {
                      return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                    } else {
                      return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                    }
                  })
                }
                
                {
                  (currentData.includes("state")) && Object.keys(StateVariables).map((variable) => {
                    if (variable.split(':')[0]==="HEADER") {
                      return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                    } else {
                      return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                    }
                  })
                }
                {
                  currentData.includes("1p3a") && Object.keys(OneP3AVariables).map((variable) => {
                    if (variable.split(':')[0]==="HEADER") {
                      return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                    } else {
                      return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                    }
                  })
                }
                {
                  currentData.includes("cdc") && Object.keys(CDCVariables).map((variable) => {
                    if (variable.split(':')[0]==="HEADER") {
                      return <ListSubheader key={variable.split(':')[1]} disabled>{variable.split(':')[1]}</ListSubheader>
                    } else {
                      return <MenuItem value={variable} key={variable}>{variable}</MenuItem> 
                    }
                  })
                }
              </Select>
            </StyledDropDown>
        } */}
        <br/>
        <TwoUp id="overlaysResources">
          <StyledDropDown>
            <InputLabel htmlFor="overlay-select">Overlay</InputLabel>
            <Select  
              id="overlay-select"
              value={mapParams.overlay}
              onChange={handleMapOverlay}
            >
              <MenuItem value="" key={'None'}>None</MenuItem> 
              <MenuItem value={'native_american_reservations'} key={'native_american_reservations'}>Native American Reservations</MenuItem>
              <MenuItem value={'segregated_cities'} key={'segregated_cities'}>Hypersegregated Cities<Tooltip id="Hypersegregated"/></MenuItem>
              <MenuItem value={'blackbelt'} key={'blackbelt'}>Black Belt Counties<Tooltip id="BlackBelt" /></MenuItem>
              <MenuItem value={'uscongress-districts'} key={'uscongress-districts'}>US Congressional Districts <Tooltip id="USCongress" /></MenuItem>
              {/* <MenuItem value={'mobility-county'} key={'mobility-county'}>Mobility Flows (County) WARNING BIG DATA</MenuItem> */}
            </Select>
          </StyledDropDown>
          <StyledDropDown>
            <InputLabel htmlFor="resource-select">Resource</InputLabel>
            <Select  
              id="resource-select"
              value={mapParams.resource}
              onChange={handleMapResource}
            >
              <MenuItem value="" key='None'>None</MenuItem> 
              <MenuItem value={'clinics_hospitals'} key={'variable1'}>Clinics and Hospitals</MenuItem>
              <MenuItem value={'clinics'} key={'variable2'}>Clinics</MenuItem>
              <MenuItem value={'hospitals'} key={'variable3'}>Hospitals</MenuItem>
            </Select>
          </StyledDropDown>
        </TwoUp>        
      </ControlsContainer>
      <div className="noteContainer">
        <h3>Help us improve the Atlas!</h3>
        <p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSf0KdYeVyvwnz0RLnZijY3kdyFe1SwXukPc--a1HFPE1NRxyw/viewform?usp=sf_link" target="_blank" rel="noopener noreferrer">Take the Atlas v2 survey here </a>
          or share your thoughts at <a href="mailto:contact@theuscovidatlas.org" target="_blank" rel="noopener noreferrer">contact@theuscovidatlas.org.</a>
        </p>
        <hr></hr>
        <p className="note">
          Data is updated with freshest available data at 3pm CST daily, at minimum. 
          In case of data discrepancy, local health departments are considered most accurate as per CDC recommendations. 
          More information on <a href="data.html">data</a>, <a href="methods.html">methods</a>, 
          and <a href="FAQ.html">FAQ</a> at main site.
        </p>
        <div className="poweredByGeoda">
            <a href="https://geodacenter.github.io" target="_blank" rel="noopener noreferrer">
              <img src={`${process.env.PUBLIC_URL}/assets/img/geoda-logo.png`} alt="Geoda Logo"/>
              POWERED BY GEODA
            </a>
        </div> 
      </div>
      <button onClick={handleOpenClose} id="showHideLeft" className={panelState.variables ? 'active' : 'hidden'}>{settings}</button>

    </VariablePanelContainer>
  );
}

export default VariablePanel;