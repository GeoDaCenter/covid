import React, { useRef, useState } from "react";
import styled from "styled-components";
import colors from "../../config/colors";
import ReportComponentMapping from "./PanelComponents";
import { MuuriComponent } from "muuri-react";
import { Icon } from "../../components";
import ClickAwayListener from "@mui/material/ClickAwayListener";

const pagePadding = 2;
const LayoutPageContainer = styled.div`
  background: white;
  border: 1px solid black;
  aspect-ratio: 0.77;
  width: 80%;
  margin: 0.25em auto;
  position: relative;
  color: black;
  padding: ${pagePadding}em;
`;

const WaterMarkDiv = styled.div`
  position: absolute;
  left: ${(props) => (props.left ? pagePadding + "em" : "initial")};
  right: ${(props) => (props.right ? pagePadding + "em" : "initial")};
  top: ${(props) => (props.top ? pagePadding + "em" : "initial")};
  bottom: ${(props) => (props.bottom ? pagePadding + "em" : "initial")};
  p {
    font-size: 0.5rem;
  }
  max-width: 20%;
  img {
    width: 100%;
  }
`;

// Grid static options.
export const options = {
  layoutDuration: 400,
  dragRelease: {
    duration: 400,
    easing: "ease-out",
  },
  dragEnabled: true,
  dragContainer: document.body,
  // The placeholder of an item that is being dragged.
  dragPlaceholder: {
    enabled: true,
    createElement: function (item) {
      // The element will have the Css class ".muuri-item-placeholder".
      return item.getElement().cloneNode(true);
    },
  },
};

const DateWaterMark = () => (
  <WaterMarkDiv left bottom>
    <p>Generated on {Date().toLocaleString()}</p>
  </WaterMarkDiv>
);
const AtlasWaterMark = () => (
  <WaterMarkDiv right bottom>
    <img
      src={`${process.env.PUBLIC_URL}/img/us-covid-atlas-cluster-logo.svg`}
      style={{ width: "100%" }}
    />
  </WaterMarkDiv>
);

const availableModules = [
  {
    type: "Summary Description",
    modules: [
      {
        type: "textReport",
        label: "Text Report",
        width: 2,
        height: 3,
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
        currentTable: "cases",
      },
      {
        type: "lineChart",
        label: "Deaths Line Chart",
        width: 2,
        height: 2,
        currentTable: "deaths",
      },
      {
        type: "lineChart",
        label: "Vaccinations Line Chart",
        width: 2,
        height: 2,
        currentTable: "vaccines_fully_vaccinated",
      },
      {
        type: "lineChart",
        label: "Testing Positivity Line Chart",
        width: 2,
        height: 2,
        currentTable: "testing_wk_pos",
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

const AddItemButton = styled.button`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(-50%, -50%);
  background: ${colors.lightgray};
  width: 3em;
  height: 3em;
  border: 1px solid black;
  border-radius: 50%;
  padding: 0.5em;
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

const LayoutPage = ({ content, children, handleAddItem, pageIdx }) => {
  const [sort] = useState({
    value: "",
  });
  const [openAddItem, setOpenAddItem] = useState(false);
  const toggleOpenAddItem = () => setOpenAddItem((prev) => !prev);

  return (
    <LayoutPageContainer>
      <MuuriComponent
        key={JSON.stringify(content)}
        dragEnabled
        dragStartPredicate={{ handle: ".content-header" }}
        // onDragStart={(e) => console.log(e)}
        // onDragEnd={(e) => console.log(e)}
        // onSort={(a, b) => console.log(a, b)}
        instantLayout
        propsToData={({ id }) => ({ id })}
        sort={sort.value}
        // {...options}
      >
        {children}
      </MuuriComponent>
      <DateWaterMark />
      <AtlasWaterMark />

      <AddItemButton onClick={toggleOpenAddItem}>
        <Icon symbol="plus" />
      </AddItemButton>
      {openAddItem && (
        <ClickAwayListener onClickAway={toggleOpenAddItem}>
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
      )}
    </LayoutPageContainer>
  );
};

export default function ReportPage({
  content,
  geoid,
  pageIdx,
  handleRemove,
  handleChange,
  handleToggle,
  handleAddItem,
  name,
}) {
  return (
    <LayoutPage
      content={content}
      {...{
        handleToggle,
        handleChange,
        handleAddItem,
        handleRemove,
        pageIdx,
        geoid,
        name,
      }}
    >
      {content.map((item, index) => (
        <ReportComponentMapping
          {...{
            handleToggle,
            handleChange,
            handleAddItem,
            handleRemove,
            pageIdx,
            geoid,
            name,
          }}
          key={"page-component-" + index}
          contentIdx={index}
          {...item}
        />
      ))}
    </LayoutPage>
  );
}
