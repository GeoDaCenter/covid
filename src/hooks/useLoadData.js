import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  findIn,
  getDateLists,
  getFetchParams,
  findSecondaryMonth,
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
  const currTimespans = [
    !currIndex || dateLists.isoDateList.length - currIndex < 45
      ? "latest"
      : dateLists.isoDateList[currIndex]?.slice(0, 7),
    !currIndex || dateLists.isoDateList.length - currIndex < 45
      ? false
      : findSecondaryMonth(currIndex, dateLists.isoDateList),
  ];

  const { geoda, geodaReady } = useGeoda();
  const [
    { storedData, storedGeojson, dotDensityData, resourceLayerData },
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
  });
  
  return {
    geojsonData,
    numeratorData,
    denominatorData,
    dateIndices,
    dataReady: !!numeratorDataReady && !!denominatorDataReady && !!geojsonDataReady
  };
}
