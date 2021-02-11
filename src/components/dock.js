// Dock for panel buttons 
// Current usage: Line Chart and Wiki/Manual Modal

// Import main libraries
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Import helper libraries
import styled from 'styled-components';

// Import config and actions
import { chart, info } from '../config/svg';
import { colors } from '../config';
import { setPanelState } from '../actions';


// Container
const DockContainer = styled.div`
    position:absolute;
    left:calc(100% + 2px);
    top:-2px;
    display:flex;
    @media (max-width:1024px) {
        position:fixed;
        display:block;
        left:0px;
        top:210px;
    }
    @media (max-width:600px) {
        top:260px;
    }
`

// Buttons styling
const DockButton = styled.button`
    background:${props => props.isActive ? colors.lightgray : colors.gray};
    border:none;
    outline:none;
    padding:10px;
    height:40px;
    box-sizing:border-box;
    font-family:'Lato', sans-serif;
    font-weight:bold;
    margin:2px 2px 0 0;
    box-shadow: 2px 0px 5px rgba(0,0,0,0.7);
    cursor:pointer;
    border-radius: 5px;
    transition:150ms transform, 150ms background;
    font-size:115%;
    display:inline-block;
    svg {
        width:20px;
        height:20px;
        fill:${props => props.isActive ? colors.darkgray : colors.white};
    }
    &:hover {
        background:${props => props.isActive ? colors.white : colors.darkgray};
        svg {
            fill:${props => props.isActive ? colors.darkgray : colors.lightgray};
        }
    }
    @media (max-width:1024px) {
        height:40px;
        width:40px;
        margin-top:10px;
        display:block;
        border-radius:0;
    }
    
    @media (max-width:600px) {
        height:30px;
        width:30px;
        padding:0;
        svg {
            width:20px;
            height:20px;
        }
    }
`

// Dock component
const Dock = () => {
    // Redux accessor and dispatch
    const panelState = useSelector(state => state.panelState);
    const dispatch = useDispatch();

    // Handle open and close
    const handlePanelButton = (panel) => dispatch(setPanelState({[panel]: panelState[panel] ? false : true}))
    
    return (
        <DockContainer>
            <DockButton
                title="Show Line Chart"
                id="showLineChart"
                isActive={panelState.lineChart}
                onClick={() => handlePanelButton('lineChart')}
            >   
                {chart}
            </DockButton>
            <DockButton
                title="Show Tutorial"
                id="showTutorial"
                isActive={panelState.tutorial}
                onClick={() => handlePanelButton('tutorial')}
            >
                {info}
            </DockButton>
        </DockContainer>
    )
} 

export default Dock