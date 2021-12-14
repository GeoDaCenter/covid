import { mapFnNb, mapFnTesting, mapFnHinge, dataFn, getVarId, findIn } from '../utils';

const getSimpleColor = (
  value,
  bins,
  colorScale,
  mapType,
  numerator,
  storedLisaData,
  storedGeojson,
  currentData,
  GEOID,
  mapFn,
) => mapFn(value, bins, colorScale, mapType, numerator);
const getLisaColor = (
  value,
  bins,
  colorScale,
  mapType,
  numerator,
  storedLisaData,
  storedGeojson,
  currentData,
  GEOID,
) =>
  colorScale[
    storedLisaData[storedGeojson[currentData].indices['geoidOrder'][GEOID]]
  ] || [240, 240, 240];
const getColorFunction = (mapType) =>
  mapType === 'lisa' ? getLisaColor : getSimpleColor;
const getMapFunction = (mapType, table) =>
  mapType.includes('hinge')
    ? mapFnHinge
    : table.includes('testing')
    ? mapFnTesting
    : mapFnNb;
const getStandardHeight = (val, dataParams) =>
  val *
  (dataParams.scale3D /
    (dataParams.nType === 'time-series' && dataParams.nRange === null
      ? dataParams.nIndex / 7
      : 1));
const getPctHeight = (val, dataParams) =>
  getStandardHeight(val > 100 ? 100 : val, dataParams);
const maxDesirableHeight = 500_000;

// export const generateMapData = (state) => {
//   if (
//     !state.mapParams.bins.hasOwnProperty('bins') ||
//     (state.mapParams.mapType !== 'lisa' && !state.mapParams.bins.breaks)
//   ) {
//     return state;
//   }

//   let returnObj = {};
//   const idCol = state.dataPresets[state.currentData].id;

//   const getTable = (i, predicate) => {
//     if (state.dataParams[predicate] === 'properties') {
//       return state.storedGeojson[state.currentData].data.features[i].properties;
//     } else {
//       try {
//         return state.storedData[
//           state.dataPresets[state.currentData].tables[
//             state.dataParams[predicate]
//           ].file
//         ].data[
//           state.storedGeojson[state.currentData].data.features[i].properties[
//             idCol
//           ]
//         ];
//       } catch {
//         return state.storedData[
//           state.defaultTables[state.dataPresets[state.currentData].geography][
//             state.dataParams[predicate]
//           ].file
//         ].data[
//           state.storedGeojson[state.currentData].data.features[i].properties[
//             idCol
//           ]
//         ];
//       }
//     }
//   };

//   const getColor = getColorFunction(state.mapParams.mapType);
//   const mapFn = getMapFunction(
//     state.mapParams.mapType,
//     state.dataParams.numerator,
//   );
//   const getHeight = state.dataParams.variableName
//     .toLowerCase()
//     .includes('percent')
//     ? getPctHeight
//     : getStandardHeight;

//   let maxHeightVal = 0;

//   if (state.mapParams.vizType === 'cartogram') {
//     for (let i = 0; i < state.storedCartogramData.length; i++) {
//       const currGeoid =
//         state.storedGeojson[state.currentData].indices.indexOrder[
//           state.storedCartogramData[i].properties.id
//         ];

//       const color = getColor(
//         state.storedCartogramData[i].value,
//         state.mapParams.bins.breaks,
//         state.mapParams.colorScale,
//         state.mapParams.mapType,
//         state.dataParams.numerator,
//         state.storedLisaData,
//         state.storedGeojson,
//         state.currentData,
//         currGeoid,
//         mapFn,
//       );
//       if (color === null) {
//         returnObj[currGeoid] = { color: [0, 0, 0, 0] };
//         continue;
//       }

//       returnObj[currGeoid] = {
//         ...state.storedCartogramData[i],
//         color,
//       };
//     }
//     return {
//       params: getVarId(state.currentData, state.dataParams, state.mapParams),
//       data: returnObj,
//     };
//   }
//   for (
//     let i = 0;
//     i < state.storedGeojson[state.currentData].data.features.length;
//     i++
//   ) {
//     const currGeoid =
//       state.storedGeojson[state.currentData].data.features[i].properties[idCol];
//     const tempVal = dataFn(
//       getTable(i, 'numerator'),
//       getTable(i, 'denominator'),
//       state.dataParams,
//     );

//     const color = getColor(
//       tempVal,
//       state.mapParams.bins.breaks,
//       state.mapParams.colorScale,
//       state.mapParams.mapType,
//       state.dataParams.numerator,
//       state.storedLisaData,
//       state.storedGeojson,
//       state.currentData,
//       currGeoid,
//       mapFn,
//     );

//     const tempHeight = getHeight(tempVal, state.dataParams);
//     const height = tempHeight < 0 ? 0 : tempHeight;
//     if (height > maxHeightVal) maxHeightVal = height;
//     returnObj[currGeoid] =
//       color === null ? { color: [0, 0, 0, 0], height: 0 } : { color, height };
//   }
//   return {
//     params: getVarId(state.currentData, state.dataParams, state.mapParams),
//     data: returnObj,
//     heightScale: state.mapParams.bins.breaks
//       ? maxDesirableHeight /
//         getHeight(
//           state.mapParams.mapType.includes('hinge')
//             ? state.mapParams.bins.breaks.slice(-1)[0] * 2
//             : state.mapParams.bins.breaks.slice(-1)[0],
//           state.dataParams,
//         )
//       : maxDesirableHeight / maxHeightVal,
//   };
// };
