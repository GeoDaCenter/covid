import React, { useState } from "react";
import styled from "styled-components";

import {
  ControlPopover,
  Draggable,
  Scaleable,
  Icon,
  LineChartInner
} from "../../components";

import colors from "../../config/colors";

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

export default function LineChartOuter({ defaultDimensions }) {
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const [table, setTable] = useState("cases");
  const [logChart, setLogChart] = useState(false);
  const [showSummarized, setShowSummarized] = useState(true);
  const [populationNormalized, setPopulationNormalized] = useState(false);
  const [shouldShowVariants, setShouldShowVariants] = useState(false);

  const handleSwitch = () => setLogChart((prev) => !prev);
  const handlePopSwitch = () => setPopulationNormalized((prev) => !prev);
  const handleSummarizedSwitch = () => setShowSummarized((prev) => !prev);
  const handleShouldShowVariants = () => setShouldShowVariants((prev) => !prev);

  return isPoppedOut ? (
    <Draggable
      z={9}
      defaultX={defaultDimensions.defaultXLong}
      defaultY={defaultDimensions.defaultY}
      title="lineChart"
      allowCollapse={false}
      content={
        <Scaleable
          content={
            <ChartContainer>
              <ControlPopover
                bottom
                left
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
                    action: (e) => setTable(e.target.value),
                    value: table,
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
              <LineChartInner
                resetDock={() => setIsPoppedOut(false)}
                {...{
                  table,
                  logChart,
                  showSummarized,
                  populationNormalized,
                  shouldShowVariants,
                }}
              />
            </ChartContainer>
          }
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

      <ControlPopover
        bottom
        left
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
            action: (e) => setTable(e.target.value),
            value: table,
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
      <LineChartInner
        docked={true}
        {...{
          table,
          logChart,
          showSummarized,
          populationNormalized,
          shouldShowVariants,
        }}
      />
    </PopOutContainer>
  );
}
