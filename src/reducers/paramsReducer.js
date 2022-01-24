import INITIAL_STATE from "../constants/paramsInitialState";
import {
  // getDataForCharts,
  // generateMapData,
  // generateReport,
  // shallowEqual,
  // parseTooltipData,
  // getIdOrder,
  // indexGeoProps,
  resolveName,
  findIn,
  // findDefault,
  findTableOrDefault,
  findClosestValue,
  findNextIndex,
} from "../utils";

import dataDateRanges from "../config/dataDateRanges";
import { colorScales } from "../config/scales";
const findDefaultOrCurrent = (
  tables,
  datasets,
  variableParams,
  datasetName
) => {
  const relevantTables = tables.filter(
    (f) => f.id === variableParams.numerator
  );
  const availableGeographies = relevantTables.map((f) => f.geography);
  const availableDatasets = datasets.filter(
    (f) => datasetName === f.name && availableGeographies.includes(f.geography)
  );

  if (availableDatasets.length) {
    return availableDatasets[0].file;
  }
  const anyDataset = datasets.filter((f) =>
    availableGeographies.includes(f.geography)
  );
  return anyDataset[0].file;
};

var reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "SET_CURRENT_DATA": {
      const prevDataset = findIn(state.datasets, "file", state.currentData);
      const currDataset = state.datasets.find(
        (f) =>
          f.geography === prevDataset.geography && f.name === action.payload
      );
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
    case "SET_DATES":
      return {
        ...state,
        dates: action.payload.data,
      };
    case "INCREMENT_DATE": {
      const { index, currDatesAvailable } = action.payload;
      const nextIndex = findNextIndex({
        currDatesAvailable,
        currDateIndex: state.dataParams.nIndex,
        step: index,
      });
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
          },
        };
      }
    }
    case "CHANGE_GEOGRAPHY": {
      const newGeog = action.payload;
      const relevantDatasets = state.datasets.filter(
        (f) => f.geography === newGeog
      );
      if (relevantDatasets.length === 0) {
        return state;
      }
      const currentDataset = findIn(state.datasets, "file", state.currentData);
      const sameDatasetDifferentGeography = relevantDatasets.filter(
        (f) => f.name === currentDataset.name
      );
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
        currentTable
      };
    }
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
            mapParams.colorScale = colorScales.hinge15_breaks;
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
    case "ADD_CUSTOM_DATA": {
      const dataName = resolveName(
        action.payload.selectedFile?.name.split(".geojson")[0],
        Object.keys(state.storedGeojson)
      );

      let variables = [...state.variables];

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
    default:
      return state;
  }
};

export default reducer;
