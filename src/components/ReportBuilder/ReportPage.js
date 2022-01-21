import React, { useRef, useState } from "react";
import styled from "styled-components";
import colors from "../../config/colors";
import ReportComponentMapping from "./PanelComponents";
import { MuuriComponent } from "muuri-react";

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

const LayoutPage = ({ content, children }) => {
  const [sort] = useState({
    value: "",
  });
  const muuriRef = useRef(null);
  console.log(muuriRef?.current);
  return (
    <LayoutPageContainer>
      <MuuriComponent
        key={JSON.stringify(content)}
        dragEnabled
        dragStartPredicate={{ handle: ".content-header" }}
        onDragStart={(e) => console.log(e)}
        onDragEnd={(e) => console.log(e)}
        onSort={(a, b) => console.log(a, b)}
        ref={muuriRef}
        instantLayout
        propsToData={({ id }) => ({ id })}
        sort={sort.value}
        // {...options}
      >
        {children}
      </MuuriComponent>
      <DateWaterMark />
      <AtlasWaterMark />
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
}) {
  return (
    <LayoutPage content={content}>
      {content.map((item, index) => (
        <ReportComponentMapping
          {...{ handleToggle, handleChange, handleRemove, pageIdx, geoid }}
          key={"page-component-" + index}
          contentIdx={index}
          {...item}
        />
      ))}
    </LayoutPage>
  );
}
