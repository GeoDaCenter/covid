import React, { useState } from "react";
import styled from "styled-components";
import colors from "../../config/colors";

const MapAttributionContainer = styled.div``;
const MapAttributionText = styled.span`
  position: absolute;
  width: auto;
  right: 3em;
  bottom: 1.25em;
  text-align: right;
  background: white;
  white-space: nowrap;
  display: inline-block;
  padding: 0.125em 0.25em;
  border-radius: 0.25em;
  display: ${(props) => (props.expanded ? "block" : "none")};
  a {
    margin-right: 0.5em;
    color: blue;
  }
`;
const MapAttributionButton = styled.button`
  width: 29px;
  height: 29px;
  padding: 5px;
  display: block;
  outline: none;
  border: none;
  transition: 250ms all;
  cursor: pointer;
  background: ${colors.buttongray};
  border-radius: 50%;
  box-shadow: none;
  -moz-box-shadow: none;
  -webkit-box-shadow: none;
  font-weight: bold;
`;

export default function MapAttribution() {
  const [isExpanded, setIsExpanded] = useState(false);

  const listener = (e) => {
    if (
      e.target.id !== "map-attribution-button" &&
      e.target.id !== "map-attribution-list"
    ) {
      setIsExpanded(false);
      window.removeEventListener("click", listener);
    }
  };

  const handleCloseListener = () => window.addEventListener("click", listener);

  return (
    <MapAttributionContainer>
      <MapAttributionText
        expanded={isExpanded}
        className="mapboxgl-ctrl-attrib-inner"
        role="list"
        id="map-attribution-list"
      >
        <a
          href="https://www.mapbox.com/about/maps/"
          target="_blank"
          title="Mapbox"
          aria-label="Mapbox"
          role="listitem"
          rel="noreferrer" 
        >
          © Mapbox
        </a>
        <a
          href="https://www.openstreetmap.org/about/"
          target="_blank"
          title="OpenStreetMap"
          aria-label="OpenStreetMap"
          role="listitem"
          rel="noreferrer" 
        >
          © OpenStreetMap
        </a>
        <a
          className="mapbox-improve-map"
          href="https://apps.mapbox.com/feedback/?owner=lixun910&amp;id=ckhxm4ot50yk919pj8witkk2d&amp;access_token=pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg"
          target="_blank"
          title="Map feedback"
          aria-label="Map feedback"
          role="listitem"
          rel="noreferrer" 
        >
          Improve this map
        </a>
      </MapAttributionText>
      <MapAttributionButton
        id="map-attribution-button"
        onClick={() => {
          setIsExpanded((prev) => !prev);
          handleCloseListener();
        }}
      >
        i
      </MapAttributionButton>
    </MapAttributionContainer>
  );
}
