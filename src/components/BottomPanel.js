// DEPRICATED: Bottom panel container
// Now container in Legend.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

// import { Legend } from '../components';
import { colors } from '../config';

// helper function to get dock offset
const getChartHeight = () => { try { return document.querySelector('#main-chart-container').offsetHeight} catch { return 0} }

// Styled components
const BottomDrawer = styled.div`
    position: fixed;
    bottom:0;
    left:50%;
    background:${colors.gray};
    transform:translateX(-50%);
    width:38vw;
    max-width: 500px;
    box-sizing: border-box;
    padding:0 0 5px 0;
    margin:0;
    box-shadow: 0px 0px 5px rgba(0,0,0,0.7);
    border-radius:0.5vh 0.5vh 0 0;
    transition:250ms all;
    hr {
        opacity:0.5;
    }
    @media (max-width:1024px){
        width:50vw;
        div {
            padding-bottom:5px;
        }
        #binModeSwitch {
            position:absolute !important;
            right: 10px !important;
            top: 10px !important;
        }
        #dateRangeSelector {
            position:absolute !important;
            left: 66% !important;
            transform:translateX(-50%) !important;
            top: 10px !important;
        }
    }
    
    @media (max-width:768px){
    
        width:100%;
        max-width:100%;
        padding:0;
        left:0;
        transform:none;
    }
    @media (max-width:750px) and (orientation: landscape) {
        // bottom all the way down for landscape phone
    }
`

const BottomPanel = () => {

    const panelState = useSelector(state => state.panelState);

    // offset for the bottom panel based on the chart height, 
    // managed through props via styled-components
    const [bottomMargin, setBottomMargin] = useState(0);

    const handleResize = () => setBottomMargin(getChartHeight())
    window.addEventListener("resize", handleResize);
    
    return (
        <BottomDrawer bottom={panelState.chart ? 0 : bottomMargin } id="bottomPanel">
            {/* <DateSlider /> */}
            {/* <hr />
            <MainLineChart />
            <OpenCloseButton onClick={handleBottomOpen} bottom={panelState.chart ? 5 : bottomMargin}>
                <svg version="1.1" x="0px" y="0px" viewBox="0 0 100 100">
                    <g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)">
                        <path d="M38,33.8L23.9,47.9c-1.2,1.2-1.2,3.1,0,4.2L38,66.2l4.2-4.2l-9-9H71v17c0,0.6-0.4,1-1,1H59v6h11
                        c3.9,0,7-3.1,7-7V30c0-3.9-3.1-7-7-7H59v6h11c0.6,0,1,0.4,1,1v17H33.2l9-9L38,33.8z"/>
                    </g>
                </svg>
                <svg x="0px" y="0px" viewBox="0 0 100 100">
                    <g>
                        <path d="M52.5,21.4c-1.9,0-3.6,1.3-4.1,3.1L37.9,63.7l-6.4-11.1c-1.2-2-3.7-2.7-5.7-1.5c-0.3,0.2-0.6,0.4-0.9,0.7
                            L10.1,66.6c-1.7,1.6-1.7,4.2-0.2,5.9c1.6,1.7,4.2,1.7,5.9,0.2c0.1,0,0.1-0.1,0.1-0.1L27,61.5l8.7,15.1c1.2,2,3.7,2.7,5.7,1.5
                            c0.9-0.6,1.6-1.5,1.9-2.5l9.1-33.9l4.6,17.2c0.6,2.2,2.9,3.5,5.1,2.9c1.1-0.3,2-1,2.5-1.9l10.4-18l8.9,9.4c1.6,1.7,4.2,1.8,5.9,0.3
                            s1.8-4.2,0.3-5.9c0,0-0.1-0.1-0.1-0.1L77.3,32.1c-1.6-1.7-4.2-1.8-5.9-0.2c-0.3,0.3-0.6,0.6-0.8,1L62.5,47l-6-22.5
                            C56,22.7,54.4,21.4,52.5,21.4L52.5,21.4z"/>
                    </g>
                </svg>

            </OpenCloseButton> */}
        </BottomDrawer>
    )

}

export default BottomPanel