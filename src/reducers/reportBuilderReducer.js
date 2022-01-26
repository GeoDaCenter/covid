import INITIAL_STATE from "../constants/reportBuilderState";
import {templates} from "../components/Panels/ReportBuilder/Report/Templates";

export default function Reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "ADD_NEW_REPORT": {
      const { reportName, spec} = action.payload;
      const reports = {
        ...state.reports,
        [reportName]: {
          ...action.payload,
          spec: templates[spec],
        },
      }
      return {
        reports,
        cachedReports: JSON.stringify(reports)
      };
    }
    case "CHANGE_REPORT_ITEM": {
      const { reportName, pageIdx, itemIdx, props } = action.payload;
      let spec = state.reports[reportName].spec;
      spec[pageIdx][itemIdx] = {
        ...spec[pageIdx][itemIdx],
        ...props,
      };
      const reports = {
        ...state.reports,
        [reportName]: {
          ...state.reports[reportName],
          spec
        },
      };

      return {
        reports,
        cachedReports: JSON.stringify(reports),
      };
    }
    case "ADD_REPORT_ITEM": {
      const { reportName, pageIdx, item } = action.payload;
      let spec = state.reports[reportName].spec;
      spec[pageIdx] = [...spec[pageIdx], item];

      const reports = {
        ...state.reports,
        [reportName]: {
          ...state.reports[reportName],
          spec: spec
        },
      };

      return {
        reports,
        cachedReports: JSON.stringify(reports),
      };
    }
    case "DELETE_REPORT_ITEM": {
      const { reportName, pageIdx, itemIdx } = action.payload;
      let spec = state.reports[reportName].spec;
      spec[pageIdx] = [
        ...spec[pageIdx].slice(0, itemIdx),
        ...spec[pageIdx].slice(itemIdx + 1),
      ];

      const reports = {
        ...state.reports,
        [reportName]: {
          ...state.reports[reportName],
          spec
        },
      };

      return {
        reports,
        cachedReports: JSON.stringify(reports),
      };
    }
    case "TOGGLE_REPORT_ITEM": {
      const { reportName, pageIdx, itemIdx, prop } = action.payload;
      let spec = state.reports[reportName].spec;
      spec[pageIdx][itemIdx][prop] = !spec[pageIdx][itemIdx][prop];
      const reports = {
        ...state.reports,
        [reportName]: {
          ...state.reports[reportName],
          spec
        },
      };

      return {
        reports,
        cachedReports: JSON.stringify(reports),
      };
    }
    case "REORDER_REPORT_ITEM": {
      const { reportName, pageIdx, itemsMin, currItemsOrder } = action.payload;
      let spec = state.reports[reportName].spec;
      spec[pageIdx] = currItemsOrder.map(
        (idx) => spec[pageIdx][idx - itemsMin]
      );
      const reports = {
        ...state.reports,
        [reportName]: {
          ...state.reports[reportName],
          spec,
        },
      };
      return {
        reports,
        cachedReports: JSON.stringify(reports)
      }
    }
    case "ADD_REPORT_PAGE": {
      const reportName = action.payload;
      const reports = {
        ...state.reports,
        [reportName]: {
          ...state.reports[reportName],
          spec: [
            ...state.reports[reportName].spec,
            []
          ]
        },
      };
      return {
        reports,
        cachedReports: JSON.stringify(reports),
      }
    }
    case "DELETE_REPORT": {
      let reports = {...state.reports};
      delete reports[action.payload];
      return {
        reports,
        cachedReports: JSON.stringify(reports),
      }
    }
    default:
      return state;
  }
}
