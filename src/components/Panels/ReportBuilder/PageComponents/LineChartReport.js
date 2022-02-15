import { ControlPopover, LineChartInner } from "../../../../components";
import {
  PanelItemContainer,
  GrabTarget,
  DeleteBlock,
  widthOptions,
  heightOptions,
  CenteredChartTitle
} from "./PageComponentsLayout";
import colors from "../../../../config/colors";
import countyList from "../../../../meta/countyNames";

const tableOptions = [
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
]

export const LineChartReport = ({
  geoid = [],
  pageIdx = 0,
  contentIdx = 0,
  handleChange,
  handleToggle,
  handleRemove,
  width,
  height,
  table,
  logChart,
  showSummarized,
  populationNormalized,
  shouldShowVariants,
  neighbors, secondOrderNeighbors,
  linesToShow="county"
}) => {
  const ids = {
    county: geoid,
    neighbors,
    secondOrderNeighbors,
  }[linesToShow]
  
  return (
    <PanelItemContainer style={{padding:'1em 1em 0 0'}}>
      <CenteredChartTitle>
        <h3>{tableOptions.find(f => f.value === table)?.text}</h3>
      </CenteredChartTitle>
      <LineChartInner
        docked={true}
        colorScheme="light"
        geoid={typeof ids === "number" || typeof ids === "string" ? [ids] : ids}
        {...{
          table,
          logChart,
          showSummarized,
          populationNormalized,
          shouldShowVariants,
          
        }}
      />
      <ControlPopover
        className="hover-buttons"
        top="0"
        left="0"
        iconColor={colors.strongOrange}
        controlElements={[
          {
            type: "header",
            content: "Controls for Line Chart Block",
          },
          {
            type: "helperText",
            content: "Select the data to display on the chart.",
          },
          {
            type: "select",
            content: {
              label: "Change Table",
              items: tableOptions,
            },
            action: (e) =>
              handleChange(pageIdx, contentIdx, {
                table: e.target.value,
              }),
            value: table,
          },
          {
            type: "switch",
            content: "Logarithmic Scale",
            action: () => handleToggle(pageIdx, contentIdx, "logChart"),
            value: logChart,
          },
          {
            type: "switch",
            content: "Normalize to 100K Population",
            action: () => handleToggle(pageIdx, contentIdx, "populationNormalized"),
            value: populationNormalized,
          },
          {
            type: "switch",
            content: "Show Variant Designation Dates",
            action: () => handleToggle(pageIdx, contentIdx, "shouldShowVariants"),
            value: shouldShowVariants,
          },
          {
            type: "comboBox",
            content: {
              label: "Change County",
              items: countyList,
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
};
