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
  const dataParams = useSelector(({params}) => params.dataParams);
  const currentData = useSelector(({params}) => params.currentData);
  const datasets = useSelector(({params}) => params.datasets);
  const tables = useSelector(({params}) => params.tables);
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
  // const storedData = useSelector(({data}) => data.storedData);
  const storedGeojson = useSelector(({data}) => data.storedGeojson);
  const canLoadInBackground = useSelector(({data}) => data.canLoadInBackground);

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
    currTimespans
  });

  const [numeratorData, numeratorDataReady] = useGetTable({
    filesToFetch: numeratorParams,
    shouldFetch: true,
    dateLists
  });

  const [denominatorData, denominatorDataReady] =
    useGetTable({
      filesToFetch: denominatorParams,
      shouldFetch: true,
      dateLists
    });

  const [geojsonData, geojsonDataReady] = useGetGeojson({
    geoda,
    geodaReady,
    currDataset,
    storedGeojson
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
    dispatch({
      type:'SET_CAN_LOAD_IN_BACKGROUND',
      payload: !!numeratorDataReady && !!denominatorDataReady && !!geojsonDataReady
    })
  }, [numeratorDataReady, denominatorDataReady, geojsonDataReady]);

  useBackgroundLoadData({
    currentGeography: currDataset.geography,
    tables,
    shouldFetch: canLoadInBackground,
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
