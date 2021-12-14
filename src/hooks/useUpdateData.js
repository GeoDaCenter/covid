// import { useSelector, useDispatch } from 'react-redux';
// import { useState, useEffect, useContext } from 'react';
// import {
//   getDataForBins,
//   findTableDetails,
//   getParseCSV,
//   getParsePbf,
//   getDateLists,
// } from '../utils';

// import {
//   storeLisaValues,
//   storeCartogramData,
//   setMapParams,
//   updateMap,
//   addTablesAndUpdate,
//   setIsLoading,
// } from '../actions';

// import { fixedScales, colorScales } from '../config/scales';
// import { useGeoda } from '../contexts/Geoda';

// const dateLists = getDateLists();
// const handleLoadData = (fileInfo) =>
//   fileInfo.file.slice(-4) === '.pbf'
//     ? getParsePbf(fileInfo, dateLists[fileInfo.dates])
//     : getParseCSV(fileInfo, dateLists[fileInfo.dates]);

// export default function useUpdateData() {
//   const dispatch = useDispatch();
//   const dataParams = useSelector((state) => state.dataParams);
//   const mapParams = useSelector((state) => state.mapParams);
//   const currentData = useSelector((state) => state.currentData);
//   const currentTable = useSelector((state) => state.currentTable);
//   const storedData = useSelector((state) => state.storedData);
//   const storedGeojson = useSelector((state) => state.storedGeojson);
//   const dataPresets = useSelector((state) => state.dataPresets);
//   const defaultTables = useSelector((state) => state.defaultTables);
//   const shouldUpdate = useSelector((state) => state.shouldUpdate);
//   const [isCalculating, setIsCalculating] = useState(false);
//   const [stingerTimeout, setStingerTimeout] = useState();
//   const [stinger, setStinger] = useState(false);
//   const {
//     geoda,
//     geodaReady
//   } = useGeoda();

//   const updateBins = async () => {
//     setIsCalculating(true);
//     if (
//       (storedData[currentTable.numerator] ||
//         dataParams.numerator === 'properties') &&
//       mapParams.mapType !== 'lisa'
//     ) {
//       if (dataParams.fixedScale && mapParams.mapType === 'natural_breaks') {
//         dispatch(
//           setMapParams({
//             bins: fixedScales[dataParams.fixedScale],
//             colorScale: colorScales[dataParams.fixedScale],
//           }),
//         );
//       } else {
//         let tempDataParams = { ...dataParams };

//         if (
//           mapParams.binMode !== 'dynamic' &&
//           dataParams.nType === 'time-series'
//         )
//           tempDataParams.nIndex =
//             storedData[currentTable.numerator]?.dates.slice(-1)[0];
//         if (
//           mapParams.binMode !== 'dynamic' &&
//           dataParams.dType === 'time-series'
//         )
//           tempDataParams.dIndex = tempDataParams.nIndex;

//         let binData = getDataForBins(
//           dataParams.numerator === 'properties'
//             ? storedGeojson[currentData].properties
//             : storedData[currentTable.numerator].data,
//           dataParams.denominator === 'properties'
//             ? storedGeojson[currentData].properties
//             : storedData[currentTable.denominator].data,
//           tempDataParams,
//         );

//         let nb =
//           mapParams.mapType === 'natural_breaks'
//             ? await geoda.naturalBreaks(mapParams.nBins, binData)
//             : await geoda.hinge15Breaks(binData);

//         dispatch(
//           setMapParams({
//             bins: {
//               bins:
//                 mapParams.mapType === 'natural_breaks'
//                   ? nb
//                   : [
//                       'Lower Outlier',
//                       '< 25%',
//                       '25-50%',
//                       '50-75%',
//                       '>75%',
//                       'Upper Outlier',
//                     ],
//               breaks: nb,
//             },
//             colorScale:
//               mapParams.mapType === 'natural_breaks'
//                 ? colorScales[dataParams.colorScale || mapParams.mapType]
//                 : colorScales[mapParams.mapType || dataParams.colorScale],
//           }),
//         );
//       }
//     }
//     setIsCalculating(false);
//   };

//   const updateLisa = async () => {
//     setIsCalculating(true);
//     const dataForLisa = getDataForBins(
//       dataParams.numerator === 'properties'
//         ? storedGeojson[currentData].properties
//         : storedData[currentTable.numerator].data,
//       dataParams.denominator === 'properties'
//         ? storedGeojson[currentData].properties
//         : storedData[currentTable.denominator].data,
//       dataParams,
//       Object.values(storedGeojson[currentData].indices.indexOrder),
//     );
//     const weights =
//       storedGeojson[currentData]?.weights?.Queen !== undefined
//         ? storedGeojson[currentData].weights.Queen
//         : await geoda.getQueenWeights(storedGeojson[currentData].mapId);

//     const lisaValues = await geoda.localMoran(weights, dataForLisa);
//     dispatch(storeLisaValues(lisaValues.clusters));
//     setIsCalculating(false);
//   };

//   const updateCartogram = async () => {
//     setIsCalculating(true);
//     const dataForCartogram = getDataForBins(
//       dataParams.numerator === 'properties'
//         ? storedGeojson[currentData].properties
//         : storedData[currentTable.numerator].data,
//       dataParams.denominator === 'properties'
//         ? storedGeojson[currentData].properties
//         : storedData[currentTable.denominator].data,
//       dataParams,
//       Object.values(storedGeojson[currentData].indices.indexOrder),
//     );
//     const cartogramData = await geoda.cartogram(
//       storedGeojson[currentData].mapId,
//       dataForCartogram,
//     );
//     let tempArray = new Array(cartogramData.length);
//     for (let i = 0; i < cartogramData.length; i++) {
//       cartogramData[i].value = dataForCartogram[i];
//       tempArray[i] = cartogramData[i];
//     }
//     dispatch(storeCartogramData(tempArray));
//     setIsCalculating(false);
//   };

//   const fetchMissingTables = async (
//     currentTable,
//     defaultTables,
//     dataPresets,
//     storedData,
//   ) => {
//     let inProcessLoadPromises = [];
//     let filesFetched = [];
//     if (
//       currentTable.numerator &&
//       !storedData.hasOwnProperty(currentTable.numerator) &&
//       currentTable.numerator !== 'properties'
//     ) {
//       filesFetched.push(currentTable.numerator);
//       inProcessLoadPromises.push(
//         handleLoadData(
//           findTableDetails(currentTable.numerator, defaultTables, dataPresets),
//         ),
//       );
//     }

//     if (
//       currentTable.numerator &&
//       !storedData.hasOwnProperty(currentTable.denominator) &&
//       currentTable.denominator !== 'properties'
//     ) {
//       filesFetched.push(currentTable.denominator);
//       inProcessLoadPromises.push(
//         handleLoadData(
//           findTableDetails(
//             currentTable.denominator,
//             defaultTables,
//             dataPresets,
//           ),
//         ),
//       );
//     }
//     if (inProcessLoadPromises.length) dispatch(setIsLoading());

//     const fetchedData = await Promise.all(inProcessLoadPromises);
//     let dataObj = {};
//     for (let i = 0; i < fetchedData.length; i++) {
//       dataObj[filesFetched[i]] = fetchedData[i];
//     }
//     dispatch(addTablesAndUpdate(dataObj));
//   };

//   // This listens for geoda events for LISA and Cartogram calculations
//   // Both of these are computationally heavy.
//   useEffect(() => {
//     if (!isCalculating) {
//       if (
//         mapParams.mapType === 'lisa' &&
//         (storedData[currentTable.numerator] !== undefined ||
//           currentTable.numerator === 'properties') &&
//         storedGeojson[currentData] !== undefined
//       )
//         updateLisa();
//       if (
//         mapParams.vizType === 'cartogram' &&
//         storedData[currentTable.numerator] !== undefined &&
//         storedGeojson[currentData] !== undefined
//       ) {
//         updateCartogram();
//       }
//       if (mapParams.vizType === 'cartogram') {
//         clearTimeout(stingerTimeout);
//         setStingerTimeout(
//           setTimeout(() => {
//             setStinger(true);
//           }, 1250),
//         );
//       }
//     }
//   }, [
//     currentData,
//     currentTable.numerator,
//     dataParams.numerator,
//     dataParams.nProperty,
//     dataParams.nRange,
//     dataParams.denominator,
//     dataParams.dProperty,
//     dataParams.nIndex,
//     dataParams.dIndex,
//     mapParams.binMode,
//     dataParams.variableName,
//     mapParams.mapType,
//     mapParams.vizType,
//   ]);

//   useEffect(() => {
//     if (stinger) {
//       setStinger(false);
//       clearTimeout(stingerTimeout);
//       updateCartogram();
//     }
//   }, [stinger]);

//   useEffect(() => {
//     if (geoda !== undefined) {
//       fetchMissingTables(currentTable, defaultTables, dataPresets, storedData);
//     }
//   }, [
//     currentTable.numerator,
//     currentTable.denominator,
//     dataPresets,
//     defaultTables,
//     geoda,
//   ]);

//   const binReady = () =>
//     storedGeojson[currentData] &&
//     (storedData[currentTable.numerator] ||
//       currentTable.numerator === 'properties') &&
//     mapParams.mapType !== 'lisa';
//   // Trigger on index change while dynamic bin mode
//   useEffect(() => {
//     if (!isCalculating && binReady() && mapParams.binMode === 'dynamic')
//       updateBins();
//   }, [dataParams.nIndex, mapParams.binMode]);

//   // Trigger on parameter change for metric values
//   // Gets bins and sets map parameters
//   useEffect(() => {
//     if (binReady() && !isCalculating) updateBins();
//   }, [
//     dataParams.numerator,
//     dataParams.nProperty,
//     dataParams.nRange,
//     dataParams.denominator,
//     dataParams.dProperty,
//     dataParams.dRange,
//     mapParams.mapType,
//     currentData,
//   ]);

//   useEffect(() => {
//     if (binReady() && !isCalculating && shouldUpdate) {
//       updateBins();
//     }
//   }, [shouldUpdate]);

//   // useEffect(() => {
//   //   if (storedGeojson[currentData] && mapParams.mapType !== 'lisa' ) dispatch(updateMap());
//   // }, [mapParams.bins.breaks])

//   return [updateBins, updateLisa, updateCartogram];
// }
