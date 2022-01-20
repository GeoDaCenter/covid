import { INITIAL_STATE } from "../constants/defaults";
import {
  getDataForCharts,
  // generateMapData,
  // generateReport,
  // shallowEqual,
  parseTooltipData,
  getIdOrder,
  indexGeoProps,
  resolveName,
  findIn,
  findDefault,
  findTableOrDefault,
  findClosestValue,
  findNextIndex
} from "../utils";

import dataDateRanges from "../config/dataDateRanges";
import { fixedScales, colorScales } from "../config/scales";
const findDefaultOrCurrent = (
  tables,
  datasets,
  variableParams,
  datasetName
) => {
  const relevantTables = tables.filter(f => f.id === variableParams.numerator);
  const availableGeographies = relevantTables.map(f => f.geography)
  const availableDatasets = datasets.filter(f => datasetName === f.name && availableGeographies.includes(f.geography))
  
  if (availableDatasets.length) {
    return availableDatasets[0].file
  }
  const anyDataset = datasets.filter(f => availableGeographies.includes(f.geography))
  return anyDataset[0].file
};

var reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "INITIAL_LOAD": {
      const dataParams = {
        ...state.dataParams,
        ...action.payload.data.variableParams,
      };
      const mapParams = {
        ...state.mapParams,
        ...action.payload.data.mapParams,
      };
      const storedData = {
        ...state.storedData,
        ...action.payload.data.storedData,
      };

      const storedGeojson = {
        ...state.storedGeojson,
        ...action.payload.data.storedGeojson,
      };

      return {
        ...state,
        currentData: action.payload.data.currentData,
        storedGeojson,
        storedData,
        dataParams,
        mapParams,
        currentTable: action.payload.data.currentTable,
        dates: action.payload.data.dates,
        storedLisaData: action.payload.data.storedLisaData || {},
        storedCartogramData: action.payload.data.storedCartogramData || {},
      };
    }
    // This action takes partially loaded tables from big query already in the state
    // and reconciles those with the full time-series fetched from static files
    // case "RECONCILE_TABLES": {
    //   let storedData = {
    //     ...state.storedData,
    //   };
    //   const datasets = Object.keys(action.payload.data);
    //   for (let i = 0; i < datasets.length; i++) {
    //     // null or undefined key name sometimes in place for incomplete data
    //     // So, this check makes sure the key and data are not falsy
    //     if (!datasets[i] || !action.payload.data[datasets[i]]) {
    //       continue;
    //     }

    //     // If the data doesn't exist, easy. Just plug in the full dataset
    //     // and move on to the next
    //     if (!storedData.hasOwnProperty(datasets[i])) {
    //       storedData[datasets[i]] = action.payload.data[datasets[i]];
    //       // if (datasets[i].includes('covid_deaths_usafacts')) console.log(datasets[i], action.payload.data[datasets[i]])
    //       continue;
    //     }

    //     // Otherwise, we need to reconcile based on keys present in the 'dates'
    //     // property, using the big query data as the most up-to-date vs the
    //     // static fetched data, which may have been cached client-side
    //     let currentStaticData = action.payload.data[datasets[i]];
    //     const datasetKeys = Object.keys(storedData[datasets[i]].data);
    //     const gbqIndices = storedData[datasets[i]].dates;

    //     // Loop through row (features) and date, using big query values as insertions
    //     // and static as base, to reduce loop iterations
    //     for (let x = 0; x < datasetKeys.length; x++) {
    //       let tempValues = currentStaticData.data[datasetKeys[x]];
    //       for (let n = 0; n < gbqIndices.length; n++) {
    //         tempValues[gbqIndices[n]] =
    //           storedData[datasets[i]].data[datasetKeys[x]][gbqIndices[n]];
    //       }
    //       storedData[datasets[i]].data[datasetKeys[x]] = tempValues;
    //     }

    //     // Reconcile and sort date indices
    //     let reconciledDates = currentStaticData.dates;
    //     for (let n = 0; n < storedData[datasets[i]].dates; n++) {
    //       if (reconciledDates.indexOf(storedData[datasets[i]].dates[n]) === -1)
    //         reconciledDates.push(storedData[datasets[i]].dates[n]);
    //     }
    //     storedData[datasets[i]].dates = reconciledDates.sort((a, b) => a - b);
    //   }

    //   return {
    //     ...state,
    //     storedData,
    //   };
    // }
    // case "ADD_TABLES": {
    //   const storedData = {
    //     ...state.storedData,
    //     ...action.payload.data,
    //   };

    //   return {
    //     ...state,
    //     storedData,
    //   };
    // }
    // case "ADD_TABLES_AND_UPDATE": {
    //   const storedData = {
    //     ...state.storedData,
    //     ...action.payload.data,
    //   };

    //   return {
    //     ...state,
    //     storedData,
    //     shouldUpdate: true,
    //   };
    // }
    // case "ADD_GEOJSON": {
    //   const storedGeojson = {
    //     ...state.storedGeojson,
    //     ...action.payload.data,
    //   };

    //   return {
    //     ...state,
    //     storedGeojson,
    //   };
    // }
    // // case 'UPDATE_MAP': {
    // //   return {
    // //     ...state,
    // //     mapData: generateMapData(state),
    // //     shouldUpdate: false,
    // //     isLoading: false,
    // //   };
    // // }
    // case "DATA_LOAD": {
    //   // main new data loading reducer
    //   // I: Destructure payload (load) object
    //   let {
    //     storeData,
    //     currentData,
    //     columnNames,
    //     dateIndices,
    //     storeGeojson,
    //     chartData,
    //     mapParams,
    //     variableParams,
    //   } = action.payload.load;

    //   // II: Create copies of existing state objects.
    //   // This is necessary to avoid mutating the state
    //   let [
    //     dataObj,
    //     colDataObj,
    //     dateIndexObj,
    //     geoDataObj,
    //     mapParamsDataObj,
    //     variableParamsDataObj,
    //     panelsDataObj,
    //   ] = [
    //     {
    //       ...state.storedData,
    //     },
    //     {
    //       ...state.cols,
    //     },
    //     {
    //       ...state.dateIndices,
    //     },
    //     {
    //       ...state.storedGeojson,
    //     },
    //     {
    //       ...state.mapParams,
    //       ...mapParams,
    //     },
    //     {
    //       ...state.dataParams,
    //       ...variableParams,
    //     },
    //     {
    //       ...state.panelState,
    //       info: false,
    //     },
    //   ];

    //   dataObj[storeData.name] = storeData.data;
    //   colDataObj[columnNames.name] = columnNames.data;
    //   dateIndexObj[dateIndices.name] = dateIndices.data;
    //   geoDataObj[storeGeojson.name] = storeGeojson.data;
    //   return {
    //     ...state,
    //     storedData: dataObj,
    //     cols: colDataObj,
    //     dateIndices: dateIndexObj,
    //     storedGeojson: geoDataObj,
    //     mapParams: mapParamsDataObj,
    //     dataParams: variableParamsDataObj,
    //     currentData,
    //     selectionKeys: [],
    //     selectionIndex: [],
    //     chartData,
    //     sidebarData: {},
    //     panelState: panelsDataObj,
    //   };
    // }
    // case "UPDATE_CHART": {
    //   const currDataset = findIn(state.datasets, "file", state.currentData);
    //   const currCaseData = currDataset.tables[state.chartParams.table]
    //     ? findIn(
    //         state.tables,
    //         "id",
    //         currDataset.tables[state.chartParams.table]
    //       ).name
    //     : findDefault(
    //         state.tables,
    //         state.chartParams.table,
    //         currDataset.geography
    //       ).name;

    //   let populationData = [];

    //   if (state.chartParams.populationNormalized) {
    //     populationData.push(0);
    //     for (
    //       let i = 0;
    //       i < state.storedGeojson[state.currentData].data.features.length;
    //       i++
    //     ) {
    //       populationData[0] +=
    //         state.storedGeojson[state.currentData].data.features[
    //           i
    //         ].properties.population;
    //     }
    //   }
    //   const additionalParams = {
    //     populationData,
    //   };
    //   return {
    //     ...state,
    //     chartData: getDataForCharts(
    //       state.storedData[currCaseData],
    //       state.dates,
    //       additionalParams
    //     ),
    //   };
    // }
    // case "ADD_TABLE_AND_CHART": {
    //   let populationData = [];

    //   if (state.chartParams.populationNormalized) {
    //     populationData.push(0);
    //     for (
    //       let i = 0;
    //       i < state.storedGeojson[state.currentData].data.features.length;
    //       i++
    //     ) {
    //       populationData[0] +=
    //         state.storedGeojson[state.currentData].data.features[
    //           i
    //         ].properties.population;
    //     }
    //   }
    //   const additionalParams = {
    //     populationData,
    //   };

    //   const storedData = {
    //     ...state.storedData,
    //     ...action.payload.data,
    //   };

    //   return {
    //     ...state,
    //     chartData: getDataForCharts(
    //       Object.values(action.payload.data)[0],
    //       state.dates,
    //       additionalParams
    //     ),
    //     storedData,
    //   };
    // }
    // case "SET_CHART_PARAMS": {
    //   const chartParams = {
    //     ...state.chartParams,
    //     ...action.payload.params,
    //   };

    //   const currDataset = findIn(state.datasets, "file", state.currentData);
    //   const currCaseData = currDataset.tables[state.chartParams.table]
    //     ? findIn(
    //         state.tables,
    //         "id",
    //         currDataset.tables[state.chartParams.table]
    //       )
    //     : findDefault(
    //         state.tables,
    //         state.chartParams.table,
    //         currDataset.geography
    //       );
    //   const properties = state.storedGeojson[state.currentData].properties;

    //   let populationData = [];
    //   if (chartParams.populationNormalized) {
    //     if (state.selectionKeys.length) {
    //       populationData = state.selectionKeys.map(
    //         (key) => properties[key].population
    //       );
    //     } else {
    //       populationData.push(0);
    //       for (
    //         let i = 0;
    //         i < state.storedGeojson[state.currentData].data.features.length;
    //         i++
    //       ) {
    //         populationData[0] +=
    //           state.storedGeojson[state.currentData].data.features[
    //             i
    //           ].properties.population;
    //       }
    //     }
    //   }
    //   const additionalParams = {
    //     populationData,
    //     geoid: state.selectionKeys,
    //     name: state.selectionNames,
    //   };

    //   const chartData = getDataForCharts(
    //     state.storedData[currCaseData],
    //     state.dates,
    //     additionalParams
    //   );

    //   return {
    //     ...state,
    //     chartParams,
    //     chartData,
    //   };
    // }
    // case "DATA_LOAD_EXISTING":
    //   let [variableParamsExDataObj, panelsExDataObj] = [
    //     {
    //       ...state.dataParams,
    //       ...action.payload.load.variableParams,
    //     },
    //     {
    //       ...state.panelState,
    //       info: false,
    //     },
    //   ];

    //   return {
    //     ...state,
    //     dataParams: variableParamsExDataObj,
    //     chartData: action.payload.load.chartData,
    //     sidebarData: {},
    //     selectionKeys: [],
    //     selectionIndex: [],
    //     panelState: panelsExDataObj,
    //   };
    case "SET_NEW_BINS": {
      let [binsVariableParams, binsMapParams] = [
        {
          ...state.dataParams,
          ...action.payload.load.variableParams,
        },
        {
          ...state.mapParams,
          ...action.payload.load.mapParams,
        },
      ];
      return {
        ...state,
        dataParams: binsVariableParams,
        mapParams: binsMapParams,
      };
    }
    case "SET_GEOID":
      return {
        ...state,
        currentGeoid: action.payload.geoid,
      };
    case "SET_STORED_DATA": {
      const storedData = {
        ...state.storedData,
        [action.payload.name]: action.payload.data,
      };
      return {
        ...state,
        storedData,
      };
    }
    case "SET_STORED_GEOJSON":
      let geojsonObj = {
        ...state.storedGeojson,
      };
      geojsonObj[action.payload.name] = action.payload.data;
      return {
        ...state,
        storedGeojson: geojsonObj,
      };
    case "SET_STORED_LISA_DATA": {
      return {
        ...state,
        storedLisaData: action.payload.data,
        // mapData: generateMapData({
        //   ...state,
        //   storedLisaData: action.payload.data,
        // }),
      };
    }
    case "SET_STORED_CARTOGRAM_DATA": {
      return {
        ...state,
        // mapData: generateMapData({
        //   ...state,
        //   storedCartogramData: action.payload.data,
        // }),
        storedCartogramData: action.payload.data,
      };
    }
    case "SET_STORED_MOBILITY_DATA":
      return {
        ...state,
        storedMobilityData: action.payload.data,
      };
    case "SET_CENTROIDS":
      let centroidsObj = {
        ...state.centroids,
      };
      centroidsObj[action.payload.name] = action.payload.data;
      return {
        ...state,
        centroids: centroidsObj,
      };
    case "SET_CURRENT_DATA": {
      const prevDataset = findIn(state.datasets, "file", state.currentData);
      const currDataset = state.datasets.find(f => f.geography === prevDataset.geography && f.name === action.payload);
      if (!currDataset) {
        return state;
      }
      
      const currentTable = {
        numerator: findTableOrDefault(
          currDataset,
          state.tables,
          state.dataParams.numerator
        ),
        denominator: findTableOrDefault(
          currDataset,
          state.tables,
          state.dataParams.denominator
        ),
      };

      return {
        ...state,
        currentData: currDataset.file,
        selectionKeys: [],
        selectionNaes: [],
        sidebarData: {},
        currentTable,
      };
    }
    case "SET_GEODA_PROXY":
      return {
        ...state,
        geodaProxy: action.payload.proxy,
      };
    case "SET_DATES":
      return {
        ...state,
        dates: action.payload.data,
      };
    case "SET_DATA_FUNCTION":
      return {
        ...state,
        currentDataFn: action.payload.fn,
      };
    case "SET_COLUMN_NAMES":
      let colObj = {
        ...state.cols,
      };
      colObj[action.payload.name] = action.payload.data;
      return {
        ...state,
        cols: colObj,
      };
    case "SET_CURR_DATE":
      return {
        ...state,
        currDate: action.payload.date,
      };
    case "SET_DATE_INDEX":
      return {
        ...state,
        currDateIndex: action.payload.index,
      };
    case "SET_START_DATE_INDEX":
      return {
        ...state,
        startDateIndex: action.payload.index,
      };
    case "SET_BINS":
      let binsObj = {};
      binsObj["bins"] = action.payload.bins;
      binsObj["breaks"] = action.payload.breaks;
      return {
        ...state,
        bins: binsObj,
      };
    case "SET_3D":
      return {
        ...state,
        use3D: !state.use3D,
      };
    case "SET_DATA_SIDEBAR":
      return {
        ...state,
        sidebarData: action.payload.data,
      };
    case 'INCREMENT_DATE': {
      const {
        index, 
        currDatesAvailable
      } = action.payload;     
      const nextIndex = findNextIndex({
          currDatesAvailable,
          currDateIndex: state.dataParams.nIndex,
          step: index
        })
      if (nextIndex === false) {
        return {
          ...state,
        };
      } else {
        return {
          ...state,          
          dataParams: {
            ...state.dataParams,
            nIndex: nextIndex,
            dIndex: nextIndex,
          }
        }
      }
    }
    case "SET_START_PLAYING": {
      let dateObj = {
        ...state.dataParams,
      };
      let currIndices =
        state.dateIndices[state.currentData][state.dataParams.numerator];
      let nextIndex =
        currIndices[
          currIndices.indexOf(state.dataParams.nIndex) + action.payload.index
        ];

      if (nextIndex === undefined) {
        dateObj.nIndex = currIndices[0];
        dateObj.dIndex = currIndices[0];
        return {
          ...state,
          dataParams: dateObj,
        };
      } else {
        dateObj.nIndex = nextIndex;
        dateObj.dIndex = nextIndex;
        return {
          ...state,
          isPlaying: true,
          dataParams: dateObj,
        };
      }
    }
    case "SET_STOP_PLAYING": {
      return {
        ...state,
        isPlaying: false,
      };
    }
    case "CHANGE_GEOGRAPHY":{
      const newGeog = action.payload;
      const relevantDatasets = state.datasets.filter(f => f.geography === newGeog);
      if (relevantDatasets.length === 0) {
        return state
      }
      const currentDataset = findIn(state.datasets, "file", state.currentData);
      const sameDatasetDifferentGeography = relevantDatasets.filter(f => f.name == currentDataset.name);
      if (sameDatasetDifferentGeography.length > 0) {
        return {
          ...state,
          currentData: sameDatasetDifferentGeography[0].file,
        };
      } else {
        return {
          ...state,
          currentData: relevantDatasets[0].file,
        };
      }
    }
    case "CHANGE_VARIABLE": {
      // find target params
      let currVariableParams = findIn(
        state.variables,
        "variableName",
        action.payload
      );
      // find current dataset
      let currDataset = findIn(state.datasets, "file", state.currentData);
      // check if current dataset geography compatible with target variable
      const currentData = state.variableTree[action.payload].hasOwnProperty(
        currDataset.geography
      )
        ? state.currentData
        : findDefaultOrCurrent(
            state.tables,
            state.datasets,
            currVariableParams,
            currDataset.name
          );
      // update variable to match target, if changed
      currDataset = findIn(state.datasets, "file", currentData);
      // declare tables
      const currentTable = {
        numerator: findTableOrDefault(
          currDataset,
          state.tables,
          currVariableParams.numerator
        ),
        denominator: findTableOrDefault(
          currDataset,
          state.tables,
          currVariableParams.denominator
        ),
      };
      const dataName =
        currentTable.numerator?.name?.split(".")[0] ||
        currentTable.numerator?.name?.split(".")[0];
      // pull index cases
      const currIndex =
        currVariableParams.nIndex ||
        currVariableParams.dIndex ||
        state.dataParams.nIndex ||
        state.dataParams.dIndex;
      // update variable index
      currVariableParams.nIndex =
        currVariableParams.nType === "characteristic" ||
        state.dataParams.nIndex === null
          ? null
          : dataDateRanges[dataName] && dataDateRanges[dataName][currIndex]
          ? currIndex
          : findClosestValue(currIndex, dataDateRanges[dataName]);
      // scales
      const colorScale = currVariableParams.colorScale
        ? colorScales[currVariableParams.colorScale]
        : colorScales["natural_breaks"];

      const mapParams = {
        ...state.mapParams,
        colorScale,
      };

      return {
        ...state,
        currentData,
        currentTable,
        dataParams: currVariableParams,
        mapParams,
      };
    }

    case "SET_DATA_PARAMS": {
      const dataParams = {
        ...state.dataParams,
        ...action.payload,
      };
      return {
        ...state,
        dataParams,
      };
    }
    case "SET_VARIABLE_PARAMS": {
      let dataParams = {
        ...state.dataParams,
        ...action.payload.params,
      };
      const currDataset = findIn(state.datasets, "file", state.currentData);

      const currentTable = {
        numerator: findTableOrDefault(
          currDataset,
          state.tables,
          state.dataParams.numerator
        ),
        denominator: findTableOrDefault(
          currDataset,
          state.tables,
          state.dataParams.denominator
        ),
      };

      // if (state.dataParams.zAxisParams !== null) {
      //   dataParams.zAxisParams.nIndex = dataParams.nIndex;
      //   dataParams.zAxisParams.dIndex = dataParams.dIndex;
      // }

      if (
        action.payload.params.variableName !== undefined &&
        dataParams.variableName !== state.dataParams.variable
      ) {
        if (
          dataParams.nType === "time-series" &&
          state.dataParams.nType === "time-series"
        ) {
          dataParams.nRange =
            dataParams.nRange !== null && state.dataParams.nRange !== null
              ? state.dataParams.nRange
              : dataParams.nRange;
        }

        if (
          dataParams.nType === "time-series" &&
          state.storedData[currentTable.numerator]?.dates?.indexOf(
            dataParams.nIndex
          ) === -1
        ) {
          const nearestIndex = state.storedData[
            currentTable.numerator
          ]?.dates?.reduce((a, b) => {
            return Math.abs(b - dataParams.nIndex) <
              Math.abs(a - dataParams.nIndex)
              ? b
              : a;
          });
          if (Math.abs(dataParams.nIndex - nearestIndex) < 14) {
            dataParams.nIndex = nearestIndex;
          } else {
            dataParams.nIndex =
              state.storedData[currentTable.numerator]?.dates.slice(-1)[0];
          }
        }

        if (dataParams.dType === "time-series") {
          dataParams.dIndex = dataParams.nIndex;
          dataParams.dRange = dataParams.nRange;
        }

        if (dataParams.nType === "time-series" && dataParams.nIndex === null) {
          dataParams.nIndex = state.storedIndex;
          dataParams.nRange = state.storedRange;
        }
        if (dataParams.dType === "time-series" && dataParams.dIndex === null) {
          dataParams.dIndex = state.storedIndex;
          dataParams.dRange = state.storedRange;
        }
      }

      return {
        ...state,
        storedIndex:
          dataParams.nType === "characteristic" &&
          state.dataParams.nType === "time-series"
            ? state.dataParams.nIndex
            : state.storedIndex,
        storedRange:
          dataParams.nType === "characteristic" &&
          state.dataParams.nType === "time-series"
            ? state.dataParams.nRange
            : state.storedRange,
        dataParams,
        // mapData:
        //   state.mapParams.binMode !== 'dynamic' &&
        //   state.mapParams.mapType !== 'lisa' &&
        //   shallowEqual(state.dataParams, dataParams)
        //     ? generateMapData({ ...state, dataParams })
        //     : state.mapData,
        currentTable,
        tooltipInfo: {
          x: state.tooltipInfo.x,
          y: state.tooltipInfo.y,
          geoid: state.tooltipInfo.geoid,
        },
        // sidebarData: state.selectionKeys.length
        //   ? generateReport(state.selectionKeys, state)
        //   : state.sidebarData,
      };
    }
    case "SET_VARIABLE_PARAMS_AND_DATASET": {
      let dataParams = {
        ...state.dataParams,
        ...action.payload.params.params,
      };

      const mapParams = {
        ...state.mapParams,
        ...action.payload.params.dataMapParams,
      };
      const currDataset = findIn(
        state.datasets,
        "file",
        action.payload.params.dataset
      );
      const currentTable = {
        numerator: findTableOrDefault(
          currDataset,
          state.tables,
          state.dataParams.numerator
        ),
        denominator: findTableOrDefault(
          currDataset,
          state.tables,
          state.dataParams.denominator
        ),
      };

      if (
        action.payload.params.variableName !== undefined &&
        dataParams.variableName !== state.dataParams.variable
      ) {
        if (
          dataParams.nType === "time-series" &&
          state.dataParams.nType === "time-series"
        ) {
          dataParams.nRange =
            dataParams.nRange !== null && state.dataParams.nRange !== null
              ? state.dataParams.nRange
              : dataParams.nRange;
        }

        if (
          dataParams.nType === "time-series" &&
          state.storedData[currentTable.numerator]?.dates?.indexOf(
            dataParams.nIndex
          ) === -1
        ) {
          const nearestIndex = state.storedData[
            currentTable.numerator
          ]?.dates?.reduce((a, b) => {
            return Math.abs(b - dataParams.nIndex) <
              Math.abs(a - dataParams.nIndex)
              ? b
              : a;
          });
          if (Math.abs(dataParams.nIndex - nearestIndex) < 14) {
            dataParams.nIndex = nearestIndex;
          } else {
            dataParams.nIndex =
              state.storedData[currentTable.numerator]?.dates.slice(-1)[0];
          }
        }

        if (dataParams.dType === "time-series") {
          dataParams.dIndex = dataParams.nIndex;
          dataParams.dRange = dataParams.nRange;
        }
      }

      return {
        ...state,
        dataParams,
        mapParams,
        currentTable,
        selectionKeys: [],
        selectionIndex: [],
        currentData: action.payload.params.dataset,
      };
    }
    case "SET_Z_VARIABLE_PARAMS":
      let paramObjZ = {
        ...state.dataParams,
        zAxisParams: action.payload.params,
      };

      return {
        ...state,
        currentZVariable: action.payload.variable,
        dataParams: paramObjZ,
      };

    case "SET_MAP_PARAMS": {
      let mapParams = {
        ...state.mapParams,
        ...action.payload.params,
      };

      let dataParams = {
        ...state.dataParams,
      };

      if (state.mapParams.mapType !== action.payload.params.mapType) {
        switch (action.payload.params.mapType) {
          case "lisa":
            mapParams.colorScale = colorScales.lisa;
            break;
          case "hinge15_breaks":
            mapParams.colorScale = colorScales.hinge15_breaks
            break;
          default:
            mapParams.colorScale = dataParams.colorScale
              ? colorScales[dataParams.colorScale]
              : colorScales.natural_breaks;
        }
      }
      return {
        ...state,
        mapParams,
        dataParams,
      };
    }
    case "SET_PANELS":
      return {
        ...state,
        panelState: {
          ...state.panelState,
          ...action.payload,
        }
      };
    case "TOGGLE_PANEL": {
      return {
        ...state,
        panelState: {
          ...state.panelState,
          [action.payload]: !state.panelState[action.payload],
        },
      };
    }
    case "SET_VARIABLE_NAME":
      return {
        ...state,
        currentVariable: action.payload.name,
      };
    case "UPDATE_SELECTION": {
      let selectionKeys = [...state.selectionKeys];
      if (action.payload.type === "update") {
        selectionKeys = [action.payload.geoid];
      }
      if (action.payload.type === "append") {
        selectionKeys.push(action.payload.geoid);
      }
      if (action.payload.type === "bulk-append") {
        for (let i = 0; i < action.payload.geoid.length; i++) {
          if (selectionKeys.indexOf(action.payload.geoid[i]) === -1)
            selectionKeys.push(action.payload.geoid[i]);
        }
      }
      if (action.payload.type === "remove") {
        selectionKeys.splice(selectionKeys.indexOf(action.payload.geoid), 1);
      }
      return {
        ...state,
        selectionKeys,
        panelState: {
          ...state.panelState,
          info: true,
        },
      };
    }
    case "SET_ANCHOR_EL":
      return {
        ...state,
        anchorEl: action.payload.anchorEl,
      };
    case "SET_MAP_LOADED":
      return {
        ...state,
        mapLoaded: action.payload.loaded,
      };
    case "SET_IS_LOADING": {
      return {
        ...state,
        isLoading: true,
      };
    }
    case "SET_NOTIFICATION": {
      return {
        ...state,
        notification: {
          info: action.payload.info,
          location: action.payload.location,
        },
      };
    }
    case "SET_URL_PARAMS":
      const { urlParams, presets } = action.payload;

      let preset = urlParams.var
        ? presets[urlParams.var.replace(/_/g, " ")]
        : {};

      let urlMapParamsObj = {
        ...state.mapParams,
        binMode: urlParams.dbin ? "dynamic" : "",
        mapType: urlParams.mthd || state.mapParams.mapType,
        overlay: urlParams.ovr || state.mapParams.overlay,
        resource: urlParams.res || state.mapParams.resource,
        vizType: urlParams.viz || state.mapParams.vizType,
      };

      let urlDataParamsObj = {
        ...state.dataParams,
        ...preset,
        nIndex: urlParams.date || state.dataParams.nIndex,
        nRange: urlParams.hasOwnProperty("range")
          ? urlParams.range === "null"
            ? null
            : urlParams.range
          : state.dataParams.nRange,
        nProperty: urlParams.prop || state.dataParams.nProperty,
      };

      let urlCoordObj = {
        lat: urlParams.lat || "",
        lon: urlParams.lon || "",
        z: urlParams.z || "",
      };

      let urlParamsSource = urlParams.src
        ? `${urlParams.src}.geojson`
        : state.currentData;

      return {
        ...state,
        currentData: urlParamsSource,
        urlParams: urlCoordObj,
        mapParams: urlMapParamsObj,
        dataParams: urlDataParamsObj,
      };
    case "OPEN_CONTEXT_MENU":
      let contextPanelsObj = {
        ...state.panelState,
        context: true,
        contextPos: {
          x: action.payload.params.x,
          y: action.payload.params.y,
        },
      };
      return {
        ...state,
        panelState: contextPanelsObj,
      };
    case "SET_VARIABLE_MENU_WIDTH": {
      return {
        ...state,
        variableMenuWidth: action.payload,
      };
    }
    case "SET_TOOLTIP_INFO": {
      if (!state.tooltipInfo.x && !action.payload.data) {
        return state;
      }
      const data =
        typeof action.payload.data === "number" ||
        typeof action.payload.data === "string"
          ? false
          : action.payload.data;

      const tooltipInfo = {
        x: action.payload.x + 60 + state.variableMenuWidth,
        y: action.payload.y + 10 + 50,
        data,
        geoid: +action.payload.data,
      };
      return {
        ...state,
        tooltipInfo,
      };
    }
    case "SET_DOT_DENSITY":
      return {
        ...state,
        dotDensityData: action.payload.data,
      };
    case "CHANGE_DOT_DENSITY_MODE":
      let changeDotDensityObj = {
        ...state.mapParams,
      };

      changeDotDensityObj.dotDensityParams.colorCOVID =
        !changeDotDensityObj.dotDensityParams.colorCOVID;

      return {
        ...state,
        mapParams: changeDotDensityObj,
      };
    case "TOGGLE_DOT_DENSITY_RACE":
      let toggleAcsObj = {
        ...state.mapParams,
      };

      toggleAcsObj.dotDensityParams.raceCodes[action.payload.index] =
        !toggleAcsObj.dotDensityParams.raceCodes[action.payload.index];

      return {
        ...state,
        mapParams: toggleAcsObj,
      };
    case "SET_DOT_DENSITY_BACKGROUND_OPACITY":
      let backgroundOpacityState = {
        ...state.mapParams,
      };
      backgroundOpacityState.dotDensityParams.backgroundTransparency =
        action.payload.opacity;

      return {
        ...state,
        mapParams: backgroundOpacityState,
      };
    case "SET_COLOR_FILTER": {
      return {
        ...state,
        colorFilter: action.payload,
      };
    }
    case "ADD_WEIGHTS": {
      const storedGeojson = {
        ...state.storedGeojson,
        [action.payload.file]: {
          ...state.storedGeojson[action.payload.file],
          weights: {
            Queen: action.payload.weights,
          },
        },
      };
      return {
        ...state,
        storedGeojson,
      };
    }
    case "ADD_CUSTOM_DATA": {
      const dataName = resolveName(
        action.payload.selectedFile?.name.split(".geojson")[0],
        Object.keys(state.storedGeojson)
      );

      let variables = [
        ...state.variables,
      ];

      const datasetTree = {
        ...state.datasetTree,
        [dataName]: {
          [dataName]: dataName,
        },
      };

      const tables = [
        ...state.tables,
        {
          name: dataName,
          geography: dataName,
          table: dataName,
          fileType: null,
          dataType: "characteristic",
          join: "idx",
          default: 1,
          id: dataName,
        },
      ];

      const datasets = [
        ...state.datasets,
        {
          name: dataName,
          file: dataName,
          geography: dataName,
          join: "idx",
          tables: {},
        },
      ];

      let variableTree = {
        [`HEADER: ${dataName}`]: {},
      };
      const variablesList = state.variables.map((f) => f.variableName);
      for (let i = 0; i < action.payload.variables.length; i++) {
        let currVariable = resolveName(
          action.payload.variables[i].variableName,
          variablesList
        );
        variablesList.push(currVariable);
        variables.unshift({
          ...action.payload.variables[i],
          variableName: currVariable,
        });

        variableTree[currVariable] = {
          [dataName]: [dataName],
        };
      }

      const urlParamsTree = {
        ...state.urlParamsTree,
        [dataName]: {
          name: dataName,
          geography: dataName,
        },
      };

      return {
        ...state,
        datasets,
        datasetTree,
        tables,
        urlParamsTree,
        variableTree: {
          ...variableTree,
          ...state.variableTree,
        },
        variables,
        currentData: dataName,
        dataParams: variables[0],
        currentTable: {
          numerator: "properties",
          denominator: "properties",
        },
        mapParams: {
          ...state.mapParams,
          vizType: "2D",
          dotDensityParams: {
            ...state.mapParams.dotDensityParams,
            colorCOVID: false,
          },
        },
        shouldPanMap: true,
      };
    }
    case "MAP_DID_PAN": {
      return {
        ...state,
        shouldPanMap: false,
      };
    }
    default:
      return state;
  }
};

export default reducer;
