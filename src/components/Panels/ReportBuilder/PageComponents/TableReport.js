import { ControlPopover, MetricsTable } from "../../../../components";
import {
  PanelItemContainer,
  GrabTarget,
  DeleteBlock,
  widthOptions,
  heightOptions,
} from "./PageComponentsLayout";
// import {
//   onlyUniqueArray,
//   removeListItem
// } from '../../../../utils';
import colors from "../../../../config/colors";
import countyNames from "../../../../meta/countyNames";
// import { matchAndReplaceInlineVars } from "../../../../utils";

const CommunityContextMetrics = [
  "Uninsured Percent",
  "Over 65 Years Percent",
  "Life Expectancy",
  "Percent Essential Workers",
  "Self-rated Health",
  "Adult Obesity",
  "Diabetes Prevalence",
  "Adult Smoking",
  "Excessive Drinking",
  "Drug Overdose Deaths",
  "Children in Poverty",
  "Income Inequality",
  "Median Household Income",
  "Food Insecurity",
  "Unemployment",
  "Preventable Hospital Stays",
  "Residential Segregation (Black - White)",
  "Severe Housing Problems",
].map((f) => ({ value: f, label: f }));

const CovidMetrics = ["Cases", "Deaths", "Vaccination", "Testing"].map((f) => ({
  value: f,
  label: f,
}));
const CovidVarMapping = {
  "Cases":["Confirmed Count per 100K Population", "Confirmed Count"],
  "Deaths":["Death Count per 100K Population", "Death Count"],
  "Vaccination":["Percent Fully Vaccinated", "Percent Received At Least One Dose"],
  "Testing":["7 Day Testing Positivity Rate Percent", "7 Day Tests Performed per 100K Population"]
}

export const TableReport = ({
  geoid = null,
  pageIdx = 0,
  contentIdx = 0,
  handleChange,
  handleRemove,
  width = 2,
  height = 3,
  topic = "COVID",
  metrics = [],
  includedColumns = [{header:'Metric',accessor:"variable", },{header:'',accessor:"geoidData", },{header:'',accessor:"stateQ50", },{header:'National Median',accessor:"q50"}],
  neighbors,
  secondOrderNeighbors,
  geogToInclude = "county",
  dateIndex,
  name,
  metaDict={}
}) => {
  const neighborIds = {
    county: geoid,
    neighbors,
    secondOrderNeighbors,
    national: null
  }[geogToInclude];

  const variableNames = topic === "COVID"
    ? metrics.map(metric => CovidVarMapping[metric]).flat()
    : metrics


  // const parsedIncludedColumns = includedColumns.map(({accessor, header}) => ({
  //   accessor,
  //   header: matchAndReplaceInlineVars(header, metaDict)
  // }))
  
  return (
    <PanelItemContainer>
      <h4>
        {topic.includes("COVID")
          ? "7-Day Average Summary Statistics"
          : "Community Health Context"}
      </h4>
      <MetricsTable {...{ metrics: variableNames, includedColumns, geoid, neighborIds, dateIndex, name }} />
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
              label: "Add or Remove Metrics",
              items: topic === "COVID" ? CovidMetrics : CommunityContextMetrics,
            },
            action: (e) =>
              handleChange(pageIdx, contentIdx, { metrics: e.target.value }),
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
  );
};
