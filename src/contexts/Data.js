// import React, { useReducer, useContext } from "react";
// const DataContext = React.createContext();

// const initialState = {
//   storedData: {},
//   storedGeojson: {},
//   dotDensityData: {},
//   resourceLayerData: {
//     clinics: [],
//     hospitals: [],
//     vaccineSites: [],
//   },
// };

// const orderInts = (a, b) => a - b;
// const onlyUnique = (value, index, self) => self.indexOf(value) === index;

// function reducer(state, action) {
//   switch (action.type) {
//     case "LOAD_DOT_DENSITY_DATA":
//       return {
//         ...state,
//         dotDensityData: action.payload,
//       };

//     case "RECONCILE_TABLE": {
//       // expected shape: // type: 'RECILE_TABLES', payload: { data: { dataset1: {data,dates,columns}}}
//       let storedData = {
//         ...state.storedData,
//       };
//       const { name, newData, timespan, error } = action.payload;
//       const dataError = (newData?.dates && !newData.dates.length) ||
//       (newData &&
//         newData.columns &&
//         storedData[name] &&
//         storedData[name].columns &&
//         newData.columns.join("") === storedData[name].columns.join(""))

//       // If the data doesn't exist, easy. Just plug in the full dataset
//       // and move on to the next
//       if (!storedData.hasOwnProperty(name)) {
//         storedData[name] = {
//           ...newData,
//           loaded: [timespan],
//         };
//       } else if (error || dataError) {
//         storedData[name].loaded.push(timespan);
//       } else {
//         const newDates = newData?.dates || [];
//         // Otherwise, we need to reconcile based on keys present in the 'dates'
//         // property, using the big query data as the most up-to-date vs the
//         // static fetched data, which may have been cached client-side
//         const datasetKeys = storedData[name].data ? Object.keys(storedData[name].data) : []
//         // Loop through row (features) and date, using big query values as insertions
//         // and static as base, to reduce loop iterations
//         for (let x = 0; x < datasetKeys.length; x++) {
//           let tempValues = storedData[name].data[datasetKeys[x]];
//           for (let n = 0; n < newDates.length; n++) {
//             tempValues[newDates[n]] = newData.data[datasetKeys[x]][newDates[n]];
//           }
//           storedData[name].data[datasetKeys[x]] = tempValues;
//         }

//         // Reconcile and sort date indices
//         storedData[name].loaded.push(timespan);

//         if (storedData[name]?.dates?.length) {
//           storedData[name].dates = [
//             ...storedData[name].dates,
//             ...(newData?.dates || []),
//           ]
//             .filter(onlyUnique)
//             .sort(orderInts);
//         }
//       }

//       return {
//         ...state,
//         storedData,
//       };
//     }
//     case "RECONCILE_TABLES": {
//       // expected shape: // type: 'RECILE_TABLES', payload: { data: { dataset1: {data,dates,columns}}}
//       let storedData = {
//         ...state.storedData,
//       };
//       const datasets = Object.keys(action.payload.data);
//       for (let i = 0; i < datasets.length; i++) {
//         // null or undefined key name sometimes in place for incomplete data
//         // So, this check makes sure the key and data are not falsy
//         if (!datasets[i] || !action.payload.data[datasets[i]]) {
//           continue;
//         }

//         // If the data doesn't exist, easy. Just plug in the full dataset
//         // and move on to the next
//         if (!storedData.hasOwnProperty(datasets[i])) {
//           storedData[datasets[i]] = action.payload.data[datasets[i]];
//           // if (datasets[i].includes('covid_deaths_usafacts')) console.log(datasets[i], action.payload.data[datasets[i]])
//           continue;
//         }

//         // Otherwise, we need to reconcile based on keys present in the 'dates'
//         // property, using the big query data as the most up-to-date vs the
//         // static fetched data, which may have been cached client-side
//         let currentStaticData = action.payload.data[datasets[i]];
//         const datasetKeys = storedData[datasets[i]].data ? Object.keys(storedData[datasets[i]].data) : [];
//         const gbqIndices = storedData[datasets[i]].dates;

//         // Loop through row (features) and date, using big query values as insertions
//         // and static as base, to reduce loop iterations
//         for (let x = 0; x < datasetKeys.length; x++) {
//           let tempValues = currentStaticData.data[datasetKeys[x]];
//           for (let n = 0; n < gbqIndices.length; n++) {
//             tempValues[gbqIndices[n]] =
//               storedData[datasets[i]].data[datasetKeys[x]][gbqIndices[n]];
//           }
//           storedData[datasets[i]].data[datasetKeys[x]] = tempValues;
//         }

//         // Reconcile and sort date indices
//         let reconciledDates = currentStaticData.dates;
//         for (let n = 0; n < storedData[datasets[i]].dates; n++) {
//           if (reconciledDates.indexOf(storedData[datasets[i]].dates[n]) === -1)
//             reconciledDates.push(storedData[datasets[i]].dates[n]);
//         }
//         storedData[datasets[i]].dates = reconciledDates.sort((a, b) => a - b);
//       }
//       return {
//         ...state,
//         storedData,
//       };
//     }
//     case "ADD_WEIGHTS": {
//       // id, weights
//       return {
//         ...state,
//         storedGeojson: {
//           ...state.storedGeojson,
//           [action.payload.id]: {
//             ...state.storedGeojson[action.payload.id],
//             weights: {
//               ...state.storedGeojson[action.payload.id].weights,
//               ...action.payload.weights,
//             },
//           },
//         },
//       };
//     }
//     case "LOAD_GEOJSON":
//       // data
//       return {
//         ...state,
//         storedGeojson: {
//           ...state.storedGeojson,
//           ...action.payload,
//         },
//       };
//     case "LOAD_RESOURCE":
//       return {
//         ...state,
//         resourceLayerData: {
//           ...state.resourceLayerData,
//           [action.payload.id]: action.payload.data,
//         },
//       };
//     default:
//       throw new Error();
//   }
// }

// export const DataProvider = ({ children }) => {
//   const [dataState, dataDispatch] = useReducer(reducer, initialState);

//   return (
//     <DataContext.Provider value={[dataState, dataDispatch]}>
//       {children}
//     </DataContext.Provider>
//   );
// };

// /** Update the viewport from anywhere */
// export const useDataStore = () => {
//   const ctx = useContext(DataContext);
//   if (!ctx) throw Error("Not wrapped in <DataProvider />.");
//   return ctx;
// };
