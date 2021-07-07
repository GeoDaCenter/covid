// This components formats the data for the selected geography
// and displays it in the right side panel.

// Import main libraries
import React, {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Import helper libraries
import styled from 'styled-components';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

// Import config and sub-components
import Tooltip from './tooltip';
import TwoWeekChart from './twoWeekLineChart';
import { setPanelState } from '../actions';
import {dataFn, colLookup} from '../utils';
import { colors } from '../config';
import { report } from '../config/svg';

//// Styled components CSS
// Main container for entire panel
const DataPanelContainer = styled.div`
  display: ${props => props.dataLength === 0 ? 'none' : 'initial'};
  position:fixed;
  min-width:250px;
  right:0;
  top:50px;
  overflow-x:visible;
  height:calc(100vh - 50px);
  background-color: ${colors.gray}fa;
  box-shadow: -2px 0px 5px rgba(0,0,0,0.7);
  padding:20px;
  box-sizing: border-box;
  transition:250ms all;
  font: 'Lato', sans-serif;
  color: white;
  font-size:100%;
  padding:0;
  z-index:5;
  transform: translateX(100%);
  h4 {
    margin:10px 0;
  }
  &.open {
    transform:none;
  }
  @media (max-width:1024px) {
    min-width:50vw;
  }  
  @media (max-width:600px) {
    width:100%;
    left:0;
    transform:translateX(-100%);
    z-index:51;
    &.open {
      transform:none;
    }
    display: ${props => (props.otherPanels || props.dataLength === 0) ? 'none' : 'initial'};
  }
  button#showHideRight {
    position:absolute;    
    right:calc(100% - 20px);
    top:20px;
    width:40px;
    height:40px;
    padding:0;
    margin:0;
    background-color: ${colors.gray};
    box-shadow: 0px 0px 6px rgba(0,0,0,1);
    outline:none;
    border:none;
    cursor: pointer;
    transition:500ms all;
    svg {
      width:15px;
      height:15px;
      margin:12.5px 0 0 0;
      @media (max-width:600px){
        width:20px;
        height:20px;
        margin:5px;
      }
      fill:white;
      transform:rotate(180deg);
      transition:500ms all;
    }
    :after {
      opacity:0;
      font-weight:bold;
      color:white;
      position: relative;
      top:-17px;
      transition:500ms all;
      content: 'Report';
      right:50px;
      z-index:4;
    }  
    &.hidden {
      right:100%;
      svg {
        transform:rotate(0deg);
      }
      :after {
        opacity:1;
      }
    }
    @media (max-width:768px){
      top:120px;
    }
    @media (max-width:600px) {
      left:100%;
      width:30px;
      height:30px;
      top:180px;
      &.hidden svg {
        transform:rotate(0deg);
      }
      :after {
        display:none;
      }
      &.active {
        left:90%;
      }
      &.active svg {
        transform:rotate(90deg);
      }
    }
  }
  

  div {
    div {
      p {
        line-height:1.5;
        margin:0;
        display:inline-block;
      }
    }
  }
  h2 {
    padding:15px 0 5px 0;
    margin:0;
    display:inline-block;
    max-width:200px;
  }
  h6, p {
    padding:0 0 15px 0;
    margin:0;
    max-width:30ch;
    a {
      color:${colors.yellow};
      text-decoration:none;
    }
  }
  .extraPadding {
    padding-bottom:20vh;
  }
  p {
    padding-right:10px;
  }
`
// Scrollable Wrapper for main report information
const ReportWrapper = styled.div`
  height:100vh;
  overflow-y:scroll;
  
  ::-webkit-scrollbar {
    width: 10px;
  }
  
  /* Track */
  ::-webkit-scrollbar-track {
    background: #2b2b2b;
  }
   
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: url('${process.env.PUBLIC_URL}/icons/grip.png'),  #999;
    background-position: center center;
    background-repeat: no-repeat, no-repeat;
    background-size: 50%, 100%; 
    transition:125ms all;
  }
  
  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: url('${process.env.PUBLIC_URL}/icons/grip.png'),  #f9f9f9;
    background-position: center center;
    background-repeat: no-repeat, no-repeat;
    background-size: 50%, 100%; 
  }
`

// Inner container for report content
const ReportContainer = styled.div`
    padding:5px 0 0 30px;
    box-sizing:border-box;
    overflow-x:visible;
    // Multi-column layout (NYI)
    // display:flex;
    // flex-direction:column;
    // flex-wrap:wrap;
    // width:500px;
    // columns:${props => props.cols} 250px;
    // column-gap:10px;
    // display:inline-block;
    h3 {
      font-size:${props => props.expanded ? '150%' : '100%'};
      display:${props => props.expanded ? 'block' : 'inline'};
      margin:${props => props.expanded ? '0': '0 15px 0 0'};
      padding:${props => props.expanded ? '0 0 15px 0 !important': '0'};
      &:before {
        content: ': ';
        display: ${props => props.expanded ? 'none' : 'initial'};
      }
      &:after {
        content:" ";
        white-space:pre;
        height:0;
        display: ${props => props.expanded ? 'none' : 'block'};
      }
    }
    div.numberChartContainer {
      width:100%;
      display:${props => props.expanded ? 'flex' : 'inline'};
      align-items: center;
    }
    div.numberContainer {
      display:${props => props.expanded ? 'flex' : 'inline'};
    }
    .bigOnly {
      display: ${props => props.expanded ? 'initial' : 'none'};
    }
    
`

// Subsection of report
const ReportSection = styled.span`
    padding-right:20px;
    box-sizing:border-box;
    // width:100%;
    // display:inline-block;
    padding: 0;
    margin: 0;
`

// Toggle styling for condensed and expanded drop down
const ExpandSelect = styled(FormControl)`
  outline:none;
  border:none;
  position:absolute !important;
  right:25px;
  top:15px;
  div.MuiInputBase-root:before {
    display:none !important;
  }
  div.MuiInputBase-root:after {
    display:none !important;
  }
  svg {
    path {
      fill:white;
    }
  }

`

// DataPanel Function Component
const DataPanel = () => {

  const dispatch = useDispatch();

  const storedData = useSelector(state => state.storedData);
  // name of current data set
  const currentData = useSelector(state => state.currentData);
  // current date and index
  const currDateIndex = useSelector(state => state.dataParams.nIndex);
  const dates = useSelector(state => state.dates);
  const selectionKeys = useSelector(state => state.selectionKeys);
  const selectionIndex = useSelector(state => state.selectionIndex);
  // panels open/close state
  const panelState = useSelector(state => state.panelState);
  //column names
  const cols = useSelector(state => state.cols);
  const [expanded, setExpanded] = useState(true)

  // De-structure sidebarData, which houses selected geography data
  // Based on if certain data are present or absent, the sidebar data will
  // conditionally render (short circuit) parts of the component

  // List of all current datasets joined
  const datasetList = ['properties', 'cases', 'deaths', 'predictions',
    'chr_health_factors', 'chr_life', 'chr_health_context',
    'testing', 'vaccines_one_dose', 'vaccines_fully_vaccinated', 'essential_workers', 'pct_home']

  // Map datasetList to check if each key is present in the current data
  // Output variables are checked below for conditional rendering
  const [ properties, cases, deaths, predictions,
    chr_health_factors, chr_life, chr_health_context,
    testing, vaccines_one_dose, vaccines_fully_vaccinated,
    essential_workers, pct_home
  ] = datasetList.map(dataset => {
    if (storedData[currentData] === undefined) {
      return false 
    } else {
      return storedData[currentData][0].hasOwnProperty(dataset)
    }
  });

  
  // helper for predictions data
  const parsePredictedDate = (list) => `${list.slice(-2,)[0]}/${list.slice(-1,)[0]}`

  // handles panel open/close
  const handleOpenClose = () => dispatch(setPanelState({info:panelState.info ? false : true}))

  //// TODO DRY issue -- refactor these functions
  
  // Replace Null/NaN with 0 
  const cleanData = (inputData) => inputData.map(d => d >=0 ? d : isNaN(d) || d===null ? 0 : d)
  
  // Performs different operations on the data array output
  // Sum, Average, and weighted average
  const performOperation = (dataArray, operation, totalPopulation) => {
    // Sum up data
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    // Clean data
    let clean = cleanData(dataArray);
    
    switch(operation) {
      case 'sum':
        return clean.reduce(reducer)
      case 'average':
        return clean.reduce(reducer)/clean.length
      case 'weighted_average':
        return Math.round(clean.reduce(reducer)/totalPopulation*100)/100
      default:
        return null
    }
  } 

  // Prepares data for the previous operation
  const aggregateProperty = (dataset, property, operation, specialCase=null) => {
    let dataArray; 
    let totalPopulation = 0;
    // Loop through and collect data from selected geographies in SelectionIndex
    try {
      if (operation === 'weighted_average') {
        dataArray = selectionIndex.map(selection => {
          let selectionPop = storedData[currentData][selection]['properties']['population'];
          totalPopulation+=selectionPop;
          if (specialCase === 'pcp') try { return parseInt(storedData[currentData][selection][dataset][property].split(':')[0])*selectionPop } catch { return 0}
          return storedData[currentData][selection][dataset][property]*selectionPop
        })
      } else {
        dataArray = selectionIndex.map(selection => storedData[currentData][selection][dataset][property]);
      }
    } catch {
      return 0
    }

    return performOperation(dataArray, operation, totalPopulation);
  }

  // Same as aggregteProperty(), but for time-series data
  const aggregateTimeseries = (dataset, index, operation) => {
    let dataArray; 
    let totalPopulation = 0;
    try {
      if (operation === 'weighted_average') {
        dataArray = selectionIndex.map(selection => {
          let selectionPop = storedData[currentData][selection]['properties']['population'];
          totalPopulation+=selectionPop;
          return storedData[currentData][selection][dataset].slice(index,)[0]*selectionPop
        })
      } else {
        dataArray = selectionIndex.map(selection => storedData[currentData][selection][dataset].slice(index,)[0]);
      }
    } catch {
      return 0
    }

    return performOperation(dataArray, operation, totalPopulation);
  }

  // Generate data for 2-week line charts
  const aggregate2WeekTimeSeries = (dataset, index, operation) => {
    let lookbackPeriod = []
    let rtn;

    try {
      for (let i=-13;i<1;i++) {
        lookbackPeriod.push(index+i)
      }
      rtn = lookbackPeriod.map(day => aggregateTimeseries(dataset, day, operation))
    } catch {
      return 0
    }
    return rtn;
  }
  
  // For more complete data functions (like population normalized)
  const aggregateDataFunction = (numerator, denominator, params, operation) => {
    
    let dataArray; 
    let totalPopulation = 0;
    try {
      if (operation === 'weighted_average') {
        dataArray = selectionIndex.map(selection => {
          let selectionPop = storedData[currentData][selection]['properties']['population'];
          totalPopulation+=selectionPop;
          return dataFn(storedData[currentData][selection][numerator], storedData[currentData][selection][denominator], params)*selectionPop
        })
      } else {
        dataArray = selectionIndex.map(selection => dataFn(storedData[currentData][selection][numerator], storedData[currentData][selection][denominator], params));
      }
    } catch {
      return 0
    }

    return performOperation(dataArray, operation, totalPopulation);
  }

  // Set expanded or contracted view
  const handleExpandContract = (event) => setExpanded(event.target.value)

  // // Not currently used, aggregate qualitative data (like testing criteria)
  // const aggregateQualitative = (dataset, property) => {
  //   let dataObj = {};
  //   let returnStr = [];
  //   try {
  //     let dataArray = selectionIndex.map(selection => storedData[currentData][selection][dataset][property]);
    
  //     for (let i=0; i<dataArray.length; i++){
  //       if (dataObj[dataArray[i]] === undefined) {
  //         dataObj[dataArray[i]] = 1
  //       } else {
  //         dataObj[dataArray[i]] += 1
  //       }
  //     }  
  //     for (let i=0; i<Object.keys(dataObj).length; i++){
  //       returnStr.push(`${[Object.keys(dataObj)[i]]}: ${Math.round(dataObj[Object.keys(dataObj)[i]]/dataArray.length*10000)/100}%`)
  //     }
  //   } catch {
  //     return 0
  //   }
  //   return returnStr;
  // }

  return (
    <DataPanelContainer className={panelState.info ? 'open' : ''} id="data-panel"  otherPanels={panelState.variables} dataLength={selectionKeys.length}>
      {properties &&  
      <ExpandSelect>
        <Select
          labelId="expand-view-label"
          id="expand-view"
          value={null}
          onChange={handleExpandContract}
        >
          <MenuItem value={true}>Expanded</MenuItem>
          <MenuItem value={false}>Compact</MenuItem>
        </Select>
      </ExpandSelect>
      }
      <ReportWrapper>
        <ReportContainer expanded={expanded}>
          <ReportSection>
            {(properties && selectionIndex.length < 4) && <h2>{selectionKeys.map((key, index) => index === selectionKeys.length-1 ? selectionKeys.length === 1 ? key : `and ${key}` : `${key}, `)}</h2>}
            {(properties && selectionIndex.length >= 4) && <h2>{(currentData.includes('county')||currentData.includes('cdc')) ? 'Selected Counties' : 'Selected States'}</h2>}
            <br/>
          {(properties && selectionIndex.length) && 
              <span>
                <h4>{dates[currDateIndex]}</h4>
                <p>Population</p>
                <h3>{aggregateProperty('properties', 'population', 'sum').toLocaleString('en')}</h3>
              </span>
            }       
          </ReportSection>
          {(cases && deaths && selectionIndex.length) && 
              <ReportSection>
                <p>Total Cases</p>
                <div className="numberChartContainer">
                  <h3>{aggregateTimeseries('cases', currDateIndex, 'sum')?.toLocaleString('en')}</h3>
                  {expanded && <TwoWeekChart data={aggregate2WeekTimeSeries('cases', currDateIndex, 'sum')} schema='cases/deaths'/>}
                </div>
                <p>Total Deaths </p>
                <div className="numberChartContainer">
                  <h3>{aggregateTimeseries('deaths', -1, 'sum')?.toLocaleString('en')}</h3>
                  {expanded && <TwoWeekChart data={aggregate2WeekTimeSeries('deaths', currDateIndex, 'sum')} schema='cases/deaths'/>}
                </div>
                <p>Cases per 100k Population</p>
                <h3>{aggregateDataFunction('cases', 'properties', {nProperty: null, nIndex: currDateIndex, nRange: null, dProperty: 'population', dIndex: null, dRange: null, scale: 100000}, 'weighted_average')?.toFixed(2).toLocaleString('en')}</h3>
                <p>Deaths per 100k Population</p>
                <h3>{aggregateDataFunction('deaths', 'properties', {nProperty: null, nIndex: currDateIndex, nRange: null, dProperty: 'population', dIndex: null, dRange: null, scale: 100000}, 'weighted_average')?.toFixed(2).toLocaleString('en')}</h3>
                <p>New Cases per 100k Population</p>
                <h3>{aggregateDataFunction('cases', 'properties', {nProperty: null, nIndex: currDateIndex, nRange: 1, dProperty: 'population', dIndex: null, dRange: null, scale: 100000}, 'weighted_average')?.toFixed(2).toLocaleString('en')}</h3>
                <p>New Deaths per 100k Population</p>
                <h3>{aggregateDataFunction('deaths', 'properties', {nProperty: null, nIndex: currDateIndex, nRange: 1, dProperty: 'population', dIndex: null, dRange: null, scale: 100000}, 'weighted_average')?.toFixed(2).toLocaleString('en')}</h3>
                <p>Licensed Hospital Beds</p>
                <h3>{aggregateProperty('properties','beds','sum').toLocaleString('en')}</h3>
                {/* <p>Cases per Bed: {dataFn(cases, null, cases.length-1, null, properties, 'beds', null, null, 1)?.toFixed(2)?.toLocaleString('en')}</p><br/> */}
              </ReportSection>
            }
            {(vaccines_one_dose && selectionIndex.length) &&
                <ReportSection>
                  <h2>COVID Vaccination</h2><br/>
                  <h6>Source: <a href="https://covid.cdc.gov/covid-data-tracker/#vaccinations" target="_blank" rel="noopener noreferrer">CDC COVID Data Tracker</a></h6>            
                  {(storedData[currentData][selectionIndex[0]]?.properties?.link_name && selectionIndex.length === 1) 
                    && 
                    <><p>For more on the status of vaccinations in {selectionKeys[0]}, visit 
                      the <a href={`${storedData[currentData][selectionIndex[0]].properties?.link_url}`} target="_blank" rel="noopener noreferrer">
                      {storedData[currentData][selectionIndex[0]].properties?.link_name}</a> website.</p><br/><br/></>
                  }
                  {(storedData[currentData][selectionIndex[0]]?.properties?.link_name && selectionIndex.length > 1) 
                    && 
                    <><p>For more on the status of vaccinations visit the links below:
                      <ul>
                        {selectionKeys.map((name, index) => <li><a href={storedData[currentData][selectionIndex[index]].properties?.link_url} target="_blank" rel="noopener noreferrer">{name}</a></li>)}
                      </ul>
                      </p>
                      <br/><br/>
                    </>
                  }
                  <p>% of Population<br className="bigOnly"/>  Received At Least One Dose</p>
                  <div className="numberChartContainer">
                    <h3>{aggregateDataFunction('vaccines_one_dose', 'properties', {nProperty: null, nIndex: currDateIndex, nRange: null, dProperty: 'population', dIndex: null, dRange: null, scale: 100}, 'weighted_average')?.toFixed(2).toLocaleString('en')}%</h3>
                    {expanded && <TwoWeekChart data={aggregate2WeekTimeSeries('vaccines_one_dose', currDateIndex, 'sum')} schema='vaccination'/>}
                  </div>
                  
                  <p>Total Number<br className="bigOnly"/>  Received At Least One Dose</p>
                  <h3>{aggregateDataFunction('vaccines_one_dose', 'properties', {nProperty: null, nIndex: currDateIndex, nRange: null, dProperty: null, dIndex: null, dRange: null, scale: 1}, 'sum')?.toLocaleString('en')}</h3>
                  
                  <p>% of Population<br className="bigOnly"/>  Fully Vaccinated</p>
                  <div className="numberChartContainer">
                    <h3>{aggregateDataFunction('vaccines_fully_vaccinated', 'properties', {nProperty: null, nIndex: currDateIndex, nRange: null, dProperty: 'population', dIndex: null, dRange: null, scale: 100}, 'weighted_average')?.toFixed(2).toLocaleString('en')}%</h3>
                    {expanded && <TwoWeekChart data={aggregate2WeekTimeSeries('vaccines_fully_vaccinated', currDateIndex, 'sum')} schema='vaccination'/>}
                  </div>

                  <p>Total Number<br className="bigOnly"/>  Fully Vaccinated</p>
                  <h3>{aggregateDataFunction('vaccines_fully_vaccinated', 'properties', {nProperty: null, nIndex: currDateIndex, nRange: null, dProperty: null, dIndex: null, dRange: null, scale: 1}, 'sum')?.toLocaleString('en')}</h3>

                  <p>Doses to be Administered<br className="bigOnly"/>  Per 100 People</p>
                  <h3>{aggregateDataFunction('vaccines_dist', 'properties', {nProperty: null, nIndex: currDateIndex, nRange: null, dProperty: 'population', dIndex: null, dRange: null, scale: 100}, 'weighted_average')?.toFixed(2).toLocaleString('en')}</h3>
                
                </ReportSection>
              }
              {(vaccines_fully_vaccinated && selectionIndex.length) &&
                  <ReportSection>
                    <h2>COVID Vaccination</h2><br/>
                    <h6>Source: <a href="https://covid.cdc.gov/covid-data-tracker/#vaccinations" target="_blank" rel="noopener noreferrer">CDC COVID Data Tracker</a></h6>            

                  <p>% of Population<br className="bigOnly"/>  Fully Vaccinated</p>
                  <div className="numberChartContainer">
                    <h3>{aggregateDataFunction('vaccines_fully_vaccinated', 'properties', {nProperty: null, nIndex: currDateIndex, nRange: null, dProperty: 'population', dIndex: null, dRange: null, scale: 100}, 'weighted_average')?.toFixed(2).toLocaleString('en')}%</h3>
                    {expanded && <TwoWeekChart data={aggregate2WeekTimeSeries('vaccines_fully_vaccinated', currDateIndex, 'sum')} schema='vaccination'/>}
                  </div>

                  <p>Total Number<br className="bigOnly"/>  Fully Vaccinated</p>
                  <h3>{aggregateDataFunction('vaccines_fully_vaccinated', 'properties', {nProperty: null, nIndex: currDateIndex, nRange: null, dProperty: null, dIndex: null, dRange: null, scale: 1}, 'sum')?.toLocaleString('en')}</h3>

                  </ReportSection>
                }
          {(testing && selectionIndex.length) &&
              <ReportSection>
                <h2>Testing</h2><br/>
                <h6>Source: <a href="https://healthdata.gov/dataset/covid-19-diagnostic-laboratory-testing-pcr-testing-time-series" target="_blank" rel="noopener noreferrer">HHS/CDC</a></h6>       
                <p>7-Day Positivity Rate</p>
                <div className="numberChartContainer">
                  <h3>{Math.round(aggregateTimeseries('testing_wk_pos', currDateIndex, 'weighted_average')*100)}%</h3>
                  {expanded && <TwoWeekChart data={aggregate2WeekTimeSeries('testing_wk_pos', currDateIndex, 'weighted_average')} schema='testingPos'/>}
                </div>

                <p>7-Day Testing Capacity<br className="bigOnly"/> per 100k People</p>
                <div className="numberChartContainer">
                  <h3>{Math.round(aggregateTimeseries('testing_tcap', currDateIndex, 'weighted_average')*100)/100}</h3>
                  {expanded && <TwoWeekChart data={aggregate2WeekTimeSeries('testing_tcap', currDateIndex, 'weighted_average')} schema='testingCap'/>}
                </div>

                <p>Total Testing</p>
                <h3>{aggregateTimeseries('testing', currDateIndex, 'sum')?.toLocaleString('en')}</h3>

                <p>7-Day Confirmed Cases<br className="bigOnly"/>  per Testing</p>
                <h3>{Math.round(aggregateTimeseries('testing_ccpt', currDateIndex, 'weighted_average')?.toLocaleString('en')*100)}%</h3>

                {/* <p>Testing Criterion</p><br className="bigOnly"/>
                <h3>{aggregateQualitative('properties', 'criteria').map(f => <span>{f}<br/></span>)}</h3> */}
              </ReportSection>
            }
          {(chr_health_factors && selectionIndex.length) && 
            <ReportSection>
              <h2>Community Health Factors<Tooltip id="healthfactor"/></h2>
              <h6>Source: <a href="https://www.countyhealthrankings.org/" target="_blank" rel="noopener noreferrer">County Health Rankings</a></h6>
              <p>Children in poverty</p><Tooltip id="PovChldPrc"/>
              <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'PovChldPrc'), 'weighted_average')}%</h3>
              <p>Income inequality<Tooltip id="IncRt"/></p>
              <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'IncRt'), 'weighted_average')}</h3>

              <p>Median household income</p><Tooltip id="MedianHouseholdIncome"/>
              <h3>${aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'MedianHouseholdIncome'), 'weighted_average').toLocaleString('en')}</h3>

              <p>Food insecurity</p><Tooltip id="FdInsPrc"/>
              <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'FdInsPrc'), 'weighted_average')}%</h3>

              <p>Unemployment</p><Tooltip id="UnEmplyPrc"/>
              <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'UnEmplyPrc'), 'weighted_average')}%</h3>

              <p>Uninsured</p><Tooltip id="UnInPrc"/>
              <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'UnInPrc'), 'weighted_average')}%</h3>

              <p>Primary care physicians</p><Tooltip id="PrmPhysRt"/>
              <h3>{Math.round(aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'PrmPhysRt'), 'weighted_average', 'pcp'))}:1</h3>

              <p>Preventable hospital stays</p><Tooltip id="PrevHospRt"/>
              <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'PrevHospRt'), 'sum')}</h3>

              <p>Residential segregation <br/>black / white</p>
              <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'RsiSgrBlckRt'), 'weighted_average')}</h3>

              <p>Severe housing problems</p><Tooltip id="SvrHsngPrbRt"/>
              <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'SvrHsngPrbRt'), 'weighted_average')}%</h3>
            </ReportSection>
          }
          {(essential_workers && selectionIndex.length) &&               
            <ReportSection>
              <h2>Essential Workers<Tooltip id="essentialWorkers"/></h2>
              <h6>Source: <a href="https://www.census.gov/programs-surveys/acs" target="_blank" rel="noopener noreferrer">American Community Survey</a></h6>
              <h3>{Math.round(aggregateProperty('essential_workers', 1, 'weighted_average')*100)}%</h3>
            </ReportSection>
          }
          {(chr_health_context && selectionIndex.length) && 
              <ReportSection>
                <h2>Community Health Context<Tooltip id="healthcontext"/></h2>
                <h6>Source: <a href="https://www.countyhealthrankings.org/" target="_blank" rel="noopener noreferrer">County Health Rankings</a></h6>

                <p>65 and older<Tooltip id="Over65YearsPrc"/></p>
                <h3>{aggregateProperty('chr_health_context', colLookup(cols, currentData, 'chr_health_context', 'Over65YearsPrc'), 'weighted_average')}%</h3>

                <p>Adult obesity<Tooltip id="AdObPrc"/></p>
                <h3>{aggregateProperty('chr_health_context', colLookup(cols, currentData, 'chr_health_context', 'AdObPrc'), 'weighted_average')}%</h3>

                <p>Diabetes prevalence<Tooltip id="AdDibPrc"/></p>
                <h3>{aggregateProperty('chr_health_context', colLookup(cols, currentData, 'chr_health_context', 'AdDibPrc'), 'weighted_average')}%</h3>

                <p>Adult smoking<Tooltip id="SmkPrc"/></p>
                <h3>{aggregateProperty('chr_health_context', colLookup(cols, currentData, 'chr_health_context', 'SmkPrc'), 'weighted_average')}%</h3>

                <p>Excessive drinking<Tooltip id="ExcDrkPrc"/></p>
                <h3>{aggregateProperty('chr_health_context', colLookup(cols, currentData, 'chr_health_context', 'ExcDrkPrc'), 'weighted_average')}%</h3>

                <p>Drug overdose deaths<Tooltip id="DrOverdMrtRt"/></p>
                <h3>{aggregateProperty('chr_health_context', colLookup(cols, currentData, 'chr_health_context', 'DrOverdMrtRt'), 'sum')||0}</h3>

              </ReportSection>
            }
          {(chr_life && selectionIndex.length) &&
              <ReportSection expanded={expanded}>
                <h2>Length &amp; Quality of Life<Tooltip id="healthlife"/></h2>
                <h6>Source: <a href="https://www.countyhealthrankings.org/" target="_blank" rel="noopener noreferrer">County Health Rankings</a></h6>
                
                <p>Life expectancy<Tooltip id="LfExpRt"/></p>
                <h3>{aggregateProperty('chr_life', colLookup(cols, currentData, 'chr_life', 'LfExpRt'), 'weighted_average')}</h3>

                <p>Self-rated health<Tooltip id="SlfHlthPrc"/></p>
                <h3>{aggregateProperty('chr_life', colLookup(cols, currentData, 'chr_life', 'SlfHlthPrc'), 'weighted_average')}%</h3>

              </ReportSection>
            }
          {(predictions && cols[currentData] && cols[currentData].predictions && selectionIndex.length) && 
              <ReportSection>
                <h2>Forecasting</h2><br/>            
                <h6>Source: <a href="https://github.com/Yu-Group/covid19-severity-prediction/" target="_blank" rel="noopener noreferrer">Yu Group at Berkeley</a></h6>            
                
                <p>5-Day Severity Index<Tooltip id="SeverityIndex"/></p>
                <h3> {['','Low','Medium','High'][Math.round(aggregateProperty('predictions', 1, 'weighted_average'))]}</h3>
                
                <p>Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[2].split('_'))}<Tooltip id="PredictedDeaths"/></p>
                <h3>{Math.round(aggregateProperty('predictions', 2, 'sum')*10)/10}</h3>
              
                <p>Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[4].split('_'))}<Tooltip id="PredictedDeaths"/></p>
                <h3>{Math.round(aggregateProperty('predictions', 4, 'sum')*10)/10}</h3>
                
                <p>Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[6].split('_'))}<Tooltip id="PredictedDeaths"/></p>
                <h3>{Math.round(aggregateProperty('predictions', 6, 'sum')*10)/10}</h3>
                
                <p>Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[8].split('_'))}<Tooltip id="PredictedDeaths"/></p>
                <h3>{Math.round(aggregateProperty('predictions', 8, 'sum')*10)/10}</h3>
                
                <p>Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[10].split('_'))}<Tooltip id="PredictedDeaths"/></p>
                <h3>{Math.round(aggregateProperty('predictions', 10, 'sum')*10)/10}</h3>
                
                <p>Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[12].split('_'))}<Tooltip id="PredictedDeaths"/></p>
                <h3>{Math.round(aggregateProperty('predictions', 12, 'sum')*10)/10}</h3>
                
                <p>Predicted Deaths by {parsePredictedDate(cols[currentData].predictions[14].split('_'))}<Tooltip id="PredictedDeaths"/></p>
                <h3>{Math.round(aggregateProperty('predictions', 14, 'sum')*10)/10}</h3>
              
              </ReportSection>
            }
            {(pct_home && selectionIndex.length) && 
                <ReportSection>
                  <h2>Mobility</h2><br/>     
                  <p>Percent Completely At Home</p>
                  <div className="numberChartContainer">
                    <h3>{aggregateTimeseries('pct_home', currDateIndex, 'weighted_average')}%</h3>
                  </div>
                  <p>Percent Full Time Behavior</p>
                  <div className="numberChartContainer">
                    <h3>{aggregateTimeseries('pct_fulltime', currDateIndex, 'weighted_average')}%</h3>
                  </div>
                  <p>Percent Part Time Behavior</p>
                  <div className="numberChartContainer">
                    <h3>{aggregateTimeseries('pct_parttime', currDateIndex, 'weighted_average')}%</h3>
                  </div>
                </ReportSection>
              }
          
          <div className="extraPadding"></div>
          
          {properties && <button onClick={handleOpenClose} id="showHideRight" className={panelState.info ? 'active' : 'hidden'}>{report}</button>}
          {/* {properties && <ResizeButton 
                  id="resize"
                  onMouseDown={handleDown}
                  onTouchStart={handleTouch}
                  style={{zIndex:10}}
              >
                  {verticalGrip}
              </ResizeButton>} */}
        </ReportContainer>
      </ReportWrapper>
    </DataPanelContainer>
  );
}

export default DataPanel;