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
import { setPanelState } from '../actions';
import { colors } from '../config';
import { report } from '../config/svg';
import { DataReport } from '../components'
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
        <DataReport expanded={expanded} />
        <button onClick={handleOpenClose} id="showHideRight" className={panelState.info ? 'active' : 'hidden'}>{report}</button>
      </ReportWrapper>
    </DataPanelContainer>
  );
}