import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import { setVariableParams } from '../actions';
import useTickUpdate from '../hooks/useTickUpdate';
import { colors } from '../config';

const SliderContainer = styled.div`
    color: white;
    box-sizing:border-box;
    padding:5px 20px 5px 20px;
    width:100%;
    user-select: none;
`
const PlayPauseContainer = styled(Grid)`
    height:0;
    padding:0;
    margin:0;
`

const PlayPauseButton = styled(Button)`
    background:none;
    padding:0;
    margin:0;
    position:absolute;
    left:-25px;
    bottom:-25px;
    @media (max-width: 600px) {
        bottom:-18px;
    }
    
    @media (hover:none){
        bottom:-33px;
    }
    svg {
        width: 24px;
        height:24px;
        @media (max-width: 600px) {
            width: 20px;
            height:20px;
        }
        g {
            fill: white;
        },
        path {
            fill:white;
        }
    }
    &.MuiButton-text {
        padding:6px 0;
    }
`

const LineSlider = styled(Slider)`
    &.MuiSlider-root {
        margin-top:-10px;
        margin-left:27%;
        width:61.5%;
        box-sizing:border-box;
        color:#FFFFFF55;
        @media (min-width: 600px) {
            margin-top:0;
            width:68%;
            margin-left:24%;
        }
        @media (hover:none){
            margin-top:0;
        }
    }
    span.MuiSlider-rail {
        display:none;
    }
    span.MuiSlider-track {
        // color:white;
        // height:4px;
        display:none;
    }
    span.MuiSlider-thumb {
        color:white;
        width:15px;
        height:15px;
        transform:translate(-1.5px, -1.5px);
        .MuiSlider-valueLabel {
            transform:translateY(-10px);
            pointer-events:none;
            font-size:15px;
            span {
                background: none;
            }
        }
        @media (max-width:768px){
            transform:scale(1.25);
        }
    }
    span.MuiSlider-mark {
        width:1px;
        height:2px;
    }
    // .MuiSlider-valueLabel span{
    //     transform:translateX(-100%);        
    // }
    span.MuiSlider-thumb.MuiSlider-active {
        box-shadow: 0px 0px 10px rgba(200,200,200,0.5);
    }
`

const SpeedSlider = styled.div`
    position:absolute;
    padding:0.75em 0.5em 0.25em 0.5em;
    widht:100%;
    background:${colors.gray};
    border-radius:0.5em;
    left:0;
    top:calc(100% + 0.25em);
    box-shadow: 0px 0px 5px rgb(0 0 0 / 70%);
    p {
        text-align:center;
    }
    span.MuiSlider-rail {
        display:initial;
    }
    span.MuiSlider-track {
        display:initial;
    }
    span.MuiSlider-root {
        width:80%;
        margin:0 10%;
    }
`

const RangeSlider = styled(Slider)`
    box-sizing:border-box;
    &.MuiSlider-root {
        width:68%;
        margin-left:25%;
        box-sizing:border-box;
        color:#FFFFFF55;
        padding-top:50px;
        @media (max-width: 600px) {
            margin-left:24%;
        }
        span.MuiSlider-thumb[data-index='0'] span.MuiSlider-valueLabel span span{
            margin-left:-30px;
            margin-top:-30px;
        }
        span.MuiSlider-thumb[data-index='1'] span.MuiSlider-valueLabel span span{
            margin-left:30px;
            margin-top:30px;
        }
    }
    span.MuiSlider-rail {
        color:white;
        height:4px;
        display:none;
    }
    span.MuiSlider-track {
        color:white;
        height:4px;
        display:none;
    }
    span.MuiSlider-thumb {
        color:white;
        .MuiSlider-valueLabel {
            transform:translateY(0px);
            pointer-events:none;
            span {
                background: none;
            }
        }
        @media (max-width:768px){
            transform:scale(1.25);
        }
    }
    span.MuiSlider-mark {
        width:1px;
        height:2px;
    }
    span.MuiSlider-thumb.MuiSlider-active: {
        box-shadow: 0px 0px 10px rgba(200,200,200,0.5);
    }
    
`

const DateH3 = styled.h3`
    width:100%;
    font-size:1.05rem;
    padding:10px 0 5px 0;
    margin:0;
    left:0;
    text-align:center;
    pointer-events:none;
`
const InitialDate = styled.p`
    position:absolute;
    left:10%;
    bottom:18px;
    font-size:75%;
    @media (max-width: 600px) {
        bottom:18px;
        left:12%;
    }
`

const EndDate = styled(InitialDate)`
    left:initial;
    right:10px;
`

const DateSelectorContainer = styled(Grid)`
    display:flex;
    justify-items: center;
    justify-content: flex-end;
    align-items:center;
    margin:0;
    padding:0;
    .MuiFormControl-root {
        padding: 0 0 0 20px !important; 
    }
    span {
        font-weight:bold;
    }
    #dateSelector {
        position:absolute;
        left:50%;
        transform:translateX(-50%);
        @media (max-width: 600px) {
            transform:none;
            left:20px;
        }
        @media (max-width: 450px) {
            transform:none;
            left:0px;
        }
    }
`

const valuetext = (dates, value) => {
    const fullDate = dates[value]?.split('-')

    return fullDate && `${parseInt(fullDate[1])}/${parseInt(fullDate[2])}/${fullDate[0]?.slice(2,)}`
    
}

const speedtext = (value) => `Animation Tick Rate: ${value} milliseconds`;

const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    let rawDate = new Date(date);
    rawDate.setDate(rawDate.getDate() + 1);
    return rawDate.toLocaleDateString('en-US', options);
}

function DateTitle(){
    const nType = useSelector(state => state.dataParams.nType);
    const nIndex = useSelector(state => state.dataParams.nIndex);
    const dates = useSelector(state => state.dates);

    return <>
        <DateSelectorContainer item xs={12}>
            <DateH3>{nType !== 'characteristic' ? formatDate(`${dates[nIndex]}`) : 'Characteristic Data'}</DateH3>
        </DateSelectorContainer>
    </>
}

function DateSlider(){
    const dispatch = useDispatch();  

    const nType = useSelector(state => state.dataParams.nType);
    const nIndex = useSelector(state => state.dataParams.nIndex);
    const nRange = useSelector(state => state.dataParams.nRange);
    const dType = useSelector(state => state.dataParams.dType);
    const rangeType = useSelector(state => state.dataParams.rangeType);
    const variableName = useSelector(state => state.dataParams.variableName);
    const currTable = useSelector(state => state.storedData[state.currentTable.numerator]);
    const dateIndices = currTable !== undefined && currTable.dates;
    const dates = useSelector(state => state.dates);

    const [timeCase, setTimeCase] = useState(0);
    const [dRange, setDRange] = useState(false);

    const [isTicking, setIsTicking, timing, setTiming] = useTickUpdate()

    useEffect(() => {
        if (nType === "time-series" && dType === "time-series") {
            setTimeCase(1)
        } else if (nType === "time-series") {
            setTimeCase(2)
        } else if (dType === "time-series") {
            setTimeCase(3)
        } else if (variableName.includes('Testing')||variableName.includes('Workdays')){
            setTimeCase(4)
        }
    },[dType, nType, variableName ])
    
    useEffect(() => {
        if (dRange) {
            setDRange(true)
        } else {
            setDRange(false)
        }
    },[dRange])
    
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    const handleChange = debounce((event, newValue) => {
        const val = dateIndices.includes(newValue) 
                ? 
            newValue 
                :
            dateIndices.reduce((a, b) => {return Math.abs(b - newValue) < Math.abs(a - newValue) ? b : a});

        switch(timeCase){
            case 1:
                dispatch(setVariableParams({nIndex: val, dIndex: val}))
                break
            case 2:
                dispatch(setVariableParams({nIndex: val}))
                break
            case 3:
                dispatch(setVariableParams({dIndex: val}))
                break
            default:
                dispatch(setVariableParams({nIndex: val}))
                break
        }
    }, 5);
        
    const handleRangeChange = debounce((event, newValue) => {
        const val0 = dateIndices.includes(newValue[0]) 
            ? 
        newValue[0] 
            :
        dateIndices.reduce((a, b) => {return Math.abs(b - newValue[0]) < Math.abs(a - newValue[0]) ? b : a});

        const val1 = dateIndices.includes(newValue[1]) 
            ? 
        newValue[1] 
            :
        dateIndices.reduce((a, b) => {return Math.abs(b - newValue[1]) < Math.abs(a - newValue[1]) ? b : a});
        
        if (dRange) {
            dispatch(setVariableParams(
                {
                    nIndex: val1, 
                    nRange: val1-val0,
                    rIndex: val1,
                    rRange: val1-val0
                }
            ))
        } else {
            dispatch(setVariableParams(
                {
                    nIndex: val1, 
                    nRange: val1-val0
                }
            ))
        }
    }, 25);

    const handlePlayPause = () => {
        if (!isTicking) {
            setIsTicking(true)
        } else {
            setIsTicking(false)
        }
    }

    if (dateIndices) {
        return (
            <SliderContainer>
                {nType !== 'characteristic' && <PlayPauseContainer item xs={1}>
                    <PlayPauseButton id="playPause" onClick={() => handlePlayPause()}>
                        {!isTicking ? 
                            <svg x="0px" y="0px" viewBox="0 0 100 100" ><path d="M78.627,47.203L24.873,16.167c-1.082-0.625-2.227-0.625-3.311,0C20.478,16.793,20,17.948,20,19.199V81.27  c0,1.25,0.478,2.406,1.561,3.031c0.542,0.313,1.051,0.469,1.656,0.469c0.604,0,1.161-0.156,1.703-0.469l53.731-31.035  c1.083-0.625,1.738-1.781,1.738-3.031C80.389,48.984,79.71,47.829,78.627,47.203z"></path></svg>
                            : 
                            <svg x="0px" y="0px" viewBox="0 0 100 100">
                                <g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)">
                                    <g>
                                        <path d="M22.4,0.6c3.4,0,6.8,0,10.3,0c6.5,0,11.8,5.3,11.8,11.8c0,25,0,50.1,0,75.2c0,6.5-5.3,11.8-11.8,11.8
                                            c-3.4,0-6.8,0-10.3,0c-6.5,0-11.8-5.3-11.8-11.8c0-25.1,0-50.2,0-75.2C10.6,5.9,15.9,0.6,22.4,0.6z M22.4,6.5c3.4,0,6.8,0,10.3,0
                                            c3.2,0,5.9,2.6,5.9,5.9c0,25,0,50.1,0,75.2c0,3.2-2.7,5.9-5.9,5.9c-3.4,0-6.8,0-10.3,0c-3.2,0-5.9-2.7-5.9-5.9
                                            c0-25.1,0-50.2,0-75.2C16.5,9.1,19.2,6.5,22.4,6.5z M67.3,6.5c3.4,0,6.8,0,10.2,0s6,2.6,6,5.9c0,25,0,50.1,0,75.2
                                            c0,3.2-2.7,5.9-6,5.9s-6.7,0-10.2,0c-3.3,0-5.9-2.7-5.9-5.9c0-25.1,0-50.2,0-75.2C61.4,9.1,64,6.5,67.3,6.5z M67.3,0.6
                                            c3.4,0,6.8,0,10.2,0c6.5,0,11.8,5.3,11.8,11.8c0,25,0,50.1,0,75.2c0,6.5-5.3,11.8-11.8,11.8c-3.3,0-6.7,0-10.2,0
                                            c-6.5,0-11.8-5.3-11.8-11.8c0-25.1,0-50.2,0-75.2C55.5,5.9,60.8,0.6,67.3,0.6z"/>
                                    </g>
                                </g>
                            </svg>

                        }
                    </PlayPauseButton>
                </PlayPauseContainer>}
                <Grid container spacing={2}>
                        {rangeType !== 'custom' && <DateTitle/> }
                    <Grid item xs={11}> {/* Sliders Grid Item */}
                        {/* Main Slider for changing date */}
                        { (rangeType !== 'custom' && nType !== "characteristic") && 
                            <LineSlider 
                                id="timeSlider"
                                value={nIndex} 
                                // valueLabelDisplay="on"
                                onChange={handleChange} 
                                getAriaValueText={valuetext}
                                valueLabelFormat={valuetext}
                                aria-labelledby="aria-valuetext"
                                min={1}
                                max={dates.length}
                                step={1}
                                characteristic={nType==="characteristic"}
                        />}
                        {/* Slider for bin date */}
                        {/* {!customRange && 
                            <BinSlider 
                                value={dataParams.binIndex} 
                                valueLabelDisplay="auto"
                                onChange={handleBinChange} 
                                getAriaValueText={binValuetext}
                                valueLabelFormat={binValuetext}
                                aria-labelledby="aria-valuetext"
                                min={startDateIndex}
                                step={1}
                                max={startDateIndex+dates[currentData].length-1}
                        />} */}
                        {/* Slider for changing date range */}
                        {rangeType === 'custom' && <RangeSlider 
                            id="timeSlider"
                            value={[nIndex-nRange, nIndex]} 
                            valueLabelDisplay="on"
                            onChange={handleRangeChange} 
                            getAriaValueText={(val) => valuetext(dates, val)}
                            valueLabelFormat={(val) => valuetext(dates, val)}
                            aria-labelledby="aria-valuetext"
                            min={1}
                            max={dates.length}
                            step={1}
                        />}
                    </Grid>
                    {(rangeType !== 'custom' && nType !== 'characteristic') && <InitialDate>{valuetext(dates, 0)}</InitialDate>}
                    {(rangeType !== 'custom' && nType !== 'characteristic') && <EndDate>{dateIndices !== undefined && valuetext(dates, [dateIndices.slice(-1,)[0]])}</EndDate>}
                    {isTicking && 
                        <SpeedSlider>
                        <p>Animation Speed</p>
                        <LineSlider 
                                value={1000 - timing} 
                                onChange={(e, newValue) => setTiming(1000 - newValue)} 
                                getAriaValueText={speedtext}
                                valueLabelFormat={speedtext}
                                aria-labelledby="aria-valuetext"
                                min={25}
                                max={975}
                                step={25}
                        />
                        </SpeedSlider>}
                </Grid>
            </SliderContainer>
        );
    } else {
        return <SliderContainer />
    }
}

export default DateSlider