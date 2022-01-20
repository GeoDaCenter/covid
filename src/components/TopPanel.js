// this components houses the slider, legend, and bottom dock chart
import React from 'react';

import styled from 'styled-components';

import { DateSlider, Dock, Ticks } from '../components';
import colors from '../config/colors';

// Styled components
const TopDrawer = styled.div`
  position: fixed;
  top: 50px;
  left: calc(50vw - 225px);
  background: ${colors.gray};
  width: 90vw;
  max-width: 450px;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  border: 1px solid ${colors.black};
  border-top:none;
  border-radius: 0;
  transition: 250ms all;
  z-index:6;
  hr {
    opacity: 0.5;
  }
  div.MuiGrid-item {
    padding: 0;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    left: 0;
    transform: none;
  }
  @media (max-width: 750px) and (orientation: landscape) {
    // bottom all the way down for landscape phone
  }
`;
const TopPanel = () => {
  return (
    <TopDrawer id="timelinePanel">
      <DateSlider />
    </TopDrawer>
  );
};

export default TopPanel;
