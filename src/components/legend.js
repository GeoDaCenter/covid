import React from 'react';
import Grid from '@material-ui/core/Grid';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import BinsList from './binsList';

const LegendContainer = styled.div`
    width:100%;
    padding:10px;
    margin:0;
    box-sizing: border-box;
    div.MuiGrid-item {
        padding:5px 5px 0 5px;
    }
`

const LegendTitle = styled.h3`
    text-align: center;
    font-family:'Playfair Display', serif;
    padding:0;
    font-weight:normal;
    margin:0;
    color:white;
`

const BinLabels = styled.div`
    width:100%;
    display: flex;
    margin-top:0px;
    box-sizing: border-box;
    padding: 0 ${props => props.binLength > 6 ? 100/props.binLength/2-1 : 0}%;
    .bin { 
        height:10px;
        display: inline;
        border:0;
        margin:0;
        flex:2;
        color:white;
        font-size:10px;
        text-align: center;
    }
    .bin:nth-of-type(1) {
        transform: ${props => props.firstBinZero ? 'translateX(-45%)' : 'none'};
    }
`
const BinBars = styled.div`
    width:100%;
    display: flex;
    margin-top:3px;
    box-sizing: border-box;
    .bin { 
        height:5px;
        display: inline;
        flex:1;
        border:0;
        margin:0;
    }
    .bin:nth-of-type(1) {
        transform: ${props => props.firstBinZero ? 'scaleX(0.35)' : 'none'};
    }
`


const Legend =  () => {
    
    const mapParams = useSelector(state => state.mapParams);
    const dataParams = useSelector(state => state.dataParams);

    return (
        <LegendContainer>
            <Grid container spacing={2} id='legend-bins-container'>
                <Grid item xs={12}>
                    <LegendTitle>
                        {dataParams.variableName}
                    </LegendTitle>
                </Grid>
                <Grid item xs={12}>
                    {mapParams.colorScale !== undefined &&  
                        <span>
                            <BinBars firstBinZero={`${mapParams.colorScale[0]}` === `240,240,240` && dataParams.fixedScale === null}>
                                {mapParams.colorScale.map(color => <div className="bin color" key={`${color[0]}${color[1]}`}style={{backgroundColor:`rgb(${color[0]},${color[1]},${color[2]})`}}></div>)}
                            </BinBars>
                            <BinLabels firstBinZero={`${mapParams.colorScale[0]}` === `240,240,240`} binLength={mapParams.bins.bins.length}>
                                {(`${mapParams.colorScale[0]}` === `240,240,240` && dataParams.fixedScale === null) && <div className="bin firstBin">0</div>}

                                {
                                    mapParams.bins.bins !== undefined && 
                                    <BinsList data={mapParams.bins.bins} />
                                }
                                
                            </BinLabels>
                        </span>
                    }
                </Grid>
            </Grid>
        </LegendContainer>
    )
}

export default Legend