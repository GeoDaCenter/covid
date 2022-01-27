import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  findIn,
  getDateLists,
  getDataForBins,
  getFetchParams,
  findSecondaryMonth,
  getClosestIndex,
  onlyUniqueArray,
} from "../utils";
import useGetTable from "./useGetTable";
const dateLists = getDateLists();

export default function useGetVariable({
  variable,
  priorityLoad = false,
  dataset = false,
  dateIndex = false,
}) {
  const canLoadInBackground = useSelector(
    ({ data }) => data.canLoadInBackground
  );
  // pieces of redux state
  const stateDataset = useSelector(({ params }) => params.currentData);
  const currentData = dataset || stateDataset;
  const geojsonData = useSelector(({ data }) => data.storedGeojson[currentData]);
  const dataParams = useSelector(({ params }) => params.dataParams);
  const datasets = useSelector(({ params }) => params.datasets);
  const tables = useSelector(({ params }) => params.tables);
  const variables = useSelector(({ params }) => params.variables);
  // current state data params

  const params = findIn(variables, "variableName", variable);
  const currDataset = findIn(datasets, "file", currentData);

  const [nIsTimeSeries, dIsTimeSeries] = [
    params?.nType && params.nType.includes("time"),
    params?.dType && params.dType.includes("time"),
  ];
  const isTimeSeries = nIsTimeSeries || dIsTimeSeries;

  const [defaultNumeratorParams, defaultDenominatorParams] = [
    params,
    params,
  ].map((dataParams, i) =>
    getFetchParams({
      dataParams,
      tables,
      currDataset,
      predicate: i === 1 ? "denominator" : "numerator",
      dateList: dateLists["isoDateList"],
    })
  );

  const currIndex = isTimeSeries
    ? getClosestIndex(
        dateIndex || dataParams.nIndex || dataParams.dIndex,
        defaultNumeratorParams.name || ""
      ) || 30
    : null;
  const currRangeIndex = currIndex - (dataParams.nRange || dataParams.dRange);
  const currTimespans = [currIndex, currRangeIndex]
    .map((index) => [
      !currIndex || dateLists.isoDateList.length - index < 30
        ? "latest"
        : dateLists.isoDateList[index]?.slice(0, 7),
      !currIndex || dateLists.isoDateList.length - index < 30
        ? false
        : findSecondaryMonth(index, dateLists.isoDateList),
    ])
    .flat()
    .filter((f) => !!f)
    .filter(onlyUniqueArray);
  const fetchParams = [defaultNumeratorParams, defaultDenominatorParams].map(
    (params) =>
      currTimespans.map((timespan, i) => ({
        ...params,
        timespan,
      }))
  );

  const [[numData, numReady], [denData, denReady]] = [
    useGetTable({
      filesToFetch: fetchParams[0],
      shouldFetch: canLoadInBackground,
      dateLists,
    }),
    useGetTable({
      filesToFetch: fetchParams[1],
      shouldFetch: canLoadInBackground,
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
