import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ZAxis,
  ReferenceArea,
  Tooltip,
  Label,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  CartesianGrid,
  Scatter,
} from "recharts";

import Switch from "@mui/material/Switch";

import styled from "styled-components";
import colors from "../config/colors";
import useGetScatterData from "../hooks/useGetScatterData";

const StyledResponsiveContainer = styled(ResponsiveContainer)`
  max-height: 20vh;
  background: ${colors.gray};
`;
export default function ScatterChartComponent() {
  // const dispatch = useDispatch();
  const [xAxisVar, setXAxisVar] = useState("Percent Fully Vaccinated");
  const [yAxisVar, setYAxisVar] = useState("Death Count per 100K Population");
  const { scatterData } = useGetScatterData({
    xAxisVar,
    yAxisVar,
  });

  return (
    <StyledResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 0,
        }}
      >
        <CartesianGrid isAnimationActive={false} stroke={colors.lightgray} />
        <XAxis type="number" dataKey="x" name={xAxisVar}>
          <Label
            value={xAxisVar}
            position="insideLeft"
            style={{
              transform: "translateY(20px)",
              fill: colors.lightgray,
              fontFamily: "Lato",
              fontWeight: 600,
            }}
          />
        </XAxis>
        <YAxis type="number" dataKey="y" name={yAxisVar}>
          <Label
            value={yAxisVar}
            position="outside"
            style={{
              fill: colors.lightgray,
              fontFamily: "Lato",
              fontWeight: 600,
            }}
            angle={-90}
          />
        </YAxis>
        <ZAxis type="number" dataKey="" range={[2, 2]} />

        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          isAnimationActive={false}
        />
        <Scatter
          name="A school"
          data={scatterData}
          fill="#8884d8"
          isAnimationActive={false}
          fill={colors.yellow}
        />
      </ScatterChart>
    </StyledResponsiveContainer>
  );
}
