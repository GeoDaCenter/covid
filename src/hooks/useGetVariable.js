import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  findIn,
  getDateLists,
  getDataForBins,
  getFetchParams,
  findSecondaryMonth,
} from "../utils";
import { useDataStore } from "../contexts/Data";
import { useBackgroundLoadingContext } from "../contexts/BackgroundData";
import useGetTable from "./useGetTable";
const dateLists = getDateLists();

export default function useGetVariable({
  variable,
  priorityLoad = false,
  dataset = false,
}) {
  const [contextCanLoad] = useBackgroundLoadingContext();
  const canLoadInBackground = priorityLoad || contextCanLoad;
  const [{ storedData, storedGeojson }, dataDispatch] = useDataStore();
  // pieces of redux state
  const stateDataset = useSelector((state) => state.currentData);
  const currentData = dataset || stateDataset;
  const dataParams = useSelector((state) => state.dataParams);
  const datasets = useSelector((state) => state.datasets);
  const tables = useSelector((state) => state.tables);
  const variables = useSelector((state) => state.variables);
  const geojsonData = storedGeojson[currentData];
  // current state data params
  const currIndex = dataParams.nIndex || dataParams.dIndex;
  const currDataset = findIn(datasets, "file", currentData);

  const currTimespans = [
    !currIndex || dateLists.isoDateList.length - currIndex < 45
      ? "latest"
      : dateLists.isoDateList[currIndex]?.slice(0, 7),
    !currIndex || dateLists.isoDateList.length - currIndex < 45
      ? false
      : findSecondaryMonth(currIndex, dateLists.isoDateList),
  ];
  const params = findIn(variables, "variableName", variable);

  const fetchParams = [params, params].map((dataParams, i) =>
    getFetchParams({
      dataParams,
      tables,
      currDataset,
      predicate: i % 2 ? "denominator" : "numerator",
      dateList: dateLists["isoDateList"],
      currTimespans,
    })
  );

  const [[numData, numReady, numError], [denData, denReady, denError]] = [
    useGetTable({
      filesToFetch: fetchParams[0],
      shouldFetch: canLoadInBackground,
      storedData,
      dataDispatch,
      dateLists,
    }),
    useGetTable({
      filesToFetch: fetchParams[1],
      shouldFetch: canLoadInBackground,
      storedData,
      dataDispatch,
      dateLists,
    }),
  ];

  const data = useMemo(() =>
    getDataForBins({
      numeratorData:
        params.numerator === "properties"
          ? geojsonData?.properties
          : numData?.data,
      denominatorData:
        params.denominator === "properties"
          ? geojsonData?.properties
          : denData?.data,
      dataParams: params,
      binIndex: currIndex,
      fixedOrder:
        geojsonData?.order?.indexOrder &&
        Object.values(geojsonData.order.indexOrder),
      dataReady: numReady && denReady,
    })
  );

  return data;
}
