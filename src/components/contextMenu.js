// general imports, state
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
// import Grid from '@material-ui/core/Grid';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { colors } from '../config';
import * as SVG from '../config/svg';
import { setPanelState } from '../actions';

const MenuContainer = styled(Paper)`
    position:fixed;
    left: ${props=>props.x}px;
    top: ${props=>props.y}px;
    background:${colors.lightgray};
    padding:0 15px 15px 15px;
    border-radius:4px;
    z-index:50000;
    font-family:'Lato', sans-serif;
    svg {
        width:20px;
        height:20px;
    }
    circle.cls-1 {
      fill:none;
      stroke-width:6px;
      stroke:black;
    }
    h2 {
        margin:30px 0 5px 0;
        &:nth-of-type(1) {
            margin-top:15px;
        }
        &.noBottomMargin {
            margin-bottom:0;
        }
    }
    p {
        margin:0;
    }
    span.MuiCheckbox-root {
        padding:2px 12px;
    }
    
`
const Contextbutton = styled(Button)`
    background-color: ${props => props.active ? colors.lightblue : colors.white} !important;
    .MuiButton-label {
        // font-size:75%;
        text-transform:none;
    }
    p {
        margin-left:5px;
        transform:translateY(2px);
    }
`

const recurseParentNode = (element) => {
    if (element.parentNode === null || element.parentNode.id === "contextMenu" || element.parentNode.id === "mainContainer") {
        return element.parentNode?.id
    } else {
        return recurseParentNode(element.parentNode)
    }
}
const ContextMenu = () => {
    const dispatch = useDispatch();

    const panelState = useSelector(state => state.panelState);
    const {x, y} = useSelector(state => state.panelState.contextPos);

    const closePanel = () => dispatch(setPanelState({context:false}));
    
    useEffect(() => {
        if (panelState.context) {
            const listener = (e) => {
                if (recurseParentNode(e.target) !== "contextMenu") {
                    closePanel()                  
                }
            }
            const removeListener = (e) => {
                if (recurseParentNode(e.target) !== "contextMenu") {
                    document.removeEventListener('mousedown', listener);
                    document.removeEventListener('mousedown', removeListener);
                    document.removeEventListener('wheel', listener);
                    document.removeEventListener('wheel', removeListener);
                    document.removeEventListener('touchstart', listener);
                    document.removeEventListener('touchstart', removeListener);
                }
            }

            document.addEventListener('mousedown', listener, {passive: true});
            document.addEventListener('mousedown', removeListener, {passive: true});
            document.addEventListener('wheel', listener, {passive: true});
            document.addEventListener('wheel', removeListener, {passive: true});
            document.addEventListener('touchstart', listener, {passive: true});
            document.addEventListener('touchstart', removeListener, {passive: true}); 
        }
    }, [panelState.context])
    
    return panelState.context ? 
        <MenuContainer x={x} y={y} elevation={8} id="contextMenu">
            <h2>Toggle Panels</h2>     
            <ButtonGroup>
                <Contextbutton 
                    title="Data and Map Variables"
                    active={panelState.variables}
                    onClick={() => dispatch(setPanelState({variables:panelState.variables ? false : true}))}
                    >
                    {SVG.settings}
                </Contextbutton>
                <Contextbutton
                    title="Report and Context"
                    active={panelState.info}
                    onClick={() => dispatch(setPanelState({info:panelState.info ? false : true}))}
                >
                    {SVG.report}
                </Contextbutton>
                <Contextbutton
                    title="Chart"
                    active={panelState.lineChart}
                    onClick={() => dispatch(setPanelState({lineChart:panelState.lineChart ? false : true}))}
                >
                    {SVG.chart}
                </Contextbutton>
                <Contextbutton
                    title="Atlas Manual and Wiki"
                    active={panelState.tutorial}
                    onClick={() => dispatch(setPanelState({tutorial:panelState.tutorial ? false : true}))}
                >
                    {SVG.info}
                </Contextbutton>
            </ButtonGroup>
            <h2>Map Selection Control</h2>  
            <FormControlLabel
                control={<Switch  />} //checked={state.checkedA} onChange={handleChange} name="checkedA"
                label="Select Multiple"
            /><br/>  
            <ButtonGroup>
                <Contextbutton>Reset</Contextbutton>
                <Contextbutton>Box</Contextbutton>
                <Contextbutton>Brush</Contextbutton>
            </ButtonGroup>
            <h2>Share</h2>   
            <ButtonGroup>
                <Contextbutton>{SVG.share}</Contextbutton>
                <Contextbutton>{SVG.print}</Contextbutton>
                <Contextbutton>{SVG.twitter}</Contextbutton>
                <Contextbutton>{SVG.facebook}</Contextbutton>
            </ButtonGroup>
            <br/>
            <ButtonGroup>
                <Contextbutton>{SVG.embed} <p>Embed Code</p></Contextbutton>
            </ButtonGroup>

            <h2 className="noBottomMargin">Save Settings</h2> 
            <p>Privacy Policy</p>  
            <FormControlLabel
                control={<Checkbox  />} //checked={state.checkedA} onChange={handleChange} name="checkedA"
                label="Map View"
            /><br/>
            <FormControlLabel
                control={<Checkbox  />} //checked={state.checkedA} onChange={handleChange} name="checkedA"
                label="Variable and Source"
            /><br/>
            <FormControlLabel
                control={<Checkbox  />} //checked={state.checkedA} onChange={handleChange} name="checkedA"
                label="Visualization Mode"
            /><br/>
            <FormControlLabel
                control={<Checkbox  />} //checked={state.checkedA} onChange={handleChange} name="checkedA"
                label="Selected Geographies"
            /><br/>
        </MenuContainer>
    :
        <div></div>
}

export default ContextMenu