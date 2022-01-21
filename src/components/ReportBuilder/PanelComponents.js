import { TextStatistics } from "../../components";
import { useDrag } from "muuri-react";
import { ControlPopover, LineChartInner } from "../../components";
import styled from "styled-components";
import colors from "../../config/colors";
import Icon from "../Icon";
import countyNames from "../../meta/countyNames";

const PanelItemContainer = styled.div`
  border: 1px solid rgba(0, 0, 0, 0);
  position: relative;
  padding: 0.25em;
  overflow:hidden;
  *.hover-buttons {
      opacity: 0.1;
      transition:250ms opacity;
  }
  &:hover {
    border: 1px solid black;
    *.hover-buttons {
        opacity: 1;
        background:white;
    }
  }
  &.w1 {
    width: 24.5%;
  }
  &.w2 {
    width: 49.5%;
  }
  &.w3 {
    width: 74.5%;
  }
  &.w4 {
    width: 100%;
  }
  &.h1 {
    height: 10em;
  }
  &.h2 {
    height: 20em;
  }
  &.h3 {
    height: 30em;
  }
  &.h4 {
    height: 40em;
  }
  &.h5 {
    height: 50em;
  }
  &.h6 {
    height: 60em;
  }
  &.hauto {
    height: auto;
  }
`;

const widthOptions = {
  type: "select",
  content: {
    label: "Set Width",
    items: [
      {
        label: "1/4",
        value: 1,
      },
      {
        label: "1/2",
        value: 2,
      },
      {
        label: "3/4",
        value: 3,
      },
      {
        label: "Full Width",
        value: 4,
      },
    ],
  },
};

const heightOptions = {
  type: "select",
  content: {
    label: "Set Height",
    items: [
      {
        label: "Auto",
        value: "auto",
      },
      {
        label: "1",
        value: 1,
      },
      {
        label: "2",
        value: 2,
      },
      {
        label: "3",
        value: 3,
      },
      {
        label: "3",
        value: 3,
      },
      {
        label: "4",
        value: 4,
      },
      {
        label: "5",
        value: 5,
      },
      {
        label: "6",
        value: 6,
      },
    ],
  },
};

const GrabTargetDiv = styled.button`
  position: absolute;
  left: ${(props) => props.left};
  top: ${(props) => props.top};
  width: 2rem;
  height: 2rem;
  padding: 0;
  opacity: 0.5;
  background: none;
  border: none;
  cursor: grabbing;
  span svg g path {
    fill: ${(props) => props.iconColor};
  }
  &:hover {
    opacity: 1;
  }
`;

const GrabTarget = ({ iconColor, className }) => (
  <GrabTargetDiv
    left="2em"
    top="0px"
    className={`content-header ${className}`}
    iconColor={iconColor}
    title="Move this content"
  >
    <Icon symbol="drag" />
  </GrabTargetDiv>
);

const TextContainer = styled(PanelItemContainer)``;

const TextReport = ({
  geoid = null,
  pageIdx = 0,
  contentIdx = 0,
  handleChange,
  handleRemove,
  width,
  height,
}) => (
  <PanelItemContainer className={`w${width || 2} h${height || "auto"}`}>
    <TextStatistics geoid={geoid} />
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
    <GrabTarget iconColor={colors.strongOrange} 
      className="hover-buttons" />
  </PanelItemContainer>
);

const LineChart = ({
  geoid = null,
  pageIdx = 0,
  contentIdx = 0,
  handleChange,
  handleToggle,
  handleRemove,
  width,
  height,
  currentTable,
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
        {...{
          currentTable,
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
              handleChange(pageIdx, contentIdx, { currentTable: e.target.value }),
            value: currentTable,
          },
          {
            type: "switch",
            content: "Logarithmic Scale",
            action: () => handleToggle(pageIdx, contentIdx, 'logChart'), //handleChange(pageIdx, contentIdx, { table: e.target.value }),
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
      <GrabTarget iconColor={colors.strongOrange} 
      className="hover-buttons" />
    </PanelItemContainer>
  );
};

const mapping = {
  textReport: TextReport,
  lineChart: LineChart,
};

export default function ReportComponentMapping(props) {
  const { type, width, height } = props;
  const InnerEl = mapping[type];
  if (!InnerEl) return null;
  return <InnerEl {...props} />;
}
