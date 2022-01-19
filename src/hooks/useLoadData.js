import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  findIn,
  getDateLists,
  getFetchParams,
  findSecondaryMonth,
  onlyUniqueArray
} from "../utils";
import { useGeoda } from "../contexts/Geoda";
import { useDataStore } from "../contexts/Data";
import { useBackgroundLoadingContext } from "../contexts/BackgroundData";
import useGetTable from "./useGetTable";
import useGetGeojson from "./useGetGeojson";
import useBackgroundLoadData from "./useBackgroundLoadData";

const dateLists = getDateLists();

// fetch params spec
// {
//   file: 'covid_confirmed_usafacts.latest.pbf',
//   name: '',
//    type:'pbf',
//  timespan: 'latest'
// dates: 'ISO' or 'US'
// accumulate: yeah or nea
// }

export default function useLoadData() {
  // pieces of redux state
  const dispatch = useDispatch();
  const dataParams = useSelector((state) => state.dataParams);
  const currentData = useSelector((state) => state.currentData);
  const datasets = useSelector((state) => state.datasets);
  const tables = useSelector((state) => state.tables);
  const [firstLoad, setFirstLoad] = useState(true);

  // current state data params
  const currDataset = findIn(datasets, "file", currentData);
  const currIndex = dataParams.nIndex || dataParams.dIndex;
  const currRangeIndex = currIndex - (dataParams.nRange || dataParams.dRange)
  
  const currTimespans = [currIndex, currRangeIndex].map(index => [
    !currIndex || dateLists.isoDateList.length - index < 30
      ? "latest"
      : dateLists.isoDateList[index]?.slice(0, 7),
    !currIndex || dateLists.isoDateList.length - index < 30
      ? false
      : findSecondaryMonth(index, dateLists.isoDateList),
  ]).flat().filter(f => !!f).filter(onlyUniqueArray);

  const { geoda, geodaReady } = useGeoda();
  const [
    { storedData, storedGeojson },
    dataDispatch,
  ] = useDataStore();
  const [canLoadInBackground, setCanLoadInBackground] = useBackgroundLoadingContext();

  const numeratorParams = getFetchParams({
    dataParams,
    tables,
    currDataset,
    predicate: "numerator",
    dateList: dateLists["isoDateList"],
    currTimespans,
  });

  const denominatorParams = getFetchParams({
    dataParams,
    tables,
    currDataset,
    predicate: "denominator",
    dateList: dateLists["isoDateList"],
    currTimespans,
  });

  const [numeratorData, numeratorDataReady, numeratorDataError] = useGetTable({
    filesToFetch: numeratorParams,
    shouldFetch: true,
    storedData,
    dataDispatch,
    dateLists,
  });

  const [denominatorData, denominatorDataReady, denominatorDataError] =
    useGetTable({
      filesToFetch: denominatorParams,
      shouldFetch: true,
      storedData,
      dataDispatch,
      dateLists,
    });

  const [geojsonData, geojsonDataReady, geojsonDataError] = useGetGeojson({
    geoda,
    geodaReady,
    currDataset,
    storedGeojson,
    dataDispatch,
  });
  const dateIndices = numeratorData ? numeratorData.dates : null;

  // First load fix numerator index
  useEffect(() => {
    if (firstLoad && numeratorData?.dates && numeratorData.dates.slice(-1)[0]) {
      dispatch({
        type: "SET_DATA_PARAMS",
        payload: {
          nIndex: numeratorData.dates.slice(-1)[0],
        },
      });
      setFirstLoad(false);
    }
  }, [numeratorData && (numeratorData?.dates && numeratorData.dates.slice(-1)[0])]);

  useEffect(() => {
    setCanLoadInBackground(
      !!numeratorDataReady && !!denominatorDataReady && !!geojsonDataReady
    );
  }, [numeratorDataReady, denominatorDataReady, geojsonDataReady]);

  const backgroundLoading = useBackgroundLoadData({
    currentGeography: currDataset.geography,
    tables,
    shouldFetch: canLoadInBackground,
    storedData,
    dataDispatch,
    currTimespans,
    dateLists,
    numeratorParams,
    denominatorParams,
    adjacentMonths: [
      dateLists.isoDateList[currIndex-30]?.slice(0, 7),
      dateLists.isoDateList[currIndex+30]?.slice(0, 7)
    ]
  });
  
  return {
    geojsonData,
    numeratorData,
    denominatorData,
    dateIndices,
    dataReady: !!numeratorDataReady && !!denominatorDataReady && !!geojsonDataReady
  };
}
