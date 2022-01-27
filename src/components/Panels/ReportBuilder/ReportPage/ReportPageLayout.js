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

  @media (max-width:1440px){
    width:100%;
  }
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
  max-width: 35%;
  img {
    width: 50%;
  }
`;

const AttributionDiv = styled.div`
  position:absolute;
  left:50%;
  bottom:${pagePadding}em;
  transform:translateX(-50%);
  text-align:center;
  h5 {
    margin:0 0 .5em 0;
    padding:0;
    line-height:1;
  }
`

export const DateWaterMark = () => (
  <WaterMarkDiv left bottom>
    <p>
      Data from USA Facts, CDC, Census ACS. Map Data (c) OpenStreetMap Contributors, Mapbox.
      Generated on {new Date().toISOString().slice(0,10)}
    </p>
  </WaterMarkDiv>
);

export const AtlasWaterMark = () => (
  <WaterMarkDiv right bottom>
    <img
      src={`${process.env.PUBLIC_URL}/img/us-covid-atlas-cluster-logo.svg`}
      style={{ width: "100%" }}
      alt=""
    />
  </WaterMarkDiv>
);

export const Attribution = () => <AttributionDiv>
  <h5>uscovidatlas.org &#8193; @uscovidatlas</h5>
  </AttributionDiv>