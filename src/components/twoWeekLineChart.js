import React from 'react';
import {
    LineChart, Line, YAxis
} from 'recharts';
import styled from 'styled-components';
import * as d3 from 'd3-scale';

const LineContainer = styled.div`
    display:inline;
    padding:0;
    margin:0;
    align-self:flex-start;
`

const CustomizedDot = (props) => {
    const {
      cx, cy, index, color, angle
    } = props;
    if (index === 13) {
      return (
        <svg x={cx - 10} y={cy - 10} width={20} height={20} fill={color} viewBox="0 0 500 500" >
		    <polygon points="50,125 50,375 375,250" transform={`rotate(${angle} 250 250)`}  />
	  </svg>
      );
    }
  
    return null;
  };

const TwoWeekLineChart = ( props ) => {
    
    // map data into object
    let data = props.data.map(d => {
        return {val: d/props.data[0]}
    })
    
    let schemas = {
        'cases/deaths': ['green', 'yellow', 'red'],
        'testingCap': ['#f7fbff', '#f7fbff', '#08306b'],
        'testingPos': ['#0d0887', '#cb4679', '#f0f921'],
        'vaccination': ['#fcfbfd', '#bcbcdb', '#54288f'],
    }
    
    // colors derived from green - yellow - red diverging scale
    const colorScale = d3.scaleLinear()
        .domain([0, 0.5, 1])
        .range(schemas[props.schema])

    // change over past two weeks
    const delta = props.data[13] - props.data[0]

    const lineColor = (delta, start) => {
        let pctChange = delta/start
        return colorScale(pctChange + 0.5);
    }

    const calcAngle = (delta, start) => {
        let pctChange = delta/start;
        if (pctChange >= 0.5) {
            return -60
        } else if (pctChange <= -0.5) {
            return 60
        } else { 
            return pctChange*-1*60
        }
    }

    return (
        <LineContainer>
            <LineChart data={data} width={60} height={30}>
                <YAxis domain={['dataMin', 'dataMax']}  hide={true} />
                <Line 
                    type="linear" 
                    dataKey="val" 
                    stroke={lineColor(delta, props.data[0])}
                    strokeWidth={2} 
                    isAnimationActive={false}
                    dot={
                        <CustomizedDot color={lineColor(delta, props.data[0])} angle={calcAngle(props.data[12] - props.data[10], props.data[12])} />
                        }
                />
            </LineChart>
        </LineContainer>
    );
}

export default TwoWeekLineChart;
  