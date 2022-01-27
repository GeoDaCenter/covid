import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import styled from 'styled-components';
import { Icon } from '..';
import colors from '../../config/colors';

const DockContainerOuter = styled.div`
  position:relative;
`

const DockContainer = styled.div`
  height: calc(100vh - 50px);
  background: lightgray;
  width: 50px;
  /* position: absolute; */
  /* left: 0; */
  /* top: 0; */
  background: ${colors.gray};
  border-right:1px solid black;
  display: flex;
  flex-direction: column;
  z-index: 5;
  button {
    background:none;
    border:none;
    width:100%;
    height:50px;
    padding: 14px 14px 14px 10px;
    cursor:pointer;
    border-left:4px solid rgba(0,0,0,0);
    transition: 125ms all;
    svg {
      fill:white;
      stroke:white;
      stroke-width:0;
      transition:250ms all;
    }
    &.hovered {
      svg {
        fill: ${colors.yellow};
        stroke: ${colors.yellow};
      }
    }
    &.active {
      border-color:${colors.yellow};
    }
    span.mobileText {
      display:none;
      color:white;
      font-size:.75rem;
    }
  }
  #settings-button {
    stroke-width:2px;
    circle.cls-1 {
      fill:none;
    }
  }
  @media (max-width: 768px) {
    width:100%;
    top:0;
    height:80px;
    flex-direction:row;
    overflow-x:scroll;
    overflow-y:hidden;
    button {
      height:50px;
      width:auto;
      text-align:center;
      padding:10px 20px 0 20px;
      svg {
        width:20px;
      }
      span.mobileText {
        display:block;
      }
    }
  }
`;


const DockLabels = styled.div`
  position: fixed;
  left:50px;
  top:50px;
  color:red;
  z-index:5000;
  opacity:0;
  pointer-events:none;
  transition-delay: 0s;
  transition-duration:125ms;
  transition-property: opacity;
  background: ${colors.darkgray}dd;
  display:flex;
  flex-direction:column;
  button {
    padding: 10px;
    color:white;
    background:none;
    height:50px;
    border:none;
    text-align:left;
    transition:250ms all;
    cursor:pointer;
    font-family:'Lato', sans-serif;
    &.hovered {
      color:${colors.yellow};
    }
  }
  &.active {
    opacity:1;
    pointer-events:initial;
    transition-delay: .3s;
    transition-duration:250ms;
  }
  @media (max-width: 768px) {
    display:none;
  }

`

function IconDock(){
  const dispatch = useDispatch();
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const panelState = useSelector(({ui}) => ui.panelState);
  const buttons = [
    {
      symbol: 'settings',
      id: 'settings-button',
      ariaLabel: 'Data & Variables',
      activeState: panelState.variables,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'variables' }),
    },
    {
      symbol: 'summary',
      id: 'summary-button',
      ariaLabel: 'Data Details',
      activeState: panelState.info,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'info' }),
    },
    {
      symbol: 'lineChart',
      id: 'lineChart-button',
      ariaLabel: 'Line Chart',
      activeState: panelState.lineChart,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'lineChart' }),
    },
    {
      symbol: 'scatterChart',
      id: 'scatterPlot-button',
      ariaLabel: 'Scatterplot Chart',
      activeState: panelState.scatterChart,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'scatterChart' }),
    },
    // {
    //   symbol:'addData',
    //   id: 'add-data-button',
    //   ariaLabel: 'Add Custom Data',
    //   activeState: panelState.dataLoader,
    //   onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'dataLoader' }),
    // },
    {
      symbol: 'report',
      id: 'report-button',
      ariaLabel: 'Report Builder',
      activeState: panelState.builder,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'reportBuilder' }),
    },
    // {
    //   symbol: 'sliders',
    //   id: 'user-preferences-button',
    //   ariaLabel: 'User Preferences',
    //   activeState: panelState.preferences,
    //   onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'preferences' }),
    // },
    {
      symbol: 'info',
      id: 'info-button',
      ariaLabel: 'Tutorial and Info',
      activeState: panelState.tutorial,
      onClick: () => dispatch({ type: 'TOGGLE_PANEL', payload: 'tutorial' }),
    },
  ];
  return (
    <DockContainerOuter>
      <DockContainer>
        {buttons.map(({ symbol, id, ariaLabel, onClick, activeState }) => (
          <button
            id={id}
            key={`${id}-icon-dock`}
            ariaLabel={ariaLabel}
            onClick={onClick}
            className={`${hoveredIcon === id && 'hovered '}${activeState && ' active'}`}
            onMouseEnter={() => setHoveredIcon(id)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <Icon symbol={symbol} />
            <span className="mobileText">{ariaLabel}</span>
          </button>
        ))}
      </DockContainer>
      <DockLabels className={hoveredIcon ? 'active' : ''}>
        {buttons.map(({ symbol, id, ariaLabel, onClick }) => (
            <button
              id={id}
              key={`${id}-icon-dock-label`}
              ariaLabel={ariaLabel}
              onClick={onClick}
              className={hoveredIcon === id ? 'hovered' : ''}
              onMouseEnter={() => setHoveredIcon(id)}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              {ariaLabel}
            </button>
          ))}
      </DockLabels>
    </DockContainerOuter>
  );
};

export default React.memo(IconDock)