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
} from "recharts";

import Switch from "@mui/material/Switch";
import {
  ControlPopover,
} from "../components";

import styled from "styled-components";
import colors from "../config/colors";
import useGetLineChartData from "../hooks/useGetLineChartData";

const ChartContainer = styled.span`
  span {
    color: white;
  }
  user-select: none;
  min-height:200px;
  height:100%;
  max-height:25vh;
  min-width:min(300px, 100vw)
  flex: 1 0 auto;
  background: ${colors.gray};
  padding:1em .5em;
  border-bottom:1px solid black;
  position: relative;
`;
const ChartTitle = styled.h3`
  text-align: center;
  font-family: "Lato", sans-serif;
  font-weight:bold;
  padding: 0;
  font-weight: normal;
  margin: 0;
  color: white;
  width:100%;
  span {
    max-width:20ch;
    display: block;
    margin:0 auto;
  }
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

const numberFormatter = (val) =>
  val > 1000000 ? `${val / 1000000}M` : val > 1000 ? `${val / 1000}K` : val;
const dateFormatter = (val) => {
  let tempDate = (new Date(val).getMonth() + 1) % 12;
  return `${monthNames[tempDate]}`;
};

const CustomTick = (props) => (
  <text {...props}>{props.labelFormatter(props.payload.value)}</text>
);
const getDateRange = ({ startDate, endDate }) => {
  let dateArray = [];

  let years = [];

  if (startDate.getUTCFullYear() === endDate.getUTCFullYear()) {
    years = [endDate.getUTCFullYear()];
  } else {
    for (
      let i = startDate.getUTCFullYear();
      i <= endDate.getUTCFullYear();
      i++
    ) {
      years.push(i);
    }
  }

  for (let i = 0; i < years.length; i++) {
    let yearStr = "" + years[i];
    let n;

    if (years[i] === 2020) {
      n = 2;
    } else {
      n = 1;
    }

    let dateString = `${yearStr}-${n < 10 ? 0 : ""}${n}-01`;
    while (n < 13) {
      dateString = `${yearStr}-${n < 10 ? 0 : ""}${n}-01`;
      dateArray.push(dateString);
      n++;
    }
  }
  return dateArray;
};

const rangeIncrement = (maximum) => {
  let returnArray = [];
  const increment = 2 * 10 ** (`${maximum}`.length - 1);
  for (let i = 0; i < maximum; i += increment) {
    returnArray.push(i);
  }
  return returnArray;
};

const dateRange = getDateRange({
  startDate: new Date("02/01/2020"),
  endDate: new Date(),
});

const CustomTooltip = (props) => {
  try {
    if (props.active) {
      let data = props.payload;
      return (
        <div
          style={{
            background: colors.darkgray,
            padding: "10px",
            borderRadius: "4px",
            boxShadow:
              "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
          }}
        >
          <p style={{ color: "white", padding: "5px 0 0 0" }}>
            {data[0].payload.date}
          </p>
          {data.map((data) => (
            <p
              style={{
                color: data.color,
                padding: "5px 0 0 0",
                textShadow: `2px 2px 4px ${colors.black}`,
                fontWeight: 600,
              }}
            >
              {data.name}:{" "}
              {Number.isInteger(Math.floor(data.payload[data.dataKey]))
                ? Math.floor(data.payload[data.dataKey]).toLocaleString("en")
                : data.payload[data.dataKey]}
            </p>
          ))}
        </div>
      );
    }
  } catch {
    return null;
  }
  return null;
};

export default function MainLineChart() {
  const dispatch = useDispatch();
  const [currentTable, setCurrentTable] = useState("cases");
  const {
    currentData,
    currIndex,
    currRange,
    chartData,
    maximums,
    isTimeseries,
    selectionKeys,
    selectionNames,
  } = useGetLineChartData({
    table: currentTable
  });

  const [logChart, setLogChart] = useState(false);
  const [showSummarized, setShowSummarized] = useState(true);
  const [activeLine, setActiveLine] = useState(false);
  const [populationNormalized, setPopulationNormalized] = useState(false);
  const handleSwitch = () => setLogChart((prev) => !prev);
  const handlePopSwitch = () => setPopulationNormalized((prev) => !prev);
  const handleSummarizedSwitch = () => setShowSummarized((prev) => !prev);
  const handleSetDate = ({ activeTooltipIndex }) =>
    dispatch({
      type: "SET_DATA_PARAMS",
      payload: { nIndex: activeTooltipIndex },
    });
  const handleLegendHover = (o) => setActiveLine(+o.dataKey.split('Weekly')[0]);
  const handleLegendLeave = () => setActiveLine(false);

  if (maximums && chartData) {
    return (
      <ChartContainer id="lineChart">
        <ControlPopover
          controlElements={[
            {
              type: "header",
              content: "Line Chart Controls"
            },
            {
              type: "helperText",
              content: "Select the data to display on the chart."
            },
            {
              type: "select", 
              content: {
                label: "Line Chart Variable",
                items: [
                  {
                    text: "Cases",
                    value: "cases"
                  },
                  {
                    text: "Deaths",
                    value: "deaths"
                  },
                  {
                    text: "Fully Vaccinated Persons",
                    value: "vaccines_fully_vaccinated"
                  },
                  {
                    text: "Weekly Positivity",
                    value: "testing_wk_pos"
                  }
                ],
              },
              action: (e) => setCurrentTable(e.target.value),
              value: currentTable
            },
            {
              type: "switch",
              content: "Logarithmic Scale",
              action: handleSwitch,
              value: logChart
            },
            {
              type: "switch",
              content: "Population Normalization",
              action: handlePopSwitch,
              value: populationNormalized
            },
            {
              type: "switch",
              content: "Show Summary Line",
              action: handleSummarizedSwitch,
              value: showSummarized
            }
          ]}
        />
        {selectionNames.length < 2 ? (
          <ChartTitle>
            <span>Total Cases and 7-Day Average New Cases
            {selectionNames.length ? `: ${selectionNames[0]}` : ""}</span>
          </ChartTitle>
        ) : (
          <ChartTitle><span>7-Day Average New Cases</span></ChartTitle>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 5,
              bottom: 20,
            }}
            onClick={isTimeseries ? handleSetDate : null}
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
                    transform: "translateY(10px)",
                  }}
                  labelFormatter={dateFormatter}
                />
              }
            />
            <YAxis
              yAxisId="left"
              type="number"
              scale={logChart ? "log" : "linear"}
              domain={[0.01, "dataMax"]}
              allowDataOverflow
              ticks={
                selectionKeys.length === 0
                  ? rangeIncrement({ maximum: maximums.sum })
                  : []
              }
              tick={
                <CustomTick
                  style={{
                    fill: colors.lightgray,
                    fontSize: "10px",
                    fontFamily: "Lato",
                    fontWeight: 600,
                  }}
                  labelFormatter={numberFormatter}
                />
              }
            >
              <Label
                value="Total Cases"
                position="insideLeft"
                style={{
                  marginTop: 10,
                  fill: colors.lightgray,
                  fontFamily: "Lato",
                  fontWeight: 600,
                }}
                angle={-90}
              />
            </YAxis>
            <YAxis
              yAxisId="right"
              orientation="right"
              scale={logChart ? "log" : "linear"}
              domain={[0.01, "dataMax"]}
              allowDataOverflow
              ticks={
                selectionKeys.length === 0
                  ? rangeIncrement({ maximum: maximums.count })
                  : []
              }
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
              <Label
                value="7-Day Average New Cases"
                position="insideTopRight"
                style={{
                  marginTop: 10,
                  fill:
                    selectionKeys.length < 2 ? colors.yellow : colors.lightgray,
                  fontFamily: "Lato",
                  fontWeight: 600,
                }}
                angle={-90}
              />
            </YAxis>
            <Tooltip content={CustomTooltip} />
            <ReferenceArea
              yAxisId="left"
              x1={currIndex - currRange}
              x2={currIndex}
              fill="white"
              fillOpacity={0.15}
              isAnimationActive={false}
            />
            {selectionKeys.length === 0 ? (
              <Line
                type="monotone"
                yAxisId="left"
                dataKey={`sum${populationNormalized ? "100k" : ""}`}
                name="Total Cases"
                stroke={colors.lightgray}
                dot={false}
                isAnimationActive={false}
              />
            ) : (
              selectionKeys.map((geoid) => {
                <Line
                  type="monotone"
                  yAxisId="left"
                  dataKey={`${geoid}Sum${populationNormalized ? "100k" : ""}`}
                  name="Total Cases"
                  stroke={colors.lightgray}
                  dot={false}
                  isAnimationActive={false}
                />;
              })
            )}
            {selectionKeys.length === 0 ? (
              <Line
                type="monotone"
                yAxisId="right"
                dataKey={`weekly${populationNormalized ? "100k" : ""}`}
                name="7-Day Average New Cases"
                stroke={colors.yellow}
                dot={false}
                isAnimationActive={false}
              />
            ) : (
              selectionKeys.map((geoid, idx) => (
                <Line
                  type="monotone"
                  yAxisId="left"
                  key={`line-weekly-${geoid}`}
                  dataKey={`${geoid}Weekly${populationNormalized ? "100k" : ""}`}
                  name={selectionNames[idx] + " 7-Day Ave"}
                  stroke={
                    selectionKeys.length > colors.qualtitiveScale.length
                      ? "white"
                      : colors.qualtitiveScale[idx]
                  }
                  dot={false}
                  isAnimationActive={false}
                  strokeOpacity={activeLine === geoid ? 1 : 0.7}
                  strokeWidth={activeLine === geoid ? 3 : 1}
                />
              ))
            )}
            //{" "}
            {selectionKeys.length > 1 && showSummarized && (
              <Line
                type="monotone"
                yAxisId="right"
                dataKey="keySum"
                name="Total For Selection"
                stroke={colors.lightgray}
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {selectionKeys.length < colors.qualtitiveScale.length && (
              <Legend
                onMouseEnter={handleLegendHover}
                onMouseLeave={handleLegendLeave}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        {/* <SwitchesContainer>
          <StyledSwitch>
            <Switch
              checked={logChart}
              onChange={handleSwitch}
              name="log chart switch"
              inputProps={{ "aria-label": "secondary checkbox" }}
            />
            <p>{logChart ? "Log Scale" : "Linear Scale"}</p>
          </StyledSwitch>
          <StyledSwitch>
            <Switch
              checked={populationNormalized}
              onChange={handlePopSwitch}
              name="population normalized chart switch"
              inputProps={{ "aria-label": "secondary checkbox" }}
            />
            <p>{populationNormalized ? "Per 100k" : "Counts"}</p>
          </StyledSwitch>
          {selectionKeys.length > 1 && (
            <StyledSwitch>
              <Switch
                checked={showSummarized}
                onChange={handleSummarizedSwitch}
                name="show summarized chart switch"
                inputProps={{ "aria-label": "secondary checkbox" }}
              />
              <p>
                {showSummarized
                  ? `Show ${
                      populationNormalized ? "Average" : "Total"
                    } For Selection`
                  : `Show ${
                      currentData.includes("state") ? "States" : "Counties"
                    }`}
              </p>
            </StyledSwitch>
          )}
        </SwitchesContainer> */}
      </ChartContainer>
    );
  } else {
    return null
  }
}
