import { useMemo } from "react";
import { useSelector } from "react-redux";
import useGetScatterData from "../../../../hooks/useGetScatterData";
import { ControlPopover, ScatterChartInner } from "../../../../components";
import {
  PanelItemContainer,
  GrabTarget,
  DeleteBlock,
  widthOptions,
  heightOptions,
  CenteredChartTitle
} from "./PageComponentsLayout";
import colors from "../../../../config/colors";

const RadiusRange = Array(10).fill(0).map((_,idx) => ({value: idx+1, label: `${idx+1}`}));

export const ScatterChartReport = ({
  geoid = null,
  pageIdx = 0,
  contentIdx = 0,
  handleChange,
  handleToggle,
  handleRemove,
  width,
  height,
  xAxisVar,
  yAxisVar,
  radius = 4,
}) => {
  const variables = useSelector(({params}) => params.variables);
  const ScatterPlotVars = useMemo(() => variables.map(({variableName}) => ({label:variableName, value:variableName})), [variables.length])

  const { scatterData, timestamp } = useGetScatterData({
    xAxisVar,
    yAxisVar,
  });
  const scatterChart = useMemo(
    () =>
      timestamp !== null ? (
        <ScatterChartInner
          {...{ scatterData, xAxisVar, yAxisVar, radius }}
          theme="light"
        />
      ) : null,
    [timestamp]
  );
  return (
    <PanelItemContainer>
      <CenteredChartTitle>
        <h3>{xAxisVar} (x) vs {yAxisVar} (y)</h3>
      </CenteredChartTitle>
      {scatterChart}
      <ControlPopover
        className="hover-buttons"
        top="0"
        left="0"
        iconColor={colors.strongOrange}
        controlElements={[
          {
            type: "header",
            content: "Controls for Scatter Chart Block",
          },
          {
            type: "helperText",
            content: "Select the data to display on the chart.",
          },
          {
            type: "select",
            content: {
              label: "Change X Variable",
              items: ScatterPlotVars,
            },
            action: (e) =>
              handleChange(pageIdx, contentIdx, { xAxisVar: e.target.value }),
            value: xAxisVar,
          },
          {
            type: "select",
            content: {
              label: "Change Y Variable",
              items: ScatterPlotVars,
            },
            action: (e) =>
              handleChange(pageIdx, contentIdx, { yAxisVar: e.target.value }),
            value: yAxisVar,
          },
          {
            type: "select",
            content: {
              label: "Change Dot Radius",
              items: RadiusRange,
            },
            action: (e) =>
              handleChange(pageIdx, contentIdx, { radius: e.target.value }),
            value: radius,
          },          
          {
            ...widthOptions,
            action: (e) =>
              handleChange(pageIdx, contentIdx, { width: e.target.value }),
            value: width,
          },
          {
            ...heightOptions,
            action: (e) =>
              handleChange(pageIdx, contentIdx, { height: e.target.value }),
            value: height,
          },
        ]}
      />
      <GrabTarget iconColor={colors.strongOrange} className="hover-buttons" />
      <DeleteBlock
        iconColor={colors.strongOrange}
        className="hover-buttons"
        onClick={() => handleRemove(pageIdx, contentIdx)}
      />
    </PanelItemContainer>
  );
};
