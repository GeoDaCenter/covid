import React from "react";
import styled from "styled-components";
// import ClickAwayListener from "@mui/material/ClickAwayListener";
import colors from "../../../../config/colors";
import { Box, Modal } from "@mui/material";
const defaultModules = [
  {
    type: "Maps",
    modules: [
      {
        type: "map",
        label: "Map",
        width: 2,
        height: 3,
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
        label: "Community Health Context",
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
  border-bottom: 1px solid ${colors.white};
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
    color:white;
  }
`;

const AddItemContainer = styled.div`
  /* position: absolute; */
  /* left: 3em;
  top: 50%;
  transform: translateY(-55%); */
  /* background: ${colors.lightgray}; */
  border: 1px solid ${colors.lightgray};
  color:white;
  /* height: 90%; */
`;


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: '50vw',
  bgcolor: colors.gray,
  border: "1px solid #000",
  fontFamily: "'Lato', sans-serif",
  color: "white",
  boxShadow: 0,
  overflowY: "scroll",
  overflowX: "hidden",
  zIndex: 10000,
  p: {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 4,
    xl: 4,
  },
};


const CloseButton = styled.button`
  position: absolute;
  top: -.5em;
  right: -.125em;
  padding: 0.75em;
  background:none;
  color:white;
  border:none;
  font-size:1rem;
  cursor:pointer;
`;


export function AvailableModulesList({
  availableModules = defaultModules,
  handleAddItem = () => {},
  handleClose = () => {},
  pageIdx = 0,
  open,
}) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <p>Add items to this page</p>
        <br/>
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
      <CloseButton onClick={handleClose} title="Close Panel">×</CloseButton>
      </Box>
    </Modal>
  );
}
