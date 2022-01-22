import { useMemo } from "react";
import useGetScatterData from "../../../../hooks/useGetScatterData";
import { ControlPopover, ScatterChartInner } from "../../../../components";
import {
  PanelItemContainer,
  GrabTarget,
  DeleteBlock,
  widthOptions,
  heightOptions,
} from "./PageComponentsLayout";
import colors from "../../../../config/colors";

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
}) => {
  const { scatterData, timestamp } = useGetScatterData({
    xAxisVar,
    yAxisVar,
  });
  const scatterChart = useMemo(
    () =>
      timestamp !== null ? (
        <ScatterChartInner
          {...{ scatterData, xAxisVar, yAxisVar }}
          theme="light"
        />
      ) : null,
    [timestamp]
  );
  return (
    <PanelItemContainer className={`w${width || 2} h${height || 2}`}>
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
