import styled from "styled-components";
import { Slider } from "@mui/material";
import colors from "../../config/colors";

export const StyledSlider = styled(Slider)`
&.MuiSlider-root {
  box-sizing: border-box;
  color: #ffffff55;
}
span.MuiSlider-rail {
  display: none;
}
span.MuiSlider-track {
  // color:white;
  // height:4px;
  display: none;
}
span.MuiSlider-thumb {
  color: white;
  width: 15px;
  height: 15px;
  transform: translate(-1.5px, -4px);
  border: 2px solid ${colors.gray};
  .MuiSlider-valueLabel {
    transform: translateY(-10px);
    pointer-events: none;
    font-size: 15px;
    span {
      background: none;
    }
  }
}
span.MuiSlider-mark {
  width: 1px;
  height: 2px;
}
// .MuiSlider-valueLabel span{
//     transform:translateX(-100%);
// }
span.MuiSlider-thumb.MuiSlider-active {
  box-shadow: 0px 0px 10px rgba(200, 200, 200, 0.5);
}
`;