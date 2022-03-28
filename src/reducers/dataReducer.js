import INITIAL_STATE from "../constants/dataInitialState";

const orderInts = (a, b) => a - b;
const onlyUnique = (value, index, self) => self.indexOf(value) === index;

function reconcileData(payload, storedData){  
  const { name, newData, timespan, error } = payload;
  const dataError =
    (newData?.dates && !newData.dates.length) ||
    (newData &&
      newData.columns &&
      storedData[name] &&
      storedData[name].columns &&
      newData.columns.join("") === storedData[name].columns.join(""));

  // If the data doesn't exist, easy. Just plug in the full dataset
  // and move on to the next
  if (!storedData.hasOwnProperty(name)) {
    storedData[name] = {
      ...newData,
      loaded: [timespan],
    };
  } else if (error || dataError) {
    storedData[name].loaded.push(timespan);
  } else {
    const newDates = newData?.dates || [];
    // Otherwise, we need to reconcile based on keys present in the 'dates'
    // property, using the big query data as the most up-to-date vs the
    // static fetched data, which may have been cached client-side
    const datasetKeys = storedData[name].data
      ? Object.keys(storedData[name].data)
      : [];
    // Loop through row (features) and date, using big query values as insertions
    // and static as base, to reduce loop iterations
    for (let x = 0; x < datasetKeys.length; x++) {
      let tempValues = storedData[name].data[datasetKeys[x]];
      for (let n = 0; n < newDates.length; n++) {
        tempValues[newDates[n]] = newData.data[datasetKeys[x]][newDates[n]];
      }
      storedData[name].data[datasetKeys[x]] = tempValues;
    }

    // Reconcile and sort date indices
    storedData[name].loaded.push(timespan);

    if (storedData[name]?.dates?.length) {
      storedData[name].dates = [
        ...storedData[name].dates,
        ...(newData?.dates || []),
      ]
        .filter(onlyUnique)
        .sort(orderInts);
    }
  }

}
export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "LOAD_DOT_DENSITY_DATA":
      return {
        ...state,
        dotDensityData: action.payload,
      };

    case "RECONCILE_TABLE": {
      // expected shape: // type: 'RECILE_TABLES', payload: { data: { dataset1: {data,dates,columns}}}
      let storedData = {
        ...state.storedData,
      };
      reconcileData(
        action.payload,
        storedData
      );

      return {
        ...state,
        storedData,
      };
    }
    case "RECONCILE_TABLES": {
      let storedData = {
        ...state.storedData,
      };
      action.payload.data.forEach(dataset => reconcileData(dataset, storedData))      
      return {
        ...state,
        storedData,
      };
    }
    case "SET_DATA": {
      return {
        ...state,
        storedData: action.payload.storedData
      }
    }
    case "ADD_WEIGHTS": {
      // id, weights
      return {
        ...state,
        storedGeojson: {
          ...state.storedGeojson,
          [action.payload.id]: {
            ...state.storedGeojson[action.payload.id],
            weights: {
              ...state.storedGeojson[action.payload.id].weights,
              ...action.payload.weights,
            },
          },
        },
      };
    }
    case "LOAD_GEOJSON":
      // data
      return {
        ...state,
        storedGeojson: {
          ...state.storedGeojson,
          ...action.payload,
        },
      };
    case "LOAD_RESOURCE":
      return {
        ...state,
        resourceLayerData: {
          ...state.resourceLayerData,
          [action.payload.id]: action.payload.data,
        },
      };
    case "SET_TICKING": {
      return {
        ...state,
        isTicking: action.payload
      }
    }
    case "SET_CAN_LOAD_IN_BACKGROUND":
      return {
        ...state,
        canLoadInBackground: action.payload && !state.isTicking,
      }
    default:
      return state;
  }
}
