// general imports, state
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FlyToInterpolator } from '@deck.gl/core';

import { useViewport, useSetViewport } from '../../contexts/Viewport';
import {
  ShareButton,
  MapAttribution
} from '../../components';
import colors from '../../config/colors';
import * as SVG from '../../config/svg';

const NavInlineButtonGroup = styled.div`
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: hidden;
  -moz-box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
`;

export const NavInlineButton = styled.button`
  width: 29px;
  height: 29px;
  padding: 5px;
  display: block;
  fill: rgb(60, 60, 60);
  background-color: ${(props) =>
    props.isActive ? colors.lightblue : colors.buttongray};
  outline: none;
  border: none;
  transition: 250ms all;
  cursor: pointer;
  :after {
    opacity: ${(props) => (props.shareNotification ? 1 : 0)};
    content: 'Map Link Copied to Clipboard!';
    background: ${colors.buttongray};
    -moz-box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
    -webkit-box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    position: absolute;
    transform: translate(-120%, -25%);
    padding: 5px;
    width: 150px;
    pointer-events: none;
    max-width: 50vw;
    transition: 250ms all;
  }
  svg {
    transition: 250ms all;
    transform: ${(props) => (props.tilted ? 'rotate(30deg)' : 'none')};
  }
`;

const MapButtonContainer = styled.div`
  position: absolute;
  left: 10px;
  bottom: 50px;
  z-index: 10;
  transition: 250ms all;
  @media (max-width: 768px) {
    bottom: 100px;
  }
  @media (max-width: 400px) {
    transform: scale(0.75) translate(20%, 20%);
  }
`;

const ShareURL = styled.input`
  position: fixed;
  left: 110%;
`;

function MapButtons({ boxSelect, setBoxSelect }) {
  // const selectionKeys = useSelector(({params}) => params.selectionKeys);
  const panelState = useSelector(({ui}) => ui.panelState);
  const viewport = useViewport();
  const setViewport = useSetViewport();

  const handleSelectionBoxStart = () => {
    setBoxSelect(true);
  };

  const handleGeolocate = async () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setViewport({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
        zoom: 7,
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
      });
    });
  };

  const handleZoom = (zoom) => {
    setViewport((viewState) => {
      return {
        ...viewState,
        zoom: viewState.zoom + zoom,
        transitionDuration: 250,
        transitionInterpolator: new FlyToInterpolator(),
      };
    });
  };

  const resetTilt = () => {
    setViewport((viewState) => {
      return {
        ...viewState,
        bearing: 0,
        pitch: 0,
        transitionDuration: 250,
        transitionInterpolator: new FlyToInterpolator(),
      };
    });
  };

  return (
    <MapButtonContainer infoPanel={panelState.info}>
      <NavInlineButtonGroup>
        <NavInlineButton
          title="Selection Box"
          id="boxSelect"
          isActive={boxSelect}
          onClick={() => handleSelectionBoxStart()}
        >
          {SVG.selectRect}
        </NavInlineButton>
      </NavInlineButtonGroup>
      <NavInlineButtonGroup>
        <NavInlineButton
          title="Geolocate"
          id="geolocate"
          onClick={() => handleGeolocate()}
        >
          {SVG.locate}
        </NavInlineButton>
      </NavInlineButtonGroup>

      <NavInlineButtonGroup>
        <NavInlineButton
          title="Zoom In"
          id="zoomIn"
          onClick={() => handleZoom(0.5)}
        >
          {SVG.plus}
        </NavInlineButton>
        <NavInlineButton
          title="Zoom Out"
          id="zoomOut"
          onClick={() => handleZoom(-0.5)}
        >
          {SVG.minus}
        </NavInlineButton>
        <NavInlineButton
          title="Reset Tilt"
          id="resetTilt"
          tilted={viewport.bearing !== 0 || viewport.pitch !== 0}
          onClick={() => resetTilt()}
        >
          {SVG.compass}
        </NavInlineButton>
      </NavInlineButtonGroup>
      <NavInlineButtonGroup>
        <ShareButton />
      </NavInlineButtonGroup>
      <NavInlineButtonGroup>
          <MapAttribution />
      </NavInlineButtonGroup>
      <ShareURL type="text" value="" id="share-url" readOnly />
    </MapButtonContainer>
  );
}

export default React.memo(MapButtons);