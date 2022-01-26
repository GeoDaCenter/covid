import { ControlPopover, LineChartInner } from "../../../../components";
import {
  PanelItemContainer,
  GrabTarget,
  DeleteBlock,
  widthOptions,
  heightOptions,
} from "./PageComponentsLayout";
import colors from "../../../../config/colors";

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
}) => {
  return (
    <PanelItemContainer className={`w${width || 2} h${height || 2}`}>
      <LineChartInner
        docked={true}
        colorScheme="light"
        geoid={typeof geoid === "number" || typeof geoid === "string" ? [geoid] : geoid}
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
            action: (e) =>
              handleChange(pageIdx, contentIdx, {
                table: e.target.value,
              }),
            value: table,
          },
          {
            type: "switch",
            content: "Logarithmic Scale",
            action: () => handleToggle(pageIdx, contentIdx, "logChart"), //handleChange(pageIdx, contentIdx, { table: e.target.value }),
            value: logChart,
          },
          // {
          //   type: "switch",
          //   content: "Population Normalization",
          //   action: handlePopSwitch,
          //   value: populationNormalized,
          // },
          // {
          //   type: "switch",
          //   content: "Show Summary Line",
          //   action: handleSummarizedSwitch,
          //   value: showSummarized,
          // },
          // {
          //   type: "switch",
          //   content: "Variant Designations",
          //   action: handleShouldShowVariants,
          //   value: shouldShowVariants,
          // },
          // {
          //   type: "select",
          //   content: {
          //     label: "Change County",
          //     items: countyNames,
          //   },
          //   action: (e) =>
          //     handleChange(pageIdx, contentIdx, { geoid: e.target.value }),
          //   value: geoid,
          // },
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
