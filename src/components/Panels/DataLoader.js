// Library import
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { useGeoda } from '../../contexts/Geoda';

import { setPanelState, addCustomData } from '../../actions';
import { colorScales } from '../../config/scales';

import Select from '@mui/material/Select';
import { StyledDropDown, Gutter } from '../../styled_components';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

// Config/component import
import colors from '../../config/colors';

const fadeIn = keyframes`
  from {opacity:0;}
  to {opacity:1;}
}`;

const DataLoaderContainer = styled.div`
  z-index: ${(props) => props.zIndex || 50};
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  font-family: 'Lato', sans-serif;
  opacity: 0;
  animation-name: ${fadeIn};
  animation-duration: 1;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
`;
const Shade = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100%;
  background: ${(props) =>
    props.transparent ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,0.75)'};
  border: none;
  z-index: 0;
  cursor: pointer;
`;

const Modal = styled.div`
  display: block;
  background: ${(props) => (props.dark ? colors.darkgray : colors.gray)};
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.7);
  border-radius: 1em;
  z-index: 1;
  padding: 1rem;
  color: white;
  margin: auto;
  min-width: ${(props) => (props.fullwidth ? '300px' : 'initial')};
  input[type='submit'] {
    padding: 0.5em;
    border: 1px solid ${colors.yellow};
    background: ${colors.gray};
    color: ${colors.yellow};
    cursor: pointer;
    margin: 0.5em;
    transition: 250ms all;
    &:hover {
      background: ${colors.yellow};
      color: ${colors.darkgray};
    }
  }

  input[type='file'],
  input[type='text'] {
    color: white;
    border-color: white;
    padding-bottom: 0.5em;
    background: ${colors.gray};
    border-bottom: 1px solid ${colors.white};
  }
  input[type='text'] {
    padding: 0.5em;
  }
  a {
    color: ${colors.yellow};
  }
  transition: 250ms all;
  div.MuiFormControl-root {
    width: ${(props) => (props.fullwidth ? '100%' : 'auto')};
  }
`;

const HelperText = styled.p`
  font-size: 0.75rem;
`;

const FormButton = styled.button`
  padding: 0.5em;
  border: 1px solid ${colors.white};
  background: ${(props) => (props.active ? colors.white : colors.gray)};
  color: ${(props) => (props.active ? colors.gray : colors.white)};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  margin: 0.5em 0.5em 0.5em 0;
  opacity: ${(props) => (props.disabled ? 0.25 : 1)};
`;

const MessageText = styled.p`
  color: ${(props) =>
    props.type === 'error'
      ? colors.red
      : props.type === 'wait'
      ? colors.yellow
      : colors.lightblue};
  padding: 0.5em;
`;

const FileForm = styled.form`
  opacity: ${(props) => (props.complete ? 0.5 : 1)};
  transition: 250ms all;
  transition-delay: 3s all;
`;

const StyledStepper = styled(Stepper)`
  &.MuiPaper-root {
    background: none;
    .MuiSvgIcon-root {
      circle {
        color: ${colors.darkgray};
      }
    }

    .MuiStepIcon-active {
      circle {
        color: ${colors.yellow};
      }
      text {
        fill: ${colors.darkgray};
      }
    }
    .MuiStepLabel-label {
      color: ${colors.white};
    }
    .MuiStepIcon-completed,
    .MuiStepLabel-completed {
      color: ${colors.skyblue};
    }
  }
`;

const StepperButton = styled(FormButton)`
  color: ${(props) => (props.back ? colors.yellow : colors.darkgray)};
  background: ${(props) => (props.back ? colors.gray : colors.yellow)};
  border: 1px solid ${colors.yellow};
`;

const FileUploader = ({ onFileSelectSuccess, onFileSelectError }) => {
  const handleFileInput = (e) => {
    // handle validations
    const file = e.target.files[0];
    if (!file.name.includes('json')) {
      onFileSelectError({ error: 'File must be GeoJSON.' });
    } else {
      onFileSelectSuccess(file);
    }
  };

  return <input type="file" onChange={handleFileInput} />;
};

const validateGeojson = (content) => {
  if (!content) {
    return ['Please select a file.', false];
  }
  if (
    content.crs?.properties?.name &&
    !content.crs.properties.name.includes('CRS84')
  ) {
    return ['Geospatial data must be in WGS84 projection.', false];
  }
  if (content.features === undefined || !content.features.length) {
    return ['No features detected.', false];
  }

  return [false, true];
};

const steps = ['Load your GeoJSON', 'Configure your Variables'];

const Steps = ({ activeStep, steps }) => (
  <>
    <StyledStepper activeStep={activeStep}>
      {steps.map((label) => {
        return (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        );
      })}
    </StyledStepper>
  </>
);

const StepButtons = ({ activeStep, setActiveStep, currentGeojson }) => (
  <>
    <StepperButton
      onClick={() => setActiveStep((prev) => prev - 1)}
      back
      disabled={activeStep === 0}
    >
      Back
    </StepperButton>
    <StepperButton
      onClick={() => setActiveStep((prev) => prev + 1)}
      disabled={
        activeStep === steps.length - 1 || currentGeojson.columns === undefined
      }
    >
      Next
    </StepperButton>
  </>
);

// const FormDropDownContainer = styled.div`
//   min-width: 100px;
//   margin: 0 auto;
//   display: flex;
//   justify-content: center;
//   .MuiFormControl-root {
//     min-width: 100px;
//   }
// `;

const CardContainer = styled(Grid)`
  max-height: 50vh;
  overflow-y: scroll;
`;

const VariableCard = styled(Card)`
  &.MuiPaper-root {
    background-color: ${colors.lightgray};
    button {
      font-size: 1rem;
      background: ${colors.lightgray};
      color: ${colors.darkgray};
      border: 1px solid ${colors.darkgray};
      padding: 0.5em;
      font-family: 'Lato', sans-serif;
      cursor: pointer;
      margin: 0 auto;
    }
    p {
      font-size: 1rem;
    }
  }
`;

const ColorBarContainer = styled.span`
  display: flex;
  width: 100%;
  span {
    height: 10px;
    flex: 1;
  }
`;

const VariableTextField = styled(TextField)`
  &.MuiFormControl-root {
    margin-top: -1em;
    border-bottom: 1px solid white;
  }
  label {
    visibility: hidden;
    display: none;
    text-align: center;
  }
  input {
    color: white;
    text-align: center;
  }
`;

const VariableLabel = styled.p`
  color: white;
  margin-bottom: 0;
`;

const ColorBar = ({ colors }) => (
  <ColorBarContainer>
    {colors.map((color) => (
      <span style={{ background: `rgb(${color.join(',')})` }}>&nbsp;</span>
    ))}
  </ColorBarContainer>
);

const VariableEditor = ({
  fileName,
  columns,
  variables,
  setVariables,
  handleClose,
  idx,
}) => {
  const [variableInfo, setVariableInfo] = useState(
    idx !== false
      ? variables[idx]
      : {
          nProperty: columns[0],
          dProperty: 'NULL',
        },
  );

  const handleProperty = (property, value) => {
    setVariableInfo((prev) => {
      return {
        ...prev,
        [property]: value,
      };
    });
  };

  const handleSave = () => {
    const fullSpec = {
      variableName:
        variableInfo.variableName || `${fileName}-${variables.length + 1}`,
      numerator: 'properties',
      nType: 'characteristic',
      nRange: null,
      nIndex: null,
      nProperty: variableInfo.nProperty,
      denominator: 'properties',
      dType: variableInfo.dProperty === 'NULL' ? null : 'characteristic',
      dProperty:
        variableInfo.dProperty === 'NULL' ? null : variableInfo.dProperty,
      dRange: null,
      dIndex: null,
      scale: 1 || variableInfo.scale,
      scale3D: 1000 || variableInfo.scale3D,
      fixedScale: null,
      colorScale: null || variableInfo.colorScale,
      dataNote: null,
    };
    if (idx) {
      setVariables((prev) => {
        prev[idx] = fullSpec;
        return prev;
      });
      handleClose();
    } else {
      setVariables((prev) => {
        let newArray = [...prev];
        newArray.unshift(fullSpec);
        return newArray;
      });
      handleClose();
    }
  };

  const colors8 = [
    'natural_breaks',
    'mobilityWork',
    'BuPu8',
    'purpleSingleHue8',
    'YlGnBu8',
    'YlGn8',
    'greenSingleHue8',
    'mobilityDivergingHome',
    'mobilityDivergingWork',
  ];

  return (
    <DataLoaderContainer zIndex={51}>
      <Modal dark fullwidth>
        <h3>Variable Editor</h3>
        <Gutter h={30} />

        <VariableLabel htmlFor="variableName" required>
          Variable Name
        </VariableLabel>
        <VariableTextField
          required
          id="variableName"
          label="Variable Name"
          onChange={(event) =>
            handleProperty('variableName', event.target.value)
          }
          aria-describedby="variable-name-helper"
          value={variableInfo.variableName}
        />
        <HelperText id="variable-name-helper">
          What your variable should be called.
        </HelperText>
        <Gutter h={30} />

        <StyledDropDown id="numerSelect">
          <InputLabel htmlFor="numerSelect" required>
            Numerator Column
          </InputLabel>
          <Select
            required
            value={variableInfo.nProperty}
            onChange={(event) =>
              handleProperty('nProperty', event.target.value)
            }
            aria-describedby="numer-name-helper"
          >
            {columns.map((col) => (
              <MenuItem value={col} key={'numer-select-' + col}>
                {col}
              </MenuItem>
            ))}
          </Select>
        </StyledDropDown>
        <HelperText id="numer-name-helper">
          The column for your variable.
          <br />
          If you want to normalize your data,
          <br /> the top of your expression.
        </HelperText>
        <Gutter h={30} />

        <StyledDropDown id="denomSelect">
          <InputLabel htmlFor="denomSelect">
            Denominator Column (Optional)
          </InputLabel>
          <Select
            value={variableInfo.dProperty}
            onChange={(event) =>
              handleProperty('dProperty', event.target.value)
            }
            aria-describedby="denom-name-helper"
          >
            <MenuItem value={'NULL'} key={'denom-select-null'}>
              No denominator
            </MenuItem>
            {columns.map((col) => (
              <MenuItem value={col} key={'denom-select-' + col}>
                {col}
              </MenuItem>
            ))}
          </Select>
        </StyledDropDown>
        <HelperText id="denom-name-helper">
          If normalizing, the bottom of your expression.
        </HelperText>

        <Gutter h={30} />

        <StyledDropDown id="colorScaleSelect">
          <InputLabel htmlFor="colorScaleSelect">Color Scale</InputLabel>
          <Select
            value={variableInfo.colorScale}
            onChange={(event) =>
              handleProperty('colorScale', event.target.value)
            }
          >
            {colors8.map((scheme) => (
              <MenuItem value={scheme} key={'color-select-' + scheme}>
                <ColorBar colors={colorScales[scheme].slice(1)} />
              </MenuItem>
            ))}
          </Select>
        </StyledDropDown>
        <Gutter h={30} />

        {/* <VariableLabel htmlFor="colorScaleSelect">Variable Scale</VariableLabel>
            <VariableTextField 
                id="standard-basic" 
                label="Variable Scale" 
                onChange={(event) => handleProperty('scale', event.target.value)}
                type="number"
                value={variableInfo.scale}
            />
            <Gutter h={30} />

            <VariableLabel htmlFor="colorScaleSelect">3D Scale</VariableLabel>
            <VariableTextField 
                id="standard-basic" 
                label="Variable Scale" 
                onChange={(event) => handleProperty('scale3D', event.target.value)}
                type="number"
                value={variableInfo.scale3D}
            /> */}
        <Gutter h={30} />

        <FormButton onClick={handleSave}>Save Variable</FormButton>
      </Modal>
      <Shade
        aria-label="Exit Variable Panel"
        onClick={handleClose}
        transparent
      />
    </DataLoaderContainer>
  );
};

const addIndex = (geojson) => ({
  ...geojson,
  features: geojson.features.map((feature, idx) => ({
    ...feature,
    properties: { ...feature.properties, idx },
  })),
});

// DataLoader component
export default function DataLoader() {
  const dispatch = useDispatch();
  // const customData = useSelector(({params}) => params.customData);

  const [uploadTab, setUploadTab] = useState(true);
  const [selectedFile, setSelectedFile] = useState('');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [fileMessage, setFileMessage] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [variables, setVariables] = useState([]);
  const [editor, setEditor] = useState({ open: false, idx: false });

  const [currentGeojson, setCurrentGeojson] = useState({});
  const {
    geoda,
    // geodaReady
  } = useGeoda();

  const closePanel = () => dispatch(setPanelState({ dataLoader: false }));

  let fileReader;

  const loadArrayBuffer = async (content) => {
    const ab = new TextEncoder().encode(JSON.stringify(content));
    const mapId = await geoda.readGeoJSON(ab);
    setCurrentGeojson((prev) => {
      return {
        ...prev,
        mapId,
      };
    });
  };

  const handleFileRead = (data = false) => {
    const content = data ? data : JSON.parse(fileReader.result);
    const [error, validGeojson] = validateGeojson(content);
    if (validGeojson) {
      const indexedGeoJson = addIndex(content);
      setCurrentGeojson({
        data: { ...indexedGeoJson },
        columns: Object.keys(indexedGeoJson.features[0].properties),
      });
      // setSelectedId(Object.keys(content.features[0].properties)[0])

      setFileMessage({
        type: 'validation',
        body: `Basic validation complete 🎉 Continue to configure your variables. `,
      });

      loadArrayBuffer(content);
    } else {
      setFileMessage({
        type: 'error',
        body: `Error! GeoJSON is invalid: ${error}`,
      });
    }
  };

  const fetchRemoteData = async (url) => {
    const data = await fetch(url)
      .then((response) => {
        setFileMessage({
          type: 'wait',
          body: `Data loaded, validating...`,
        });
        return response.json();
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
    if (data) {
      handleFileRead(data);
      setSelectedFile({
        name: url.split('/').pop(),
      });
    } else {
      setFileMessage({
        type: 'error',
        body: `Error! Unable to fetch data. Please ensure your data source allows remote access.`,
      });
    }
  };

  const handleFileSubmission = (e) => {
    e.preventDefault();
    try {
      if (uploadTab) {
        fileReader = new FileReader();
        fileReader.onloadend = () => handleFileRead();
        fileReader.readAsText(selectedFile);
      } else {
        setFileMessage({
          type: 'wait',
          body: `Please wait, fetching your data...`,
        });
        fetchRemoteData(remoteUrl);
      }
    } catch {
      console.log(e);
    }
  };

  const handleUploadTab = (e) => {
    e.preventDefault();
    setUploadTab(e.target.getAttribute('data-id') === 'file-upload');
  };

  const handleOpenEditor = (idx) => {
    setEditor({ open: true, idx: idx });
  };

  const handleClose = () => setEditor({ open: false, idx: false });

  const handleLoadData = () => {
    dispatch({
      type:'LOAD_GEOJSON',
      payload: {'customdata': currentGeojson}
    })
    dispatch(addCustomData(selectedFile, currentGeojson, variables));
    closePanel();
    handleClose();
  };
  return (
    <DataLoaderContainer>
      <Modal>
        <Gutter h={15} />
        <h2>Atlas Data Loader</h2>
        <Steps
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          steps={steps}
          currentGeojson={currentGeojson}
        />
        {activeStep === 0 && (
          <FileForm onSubmit={handleFileSubmission}>
            <label for="filename">
              {uploadTab
                ? 'Select your GeoJSON for Upload'
                : 'Enter a valid GeoJSON URL'}
            </label>
            <Gutter h={15} />
            <HelperText>
              For more information on formatting your data and privacy, click{' '}
              <a href="/data-loading">here</a>.
            </HelperText>
            <HelperText>
              You can load your file directly, or select a remote link to fetch
              data from.
            </HelperText>
            <Gutter h={15} />

            <FormButton
              onClick={handleUploadTab}
              data-id={'file-upload'}
              active={uploadTab}
            >
              File Upload
            </FormButton>
            <FormButton
              onClick={handleUploadTab}
              data-id={'file-link'}
              active={!uploadTab}
            >
              File Link
            </FormButton>
            <Gutter h={15} />
            {uploadTab && (
              <FileUploader
                onFileSelectSuccess={(file) => {
                  setFileMessage(false);
                  setSelectedFile(file);
                }}
                onFileSelectError={({ error }) =>
                  setFileMessage({
                    type: 'error',
                    body: error,
                  })
                }
              />
            )}
            {!uploadTab && (
              <VariableTextField
                id="remoteUrl"
                label="Remote Data URL"
                onChange={(event) => setRemoteUrl(event.target.value)}
                aria-describedby="remote-data-helper"
                value={remoteUrl}
                placeholder="eg https://raw.githubusercontent.com/..."
              />
            )}

            <input type="submit" value="Validate" />
            {fileMessage && (
              <MessageText type={fileMessage.type}>
                {fileMessage.body}
              </MessageText>
            )}
          </FileForm>
        )}
        {/* {activeStep === 1 && <>
                    <label for="idSelect">Select your data's ID column</label>
                    <Gutter h={15}/>
                    <HelperText>Choose a column that represents your data's featured ID, <br/>such as GEOID or FIPS code, ZIP code, or other geographic identifier.</HelperText>                   
                    <Gutter h={15}/>
                    <FormDropDownContainer>
                        <StyledDropDown id="idSelect">
                            <InputLabel htmlFor="idSelect">ID Column</InputLabel>
                            <Select
                                value={selectedId}
                                onChange={(event) => setSelectedId(event.target.value)}
                                >
                                {currentGeojson.columns.map(col =>  <MenuItem value={col} key={'id-col-select-'+col}>{col}</MenuItem> )}
                                
                            </Select>
                        </StyledDropDown>
                    </FormDropDownContainer>
                </>} */}
        {activeStep === 1 && (
          <>
            <label for="idSelect">Configure your variables</label>
            <Gutter h={15} />
            <CardContainer
              container
              spacing={2}
              justify="center"
              alignItems="flex-start"
            >
              {variables.map((variable, idx) => (
                <Grid item xs={12} md={6} lg={4}>
                  <VariableCard>
                    <CardContent>
                      <p>{variable.variableName}</p>
                    </CardContent>
                    <CardActions>
                      <button onClick={() => handleOpenEditor(idx)}>
                        Edit
                      </button>
                    </CardActions>
                  </VariableCard>
                </Grid>
              ))}
              <Grid item xs={12} md={6} lg={4}>
                <VariableCard>
                  <CardActions>
                    <button
                      onClick={() => setEditor({ open: true, idx: false })}
                    >
                      Add a variable
                    </button>
                  </CardActions>
                </VariableCard>
              </Grid>
            </CardContainer>
            {!!editor.open && (
              <VariableEditor
                fileName={selectedFile.name}
                columns={currentGeojson.columns}
                idx={editor.idx}
                variables={variables}
                setVariables={setVariables}
                handleClose={handleClose}
              />
            )}
            {!!variables.length && (
              <FormButton onClick={handleLoadData}>Load Data</FormButton>
            )}
          </>
        )}
        <Gutter h={30} />
        <StepButtons
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          currentGeojson={currentGeojson}
        />
        <Gutter h={15} />
      </Modal>
      <Shade aria-label="Exit Data Loader" onClick={closePanel}></Shade>
    </DataLoaderContainer>
  );
}
