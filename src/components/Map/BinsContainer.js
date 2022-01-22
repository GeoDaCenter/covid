import styled from 'styled-components';
import colors from '../../config/colors';

export const BinsContainer = styled.div`
  display: inline-block;
  transform: translateY(10px);
  opacity: ${(props) => (props.disabled ? 0.25 : 1)};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'initial')};
  p {
    display: inline;
    color: white;
    transform: translateY(5px);
  }
  span.MuiSwitch-track {
    background-color: ${colors.buttongray};
  }
  .MuiSwitch-colorSecondary.Mui-checked {
    color: ${colors.lightblue};
  }
  .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track {
    background-color: ${colors.lightblue};
  }
  .MuiSwitch-colorSecondary:hover {
    background-color: ${colors.lightblue}55;
  }
`;