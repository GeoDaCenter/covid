import React, {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  LineChart, Line, XAxis, YAxis, ReferenceArea, 
  Tooltip, Label, ResponsiveContainer, Legend
} from 'recharts';

import Switch from '@material-ui/core/Switch';

import styled from 'styled-components';
import { colors } from '../config';
import { setVariableParams } from '../actions';

const ChartContainer = styled.span`
    span {
        color:white;
    }
`

const StyledSwitch = styled.div`
    float:left;
    p {
        color:white;
        display:inline;
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

// const LegendList = styled.ul`
//     list-style:none;
//     margin-block-start: 0;
//     margin-block-end: 0;
//     padding-inline-start: 0;
//     text-align:center;
// `

// const LegendItem = styled.li`
//     color: ${props => props.color};
//     font-family:'Lato', sans-serif;
//     line-height:1.5;
//     text-decoration: ${props => props.active ? 'underline' : 'none'};
//     display:inline;
//     margin-right:10px;

// `


const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

const millionFormatter = val => { return `${val/1000000}M` };
const thousandFormatter = val => { return `${val/1000}K` };
const dateFormatter = val => { 
    let tempDate = new Date(val).getMonth();
    return `${monthNames[tempDate]}`
};

const CustomTick = props => {
    return <text {...props}>{props.labelFormatter(props.payload.value)}</text>
};


// const stripLeadingZero = ( str ) => str[0] !== '0' ? str : str.slice(1,);

// const getStartDate = (range, index, data) => {
//     if (range === null) {
//         try {
//             if ((data.slice(0,1)[0].date).indexOf('-') === -1) {
//                 return data.slice(0,1)[0].date
//             } else {
//                 let tempDate = data.slice(0,1)[0].date.split('-');
//                 return `${stripLeadingZero(tempDate[1])}/${stripLeadingZero(tempDate[2])}/${tempDate[0].slice(0,2)}`
//             }            
//         } catch {
//             return null
//         }
//     } else {
//         try {
//             if ((data[index-range].date).indexOf('-') === -1) {
//                 return data[index-range].date
//             } else {
//                 let tempDate = data[index-range].date.split('-');
//                 return `${stripLeadingZero(tempDate[1])}/${stripLeadingZero(tempDate[2])}/${tempDate[0].slice(0,2)}`
//             }
//         } catch {
//             return null
//         }
//     }
// }

// const getEndDate = (index, data) => {
//     try {
//         if ((data[index].date).indexOf('-') === -1) {
//             return data[index].date
//         } else {
//             let tempDate = data[index].date.split('-');
//             return `${stripLeadingZero(tempDate[1])}/${stripLeadingZero(tempDate[2])}/${tempDate[0].slice(0,2)}`
//         }
//     } catch {
//         return null
//     }
// }

const getDateRange = ({startDate, endDate}) => {
    let dateArray = [];

    let years;

    if (startDate.getUTCFullYear() === endDate.getUTCFullYear()) {
        years = [endDate.getUTCFullYear()]
    } else {
        years = []
        for (let i=startDate.getUTCFullYear(); i<endDate.getUTCFullYear(); i++) {
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
        while (n<13) {
            let dateString = `${n}/${1}/${yearStr.slice(-2,)}`
            if (new Date(dateString) > endDate) break
            dateArray.push(dateString)
            n++
        }
    }
    return dateArray;
}

const CustomTooltip = props => {
    try {
        if (props.active) {
            let data = props.payload
            return (
                <div 
                    style={{
                        background:colors.darkgray,
                        padding:'1px 10px',
                        borderRadius:'4px',
                        boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)'
                
                }}> 
                <p style={{color:'white', padding:0,}}>{data[0].payload.date}</p>
                    {data.map(data => 
                        <p style={{color: data.color, textShadow: `2px 2px 4px ${colors.black}`, fontWeight:600}}>{data.name}: {Number.isInteger(Math.floor(data.payload[data.dataKey])) ? 
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
    const chartData = useSelector(state => state.chartData);
    const dataParams = useSelector(state => state.dataParams);
    const currentVariable = useSelector(state => state.currentVariable);
    const currentData = useSelector(state => state.currentData);
    const dateIndices = useSelector(state => state.dateIndices);
    const selectionKeys = useSelector(state => state.selectionKeys);

    
    const [logChart, setLogChart] = useState(false);
    const [strokeOpacities, setStrokeOpacities] = useState([])

    const dispatch = useDispatch();

    const handleSwitch = () => {
        setLogChart(prev => !prev);
    }

    const chartSetDate = (e) => {
        if (e?.activeTooltipIndex !== undefined) {
            if (dateIndices[currentData][dataParams.numerator].indexOf(e.activeTooltipIndex) !== -1) {
                handleChange(e.activeTooltipIndex)
            } else {
                handleChange(dateIndices[currentData][dataParams.numerator].reduce((a, b) => {return Math.abs(b - e.activeTooltipIndex) < Math.abs(a - e.activeTooltipIndex) ? b : a}))
            }
        }
    }    

    const handleChange = (newValue) => {
        if (dataParams.nType === "time-series" && dataParams.dType === "time-series") {
            dispatch(setVariableParams({nIndex: newValue, dIndex: newValue}))
        } else if (dataParams.nType === "time-series") {
            dispatch(setVariableParams({nIndex: newValue}))
        } else if (dataParams.dType === "time-series") {
            dispatch(setVariableParams({dIndex: newValue}))
        } else if (currentVariable.includes('Testing')){
            dispatch(setVariableParams({nIndex: newValue}))
        }
    };

    const getMax = ({ array, variables }) => {
        let maxVals = {}

        for (let i=0;i<array.length;i++) {
            for (let n=0;n<variables.length;n++){
                let tempVal = array[i][variables[n]];
                if (maxVals[variables[n]]===undefined || maxVals[variables[n]] < tempVal) {
                    maxVals[variables[n]] = tempVal
                }
            }
        }

        return maxVals
    }

    const rangeIncrement = ({ maximum, increment }) => {
        let returnArray = []
        
        for (let i=0; i<maximum; i+=increment) {
            returnArray.push(i)
        }

        return returnArray;
    }

    const summarizeChartData = ( { chartData, keys }) => {
        let summarizedData = []

        for (let i=0;i<chartData.length;i++) {
            let tempSum = 0;
            
            for (let n=0; n<keys.length;n++ ) {
                tempSum += chartData[i][`${keys[n]} Daily Count`]
            }

            summarizedData.push({
                ...chartData[i],
                'summarized': tempSum 
            })
        }

        return summarizedData
    }

    const parsedData = summarizeChartData( { chartData: chartData, keys: selectionKeys })
    const maximums = getMax({array: parsedData, variables: ['count','sum']})
    const dateRange = getDateRange({startDate: new Date('02/01/2020'), endDate: new Date()})
    
    const handleLegendHover = (o) => {
        setStrokeOpacities(o.dataKey)
    }

    const handleLegendLeave = () => {
        setStrokeOpacities(null)
    }

    return (
        <ChartContainer>
            {selectionKeys.length < 2 && 
                <ChartTitle>Total Cases and 7-Day Average New Cases
                    {selectionKeys.length>0 && `: ${selectionKeys[0]}`}
                </ChartTitle>
            }
            {selectionKeys.length >= 2 && 
                <ChartTitle>7-Day Average New Cases</ChartTitle>
            }
            <ResponsiveContainer width="100%" height="80%">
                <LineChart
                    data={parsedData}
                    margin={{
                        top: 0, right: 10, left: 10, bottom: 20,
                    }}
                    onClick={dataParams.nType === 'characteristic' ? '' : chartSetDate}
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
                        ticks={selectionKeys.length === 0 ? rangeIncrement({maximum: maximums.sum, increment: 2000000}) : []} 
                        tick={
                            <CustomTick
                            style={{
                                fill: colors.lightgray,
                                fontSize: "10px",
                                fontFamily: "Lato",
                                fontWeight: 600
                            }}
                            labelFormatter={selectionKeys.length === 0 ? millionFormatter : thousandFormatter}
                            />
                        }
                        >
                        <Label value="Total Cases" position='insideLeft' style={{marginTop:10, fill:colors.lightgray, fontFamily: 'Lato', fontWeight: 600}} angle={-90}  />
                    </YAxis>
                    <YAxis yAxisId="right" orientation="right" scale={logChart ? "log" : "linear"} domain={[0.01, 'dataMax']} allowDataOverflow 
                        ticks={selectionKeys.length === 0 ? rangeIncrement({maximum: maximums.count, increment: 50000}) : []}
                        tick={
                            <CustomTick
                                style={{
                                    fill: colors.lightgray,
                                    fontSize: "10px",
                                    fontFamily: "Lato",
                                    fontWeight: 600,
                                }}
                                labelFormatter={thousandFormatter}
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
                        // x1={getStartDate(dataParams.nRange, dataParams.nIndex, parsedData)}
                        // x2={getEndDate(dataParams.nIndex, parsedData)} 
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
                    
                    {/* {selectionKeys.length !== 0 && 
                        selectionKeys.map((key,index) => { 
                            return <Line 
                                type="monotone" 
                                yAxisId="left" 
                                dataKey={key + ' Total Cases'} 
                                name={key + ' Total Cases'} 
                                stroke={colors.pairedColors.sum[index]} 
                                dot={false} 
                                isAnimationActive={false}  
                                strokeOpacity={strokeOpacities.length === 0 || strokeOpacities.includes(key + ' Total Cases') ? 1 : 0.25}
                            />}
                        )
                    } */}
                    {selectionKeys.length > 1 && 
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
                    {selectionKeys.length > 1 && 
                        selectionKeys.map((key,index) => {
                            return <Line 
                                type='monotone'
                                yAxisId='right' 
                                dataKey={key + ' Daily Count'} 
                                name={key} 
                                stroke={colors.qualtitiveScale[index]} 
                                dot={false} 
                                isAnimationActive={false}  
                                strokeOpacity={strokeOpacities === key + ' Daily Count' ? 1 : 0.5}
                                strokeWidth={strokeOpacities === key + ' Daily Count' ? 2 : 1}
                            />}
                        )
                    }
                    <Legend 
                        // content={renderLegend}
                        onMouseEnter={handleLegendHover} 
                        onMouseLeave={handleLegendLeave}
                    />
                </LineChart>
            </ResponsiveContainer>
            <StyledSwitch>
                <Switch
                    checked={logChart}
                    onChange={handleSwitch}
                    name='log chart switch'
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
                <p>{logChart ? 'Log Scale' : 'Linear Scale'}</p>
            </StyledSwitch>
        </ChartContainer>
    );
}

export default MainLineChart

// dataParams.nIndex-(dataParams.nRange||dataParams.nIndex)