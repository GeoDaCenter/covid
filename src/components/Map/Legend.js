import React from "react";
import Grid from "@mui/material/Grid";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { BinsList, Gutter, Tooltip, Icon } from "../../components";
import colors from "../../config/colors";

const BottomPanel = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  background: ${colors.gray};
  transform: translateX(-50%);
  width: 38vw;
  max-width: 500px;
  box-sizing: border-box;
  padding: 0.5em 1em;
  margin: 0;
  border: 1px solid ${colors.black};
  border-bottom: none;
  transition: 250ms all;
  color: white;
  hr {
    opacity: 0.5;
  }
  @media (max-width: 1024px) {
    width: 50vw;
    div {
      padding-bottom: 5px;
    }
    #binModeSwitch {
      position: absolute !important;
      right: 10px !important;
      top: 10px !important;
    }
    #dateRangeSelector {
      position: absolute !important;
      left: 66% !important;
      transform: translateX(-50%) !important;
      top: 10px !important;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    padding: 0;
    left: 0;
    transform: none;
  }
  @media (max-width: 750px) and (orientation: landscape) {
    // bottom all the way down for landscape phone
  }
  user-select: none;
`;

const LegendContainer = styled.div`
  width: 100%;
  padding: 10px 0 0 16px;
  margin: 0;
  box-sizing: border-box;
  div.MuiGrid-item {
    padding: 5px 5px 0 5px;
  }
`;

const IconContainer = styled.div`
  padding: 5px 10px;
  span.icons-title {
    margin-right: 10px;
    font-weight: bold;
  }
  img {
    width: 20px;
    height: 20px;
    transform: translateY(4px);
    padding: 2px;
  }
  span.icons-text {
    margin: 0 25px 0 5px;
  }
`;

const LegendTitle = styled.h3`
  text-align: center;
  font-family: "Lato", sans-serif;
  font-weight: bold;
  padding: 0;
  margin: 0;
`;

const BinLabels = styled.div`
  width: 100%;
  display: flex;
  margin-top: 0px;
  box-sizing: border-box;
  padding: 0
    ${(props) => (props.binLength > 6 ? 100 / props.binLength / 2 - 2 : 0)}%;
  .bin {
    height: 10px;
    display: inline;
    border: 0;
    margin: 0;
    flex: 2;
    font-size: 10px;
    text-align: center;
    background: none;
    text-align: center;
  }
  .bin:nth-of-type(1) {
    transform: ${(props) => (props.firstBinZero ? "translateX(-45%)" : "none")};
  }
  .tooltipText {
    margin-top: -5px;
    padding-bottom: 25px;
  }
`;
const BinBars = styled.div`
  width: 100%;
  display: flex;
  margin-top: 3px;
  box-sizing: border-box;
  .bin {
    height: 45px;
    display: inline;
    flex: 1;
    border: 0;
    padding: 20px 0;
    margin: -20px 0;
    background: none;
    transition: 125ms padding, 125ms margin;
    &.active {
      padding-top: 10px;
      span {
        box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.7);
      }
    }
    span {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
  .bin:nth-of-type(1) {
    transform: ${(props) => (props.firstBinZero ? "scaleX(0.35)" : "none")};
  }
`;

const DataNote = styled.p`
  margin-top: 1.5rem;
  text-align: center;
  svg {
    height: 20px;
    width: 20px;
    display: inline-block;
    transform: translateY(5px);
    margin-right: 5px;
    fill: ${colors.yellow};
  }
`;

export const LegendInner = ({
  currentBins,
  colorScale,
  fixedScale,
  handleHover = () => {},
  colorFilter,
}) => (
  <span>
    <BinBars
      firstBinZero={
        `${colorScale[0]}` === `240,240,240` && fixedScale === undefined
      }
    >
      {colorScale.map((color) => (
        <button
          onMouseEnter={() => handleHover(color)}
          onMouseLeave={() => handleHover(null)}
          onFocus={() => handleHover(color)}
          onBlur={() => handleHover(null)}
          className={`bin color ${colorFilter === color && "active"}`}
          key={`${color[0]}${color[1]}`}
        >
          <span
            style={{
              backgroundColor: `rgb(${color[0]},${color[1]},${color[2]})`,
            }}
          ></span>
        </button>
      ))}
    </BinBars>
    <BinLabels
      firstBinZero={`${colorScale[0]}` === `240,240,240`}
      binLength={currentBins?.length}
    >
      {`${colorScale[0]}` === `240,240,240` && fixedScale === null && (
        <div className="bin firstBin">0</div>
      )}

      {currentBins !== undefined && <BinsList data={currentBins} />}
    </BinLabels>
  </span>
);

const Legend = ({
  variableName,
  colorScale,
  bins,
  resource,
  fixedScale,
  note,
}) => {
  const dispatch = useDispatch();
  const colorFilter = useSelector(({ ui }) => ui.colorFilter);
  const handleHover = (color) => {
    dispatch({
      type: "SET_COLOR_FILTER",
      payload: color,
    });
  };
  const { bins: currentBins } = bins;

  return (
    <BottomPanel id="bottomPanel">
      <LegendContainer>
        <Grid container spacing={2} id="legend-bins-container">
          <Grid item xs={12}>
            <LegendTitle>{variableName}</LegendTitle>
          </Grid>
          <Grid item xs={12}>
            {colorScale !== undefined && (
              <LegendInner
                {...{
                  currentBins,
                  colorScale,
                  fixedScale,
                  handleHover,
                  colorFilter,
                }}
              />
            )}
          </Grid>
        </Grid>
        {resource && <Gutter h={20} />}
        {resource && (
          <IconContainer>
            <span className="icons-title">Icons:</span>

            {resource.includes("clinics") && (
              <>
                <img
                  src={`${process.env.PUBLIC_URL}/assets/img/clinic_icon.png`}
                  alt=""
                />
                <span className="icons-text">Clinics</span>
              </>
            )}
            {resource.includes("hospitals") && (
              <>
                <img
                  src={`${process.env.PUBLIC_URL}/assets/img/hospital_icon.png`}
                  alt=""
                />
                <span className="icons-text">Hospital</span>
              </>
            )}
            {resource.includes("vaccination") && (
              <>
                <img
                  src={`${process.env.PUBLIC_URL}/assets/img/federal_site.png`}
                  alt=""
                />
                <span className="icons-text">
                  Vaccine Center
                  <Tooltip id="vaccineCenter" />
                </span>
              </>
            )}
            {resource.includes("vaccination") && (
              <>
                <img
                  src={`${process.env.PUBLIC_URL}/assets/img/participating_clinic.png`}
                  alt=""
                />
                <span className="icons-text">
                  Clinic
                  <Tooltip id="vaccineClinic" />
                </span>
              </>
            )}
            {resource.includes("vaccination") && (
              <>
                <img
                  src={`${process.env.PUBLIC_URL}/assets/img/invited_clinic.png`}
                  alt=""
                />
                <span className="icons-text">
                  Invited Clinic
                  <Tooltip id="vaccineClinicInvited" />
                </span>
              </>
            )}
          </IconContainer>
        )}
        {note && (
          <DataNote>
            <Icon symbol="alert" />
            {note}
          </DataNote>
        )}
      </LegendContainer>
    </BottomPanel>
  );
};

export default React.memo(Legend);
