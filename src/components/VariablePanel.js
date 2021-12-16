import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Switch from '@material-ui/core/Switch';
import Slider from '@material-ui/core/Slider';

import styled from 'styled-components';

import Tooltip from './Tooltip';
import { Icon } from '../components';
import { StyledDropDown, BinsContainer, Gutter } from '../styled_components';
import {
  setVariableParams,
  setMapParams,
  setCurrentData,
  setPanelState,
  setParametersAndData,
  setNotification,
  changeDotDensityMode,
  toggleDotDensityRace,
  setDotDensityBgOpacity,
} from '../actions';
import colors from '../config/colors';
import {findIn} from '../utils';
import { fixedScales, colorScales } from '../config/scales';

/** STYLES */
const VariablePanelContainer = styled.div`
  position:absolute;
  left:50px;
  top:0;
  height:auto;
  min-height:calc(100vh - 50px);
  width:min(25%, 350px);
  background-color: ${colors.gray}fa;
  box-shadow: 2px 0px 5px rgba(0,0,0,0.7);
  padding:0;
  box-sizing: border-box;
  transition:125ms all;
  font: 'Lato', sans-serif;
  color:white;
  z-index:0;
  &.hidden {
    transform: translateX(calc(-100% - 50px));
  }
  h1,h2,h3,h4 {
    margin: 0 0 10px 0;
  }
  p {
    margin: 10px 0;
  }
  @media (max-width:1024px) {
    min-width:50vw;
  }  
  @media (max-width:600px) {
    width:100%;
    display: ${(props) => (props.otherPanels ? 'none' : 'initial')};
  }
  div.noteContainer {
    position: absolute;
    bottom:0;
    left:0;
    padding:20px;
    box-sizing:border-box;
    background:${colors.gray};
    width:calc(100%);
    border-top:1px solid black;
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
  user-select:none;
`;
const ButtonGroup = styled.div`
  button:first-of-type {
    border-radius: 0.5em 0 0 0.5em;
  }
  button:last-of-type {
    border-radius: 0 0.5em 0.5em 0;
  }
`;

const VizTypeButton = styled.button`
  background: ${(props) => (props.active ? colors.white : 'none')};
  color: ${(props) => (props.active ? colors.darkgray : colors.white)};
  outline: none;
  border: 1px solid ${colors.white}77;
  padding: 0.25em 0.75em;
  margin: 0;
  font-family: 'Lato', sans-serif;
  font-size: 0.875rem;
  cursor: ${(props) => (props.disabled ? 'none' : 'pointer')};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'initial')};
  opacity: ${(props) => (props.disabled ? '.25' : '1')};
  transition: 250ms all;
  letter-spacing: 0.02857em;
  font-weight: 500;
  &:hover {
    background: ${colors.lightgray};
    color: ${colors.darkgray};
  }
`;

const DotDensityControls = styled.div`
  border: 1px solid ${colors.white}77;
  max-width: 20em;
  padding: 0 0.5em 1.5em 0.5em;
  p.help-text {
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: bold;
    text-align: center;
  }
  span.MuiSlider-root {
    margin: 1em 1em 0 1em;
    max-width: calc(100% - 2em);
    padding: 0;
    color: ${colors.white};
  }
`;

const DateSelectorContainer = styled.div`
  opacity: ${(props) => (props.disabled ? 0.25 : 1)};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'initial')};
`;

const TwoUp = styled.div`
  width: 100%;
  .MuiFormControl-root {
    width: auto;
    min-width: 8rem;
    margin-right: 5px;
  }
`;

const ControlsContainer = styled.div`
  max-height: 78vh;
  overflow-y: scroll;
  padding: 20px;

  ::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #2b2b2b;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: url('${process.env.PUBLIC_URL}/icons/grip.png'), #999;
    background-position: center center;
    background-repeat: no-repeat, no-repeat;
    background-size: 50%, 100%;
    transition: 125ms all;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: url('${process.env.PUBLIC_URL}/icons/grip.png'), #f9f9f9;
    background-position: center center;
    background-repeat: no-repeat, no-repeat;
    background-size: 50%, 100%;
  }

  @media (max-height: 1325px) {
    padding: 20px 20px 10vh 20px;
  }

  @media (max-width: 600px) {
    width: 100%;
    padding: 0 10px 25vh 10px;
  }
`;

const ListSubheader = styled(MenuItem)`
  font-variant: small-caps;
  font-weight: 800;
`;

const AcsRaceButton = styled.button`
  background: ${(props) =>
    props.active ? `rgb(${props.bgColor.join(',')})` : colors.darkgray};
  color: ${(props) => (props.active ? colors.black : colors.white)};
  text-align: left;
  border: none;
  outline: none;
  margin: 0.25em;
  padding: 0.5em;
  border-radius: 0.5em;
  cursor: pointer;
`;
/** END STYLES */

const dotDensityAcsGroups = [
  {
    idx: 3,
    name: 'Black or African American',
  },
  {
    idx: 4,
    name: 'Hispanic or Latino',
  },
  {
    idx: 2,
    name: 'Asian',
  },
  {
    idx: 8,
    name: 'White',
  },
  {
    idx: 1,
    name: 'American Indian or Alaska Native',
  },
  {
    idx: 5,
    name: 'Native Hawaiian or Other Pacific Islander',
  },
  {
    idx: 6,
    name: 'Other',
  },
  {
    idx: 7,
    name: 'Two or more',
  },
];

const BYODButton = styled.button`
  background: none;
  color: ${colors.white};
  border: 1px solid white;
  cursor: pointer;
  padding: 0.25em 0.5em;
  margin: 0.25em 0;
  border-radius: 0.5em;
  text-transform: capitalize;
  font-size: 0.75rem;
  transition: 250ms all;
  &:hover {
    color: ${colors.yellow};
    border-color: ${colors.yellow};
  }
`;
const onlyUnique = (value, index, self) => self.indexOf(value) === index;

export default function VariablePanel() {
  const dispatch = useDispatch();

  const currentData = useSelector((state) => state.currentData);

  const binMode = useSelector((state) => state.mapParams.binMode);
  const mapType = useSelector((state) => state.mapParams.mapType);
  const vizType = useSelector((state) => state.mapParams.vizType);
  const dotDensityParams = useSelector(
    (state) => state.mapParams.dotDensityParams,
  );

  const overlay = useSelector((state) => state.mapParams.overlay);
  const resource = useSelector((state) => state.mapParams.resource);

  const panelState = useSelector((state) => state.panelState);

  const numerator = useSelector((state) => state.dataParams.numerator);
  const variableName = useSelector((state) => state.dataParams.variableName);
  const nType = useSelector((state) => state.dataParams.nType);
  const nRange = useSelector((state) => state.dataParams.nRange);
  const dType = useSelector((state) => state.dataParams.dType);
  const rangeType = useSelector((state) => state.dataParams.rangeType);

  const variables = useSelector((state) => state.variables);
  const datasets = useSelector((state) => state.datasets);
  const currentPreset = findIn(datasets, 'file', currentData);
  const variableTree = useSelector((state) => state.variableTree);
  const datasetTree = useSelector((state) => state.datasetTree);
  const urlParamsTree = useSelector((state) => state.urlParamsTree);
  const allGeographies = Object.values(variableTree)
    .flatMap((o) => Object.keys(o))
    .filter(onlyUnique);
  const allDatasets = Object.values(variableTree)
    .flatMap((o) => Object.values(o))
    .flatMap((o) => o)
    .filter(onlyUnique);
  const isCustom = !['State', 'County', 'County (Hybrid)'].includes(
    currentPreset.geography,
  );

  const handleMapType = (event, newValue) => {
    let nBins = newValue === 'hinge15_breaks' ? 6 : 8;
    if (newValue === 'lisa') {
      if (
        numerator === 'vaccines_one_dose' ||
        numerator === 'vaccines_fully_vaccinated'
      ) {
        dispatch(
          setNotification(
            `
                    <h2>Map Note</h2>
                    <p>
                        <br/>
                        Red-colored areas represent a <b>high</b> share of the population that has been vaccinated. Blue-colored areas represent areas where vaccination rates remain <b>low</b>.                    </a>
                    </p>
                `,
            'bottom-right',
          ),
        );
      }
      dispatch(
        setMapParams({
          mapType: newValue,
          nBins: 4,
          bins: fixedScales[newValue],
          colorScale: colorScales[newValue],
          binMode: 'natural_breaks',
        }),
      );
    } else {
      dispatch(
        setMapParams({
          nBins,
          mapType: newValue,
          binMode: newValue === 'hinge15_breaks' ? 'dynamic' : '',
        }),
      );
    }
  };
  const handleMapOverlay = (event) => {
    dispatch(
      setMapParams({
        overlay: event.target.value,
      }),
    );
  };
  const handleMapResource = (event) => {
    dispatch(
      setMapParams({
        resource: event.target.value,
      }),
    );
  };

  const handleVizTypeButton = (vizType) => dispatch(setMapParams({ vizType }));

  const handleDotDensitySlider = (e, newValue) => dispatch(setDotDensityBgOpacity(newValue));
  const handleVariable = (e) => dispatch({
    type:'CHANGE_VARIABLE',
    payload: e.target.value,
  })
  const handleGeography = (e) => dispatch({
    type:'CHANGE_GEOGRAPHY',
    payload: e.target.value,
  })
  
  const handleDataset = (e) => {
    dispatch(
      setCurrentData(
        datasetTree[currentPreset.geography][e.target.value],
      ),
    );
  };

  const handleRangeButton = (event) => {
    let val = event.target.value;

    if (val === 'custom') {
      // if swapping over to a custom range, which will use a 2-part slider to scrub the range
      if (nType === 'time-series' && dType === 'time-series') {
        dispatch(
          setVariableParams({ nRange: 30, dRange: 30, rangeType: 'custom' }),
        );
      } else if (nType === 'time-series') {
        dispatch(setVariableParams({ nRange: 30, rangeType: 'custom' }));
      } else if (dType === 'time-series') {
        dispatch(setVariableParams({ dRange: 30, rangeType: 'custom' }));
      }
    } else {
      // use the new value -- null for cumulative, 1 for daily, 7 for weekly
      if (nType === 'time-series' && dType === 'time-series') {
        dispatch(
          setVariableParams({ nRange: val, dRange: val, rangeType: 'fixed' }),
        );
      } else if (nType === 'time-series') {
        dispatch(setVariableParams({ nRange: val, rangeType: 'fixed' }));
      } else if (dType === 'time-series') {
        dispatch(setVariableParams({ dRange: val, rangeType: 'fixed' }));
      }
    }
  };

  const handleSwitch = () =>
    dispatch(setMapParams({ binMode: binMode === 'dynamic' ? '' : 'dynamic' }));

  const availableData = currentPreset.geography ? allDatasets.filter(
    (dataset) =>
      variableTree[variableName][currentPreset.geography].indexOf(
        dataset,
      ) !== -1,
  ) : [];
  const dataName = availableData.includes(urlParamsTree[currentData].name)
    ? urlParamsTree[currentData].name
    : availableData[0];

  return (
    <VariablePanelContainer
      className={panelState.variables ? '' : 'hidden'}
      otherPanels={panelState.info}
      id="variablePanel"
    >
      {panelState.variables && (
        <ControlsContainer>
          <h2>
            Data Sources &amp;
            <br /> Map Variables
          </h2>
          <Gutter h={20} />
          <StyledDropDown id="variableSelect">
            <InputLabel htmlFor="variableSelect">Variable</InputLabel>
            <Select
              value={variableName}
              onChange={handleVariable}
              MenuProps={{ id: 'variableMenu' }}
            >
              {Object.keys(variableTree).map((variable) => {
                if (variable.split(':')[0] === 'HEADER') {
                  return (
                    <ListSubheader key={variable.split(':')[1]} disabled>
                      {variable.split(':')[1]}
                    </ListSubheader>
                  );
                } else {
                  return (
                    <MenuItem value={variable} key={variable}>
                      {variable}
                    </MenuItem>
                  );
                }
              })}
            </Select>
          </StyledDropDown>
          <Gutter h={35} />
          <DateSelectorContainer disabled={nType === 'characteristic'}>
            <StyledDropDown id="dateSelector">
              <InputLabel htmlFor="date-select">Date Range</InputLabel>
              <Select
                id="date-select"
                value={
                  nRange === null ||
                  rangeType === 'custom' ||
                  variableName.indexOf('Testing') !== -1 ||
                  variableName.indexOf('Workdays') !== -1
                    ? 'x'
                    : nRange
                }
                onChange={handleRangeButton}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
              >
                <MenuItem value="x" disabled style={{ display: 'none' }}>
                  {rangeType === 'custom' && <span>Custom Range</span>}
                  {nRange === null &&
                    variableName.indexOf('Testing') === -1 &&
                    variableName.indexOf('Workdays') === -1 && (
                      <span>Cumulative</span>
                    )}
                  {variableName.indexOf('Testing') !== -1 && (
                    <span>7-Day Average</span>
                  )}
                  {variableName.indexOf('Workdays') !== -1 && (
                    <span>Daily Average</span>
                  )}
                </MenuItem>
                <MenuItem
                  value={null}
                  key={'cumulative'}
                  disabled={
                    variableName.indexOf('Testing') !== -1 ||
                    variableName.indexOf('Workdays') !== -1
                  }
                >
                  Cumulative
                </MenuItem>
                <MenuItem
                  value={1}
                  key={'daily'}
                  disabled={
                    variableName.indexOf('Testing') !== -1 ||
                    variableName.indexOf('Workdays') !== -1
                  }
                >
                  Daily New
                </MenuItem>
                <MenuItem
                  value={7}
                  key={'7-day-ave'}
                  disabled={
                    variableName.indexOf('Testing') !== -1 ||
                    variableName.indexOf('Workdays') !== -1
                  }
                >
                  7-Day Average
                </MenuItem>
                <MenuItem
                  value={'custom'}
                  key={'customRange'}
                  disabled={
                    variableName.indexOf('Testing') !== -1 ||
                    variableName.indexOf('Workdays') !== -1
                  }
                >
                  Custom Range
                </MenuItem>
              </Select>
            </StyledDropDown>
            <BinsContainer
              id="binModeSwitch"
              disabled={
                variableName.indexOf('Testing') !== -1 ||
                nType === 'characteristic' ||
                mapType === 'lisa'
              }
            >
              <Switch
                checked={binMode === 'dynamic'}
                onChange={handleSwitch}
                name="bin chart switch"
              />
              <p>
                {binMode === 'dynamic' ? 'Dynamic' : 'Fixed Bins'}
                <Tooltip id="BinModes" />
              </p>
            </BinsContainer>
          </DateSelectorContainer>
          <Gutter h={35} />

          <StyledDropDown id="geographySelect" style={{ marginRight: '20px' }}>
            <InputLabel htmlFor="geographySelect">Geography</InputLabel>
            <Select
              value={currentPreset.geography}
              onChange={handleGeography}
            >
              {allGeographies.map((geography) => (
                <MenuItem
                  value={geography}
                  key={geography}
                  disabled={
                    !variableTree[variableName].hasOwnProperty(geography)
                  }
                >
                  {geography}
                </MenuItem>
              ))}
            </Select>
          </StyledDropDown>
          <StyledDropDown id="datasetSelect">
            <InputLabel htmlFor="datasetSelect">Data Source</InputLabel>
            <Select value={dataName} onChange={handleDataset}>
              {allDatasets.map((dataset) => (
                <MenuItem
                  value={dataset}
                  key={dataset}
                  disabled={
                    variableTree[variableName][currentPreset.geography] === undefined ||
                    variableTree[variableName][currentPreset.geography].indexOf(dataset) === -1
                  }
                >
                  {dataset}
                </MenuItem>
              ))}
            </Select>
          </StyledDropDown>
          <Gutter h={35} />
          <StyledDropDown component="Radio" id="mapType">
            <FormLabel component="legend">Map Type</FormLabel>
            <RadioGroup
              aria-label="maptype"
              name="maptype1"
              onChange={handleMapType}
              value={mapType}
              className="radioContainer"
            >
              <FormControlLabel
                value="natural_breaks"
                key="natural_breaks"
                control={<Radio />}
                label="Natural Breaks"
              />
              <Tooltip id="NaturalBreaks" />
              <br />
              <FormControlLabel
                value="hinge15_breaks"
                key="hinge15_breaks"
                control={<Radio />}
                label="Box Map"
              />
              <Tooltip id="BoxMap" />
              <br />
              <FormControlLabel
                value="lisa"
                key="lisa"
                control={<Radio />}
                label="Hotspot"
              />
              <Tooltip id="Hotspot" />
              <br />
            </RadioGroup>
          </StyledDropDown>
          <Gutter h={15} />
          <p>Visualization Type</p>
          <ButtonGroup id="visualizationType">
            <VizTypeButton
              active={vizType === '2D'}
              data-val="2D"
              key="2D-btn"
              onClick={() => handleVizTypeButton('2D')}
            >
              2D
            </VizTypeButton>
            <VizTypeButton
              active={vizType === '3D'}
              data-val="3D"
              key="3D-btn"
              onClick={() => handleVizTypeButton('3D')}
              disabled={isCustom}
            >
              3D
            </VizTypeButton>
            <VizTypeButton
              active={vizType === 'dotDensity'}
              data-val="dotDensity"
              key="dotDensity-btn"
              onClick={() => handleVizTypeButton('dotDensity')}
            >
              Dot Density
            </VizTypeButton>
            <VizTypeButton
              active={vizType === 'cartogram'}
              data-val="cartogram"
              key="cartogram-btn"
              onClick={() => handleVizTypeButton('cartogram')}
              disabled={isCustom}
            >
              Cartogram
            </VizTypeButton>
          </ButtonGroup>
          <Gutter h={12} />
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
          {vizType === 'dotDensity' && (
            <DotDensityControls>
              <p className="help-text">1 Dot = 500 People</p>
              <BinsContainer>
                {!isCustom && (
                  <>
                    <Switch
                      checked={dotDensityParams.colorCOVID}
                      onChange={() => dispatch(changeDotDensityMode())}
                      name="dot density mode"
                      disabled={isCustom}
                    />
                    <p>
                      {dotDensityParams.colorCOVID
                        ? 'Color by COVID Data'
                        : 'Color by ACS Race / Ethnicity'}
                    </p>
                    <Gutter h={10} />
                    <p className="help-text">
                      Toggle ACS Race / Ethnicity Groups
                    </p>
                  </>
                )}
                <Gutter h={5} />
                {dotDensityAcsGroups.map((group) => (
                  <AcsRaceButton
                    active={dotDensityParams.raceCodes[group.idx]}
                    bgColor={colors.dotDensity[group.idx]}
                    key={group.name + 'dd-button'}
                    onClick={() => dispatch(toggleDotDensityRace(group.idx))}
                  >
                    {group.name}
                  </AcsRaceButton>
                ))}
              </BinsContainer>
              <Gutter h={20} />
              <p className="help-text">Background Opacity</p>
              <Slider
                value={dotDensityParams.backgroundTransparency}
                min={0}
                step={0.01}
                max={1}
                onChange={handleDotDensitySlider}
              />
            </DotDensityControls>
          )}
          <Gutter h={20} />
          <TwoUp id="overlaysResources">
            <StyledDropDown>
              <InputLabel htmlFor="overlay-select">Overlay</InputLabel>
              <Select
                id="overlay-select"
                value={overlay}
                onChange={handleMapOverlay}
              >
                <MenuItem value="" key={'None'}>
                  None
                </MenuItem>
                <MenuItem
                  value={'native_american_reservations'}
                  key={'native_american_reservations'}
                >
                  Native American Reservations
                </MenuItem>
                <MenuItem value={'segregated_cities'} key={'segregated_cities'}>
                  Hypersegregated Cities
                  <Tooltip id="Hypersegregated" />
                </MenuItem>
                <MenuItem value={'blackbelt'} key={'blackbelt'}>
                  Black Belt Counties
                  <Tooltip id="BlackBelt" />
                </MenuItem>
                <MenuItem
                  value={'uscongress-districts'}
                  key={'uscongress-districts'}
                >
                  US Congressional Districts <Tooltip id="USCongress" />
                </MenuItem>
                {/* <MenuItem value={'mobility-county'} key={'mobility-county'}>Mobility Flows (County) WARNING BIG DATA</MenuItem> */}
              </Select>
            </StyledDropDown>
            <Gutter h={20} />
            <StyledDropDown>
              <InputLabel htmlFor="resource-select">Resource</InputLabel>
              <Select
                id="resource-select"
                value={resource}
                onChange={handleMapResource}
              >
                <MenuItem value="" key="None">
                  None
                </MenuItem>
                <MenuItem value={'clinics_hospitals'} key={'variable1'}>
                  Clinics and Hospitals
                  <Tooltip id="ClinicsAndHospitals" />
                </MenuItem>
                <MenuItem value={'clinics'} key={'variable2'}>
                  Clinics
                  <Tooltip id="Clinics" />
                </MenuItem>
                <MenuItem value={'hospitals'} key={'variable3'}>
                  Hospitals
                  <Tooltip id="Hospitals" />
                </MenuItem>
                <MenuItem value={'vaccinationSites'} key={'variable4'}>
                  Federal Vaccination Sites
                  <Tooltip id="vaccinationSites" />
                </MenuItem>
              </Select>
            </StyledDropDown>
          </TwoUp>
        </ControlsContainer>
      )}
      <div className="noteContainer">
        {/* <h3>Help us improve the Atlas!</h3>
        <p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSf0KdYeVyvwnz0RLnZijY3kdyFe1SwXukPc--a1HFPE1NRxyw/viewform?usp=sf_link" target="_blank" rel="noopener noreferrer">Take the Atlas v2 survey here </a>
          or share your thoughts at <a href="mailto:contact@theuscovidatlas.org" target="_blank" rel="noopener noreferrer">contact@theuscovidatlas.org.</a>
        </p>
        <hr></hr> */}
        <p className="note">
          Data is updated with freshest available data at 3pm CST daily, at
          minimum. In case of data discrepancy, local health departments are
          considered most accurate as per CDC recommendations. More information
          on <a href="data.html">data</a>, <a href="methods.html">methods</a>,
          and <a href="FAQ.html">FAQ</a> at main site.
        </p>
        <div className="poweredByGeoda">
          <a
            href="https://geodacenter.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={`${process.env.PUBLIC_URL}/assets/img/geoda-logo.png`}
              alt="Geoda Logo"
            />
            POWERED BY GEODA
          </a>
        </div>
      </div>
      {/* <button onClick={handleOpenClose} id="showHideLeft" className={panelState.variables ? 'active' : 'hidden'}>
        <Icon symbol="settings" />
      </button> */}
    </VariablePanelContainer>
  );
}
