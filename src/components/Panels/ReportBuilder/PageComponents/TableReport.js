import { ControlPopover } from "../../../../components";
import {
  PanelItemContainer,
  GrabTarget,
  DeleteBlock,
  widthOptions,
  heightOptions,
} from "./PageComponentsLayout";
import colors from "../../../../config/colors";
import StatsTable from "./StatsTable";
import countyNames from "../../../../meta/countyNames";

export const TableReport = ({
    geoid = null,
    pageIdx = 0,
    contentIdx = 0,
    handleChange,
    handleRemove,
    width = 2,
    height = 3,
    topic = "COVID",
    metrics = []
  }) => {
    console.log(metrics)
    return <PanelItemContainer className={`w${width || 2} h${height || 3}`}>
      <h4>
        {topic === "COVID"
          ? "7-Day Average Summary Statistics"
          : "Community Health Context"}
      </h4>
      <StatsTable {...{ topic, geoid }} />
      <ControlPopover
        top="0"
        left="0"
        className="hover-buttons"
        iconColor={colors.strongOrange}
        controlElements={[
          {
            type: "header",
            content: "Controls for Table Report Block",
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
            type: "selectMulti",
            content: {
              label: "Change County",
              items: [{
                label: "All",
                value: null
              },{
                label: "New York",
                value: "36061"
              }],
            },
            action: (e) => handleChange(pageIdx, contentIdx, { metrics: [...metrics, ...e.target.value] }),
            value: metrics,
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
  }