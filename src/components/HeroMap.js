// general imports, state
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// deck GL and helper function import
import DeckGL from '@deck.gl/react';
import { PolygonLayer } from '@deck.gl/layers';
import { fitBounds } from '@math.gl/web-mercator';

import { getCSV } from '../utils';

const MapContainer = styled.div`
    width:600px;
    height:400px;
    position:relative;
    pointer-events:none;
    cursor:default;
    p.caption {
        position:absolute;
        bottom:0;
        right:0;
        color:white;
        text-align:right;
        font-size:0.8rem;
        span {
            font-weight:bold;
        }
    }
    @media (max-width:960px){
        display:none;
    }

`
// US bounds
const bounds = fitBounds({
    width: 600,
    height: 400,
    bounds: [[-130.14, 53.96],[-67.12, 19]]
})

const colorscale = [
    [255,255,204,200],
    [255,237,160,200],
    [254,217,118,200],
    [254,178,76,200],
    [253,141,60,200],
    [252,78,42,200],
    [227,26,28,200],
    [177,0,38,200],
]

const getColor = (val, bins, colors) => {
    for (let i = 0; i < bins.length; i++) {
        if (val < bins[i]) return colors[i]
    }
    return colors[7]
}

export default function HeroMap(){

    const [geoData, setGeoData] = useState([]);
    const [dateList, setDateList] = useState([]);
    const [dataBins, setDataBins] = useState([]);
    const [currDate, setCurrDate] = useState({
        current:'2020-01-30',
        previous:'2020-01-23'
    });
    const [intervalFn, setIntervalFn] = useState(null);


    // map view location
    const fixedViewstate = {
        latitude: bounds.latitude,
        longitude: bounds.longitude,
        zoom: bounds.zoom,
        bearing:45,
        pitch:45
    }

    useEffect(() => {
        const getGeoData = async () => {
            const data = await fetch(`${process.env.PUBLIC_URL}/geojson/county_usfacts.geojson`)
                .then(r => r.json())
                .then(r => {
                    let returnArray = [];

                    for ( let i = 0; i < r.features.length; i++ ) {
                        for ( let n = 0; n < r.features[i].geometry.coordinates.length; n++) {
                            returnArray.push({
                                geom: r.features[i].geometry.coordinates[n],
                                GEOID: r.features[i].properties.GEOID,
                                population: r.features[i].properties.population
                            })
                        }
                    }

                    return returnArray
                })
            return data
        }

        const formatData = async (data) => {
            let returnObj = {}

            for (let i = 0; i < data.length; i++) {
                returnObj[data[i].countyFIPS] = data[i]
            }

            return returnObj;
        }

        const getDates = async (data) => {

            const keys = Object.keys(data);

            for (let i = 0; i < keys.length; i++) {
                if (!Number.isNaN(Date.parse(keys[i]))) {
                    return(keys.slice(i,))
                }
            }
        }

        const getBins = async (data, dates, geoData) => {
            const finalDate = dates.slice(-1,)[0];
            const weekBefore = dates.slice(-7,)[0];
            let populations = {};
            const values = Object.values(data)

            for (let i=0; i<geoData.length; i++){
                populations[geoData[i].GEOID] = geoData[i].population;
            };

            const valArray = values.map(d => (((d[finalDate]-d[weekBefore])/7)/populations[d.countyFIPS])*100000);

            valArray.sort(function(a, b) {
                return a - b;
            });

            let quantileArray = []

            for (let i=0; i<8; i++){
                quantileArray.push(
                    valArray[
                        Math.round(
                            (valArray.length/100)*(12.5*i)
                        )
                    ]
                )
            }
            
            return quantileArray;
        };

        const joinData = async (geoData, data) => {
            for (let i=0; i<geoData.length; i++) {
                geoData[i]['data'] = data[geoData[i].GEOID]
            }
            return geoData
        }

        const handleInitialDataLoad = async () => {
            const data = await getCSV(`${process.env.PUBLIC_URL}/csv/covid_confirmed_usafacts.csv`);
            const dates = await getDates(data[0]);
            const geoData = await getGeoData();
            const formattedData = await formatData(data);
            const bins = await getBins(formattedData, dates, geoData);
            const joinedData = await joinData(geoData, formattedData);
            
            setDataBins(bins);
            setGeoData(joinedData);
            setDateList(dates);
        }

        handleInitialDataLoad()
    },[])

    useEffect(() => {
        clearInterval(intervalFn);
        setIntervalFn(setInterval(() => setCurrDate(prev => {
            if (dateList.indexOf(prev.current)+1 < dateList.length) {
                return {
                    current: dateList[(dateList.indexOf(prev.current)+1)],
                    previous: dateList[(dateList.indexOf(prev.current)-6)%dateList.length]
                }
            } else {
                return {
                    current: '2020-01-30',
                    previous: '2020-01-23'
                }
            }
        }
        ), 125));
    }, [dateList])

    const layer = new PolygonLayer({
        id: 'home choropleth',
        data: geoData,
        getFillColor: d => getColor((((d.data[currDate.current]-d.data[currDate.previous])/7)/d.population)*100000, dataBins, colorscale),
        getPolygon: d => d.geom,
        getElevation: d => (((((d.data[currDate.current]-d.data[currDate.previous])/7)/d.population)*100000)/dataBins[7])*25000,
        pickable: false,
        stroked: false,
        filled: true,
        wireframe: true,
        extruded: true,
        opacity: 0.8,
        material:false, 
        updateTriggers: {
            getFillColor: currDate,
            getElevation: currDate
        }  
    })

    return (
        <MapContainer>
            <DeckGL
                layers={layer}
                initialViewState={fixedViewstate}
                controller={false}
            />
            <p className="caption">
                <span>{currDate.current}</span>
                <br/> 
                7-Day Average of New Cases per Capita by County (Source: USA Facts) 
            </p>
        </MapContainer>
    )

}
