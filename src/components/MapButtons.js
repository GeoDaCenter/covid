// general imports, state
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {FlyToInterpolator} from '@deck.gl/core';

import { useViewport, useSetViewport } from '../contexts/ViewportContext';
import ShareButton from '../components/ShareButton';
import { colors } from '../config';
import * as SVG from '../config/svg'; 

const NavInlineButtonGroup = styled.div`
    margin-bottom:10px;
    border-radius:4px;
    overflow:hidden;
    -moz-box-shadow: 0 0 2px rgba(0,0,0,.1);
    -webkit-box-shadow: 0 0 2px rgba(0,0,0,.1);
    box-shadow: 0 0 0 2px rgba(0,0,0,.1);
`

export const NavInlineButton = styled.button`
    width:29px;
    height:29px;
    padding:5px;
    display:block;
    fill:rgb(60,60,60);
    background-color: ${props => props.isActive ? colors.lightblue : colors.buttongray};
    border:none;
    transition:250ms all;
    cursor:pointer;
    :after {
        opacity: ${props => props.shareNotification ? 1 : 0};
        content:'Map Link Copied to Clipboard!';
        background:${colors.buttongray};
        -moz-box-shadow: 0 0 2px rgba(0,0,0,.1);
        -webkit-box-shadow: 0 0 2px rgba(0,0,0,.1);
        box-shadow: 0 0 0 2px rgba(0,0,0,.1);
        border-radius: 4px;
        position: absolute;
        transform:translate(-120%, -25%);
        padding:5px;
        width:150px;
        pointer-events:none;
        max-width:50vw;
        transition:250ms all;
    }
    svg {
        transition:250ms all;
        transform:${props => props.tilted ? 'rotate(30deg)' : 'none' };
    }
`



const MapButtonContainer = styled.div`
    position: absolute;
    right: ${props => props.infoPanel ? 276 : 10}px;
    bottom: 0px;
    z-index: 10;
    transition: 250ms all;
    @media (max-width:1024px) {
        right: ${props => props.infoPanel ? 'calc(50% + 1em)' : '10px'};
        bottom: ${props => props.infoPanel ? '6em' : 0};
    }
    @media (max-width:768px){
        bottom:6em;
        right:10px;
    }
    @media (max-width: 400px) {
        transform:scale(0.75) translate(20%, 20%);
    }
`


const ShareURL = styled.input`
    position:fixed;
    left:150%;
`

const MapAttributionContainer = styled.div`
`

const MapAttributionText = styled.span`
    position:absolute;
    width:auto;
    right:3em;
    bottom:1.25em;
    text-align:right;
    background:white;
    white-space:nowrap;
    display:inline-block;
    padding:.125em .25em;
    border-radius:.25em;
    display:${props => props.expanded ? 'block' : 'none'};
    a {
        margin-right:0.5em;
        color:blue;
    }
    `

const MapAttributionButton = styled(NavInlineButton)`
    background:${colors.buttongray};
    border-radius:50%;
    box-shadow:none;
    -moz-box-shadow:none;
    -webkit-box-shadow:none;
    font-weight:bold;
    
`

const MapAttribution = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const listener = (e) => {
        if (e.target.id !== 'map-attribution-button' && e.target.id !== 'map-attribution-list') {
            setIsExpanded(false);
            window.removeEventListener('click', listener);
        }
    }
    
    const handleCloseListener = () => window.addEventListener('click', listener);

    return <MapAttributionContainer>
        <MapAttributionText 
            expanded={isExpanded} 
            className="mapboxgl-ctrl-attrib-inner" 
            role="list"
            id="map-attribution-list"
            >
                <a href="https://www.mapbox.com/about/maps/" target="_blank" title="Mapbox" aria-label="Mapbox" role="listitem">© Mapbox</a> 
                <a href="https://www.openstreetmap.org/about/" target="_blank" title="OpenStreetMap" aria-label="OpenStreetMap" role="listitem">© OpenStreetMap</a> 
                <a className="mapbox-improve-map" href="https://apps.mapbox.com/feedback/?owner=lixun910&amp;id=ckhxm4ot50yk919pj8witkk2d&amp;access_token=pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg" target="_blank" title="Map feedback" aria-label="Map feedback" role="listitem" rel="noopener nofollow">Improve this map</a>
        </MapAttributionText>
        <MapAttributionButton
            id="map-attribution-button"
            onClick={() => {setIsExpanded(prev => !prev);handleCloseListener();}}
            >
            i
        </MapAttributionButton>
    </MapAttributionContainer>
}



export default function MapButtons({
    boxSelect,
    setBoxSelect
}){
    const selectionKeys = useSelector(state => state.selectionKeys);
    const panelState = useSelector(state => state.panelState);
    const viewport = useViewport();
    const setViewport = useSetViewport();

    const handleSelectionBoxStart = () => {
        setBoxSelect(true)
    }
    
    const handleGeolocate = async () => {
        navigator.geolocation.getCurrentPosition( position => {
            setViewport({
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude,
                    zoom:7,
                    transitionDuration: 1000,
                    transitionInterpolator: new FlyToInterpolator()
                })
        }) 
    }

    const handleZoom = (zoom) => {
        setViewport((viewState) => {
            return {
                ...viewState,
                zoom: viewState.zoom + zoom,
                transitionDuration: 250,
                transitionInterpolator: new FlyToInterpolator()
            }})
    }
    
    const resetTilt = () => {
        setViewport((viewState) => {
            return {
                ...viewState,
                bearing:0,
                pitch:0,
                transitionDuration: 250,
                transitionInterpolator: new FlyToInterpolator()
            }})
    }

    return <MapButtonContainer infoPanel={panelState.info && selectionKeys.length}>
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
            <ShareURL type="text" value="" id="share-url" />
        </MapButtonContainer>
}