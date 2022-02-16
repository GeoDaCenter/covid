import INITIAL_STATE from "../constants/reportBuilderState";
import { templates } from "../components/Panels/ReportBuilder/Report/Templates";

function generateTypeKey(
  stringifiedKeys,
  type
) {
  if (!(stringifiedKeys.includes(type))) {
    return `${type}-0`
  } else {
    let i=1;
    do {
      const tempName = `${type}-${i}`
      if (!(stringifiedKeys.includes(tempName))) {
        return tempName
      }
    } while (i < 1000) //artibtrary cut off to prevent infinite loops
  }
  return null
}

function generateReportLayout(spec) {
  const template = templates[spec]
  let items = {};
  let layout = template.map(_ => []);
  for (let i = 0; i < layout.length; i++) {
    for (let j = 0; j < template[i].length; j++) {
      const keys = [...Object.keys(items)].reverse();
      const stringifiedKeys = keys.join(' ')
      const currItem = template[i][j];
      const {
        type,
        w,
        h,
        x,
        y
      } = currItem
      const key = generateTypeKey(stringifiedKeys, type)
      items[key] = {
        ...currItem,
        key
      }
      layout[i].push({
        w: w||1,
        h: h||1,
        x: x||0,
        y: y||0,
        i: key
      })

    }
  }
  
  return {
    items,
    layout
  }
}


export default function Reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "ADD_NEW_REPORT": {
      const { reportName, spec, meta } = action.payload;
      const { items, layout } = generateReportLayout(spec)
      
      const reports = {
        ...state.reports,
        [reportName]: {
          meta,
          items, 
          layout,
          defaults: action.payload
        },
      }
      return {
        reports
      }
    }
    // case "RESET_REPORT": {
    //   const { reportName } = action.payload;
    //   const prev = state.reports[reportName];
    //   const reports = {
    //     ...state.reports,
    //     [reportName]: {
    //       ...prev,
    //       spec: templates[prev.defaultTemplate],
    //     },
    //   }
    //   return {
    //     reports
    //   };
    // }
    case "CHANGE_REPORT_ITEM": {
      const { reportName, itemId, props } = action.payload;

      let items = state.reports[reportName].items;

      items[itemId] = {
        ...items[itemId],
        ...props,
      };
      
      const reports = {
        ...state.reports,
        [reportName]: {
          ...state.reports[reportName],
          items
        },
      };

      return {
        reports
      };
    }
    // case "ADD_REPORT_ITEM": {
    //   const { reportName, pageIdx, item } = action.payload;
    //   let spec = state.reports[reportName].spec;
    //   spec[pageIdx] = [...spec[pageIdx], item];

    //   const reports = {
    //     ...state.reports,
    //     [reportName]: {
    //       ...state.reports[reportName],
    //       spec: spec
    //     },
    //   };

    //   return {
    //     reports
    //   };
    // }
    // case "DELETE_REPORT_ITEM": {
    //   const { reportName, pageIdx, itemIdx } = action.payload;
    //   let spec = state.reports[reportName].spec;
    //   spec[pageIdx] = [
    //     ...spec[pageIdx].slice(0, itemIdx),
    //     ...spec[pageIdx].slice(itemIdx + 1),
    //   ];

    //   const reports = {
    //     ...state.reports,
    //     [reportName]: {
    //       ...state.reports[reportName],
    //       spec
    //     },
    //   };

    //   return {
    //     reports
    //   };
    // }
    // case "TOGGLE_REPORT_ITEM": {
    //   const { reportName, pageIdx, itemIdx, prop } = action.payload;
    //   let spec = state.reports[reportName].spec;
    //   spec[pageIdx][itemIdx][prop] = !spec[pageIdx][itemIdx][prop];
    //   const reports = {
    //     ...state.reports,
    //     [reportName]: {
    //       ...state.reports[reportName],
    //       spec
    //     },
    //   };

    //   return {
    //     reports
    //   };
    // }
    // case "REORDER_REPORT_ITEMS": {
    //   const { reportName, pageIdx, itemsMin, currItemsOrder } = action.payload;
    //   let spec = state.reports[reportName].spec;
    //   spec[pageIdx] = currItemsOrder.map(
    //     (idx) => spec[pageIdx][idx - itemsMin]
    //   );
    //   const reports = {
    //     ...state.reports,
    //     [reportName]: {
    //       ...state.reports[reportName],
    //       spec,
    //     },
    //   };
    //   return {
    //     reports
    //   }
    // }
    // case "ADD_REPORT_PAGE": {
    //   const reportName = action.payload;
    //   const reports = {
    //     ...state.reports,
    //     [reportName]: {
    //       ...state.reports[reportName],
    //       spec: [
    //         ...state.reports[reportName].spec,
    //         []
    //       ]
    //     },
    //   };
    //   return {
    //     reports
    //   }
    // }
    // case "DELETE_REPORT": {
    //   let reports = { ...state.reports };
    //   delete reports[action.payload];
    //   return {
    //     reports
    //   }
    // }
    default:
      return state;
  }
}
