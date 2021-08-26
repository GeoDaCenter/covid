// this components houses the slider, legend, and bottom dock chart
import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { DateSlider, Dock, Ticks, SliderPlaceholder } from '../components';
import { colors } from '../config';
import * as SVG from '../config/svg';
import { OutlineButton } from '../styled_components';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Slider from '@material-ui/core/Slider';

// Styled components
const TopDrawer = styled.div`
    position: fixed;
    top:50px;
    left:calc(50vw - 225px);
    background:${colors.gray};
    width:90vw;
    max-width: 450px;
    box-sizing: border-box;
    padding:0;
    margin:0;
    box-shadow: 0px 0px 5px rgba(0,0,0,0.7);
    border-radius:0 0 0.5vh 0.5vh ;
    transition:250ms all;
    color:white;
    hr {
        opacity:0.5;
    }
    div.MuiGrid-item {
        padding:0;
    }
    
    @media (max-width:768px){
        width:100%;
        max-width:100%;
        left:0;
        transform:none;
    }
    @media (max-width:750px) and (orientation: landscape) {
        // bottom all the way down for landscape phone
    }
`

const PreferenceContainer = styled.div`
    position:absolute;
    width:90vw;
    max-width: 450px;
    display:flex;
    div {
        display:block;
        margin:0 auto
    }
`

const PreferenceButton = styled.button`
    background:none;
    border:none;
    position:absolute;
    right:0.5em;
    top:0.5em;
    width:1.5em;
    height:1.5em;
    cursor:pointer;
    svg {
        fill:${colors.white};
        transition:250ms all;
        &:hover {
            fill:${colors.yellow}
        }
    }
`

const DismissButton = styled(OutlineButton)`
    border:none;
    &.topRight {
        position:absolute;
        top:0;
        right:0;
    }
`

const PreferencePanelContainer = styled.div`
    position:absolute;
    width:100%;
    background:${colors.gray};
    box-shadow: 0px 0px 5px rgba(0,0,0,0.7);
    border-radius:0.5vh;
    transition:250ms all;
    color:white;
    top:calc(100% + 0.5em);
    padding:1em;
    span.MuiIconButton-colorSecondary, span.MuiSlider-root {
        color:white;
    }
    span.MuiSlider-root {
        margin:0 31px;
    }
    p, span.MuiTypography-root {
        font-size:1rem;
        font-family:'Lato',arial, sans-serif;
    }
    p {
        padding-left:31px;
    }
`

function PreferncePanel({closePanel}){
    const shouldAlwaysLoadTimeseries = useSelector((state)=>state.shouldAlwaysLoadTimeseries)
    const snapshotDaysToLoad = useSelector((state) => state.snapshotDaysToLoad);
    const shouldSaveLocation = useSelector((state) => state.shouldSaveLocation);
    const dispatch = useDispatch();

    return <PreferencePanelContainer>
        <h3>Atlas Preferences</h3>
        <FormGroup row>
            <FormControlLabel
                control={<Checkbox 
                    checked={shouldAlwaysLoadTimeseries} 
                    onChange={() => dispatch({type:'SET_LOAD_TIMESERIES',payload:'toggle'})} 
                    name="checkedA" 
                />}
                label="Always load historic time-series data"
            />
            {!shouldAlwaysLoadTimeseries && <><p id="snapshot-slider-label">
                Number of days to load: {snapshotDaysToLoad} days
            </p>
            <Slider min={15} max={180} step={15} 
                value={snapshotDaysToLoad} 
                onChange={(e, value) => dispatch({type:'SET_PREFERENCE',payload:{pref:'snapshotDaysToLoad', value}})}
                aria-labelledby="snapshot-slider-label" /></>}
            <FormControlLabel
                control={<Checkbox checked={shouldSaveLocation} onChange={() => dispatch({type:'SET_PREFERENCE', payload:{pref:'shouldSaveLocation',value:'toggle'}})} name="checkedA" />}
                label="Save map location"
            />
            <FormControlLabel
                control={<Checkbox checked={false} onChange={(e) => console.log(e)} name="checkedA" />}
                label="Save variable settings (requires historic time-series data enabled)"
                disabled
            />
            <FormControlLabel
                control={<Checkbox checked={false} onChange={(e) => console.log(e)} name="checkedA" />}
                label="Save overlay displayed"
                disabled
            />
            <FormControlLabel
                control={<Checkbox checked={false} onChange={(e) => console.log(e)} name="checkedA" />}
                label="Save resource displayed"
                disabled
            />
        </FormGroup>
        <DismissButton onClick={closePanel} className="topRight">×</DismissButton>
        
    </PreferencePanelContainer>
}

export default function TopPanel(){
    const shouldLoadTimeseries = useSelector((state)=>state.shouldLoadTimeseries)
    const shouldAlwaysLoadTimeseries = useSelector((state)=>state.shouldAlwaysLoadTimeseries)
    const dispatch = useDispatch();
    const [showPrefButton, setShowPrefButton] = useState(true)
    const [showPreferenceMenu, setShowPreferenceMenu] = useState(false)

    return (
        <TopDrawer id="timelinePanel">
            <DateSlider />
            <Dock />
            <Ticks />
            {(!shouldAlwaysLoadTimeseries && showPrefButton) &&
                <PreferenceContainer> 
                    <div>
                        {(!shouldLoadTimeseries && !shouldAlwaysLoadTimeseries) && <OutlineButton onClick={() => dispatch({type:'SET_LOAD_TIMESERIES'})}>Load Historic Data</OutlineButton>}
                        {(shouldLoadTimeseries && !shouldAlwaysLoadTimeseries) && <OutlineButton onClick={() => dispatch({type:'SET_LOAD_TIMESERIES',payload:'always'})}>Remember my preference</OutlineButton>}
                        <DismissButton onClick={() => setShowPrefButton(false)}>Dismiss</DismissButton>
                    </div>
                </PreferenceContainer>
            }
            <PreferenceButton onClick={() => setShowPreferenceMenu(prev => !prev)}>{SVG.sliders}</PreferenceButton>
            {showPreferenceMenu && <PreferncePanel closePanel={() => setShowPreferenceMenu(false)} />}
        </TopDrawer>
    )
}