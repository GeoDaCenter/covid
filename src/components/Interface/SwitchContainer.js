import styled from 'styled-components';
import colors from '../../config/colors';

export const SwitchContainer = styled.div`
  padding-top: 4px !important;
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