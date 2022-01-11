import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceArea,
  Tooltip,
  Label,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  CartesianGrid,
  Scatter

} from "recharts";

import Switch from "@material-ui/core/Switch";

import styled from "styled-components";
import colors from "../config/colors";
import { setVariableParams, setChartParams } from "../actions";
import useGetScatterData from "../hooks/useGetScatterData";

const ChartContainer = styled.span`
  span {
    color: white;
  }
  user-select: none;
  min-height:200px;
  height:30vh;
  max-height:30vh;
  flex: 1 0 auto;
  background: ${colors.gray};
  padding:1em 0;
  border-bottom:1px solid black;
`;
const SwitchesContainer = styled.div`
  display: flex;
  justify-content: center;
`;
const StyledSwitch = styled.div`
  margin: 0 5px;
  @media (max-width: 960px) {
    margin: 0;
  }
  p {
    color: white;
    display: inline;
    text-align: center;
  }
  span.MuiSwitch-track {
    background-color: ${colors.lightgray};
  }
  .MuiSwitch-colorSecondary.Mui-checked {
    color: ${colors.lightblue};
  }
  .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track {
    background-color: ${colors.lightblue};
  }
  .MuiSwitch-colorSecondary:hover {
    background-color: ${colors.lightblue}55;
  }
`;
const ChartTitle = styled.h3`
  text-align: center;
  font-family: "Lato", sans-serif;
  font-weight:bold;
  padding: 0;
  font-weight: normal;
  margin: 0;
  color: white;
`;

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// const numberFormatter = (val) =>
//   val > 1000000 ? `${val / 1000000}M` : val > 1000 ? `${val / 1000}K` : val;
// const dateFormatter = (val) => {
//   let tempDate = (new Date(val).getMonth() + 1) % 12;
//   return `${monthNames[tempDate]}`;
// };

// const CustomTick = (props) => (
//   <text {...props}>{props.labelFormatter(props.payload.value)}</text>
// );

// const CustomTooltip = (props) => {
//   try {
//     if (props.active) {
//       let data = props.payload;
//       return (
//         <div
//           style={{
//             background: colors.darkgray,
//             padding: "10px",
//             borderRadius: "4px",
//             boxShadow:
//               "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
//           }}
//         >
//           <p style={{ color: "white", padding: "5px 0 0 0" }}>
//             {data[0].payload.date}
//           </p>
//           {data.map((data) => (
//             <p
//               style={{
//                 color: data.color,
//                 padding: "5px 0 0 0",
//                 textShadow: `2px 2px 4px ${colors.black}`,
//                 fontWeight: 600,
//               }}
//             >
//               {data.name}:{" "}
//               {Number.isInteger(Math.floor(data.payload[data.dataKey]))
//                 ? Math.floor(data.payload[data.dataKey]).toLocaleString("en")
//                 : data.payload[data.dataKey]}
//             </p>
//           ))}
//         </div>
//       );
//     }
//   } catch {
//     return null;
//   }
//   return null;
// };

export default function ScatterChartComponent() {
  // const dispatch = useDispatch();
  const [xAxisVar, setXAxisVar] = useState('Percent Fully Vaccinated');
  const [yAxisVar, setYAxisVar] = useState('Death Count per 100K Population');
  const {
      scatterData
  } = useGetScatterData({
      xAxisVar,
      yAxisVar
  })
  
  return <ResponsiveContainer width="100%" height="100%">
  <ScatterChart
    width={400}
    height={400}
    margin={{
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    }}
  >
    <CartesianGrid />
    <XAxis type="number" dataKey="x" name="stature" unit="cm" />
    <YAxis type="number" dataKey="y" name="weight" unit="kg" />
    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
    <Scatter name="A school" data={scatterData} fill="#8884d8" />
  </ScatterChart>
</ResponsiveContainer>
}