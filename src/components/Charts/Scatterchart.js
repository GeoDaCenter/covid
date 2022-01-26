import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";

import {
  // LineChart,
  // Line,
  XAxis,
  YAxis,
  ZAxis,
  // ReferenceArea,
  Tooltip,
  Label,
  ResponsiveContainer,
  // Legend,
  ScatterChart,
  CartesianGrid,
  Scatter,
} from "recharts";

// import Switch from "@mui/material/Switch";

import styled from "styled-components";
import { ChartTitle, ControlPopover } from "../../components";
import colors from "../../config/colors";
import useGetScatterData from "../../hooks/useGetScatterData";

const ScatterChartContainer = styled.div`
  position: relative;
  background: none;
  width: 100%;
  max-height: 20vh;
  height: 400px;
  background: ${colors.gray};
`;

const colorSchemes = {
  light: {
    highlightColor: colors.strongOrange,
    mediumColor: colors.darkgray,
    gridColor: `${colors.black}22`,
  },
  dark: {
    highlightColor: colors.yellow,
    mediumColor: colors.lightgray,
    gridColor: `${colors.white}88`,
  },
};

export function ScatterChartInner({ scatterData, xAxisVar, yAxisVar, theme, radius=2 }) {
  const { highlightColor, mediumColor, gridColor } = colorSchemes[theme];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{
          top: 40,
          right: 20,
          bottom: 40,
          left: 0,
        }}
      >
        <CartesianGrid isAnimationActive={false} stroke={gridColor} />
        <XAxis type="number" dataKey="x" name={xAxisVar}>
          <Label
            value={xAxisVar}
            position="insideLeft"
            style={{
              transform: "translateY(20px)",
              fill: mediumColor,
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
              fill: mediumColor,
              fontFamily: "Lato",
              fontWeight: 600,
            }}
            angle={-90}
          />
        </YAxis>
        <ZAxis type="number" dataKey="" range={[radius, radius]} />

        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          isAnimationActive={false}
        />
        <Scatter
          name="A school"
          data={scatterData}
          isAnimationActive={false}
          fill={highlightColor}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export default function ScatterChartComponent({
  props=null
}) {
  // const dispatch = useDispatch();
  const [xAxisVar, setXAxisVar] = useState("Percent Fully Vaccinated");
  const [yAxisVar, setYAxisVar] = useState("Death Count per 100K Population");
  const variables = useSelector(({params}) => params.variables);
  const { scatterData, timestamp } = useGetScatterData({
    xAxisVar,
    yAxisVar,
  });
  
  const variableItems = variables.map(({ variableName }) => ({
    text: variableName,
    value: variableName,
  }));
  const scatterChart = useMemo(
    () =>
      timestamp !== null ? (
        <ScatterChartInner
          {...{ scatterData, xAxisVar, yAxisVar }}
          theme="dark"
        />
      ) : null,
    [timestamp]
  );
  return (
    <ScatterChartContainer>
      <ControlPopover
        controlElements={[
          {
            type: "header",
            content: "Scatterplot Controls",
          },
          {
            type: "helperText",
            content: "Select the data to display on the chart.",
          },
          {
            type: "select",
            content: {
              label: "XAxis Variable",
              items: variableItems,
            },
            action: (e) => setXAxisVar(e.target.value),
            value: xAxisVar,
          },
          {
            type: "select",
            content: {
              label: "YXAxis Variable",
              items: variableItems,
            },
            action: (e) => setYAxisVar(e.target.value),
            value: yAxisVar,
          },
        ]}
      />
      <ChartTitle>Scatterplot</ChartTitle>
      {scatterChart}
    </ScatterChartContainer>
  );
}
