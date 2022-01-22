import styled from "styled-components";
import colors from "../../../../config/colors";

const pagePadding = 2;

export const LayoutPageContainer = styled.div`
  background: white;
  border: 1px solid black;
  aspect-ratio: 0.77;
  width: 80%;
  margin: 0.25em auto;
  position: relative;
  color: black;
  padding: ${pagePadding}em;
`;

export const AddItemButton = styled.button`
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

export const DateWaterMark = () => (
  <WaterMarkDiv left bottom>
    <p>Generated on {Date().toLocaleString()}</p>
  </WaterMarkDiv>
);

export const AtlasWaterMark = () => (
  <WaterMarkDiv right bottom>
    <img
      src={`${process.env.PUBLIC_URL}/img/us-covid-atlas-cluster-logo.svg`}
      style={{ width: "100%" }}
    />
  </WaterMarkDiv>
);
