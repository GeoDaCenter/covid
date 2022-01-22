// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import { useSelector } from 'react-redux';
// import Grid from '@mui/material/Grid';

// import { MainLineChart, Legend } from '.';

// const PrintContainer = styled.div`
//     background:white;
//     h1, h2 {
//         display:inline-block;
//         margin-bottom:20px;
//     }
//     h2 {
//         font-weight:normal;
//         margin-left:20px;
//     }
// `
// const MapContainer = styled.div`
//     max-width:100vw;
//     position:relative;
//     overflow: hidden;
//     height: 0;
//     padding-top: 56.25%;
//     #bottomPanel {
//         position:absolute;
//         width:50%;
//         left:50%;
//         transform:translateX(-50%);
//         bottom:0px;
//         background:white;
//         box-shadow:none;
//         border:1px solid black;
//         h3, span div {
//             color:black;
//         }
//         div div.bin {
//             height:3px;
//         }
//     }
// `
// const ScreenshotImage = styled.img`
//     position:absolute;
//     left:0;
//     top:0;
//     max-width:100%;
// `

// const LineChartContainer = styled.div`
//     position:relative;
//     width:100%;
//     height:300px;
//     color:black;
//     #linearLogSwitch {
//         display:none;
//     }
// `

// const LogoImage = styled.img`
//     position:absolute;
//     left:0;
//     bottom:0;
//     width:20vw;
// `

export default function PrintLayout() {
  // const [printing, setPrinting] = useState(false)
  // console.log(printing)
  // useEffect(() => {
  //     window.addEventListener("beforeprint", () => setPrinting(true));
  //     window.addEventListener("afterprint", () => setPrinting(false));
  // }, [])

  // const mapScreenshotData = useSelector(state => state.mapScreenshotData);
  // const dataParams = useSelector(state => state.dataParams);
  // const mapParams = useSelector(state => state.mapParams);
  // const dates = useSelector(state => state.dates);

  // if (!printing) {
  return <div></div>;
  // } //else {

  // return (
  //     <PrintContainer id="printContainer">
  //         <Grid container spacing={1}>
  //             <Grid item xs={12}>
  //                 <h1>{dataParams.variableName}</h1>
  //                 {dataParams.rangeType !== 'custom' &&
  //                     <h2>{dataParams.nType !== 'characteristic' ? `${dates[dataParams.nIndex]}` : 'Characteristic Data'}</h2>
  //                 }
  //             </Grid>
  //             <Grid item xs={12} sm={6}>
  //                 <MapContainer>
  //                     <ScreenshotImage src={mapScreenshotData.deck}/>
  //                     <ScreenshotImage src={mapScreenshotData.mapbox} overlay/>
  //                     <Legend
  //                         variableName={dataParams.variableName}
  //                         colorScale={mapParams.colorScale}
  //                         bins={mapParams.bins}
  //                         fixedScale={dataParams.fixedScale}
  //                         resource={mapParams.resource}
  //                         note={dataParams.dataNote}
  //                     />
  //                 </MapContainer>
  //             </Grid>
  //             <Grid item xs={6}>
  //                 <h4>7-Day Average Cases</h4>
  //                 <h4>7-Day Average Deaths</h4>
  //                 <h4>7-Day Average Cases Per 100K</h4>
  //                 <h4>7-Day Average Deaths Per 100K</h4>
  //                 <h4>Cumulative Cases</h4>
  //                 <h4>Cumulative Deaths</h4>
  //                 <h4>Cumulative Cases Per 100K</h4>
  //                 <h4>Cumulative Deaths Per 100K</h4>
  //             </Grid>
  //             <Grid item xs={6}>
  //                 <LineChartContainer>
  //                     <MainLineChart printing={true} />
  //                 </LineChartContainer>
  //             </Grid>
  //         </Grid>
  //         <LogoImage src={`${process.env.PUBLIC_URL}/img/us-covid-atlas-cluster-logo.svg`} />
  //     </PrintContainer>
  // )
  // }
}
