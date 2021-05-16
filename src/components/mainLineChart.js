import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  LineChart, Line, XAxis, YAxis, ReferenceArea, 
  Tooltip, Label, ResponsiveContainer, Legend
} from 'recharts';

import Switch from '@material-ui/core/Switch';

import styled from 'styled-components';
import { colors } from '../config';
import { setVariableParams, setChartParams } from '../actions';

const ChartContainer = styled.span`
    span {
        color:white;
    }
`
const SwitchesContainer = styled.div`
    display:flex;
    justify-content:center;
`
const StyledSwitch = styled.div`
    margin:0 5px;
    @media (max-width:960px){
        margin:0;
    }
    p {
        color:white;
        display:inline;
        text-align:center;
    }
    span.MuiSwitch-track {
        background-color:${colors.lightgray};
    }
    .MuiSwitch-colorSecondary.Mui-checked {
        color:${colors.lightblue};
    }
    .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track {
        background-color: ${colors.lightblue};
    }
    .MuiSwitch-colorSecondary:hover {
        background-color:${colors.lightblue}55;
    }
`
const ChartTitle = styled.h3`
    text-align: center;
    font-family:'Playfair Display', serif;
    padding:0;
    font-weight:normal;
    margin:0;
    color:white;
`

const monthNames = ["Jan","Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

const numberFormatter = val => val > 1000000 ? `${val/1000000}M` : val > 1000 ? `${val/1000}K` : val;
const dateFormatter = val => { 
    let tempDate = (new Date(val).getMonth()+1)%12;
    return `${monthNames[tempDate]}`
};

const CustomTick = props => <text {...props}>{props.labelFormatter(props.payload.value)}</text>
const getDateRange = ({startDate, endDate}) => {
    let dateArray = [];

    let years = [];

    if (startDate.getUTCFullYear() === endDate.getUTCFullYear()) {
        years = [endDate.getUTCFullYear()]
    } else {
        for (let i=startDate.getUTCFullYear(); i<=endDate.getUTCFullYear(); i++) {
            years.push(i)
        }
    }

    for (let i=0; i<years.length; i++){
        let yearStr = ''+years[i]
        let n;
    
        if (years[i] === 2020) {
            n = 2
        } else {
            n = 1
        }

        let dateString = `${yearStr}-${n<10?0:''}${n}-01`
        while (n < 13) {
            dateString = `${yearStr}-${n<10?0:''}${n}-01`
            dateArray.push(dateString)
            n++
        }
    }
    return dateArray;
};

const dateRange = getDateRange({startDate: new Date('02/01/2020'), endDate: new Date()})
const CustomTooltip = props => {
    try {
        if (props.active) {
            let data = props.payload
            return (
                <div 
                    style={{
                        background:colors.darkgray,
                        padding:'10px',
                        borderRadius:'4px',
                        boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)'
                
                }}> 
                <p style={{color:'white', padding:'5px 0 0 0',}}>{data[0].payload.date}</p>
                    {data.map(data => 
                        <p style={{color: data.color, padding:'5px 0 0 0', textShadow: `2px 2px 4px ${colors.black}`, fontWeight:600}}>{data.name}: {Number.isInteger(Math.floor(data.payload[data.dataKey])) ? 
                            Math.floor(data.payload[data.dataKey]).toLocaleString('en') 
                            : data.payload[data.dataKey]}
                        </p>
                        
                    )}
                </div>
            )
        }
    } catch {
        return null;
    }
    return null;
};

const MainLineChart = () => {
    const chartData = useSelector(state => state.chartData.data);
    const columns = useSelector(state => state.chartData.columns);
    const maximums = useSelector(state => state.chartData.maximums);
    const dataParams = useSelector(state => state.dataParams);
    const nType = useSelector(state => state.dataParams.nType);
    const dType = useSelector(state => state.dataParams.dType);
    const currentVariable = useSelector(state => state.currentVariable);
    const currentData = useSelector(state => state.currentData);
    const selectionKeys = useSelector(state => state.selectionKeys);
    const storedData = useSelector(state => state.storedData);
    const currentTable = useSelector(state => state.currentTable);
    const populationNormalized = useSelector(state => state.chartParams.populationNormalized);

    const [logChart, setLogChart] = useState(false);
    const [showSummarized, setShowSummarized] = useState(true);
    const [strokeOpacities, setStrokeOpacities] = useState([]);

    const dispatch = useDispatch();

    const handleSwitch = () => setLogChart(prev => !prev)
    const handlePopSwitch = () => dispatch(setChartParams({populationNormalized: !populationNormalized}))
    const handleSummarizedSwitch = () => setShowSummarized(prev => !prev)
    const handleChange = (newValue) => {
        if (nType === "time-series" && dType === "time-series") {
            dispatch(setVariableParams({nIndex: newValue, dIndex: newValue}))
        } else if (nType === "time-series") {
            dispatch(setVariableParams({nIndex: newValue}))
        } else if (dType === "time-series") {
            dispatch(setVariableParams({dIndex: newValue}))
        } else if (currentVariable.includes('Testing')){
            dispatch(setVariableParams({nIndex: newValue}))
        }
    };
    const chartSetDate = (e) => {
        if (e?.activeTooltipIndex !== undefined) {
            if (storedData[currentTable.numerator][2].indexOf(e.activeTooltipIndex) !== -1) {
                handleChange(e.activeTooltipIndex)
            } else {
                handleChange(storedData[currentTable.numerator][2].reduce((a, b) => {return Math.abs(b - e.activeTooltipIndex) < Math.abs(a - e.activeTooltipIndex) ? b : a}))
            }
        }
    }    

    const rangeIncrement = ( maximum ) => {
        let returnArray = []
        const increment = 2*10**(`${maximum}`.length-1);
        for (let i=0; i<maximum; i+=increment) {
            returnArray.push(i)
        }

        return returnArray;
    }

    const handleLegendHover = (o) => {
        setStrokeOpacities(o.dataKey)
    }

    const handleLegendLeave = () => {
        setStrokeOpacities(null)
    }

    if (maximums && chartData) {
        return (
            <ChartContainer id="lineChart">
                {(columns === undefined || columns.length === 2) ?
                    <ChartTitle>Total Cases and 7-Day Average New Cases{columns && columns.length > 0 && `: ${columns[0].slice(0,-4)}`}</ChartTitle>
                    : 
                    <ChartTitle>7-Day Average New Cases</ChartTitle>
                }
                <ResponsiveContainer width="100%" height="80%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 0, right: 10, left: 10, bottom: 20,
                        }}
                        onClick={nType === 'characteristic' ? '' : chartSetDate}
                    >
                        <XAxis 
                            dataKey="date"
                            ticks={dateRange}
                            tick={
                                <CustomTick
                                style={{
                                    fill: `${colors.white}88`,
                                    fontSize: "10px",
                                    fontFamily: "Lato",
                                    fontWeight: 600,
                                    transform:'translateY(10px)'
                                }}
                                labelFormatter={dateFormatter}
                                />
                            }
                        />
                        <YAxis yAxisId="left" type="number" scale={logChart ? "log" : "linear"} domain={[0.01, 'dataMax']} allowDataOverflow 
                            ticks={selectionKeys.length === 0 ? rangeIncrement({maximum: maximums.sum}) : []} 
                            tick={
                                <CustomTick
                                style={{
                                    fill: colors.lightgray,
                                    fontSize: "10px",
                                    fontFamily: "Lato",
                                    fontWeight: 600
                                }}
                                labelFormatter={numberFormatter}
                                />
                            }
                            >
                            <Label value="Total Cases" position='insideLeft' style={{marginTop:10, fill:colors.lightgray, fontFamily: 'Lato', fontWeight: 600}} angle={-90}  />
                        </YAxis>
                        <YAxis yAxisId="right" orientation="right" scale={logChart ? "log" : "linear"} domain={[0.01, 'dataMax']} allowDataOverflow 
                            ticks={selectionKeys.length === 0 ? rangeIncrement({maximum: maximums.count}) : []}
                            tick={
                                <CustomTick
                                    style={{
                                        fill: colors.yellow,
                                        fontSize: "10px",
                                        fontFamily: "Lato",
                                        fontWeight: 600,
                                    }}
                                    labelFormatter={numberFormatter}
                                />
                            }
                            >
                            <Label value="7-Day Average New Cases" position='insideTopRight' style={{marginTop:10, fill:(selectionKeys.length < 2 ? colors.yellow : colors.lightgray), fontFamily: 'Lato', fontWeight: 600}} angle={-90}  />
                        </YAxis>
                        <Tooltip
                            content={CustomTooltip}
                        />
                        <ReferenceArea 
                            yAxisId="left"
                            x1={dataParams.nRange === null ? 
                                dataParams.variableName.indexOf('Testing') !== -1 ? dataParams.nIndex - 7 : 0
                                : dataParams.nIndex-dataParams.nRange}
                            x2={dataParams.nIndex}
                            fill="white" 
                            fillOpacity={0.15}
                            isAnimationActive={false}
                        />
                        {selectionKeys.length < 2 && <Line type="monotone" yAxisId="left" dataKey={selectionKeys.length > 0 ? selectionKeys[0] + " Total Cases" : "sum"} name="Total Cases" stroke={colors.lightgray} dot={false} isAnimationActive={false} /> }
                        {selectionKeys.length < 2 && <Line type="monotone" yAxisId="right" dataKey={selectionKeys.length > 0 ? selectionKeys[0] + " Daily Count": "count"} name="7-Day Average New Cases" stroke={colors.yellow} dot={false} isAnimationActive={false} /> }
                        
                        {(selectionKeys.length > 1 && showSummarized) &&
                                <Line 
                                    type='monotone'
                                    yAxisId='right'
                                    dataKey='summarized' 
                                    name='Total For Selection' 
                                    stroke={colors.lightgray}
                                    strokeWidth={3} 
                                    dot={false} 
                                    isAnimationActive={false}  
                                />
                        }
                        {columns && 
                            columns.map((key,index) => {
                                return <Line 
                                    type='monotone'
                                    yAxisId='right' 
                                    dataKey={key} 
                                    name={key} 
                                    stroke={colors.qualtitiveScale[index]} 
                                    dot={false} 
                                    isAnimationActive={false}  
                                    strokeOpacity={strokeOpacities === key.includes('7-Day') ? 1 : 0.7}
                                    strokeWidth={strokeOpacities === key.includes('7-Day') ? 3 : 1}
                                />}
                            )
                        }
                        <Legend 
                            onMouseEnter={handleLegendHover} 
                            onMouseLeave={handleLegendLeave}
                        />
                    </LineChart>
                </ResponsiveContainer>
                <SwitchesContainer>
                    <StyledSwitch>
                        <Switch
                            checked={logChart}
                            onChange={handleSwitch}
                            name='log chart switch'
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                        />
                        <p>{logChart ? 'Log Scale' : 'Linear Scale'}</p>
                    </StyledSwitch>
                    <StyledSwitch>
                        <Switch
                            checked={populationNormalized}
                            onChange={handlePopSwitch}
                            name='population normalized chart switch'
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                        />
                        <p>{populationNormalized ? 'Per 100k' : 'Counts'}</p>
                    </StyledSwitch>
                    {selectionKeys.length > 1 && <StyledSwitch>
                        <Switch
                            checked={showSummarized}
                            onChange={handleSummarizedSwitch}
                            name='show summarized chart switch'
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                        />
                        <p>{showSummarized ? `Show ${populationNormalized ? 'Average' : 'Total'} For Selection` : `Show ${currentData.includes('state') ? 'States' : 'Counties'}` }</p>
                    </StyledSwitch>}
                </SwitchesContainer>
            </ChartContainer>
        );
    } else {
        return <div></div>
    }
}

export default MainLineChart