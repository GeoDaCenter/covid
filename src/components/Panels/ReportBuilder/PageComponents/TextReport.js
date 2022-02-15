import { ControlPopover, TextStatistics } from "../../../../components";
import {
  PanelItemContainer,
  GrabTarget,
  DeleteBlock,
  widthOptions,
  heightOptions,
} from "./PageComponentsLayout";
import colors from "../../../../config/colors";
import countyNames from "../../../../meta/countyNames";

export const TextReport = ({
  geoid = null,
  pageIdx = 0,
  contentIdx = 0,
  handleChange,
  handleRemove,
  width,
  height,
  format="bullet",
  dateIndex
}) => (
  <PanelItemContainer>
    <TextStatistics {...{geoid, format, dateIndex}} />
    <ControlPopover
      top="0"
      left="0"
      className="hover-buttons"
      iconColor={colors.strongOrange}
      controlElements={[
        {
          type: "header",
          content: "Controls for Text Report Block",
        },
        {
          type: "helperText",
          content: "Select the data to display on the chart.",
        },
        {
          type: "select",
          content: {
            label: "Change County",
            items: countyNames,
          },
          action: (e) =>
            handleChange(pageIdx, contentIdx, { geoid: e.target.value }),
          value: geoid,
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
