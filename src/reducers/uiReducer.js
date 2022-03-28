import INITIAL_STATE from "../constants/uiInitialState";

export default function Reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
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

    case "SET_PANELS":
      return {
        ...state,
        panelState: {
          ...state.panelState,
          ...action.payload,
        },
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
    case "SET_VARIABLE_MENU_WIDTH": {
      return {
        ...state,
        variableMenuWidth: action.payload,
      };
    }
    case "MAP_DID_PAN": {
      return {
        ...state,
        shouldPanMap: false,
      };
    }
    case "SET_COLOR_FILTER": {
      return {
        ...state,
        colorFilter: action.payload,
      };
    }
    default:
      return state;

    // case "OPEN_CONTEXT_MENU":{
    //     let contextPanelsObj = {
    //       ...state.panelState,
    //       context: true,
    //       contextPos: {
    //         x: action.payload.params.x,
    //         y: action.payload.params.y,
    //       },
    //     };
    //     return {
    //       ...state,
    //       panelState: contextPanelsObj,
    //     };
    // }
  }
}
