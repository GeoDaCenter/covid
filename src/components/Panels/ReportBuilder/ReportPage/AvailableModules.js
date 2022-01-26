import React from "react";
import styled from "styled-components";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import colors from "../../../../config/colors";

const defaultModules = [
  {
    type: "Maps",
    modules: [
      {
        type: "map",
        label: "Map",
        width: 2,
        height: 3
      },
    ],
  },
  {
    type: "Summary Description",
    modules: [
      {
        type: "textReport",
        label: "Text Report",
        width: 2,
        height: 4,
      },
    ],
  },

  {
    type: "Table",
    modules: [
      {
        type: "table",
        label: "COVID Summary Table",
        width: 2,
        height: 3,
        topic: "COVID",
      },
      {
        type: "table",
        label: "Social & Structural Factors Summary Table",
        width: 2,
        height: 3,
        topic: "SDOH",
      },
    ],
  },
  {
    type: "Line Chart",
    modules: [
      {
        type: "lineChart",
        label: "Cases Line Chart",
        width: 2,
        height: 2,
        table: "cases",
      },
      {
        type: "lineChart",
        label: "Deaths Line Chart",
        width: 2,
        height: 2,
        table: "deaths",
      },
      {
        type: "lineChart",
        label: "Vaccinations Line Chart",
        width: 2,
        height: 2,
        table: "vaccines_fully_vaccinated",
      },
      {
        type: "lineChart",
        label: "Testing Positivity Line Chart",
        width: 2,
        height: 2,
        table: "testing_wk_pos",
      },
    ],
  },
  {
    type: "Scatter Chart",
    modules: [
      {
        type: "scatterChart",
        label: "Vaccinations vs Deaths Line Chart",
        width: 3,
        height: 3,
        xAxisVar: "Percent Fully Vaccinated",
        yAxisVar: "Death Count per 100K Population",
      },
    ],
  },
];

const ItemTypeContainer = styled.div`
  padding: 0.5em;
  border-bottom: 1px solid ${colors.darkgray};
  ul {
    list-style: none;
  }
  ul li button {
    background: none;
    border: none;
    &:before {
      content: "+";
      margin-right: 2px;
    }
  }
`;

const AddItemContainer = styled.div`
  position: absolute;
  left: 3em;
  top: 50%;
  transform: translateY(-55%);
  background: ${colors.lightgray};
  border: 1px solid black;
  height: 90%;
`;

export function AvailableModulesList({
  availableModules = defaultModules,
  handleAddItem = () => {},
  handleClose = () => {},
  pageIdx = 0
}) {
  return (
    <ClickAwayListener onClickAway={handleClose}>
      <AddItemContainer>
        {availableModules.map(({ type, modules }) => (
          <ItemTypeContainer key={type}>
            <h3>{type}</h3>
            <ul>
              {modules.map((props, idx) => (
                <li key={type + idx}>
                  <button onClick={() => handleAddItem(pageIdx, props)}>
                    {props.label}
                  </button>
                </li>
              ))}
            </ul>
          </ItemTypeContainer>
        ))}
      </AddItemContainer>
    </ClickAwayListener>
  );
}
