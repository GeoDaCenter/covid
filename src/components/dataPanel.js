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
import { colors } from '../config';
import { report } from '../config/svg';

//// Styled components CSS
// Main container for entire panel
const DataPanelContainer = styled.div`
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
    padding-right: ${props => props.expanded ? '10px' : '0px'};
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
export default function DataPanel(){

  const dispatch = useDispatch();
  const selectionKeys = useSelector(state => state.selectionKeys);
  const panelState = useSelector(state => state.panelState);
  const sidebarData = useSelector(state => state.sidebarData);
  const [expanded, setExpanded] = useState(true)
  if (!selectionKeys.length) return null;
  
  // handles panel open/close
  const handleOpenClose = () => dispatch(setPanelState({info: !panelState.info}))

  // Set expanded or contracted view
  const handleExpandContract = (event) => setExpanded(event.target.value)
  return (
    <DataPanelContainer 
      className={panelState.info ? 'open' : ''} id="data-panel"  
      expanded={expanded}
      otherPanels={panelState.variables} 
      dataLength={selectionKeys.length}>
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
      <ReportWrapper>
        <ReportContainer expanded={expanded}>
          <ReportSection>
            {sidebarData.name && <h2>{sidebarData.name}</h2>}
            <br/>
            {sidebarData.date && 
              <>
                <h4>{sidebarData.date}</h4>
                {sidebarData.population && <>Population <h3>{sidebarData.population?.toLocaleString('en')}</h3></>}
              </>
            }       
          </ReportSection>
          {(sidebarData.hasOwnProperty('cases') && sidebarData.hasOwnProperty('deaths')) &&
            <ReportSection>
              Total Cases
              <div className="numberChartContainer">
                <h3>{sidebarData.cases?.toLocaleString('en')}</h3>
                {expanded && <TwoWeekChart data={sidebarData.cases14} schema='cases/deaths'/>}
              </div>
              Total Deaths
              <div className="numberChartContainer">
                <h3>{sidebarData.deaths?.toLocaleString('en')}</h3>
                {expanded && <TwoWeekChart data={sidebarData.deaths14} schema='cases/deaths'/>}
              </div>
              <p>Cases per 100k Population</p>
              <h3>{sidebarData.cases100k?.toFixed(2).toLocaleString('en')}</h3>
              <p>7-Day Average New Cases per 100k Population</p>
              <h3>{sidebarData.cases7d?.toFixed(2).toLocaleString('en')}</h3>
              <p>Deaths per 100k Population</p>
              <h3>{sidebarData.deaths100k?.toFixed(2).toLocaleString('en')}</h3>
              <p>7-Day Average New Deaths per 100k Population</p>
              <h3>{sidebarData.deaths7d?.toFixed(2).toLocaleString('en')}</h3>
              <p>Licensed Hospital Beds</p>
              <h3>{sidebarData.beds.toLocaleString('en')}</h3>
            </ReportSection>
          }
          {sidebarData.hasOwnProperty('fully_vaccinated') &&
            <ReportSection>
              <h2>COVID Vaccination</h2><br/>
              <h6>Source: <a href="https://covid.cdc.gov/covid-data-tracker/#vaccinations" target="_blank" rel="noopener noreferrer">CDC COVID Data Tracker</a></h6>            
              <p>% of Population<br className="bigOnly"/>  Fully Vaccinated</p>
              <div className="numberChartContainer">
                <h3>{Math.round(sidebarData.fully_vaccinatedPc*10000)/100}%</h3>
                {expanded && <TwoWeekChart data={sidebarData.fully_vaccinated14} schema='vaccination'/>}
              </div>
              <p>Total Number<br className="bigOnly"/>  Fully Vaccinated</p>
              <h3>{sidebarData.fully_vaccinated.toLocaleString('en')}</h3>
            </ReportSection>
          }
          {sidebarData.hasOwnProperty('one_dose') &&
            <ReportSection>
              <p>% of Population<br className="bigOnly"/>  Received At Least One Dose</p>
              <div className="numberChartContainer">
                <h3>{(sidebarData.one_dosePc*100)?.toFixed(2)}%</h3>
                {expanded && <TwoWeekChart data={sidebarData.one_dose14} schema='vaccination'/>}
              </div>
              <p>Total Number<br className="bigOnly"/>  Received At Least One Dose</p>
              <h3>{sidebarData.one_dose?.toLocaleString('en')}</h3>
              <p>Doses to be Administered<br className="bigOnly"/>  Per 100 People</p>
              <h3>{sidebarData.doses_dist100?.toFixed(2).toLocaleString('en')}</h3>
            </ReportSection>
          }
          {sidebarData.hasOwnProperty('testing') &&
            <ReportSection>
              <h2>Testing</h2><br/>
              <h6>Source: <a href="https://healthdata.gov/dataset/covid-19-diagnostic-laboratory-testing-pcr-testing-time-series" target="_blank" rel="noopener noreferrer">HHS/CDC</a></h6>       
              <p>7-Day Positivity Rate</p>
              <div className="numberChartContainer">
                <h3>{Math.round(sidebarData.wk_pos)}%</h3>
                {expanded && <TwoWeekChart data={sidebarData.wk_pos14} schema='testingPos'/>}
              </div>
              <p>7-Day Tests Performed <br className="bigOnly"/> per 100k People</p>
              <div className="numberChartContainer">
                <h3>{Math.round(sidebarData.tcap)}</h3>
                {expanded && <TwoWeekChart data={sidebarData.tcap14} schema='testingCap'/>}
              </div>
              <p>Total Testing</p>
              <h3>{sidebarData.testing}</h3>
              <p>7-Day Confirmed Cases<br className="bigOnly"/>  per Testing</p>
              <h3>{sidebarData.ccpt.toLocaleString('en')}%</h3>
            </ReportSection>
          }
          {sidebarData.hasOwnProperty('PovChldPrc') && 
            <ReportSection>
              <h2>Community Health Factors<Tooltip id="healthfactor"/></h2>
              <h6>Source: <a href="https://www.countyhealthrankings.org/" target="_blank" rel="noopener noreferrer">County Health Rankings</a></h6>
              <p>Children in poverty</p><Tooltip id="PovChldPrc"/>
              <h3>{sidebarData.PovChldPrc}%</h3>
              <p>Income inequality<Tooltip id="IncRt"/></p>
              <h3>{sidebarData.IncRt}</h3>
              <p>Median household income</p><Tooltip id="MedianHouseholdIncome"/>
              <h3>${sidebarData.MedianHouseholdIncome.toLocaleString('en')}</h3>
              <p>Food insecurity</p><Tooltip id="FdInsPrc"/>
              <h3>{sidebarData.FdInsPrc}%</h3>
              <p>Unemployment</p><Tooltip id="UnEmplyPrc"/>
              <h3>{sidebarData.UnEmplyPrc}%</h3>
              <p>Uninsured</p><Tooltip id="UnInPrc"/>
              <h3>{sidebarData.UnInPrc}%</h3>
              <p>Primary care physicians</p><Tooltip id="PrmPhysRt"/>
              <h3>{sidebarData.PrmPhysRt}:1</h3>
              <p>Preventable hospital stays</p><Tooltip id="PrevHospRt"/>
              <h3>{sidebarData.PrevHospRt}</h3>
              <p>Residential segregation <br/>black / white</p>
              <h3>{sidebarData.RsiSgrBlckRt}</h3>
              <p>Severe housing problems</p><Tooltip id="SvrHsngPrbRt"/>
              <h3>{sidebarData.SvrHsngPrbRt}%</h3>
            </ReportSection>
          }
          {sidebarData.hasOwnProperty('EssentialPct') &&               
            <ReportSection>
              <h2>Essential Workers<Tooltip id="essentialWorkers"/></h2>
              <h6>Source: <a href="https://www.census.gov/programs-surveys/acs" target="_blank" rel="noopener noreferrer">American Community Survey</a></h6>
              <h3>{Math.round(sidebarData.EssentialPct*100)}%</h3>
            </ReportSection>
          }
          {sidebarData.hasOwnProperty('Over65YearsPrc') && 
              <ReportSection>
                <h2>Community Health Context<Tooltip id="healthcontext"/></h2>
                <h6>Source: <a href="https://www.countyhealthrankings.org/" target="_blank" rel="noopener noreferrer">County Health Rankings</a></h6>
                <p>65 and older<Tooltip id="Over65YearsPrc"/></p>
                <h3>{sidebarData.Over65YearsPrc}%</h3>
                <p>Adult obesity<Tooltip id="AdObPrc"/></p>
                <h3>{sidebarData.AdObPrc}%</h3>
                <p>Diabetes prevalence<Tooltip id="AdDibPrc"/></p>
                <h3>{sidebarData.AdDibPrc}%</h3>
                <p>Adult smoking<Tooltip id="SmkPrc"/></p>
                <h3>{sidebarData.SmkPrc}%</h3>
                <p>Excessive drinking<Tooltip id="ExcDrkPrc"/></p>
                <h3>{sidebarData.ExcDrkPrc}%</h3>
                <p>Drug overdose deaths<Tooltip id="DrOverdMrtRt"/></p>
                <h3>{sidebarData.DrOverdMrtRt}</h3>

              </ReportSection>
            }
          {sidebarData.hasOwnProperty('LfExpRt') &&
              <ReportSection expanded={expanded}>
                <h2>Length &amp; Quality of Life<Tooltip id="healthlife"/></h2>
                <h6>Source: <a href="https://www.countyhealthrankings.org/" target="_blank" rel="noopener noreferrer">County Health Rankings</a></h6>
                <p>Life expectancy<Tooltip id="LfExpRt"/></p>
                <h3>{sidebarData.LfExpRt}</h3>
                <p>Self-rated health<Tooltip id="SlfHlthPrc"/></p>
                <h3>{sidebarData.SlfHlthPrc}%</h3>
              </ReportSection>
            }
          {sidebarData.hasOwnProperty('severity_index') && 
              <ReportSection>
                <h2>Forecasting</h2><br/>            
                <h6>Source: <a href="https://github.com/Yu-Group/covid19-severity-prediction/" target="_blank" rel="noopener noreferrer">Yu Group at Berkeley</a></h6>            
                
                <p>5-Day Severity Index<Tooltip id="SeverityIndex"/></p>
                <h3> {['','Low','Medium','High'][Math.round(sidebarData.severity_index)]}</h3>
                
                <p>Predicted Deaths <Tooltip id="PredictedDeaths"/></p>
                <br/>
                <p>{sidebarData.predDates[0].split('_').slice(1,).join('-')}</p>
                <h3>{Math.round(sidebarData.pred1*10)/10}</h3>
              
                <p>{sidebarData.predDates[1].split('_').slice(1,).join('-')}</p>
                <h3>{Math.round(sidebarData.pred2*10)/10}</h3>
                
                <p>{sidebarData.predDates[2].split('_').slice(1,).join('-')}</p>
                <h3>{Math.round(sidebarData.pred3*10)/10}</h3>
                
                <p>{sidebarData.predDates[3].split('_').slice(1,).join('-')}</p>
                <h3>{Math.round(sidebarData.pred4*10)/10}</h3>
                
                <p>{sidebarData.predDates[4].split('_').slice(1,).join('-')}</p>
                <h3>{Math.round(sidebarData.pred5*10)/10}</h3>
                
                <p>{sidebarData.predDates[5].split('_').slice(1,).join('-')}</p>
                <h3>{Math.round(sidebarData.pred6*10)/10}</h3>
                
                <p>{sidebarData.predDates[6].split('_').slice(1,).join('-')}</p>
                <h3>{Math.round(sidebarData.pred7*10)/10}</h3>
              
              </ReportSection>
            }
            {sidebarData.hasOwnProperty('pct_home') && 
              <ReportSection>
                <h2>Mobility</h2><br/>     
                <p>Percent Completely At Home</p>
                <div className="numberChartContainer">
                  <h3>{sidebarData.pct_home}%</h3>
                </div>
                <p>Percent Full Time Behavior</p>
                <div className="numberChartContainer">
                  <h3>{sidebarData.pct_fulltime}%</h3>
                </div>
                <p>Percent Part Time Behavior</p>
                <div className="numberChartContainer">
                  <h3>{sidebarData.pct_parttime}%</h3>
                </div>
              </ReportSection>
            }
          
          <div className="extraPadding"></div>
          
          <button onClick={handleOpenClose} id="showHideRight" className={panelState.info ? 'active' : 'hidden'}>{report}</button>
        </ReportContainer>
      </ReportWrapper>
    </DataPanelContainer>
  );
}