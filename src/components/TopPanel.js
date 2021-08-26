// this components houses the slider, legend, and bottom dock chart
import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { DateSlider, Dock, Ticks, SliderPlaceholder } from '../components';
import { colors } from '../config';
import { OutlineButton } from '../styled_components';

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


const DismissButton = styled(OutlineButton)`
    border:none;
`

export default function TopPanel(){
    const shouldLoadTimeseries = useSelector((state)=>state.shouldLoadTimeseries)
    const shouldAlwaysLoadTimeseries = useSelector((state)=>state.shouldAlwaysLoadTimeseries)
    const dispatch = useDispatch();
    const [showPrefButton, setShowPrefButton] = useState(true)

    return (
        <TopDrawer id="timelinePanel">
            {(!shouldLoadTimeseries && !shouldAlwaysLoadTimeseries) && <SliderPlaceholder setHistoric={() => dispatch({type:'SET_LOAD_TIMESERIES'})} />}
            {(shouldLoadTimeseries || shouldAlwaysLoadTimeseries) && <DateSlider />}
            <Dock />
            {(shouldLoadTimeseries || shouldAlwaysLoadTimeseries) && <Ticks />}
            {(shouldLoadTimeseries && !shouldAlwaysLoadTimeseries && showPrefButton) &&
                <PreferenceContainer> 
                    <div>
                        <OutlineButton onClick={() => dispatch({type:'SET_LOAD_TIMESERIES',payload:'always'})}>Remember my preference</OutlineButton>
                        <DismissButton onClick={() => setShowPrefButton(false)}>Dismiss</DismissButton>
                    </div>
                </PreferenceContainer>
            }
        </TopDrawer>
    )
}