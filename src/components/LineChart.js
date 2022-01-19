import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setVariableParams } from "../actions";
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
  ReferenceLine,
} from "recharts";

import {
  ChartTitle,
  ChartLabel,
  ControlPopover,
  Draggable,
  Scaleable,
} from "../components";

import styled from "styled-components";
import colors from "../config/colors";
import useGetLineChartData from "../hooks/useGetLineChartData";
import Icon from "./Icon";

const ChartContainer = styled.span`
  span {
    color: white;
  }
  user-select: none;
  /* flex: 1 0 auto; */
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const PopOutContainer = styled.div`
  position: relative;
  background: ${colors.gray};
  padding: 0;
`;
const DockPopButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 2em;
  height: 2em;
  background: none;
  border: none;
  padding: 0.25em;
  z-index: 1;
  cursor: pointer;
  svg g {
    fill: ${colors.yellow};
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

const LabelText = {
  cases: {
    x1label: "Cumulative Cases",
    x2label: "New Cases (7 Day Average)",
    title: "Cases",
  },
  deaths: {
    x1label: "Deaths Cases",
    x2label: "New Deaths (7 Day Average)",
    title: "Deaths",
  },
  vaccines_fully_vaccinated: {
    x1label: "Total Vaccinations",
    x2label: "New Vaccinations (7 Day Average)",
    title: "Population Fully Vaccinated",
  },
  testing_wk_pos: {
    x1label: "",
    x2label: "Testing Positivity (7 Day Average)",
    title: "Testing Positivity",
  },
};
function LineChartInner({ resetDock = () => {}, docked = false }) {
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
    table: currentTable,
  });
  const { x1label, x2label, title } = LabelText[currentTable];
  const [logChart, setLogChart] = useState(false);
  const [showSummarized, setShowSummarized] = useState(true);
  const [activeLine, setActiveLine] = useState(false);
  const [populationNormalized, setPopulationNormalized] = useState(false);
  const [shouldShowVariants, setShouldShowVariants] = useState(false);
  const handleSwitch = () => setLogChart((prev) => !prev);
  const handlePopSwitch = () => setPopulationNormalized((prev) => !prev);
  const handleSummarizedSwitch = () => setShowSummarized((prev) => !prev);
  const handleChange = (e) =>
    e?.activeTooltipIndex &&
    dispatch(setVariableParams({ nIndex: e.activeTooltipIndex }));
  const handleLegendHover = (o) => setActiveLine(+o.dataKey.split("Weekly")[0]);
  const handleLegendLeave = () => setActiveLine(false);
  const handleShouldShowVariants = () => setShouldShowVariants((prev) => !prev);
  
  if (maximums && chartData) {
    return (
      <ChartContainer id="lineChart">
        <ControlPopover
          controlElements={[
            {
              type: "header",
              content: "Line Chart Controls",
            },
            {
              type: "helperText",
              content: "Select the data to display on the chart.",
            },
            {
              type: "select",
              content: {
                label: "Line Chart Variable",
                items: [
                  {
                    text: "Cases",
                    value: "cases",
                  },
                  {
                    text: "Deaths",
                    value: "deaths",
                  },
                  {
                    text: "Fully Vaccinated Persons",
                    value: "vaccines_fully_vaccinated",
                  },
                  {
                    text: "Weekly Positivity",
                    value: "testing_wk_pos",
                  },
                ],
              },
              action: (e) => setCurrentTable(e.target.value),
              value: currentTable,
            },
            {
              type: "switch",
              content: "Logarithmic Scale",
              action: handleSwitch,
              value: logChart,
            },
            {
              type: "switch",
              content: "Population Normalization",
              action: handlePopSwitch,
              value: populationNormalized,
            },
            {
              type: "switch",
              content: "Show Summary Line",
              action: handleSummarizedSwitch,
              value: showSummarized,
            },
            {
              type: "switch",
              content: "Variant Designations",
              action: handleShouldShowVariants,
              value: shouldShowVariants,
            },
          ]}
        />
        {!docked && (
          <DockPopButton onClick={resetDock} title="Dock Line Chart Panel">
            <Icon symbol="popOut" />
          </DockPopButton>
        )}
        {selectionNames.length < 2 ? (
          <ChartTitle>
            <span>
              {title}
              {selectionNames.length ? `: ${selectionNames[0]}` : ""}
            </span>
          </ChartTitle>
        ) : (
          <ChartTitle>
            <span>7-Day Average New Cases</span>
          </ChartTitle>
        )}
        <ChartLabel color={colors.white} left={-45}>
          {x1label}
        </ChartLabel>
        <ChartLabel color={colors.yellow} right={-75}>
          {x2label}
        </ChartLabel>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 0,
              right: 20,
              left: 10,
              bottom: 50,
            }}
            onClick={isTimeseries ? handleChange : null}
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
            ></YAxis>
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
            ></YAxis>
            <Tooltip content={CustomTooltip} />
            <ReferenceArea
              yAxisId="left"
              x1={chartData[currIndex - currRange]?.date || 0}
              x2={chartData[currIndex]?.date || 0}
              fill="white"
              fillOpacity={0.15}
              isAnimationActive={false}
            />
            {selectionKeys.length === 0 ? (
              <Line
                type="monotone"
                yAxisId="left"
                dataKey={`sum${populationNormalized ? "100k" : ""}`}
                name={x1label}
                stroke={colors.lightgray}
                dot={false}
                isAnimationActive={false}
              />
            ) : (
              selectionKeys.map((geoid, idx) => (
                <Line
                  type="monotone"
                  yAxisId="left"
                  dataKey={`${geoid}Sum${populationNormalized ? "100k" : ""}`}
                  name={selectionNames[idx] + " Cumulative"}
                  stroke={colors.lightgray}
                  dot={false}
                  isAnimationActive={false}
                />
              ))
            )}
            {selectionKeys.length === 0 ? (
              <Line
                type="monotone"
                yAxisId="right"
                dataKey={`weekly${populationNormalized ? "100k" : ""}`}
                name={x2label}
                stroke={colors.yellow}
                dot={false}
                isAnimationActive={false}
              />
            ) : (
              selectionKeys.map((geoid, idx) => (
                <Line
                  type="monotone"
                  yAxisId="right"
                  key={`line-weekly-${geoid}`}
                  dataKey={`${geoid}Weekly${
                    populationNormalized ? "100k" : ""
                  }`}
                  name={selectionNames[idx] + " 7-Day Ave"}
                  stroke={
                    selectionKeys.length === 1
                      ? colors.yellow
                      : selectionKeys.length > colors.qualtitiveScale.length
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
                margin={{ top: 40, left: 0, right: 0, bottom: 50 }}
                iconType="plainline"
              />
            )}
            {shouldShowVariants && (
              <>
                <ReferenceLine
                  x="2020-12-18"
                  yAxisId="left"
                  stroke="gray"
                  strokeWidth={0.5}
                  label={{
                    value: "Alpha, Beta",
                    angle: 90,
                    position: "left",
                    fill: "gray",
                  }}
                />
                <ReferenceLine
                  x="2021-01-11"
                  yAxisId="left"
                  stroke="gray"
                  strokeWidth={0.5}
                  label={{
                    value: "Gamma",
                    angle: 90,
                    position: "left",
                    fill: "gray",
                  }}
                />
                <ReferenceLine
                  x="2021-05-11"
                  yAxisId="left"
                  stroke="gray"
                  strokeWidth={0.5}
                  label={{
                    value: "Delta",
                    angle: 90,
                    position: "left",
                    fill: "gray",
                  }}
                />
                <ReferenceLine
                  x="2021-11-26"
                  yAxisId="left"
                  stroke="gray"
                  strokeWidth={0.5}
                  label={{
                    value: "Omicron",
                    angle: 90,
                    position: "left",
                    fill: "gray",
                  }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  } else {
    return null;
  }
}

export default function LineChartOuter({ defaultDimensions }) {
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  return isPoppedOut ? (
    <Draggable
      z={9}
      defaultX={defaultDimensions.defaultXLong}
      defaultY={defaultDimensions.defaultY}
      title="lineChart"
      allowCollapse={false}
      content={
        <Scaleable
          content={<LineChartInner resetDock={() => setIsPoppedOut(false)} />}
          title="lineChart"
          defaultWidth={defaultDimensions.defaultWidthLong}
          defaultHeight={defaultDimensions.defaultHeight}
          minHeight={defaultDimensions.minHeight}
          minWidth={defaultDimensions.minWidth}
        />
      }
    />
  ) : (
    <PopOutContainer
      style={{
        height: defaultDimensions.defaultHeight + "px",
        minHeight: defaultDimensions.defaultHeight + "px",
        width: defaultDimensions.defaultWidthLong + "px",
      }}
    >
      <DockPopButton
        title="Popout Line Chart Panel"
        onClick={() => setIsPoppedOut(true)}
        className="popout-button"
      >
        <Icon symbol="popOut" />
      </DockPopButton>
      <LineChartInner docked={true} />
    </PopOutContainer>
  );
}
