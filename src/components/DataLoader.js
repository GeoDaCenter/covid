// Library import
import React, {useState, useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { setPanelState } from '../actions'

import Select from '@material-ui/core/Select';

// Config/component import
import { colors } from '../config';
import { prop } from 'ramda';

const DataLoaderContainer = styled.div`
    z-index:50;
    position:fixed;
    width:100vw;
    height:100%;
    display:flex;
    justify-content: center;
    align-items: center;
`
const Shade = styled.button`
    position:absolute;
    left:0;
    top:0;
    width:100vw;
    height:100%;
    background:rgba(0,0,0,0.75);
    border:none;
    z-index:0;
    cursor:pointer;
`

const Modal = styled.div`
    display:block;
    max-width:50%;
    height:50%;
    flex:1;
    background:${colors.gray};
    box-shadow: 0px 0px 5px rgba(0,0,0,0.7);
    border-radius: 1em;
    z-index:1;
    padding:1rem;
    color:white;
`

const HelperText = styled.p`
    font-size:0.75rem;
`

const FormButton = styled.button`
    padding:0.5em;
    border:1px solid ${colors.white};
    background: ${props => props.active ? colors.white : colors.darkgray};
    color: ${props => props.active ? colors.darkgray : colors.white};
    cursor:pointer;
    margin:0.5em 0.5em 0.5em 0;
    
`

const ErrorText = styled.p`
    color: ${colors.red};
    padding:0.5em;
    border-button:1px solid ${colors.red};
`

const FileUploader = ({onFileSelectSuccess, onFileSelectError}) => {
    const fileInput = useRef(null)

    const handleFileInput = (e) => {
        // handle validations
        const file = e.target.files[0];
        if (!file.name.includes('json')){
            onFileSelectError({ error: "File must be GeoJSON." });
        } else {
            onFileSelectSuccess(file);
        }
      };

    return (
        <div className="file-uploader">
            <input type="file" onChange={handleFileInput} />
            <button onClick={e => fileInput.current && fileInput.current.click()} className="btn btn-primary" />
        </div>
    )
}

const validateGeojson = (content) => {
    if (content.crs?.properties?.name && !content.crs.properties.name.includes('CRS84') ){
        return ['Geospatial data must be in WGS84 projection.', false]
    }
    if (!content.features.length){
        return ['No features includes', false]
    }

    return [false, true]
}

// DataLoader component
export default function DataLoader(){
    const dispatch = useDispatch()
    const panelOpen = useSelector(state => state.panelState.dataLoader);
    const customData = useSelector(state => state.customData);

    const [uploadTab, setUploadTab] = useState(true);
    const [selectedFile, setSelectedFile] = useState('');
    const [fileError, setFileError] = useState(false);

    const closePanel = (panelOpen) => dispatch(setPanelState({dataLoader: !panelOpen}))

    let fileReader;
    const handleArrayBuffer = (e) => {

    }

    const handleFileRead = () => {
        const content = JSON.parse(fileReader.result);
        const [error, validGeojson] = validateGeojson(content)
        if (validGeojson) {
            // dispatch(adddata) yada yada
            fileReader.onloadend = handleArrayBuffer;
            fileReader.readAsArrayBuffer(selectedFile)
        } else {
            setFileError(`Error! GeoJSON is invalid: ${error}`)
        }
    }
    const handleFileSubmission = (e) => {
        e.preventDefault();
        fileReader = new FileReader();
        fileReader.onloadend = handleFileRead;
        fileReader.readAsText(selectedFile)
    }


    if (!panelOpen){
        return null
    } else {
        return (
            <DataLoaderContainer>
                <Modal>
                    <h2>Data Loader</h2>
                    <hr/>
                    <form onSubmit={handleFileSubmission}>
                        <label for="filename">{uploadTab ? 'Select your GeoJSON for Upload' : 'Enter a valid GeoJSON URL'}</label>
                        <HelperText>For more information on formatting your data, click <a href="#">here</a></HelperText>
                        <FormButton onClick={() => setUploadTab(true)} active={uploadTab}>File Upload</FormButton> 
                        <FormButton onClick={() => setUploadTab(false)} active={!uploadTab}>File Link</FormButton>
                        <br/>
                        {uploadTab && <FileUploader
                            onFileSelectSuccess={(file) => {
                                setFileError(false)
                                setSelectedFile(file)
                            }}
                            onFileSelectError={({ error }) => setFileError(error)}
                            />}
                        {!uploadTab && <input type="text" name="filename"/>}
                        {fileError && <ErrorText>{fileError}</ErrorText>}
                        <input type="submit"/>
                    </form>
                </Modal>
                <Shade 
                    aria-label="Exit Data Loader"
                    onClick={closePanel}
                    ></Shade>
            </DataLoaderContainer>
        )
    }
}