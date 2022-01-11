import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  findAllDefaults,
  findIn,
  findTableOrDefault,
  getDateLists,
  getDataForBins,
  getFetchParams,
  getIdOrder,
  getParseCSV,
  getParseCsvPromise,
  indexGeoProps,
  parsePbfData,
  findSecondaryMonth,
  stitch,
} from "../utils";
import { useDataStore } from "../contexts/Data";
import { useBackgroundLoadingContext } from "../contexts/BackgroundData";
import useGetTable from "./useGetTable";
const dateLists = getDateLists();

export default function useGetScatterData({ xAxisVar, yAxisVar }) {
  const [canLoadInBackground] = useBackgroundLoadingContext();
  const [{ storedData, storedGeojson }, dataDispatch] = useDataStore();

  // pieces of redux state
  const currentData = useSelector((state) => state.currentData);
  const dates = useSelector((state) => state.dates);
  const dataParams = useSelector((state) => state.dataParams);
  const datasets = useSelector((state) => state.datasets);
  const tables = useSelector((state) => state.tables);
  const variables = useSelector((state) => state.variables);
  const geojsonData = storedGeojson[currentData];

  // current state data params
  const currIndex = dataParams.nIndex || dataParams.dIndex;
  const currDataset = findIn(datasets, "file", currentData);
  const currTables = [
    ...Object.values(currDataset.tables).map((tableId) =>
      findIn(tables, "id", tableId)
    ),
    ...findAllDefaults(tables, currDataset.geography).map((dataspec) => ({
      ...dataspec,
    })),
  ].filter(
    (entry, index, self) =>
      self.findIndex((f) => f.table === entry.table) === index
  );
  const currTimespans = [
    !currIndex || dateLists.isoDateList.length - currIndex < 45
      ? "latest"
      : dateLists.isoDateList[currIndex]?.slice(0, 7),
    !currIndex || dateLists.isoDateList.length - currIndex < 45
      ? false
      : findSecondaryMonth(currIndex, dateLists.isoDateList),
  ];
  const [xParams, yParams] = [
    findIn(variables, "variableName", xAxisVar),
    findIn(variables, "variableName", yAxisVar),
  ];

  const fetchParams = [xParams, xParams, yParams, yParams].map(
    (dataParams, i) =>
      getFetchParams({
        dataParams,
        tables,
        currDataset,
        predicate: i % 2 ? "denominator" : "numerator",
        dateList: dateLists["isoDateList"],
        currTimespans,
      })
  );

  const [
    [xNumData, xNumReady, xNumError],
    [xDenData, xDenReady, xDenError],
    [yNumData, yNumReady, yNumError],
    [yDenData, yDenReady, yDenError],
  ] = [
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
    useGetTable({
      filesToFetch: fetchParams[2],
      shouldFetch: canLoadInBackground,
      storedData,
      dataDispatch,
      dateLists,
    }),
    useGetTable({
      filesToFetch: fetchParams[3],
      shouldFetch: canLoadInBackground,
      storedData,
      dataDispatch,
      dateLists,
    }),
  ];

  const xData = useMemo(() =>
    getDataForBins({
      numeratorData:
        xParams.numerator === "properties"
          ? geojsonData?.properties
          : xNumData?.data,
      denominatorData:
        xParams.denominator === "properties"
          ? geojsonData?.properties
          : xDenData?.data,
      dataParams: xParams,
      binIndex: currIndex,
      fixedOrder:
        geojsonData?.order?.indexOrder &&
        Object.values(geojsonData.order.indexOrder),
      dataReady: xNumReady && xDenReady,
    })
  );

  const yData = useMemo(() =>
    getDataForBins({
      numeratorData:
        yParams.numerator === "properties"
          ? geojsonData?.properties
          : yNumData?.data,
      denominatorData:
        yParams.denominator === "properties"
          ? geojsonData?.properties
          : yDenData?.data,
      dataParams: yParams,
      binIndex: currIndex,
      fixedOrder:
        geojsonData?.order?.indexOrder &&
        Object.values(geojsonData.order.indexOrder),
      dataReady: yNumReady && yDenReady,
    })
  );
  const scatterData = useMemo(
    () =>
      stitch(
        xData,
        yData,
        geojsonData?.order?.indexOrder &&
          Object.values(geojsonData.order.indexOrder)
      ),
    [JSON.stringify(xData), JSON.stringify(yData)]
  );

  return {
    scatterData,
  };
}
