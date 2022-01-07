import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import {
  findAllDefaults,
  findIn,findTableOrDefault,
  getDateLists,
  getIdOrder,
  getParseCSV,
  getParseCsvPromise,
  indexGeoProps,
  parsePbfData
} from '../utils';
import { useGeoda } from '../contexts/Geoda';
import * as Pbf from 'pbf';
import * as Schemas from '../schemas';
import { useDataStore } from '../contexts/Data';

const dateLists = getDateLists();

const fetchFile = (fileInfo) => {
  const {
    name,
    filetype,
    timespan,
    date
  } = fileInfo; 
  if (!name || !filetype) return () => [];
  if (filetype === 'pbf') {
    return fetch(`${process.env.PUBLIC_URL}/pbf/${name}${timespan ? `.${timespan}` : ''}.pbf`)
        .then((r) => r.arrayBuffer())
        .then((ab) => new Pbf(ab))
        .then((pbf) => Schemas.Rows.read(pbf))
        .then((pbfData) =>
          parsePbfData(pbfData, fileInfo, dateLists[date]),
        )
  }
  return getParseCsvPromise(fileInfo, dateLists[date]);
}

const fetcher = async (filesToFetch=[]) => filesToFetch.length ? await Promise.allSettled(filesToFetch.map(file => fetchFile(file))) : () => [];

// fetch params spec
// {
//   file: 'covid_confirmed_usafacts.latest.pbf',
//   name: '',
//    type:'pbf',
//  timespan: 'latest'
// dates: 'ISO' or 'US'
// accumulate: yeah or nea
// }

function useGetTable({
  filesToFetch = [],
  shouldFetch = false,
  storedData = {},
  dataDispatch = () => {},
}) {
  useEffect(() => {
    if (shouldFetch) {
      fetcher(filesToFetch).then(dataArray => {
        if (dataArray.length) {
          dataArray.forEach(({value: newData}, idx) => {
            if (!storedData[filesToFetch[idx]?.name] || (!!storedData[filesToFetch[idx]?.name] && !storedData[filesToFetch[idx]?.name]?.loaded?.includes(filesToFetch[idx]?.timespan))) {
              dataDispatch({
                type: 'RECONCILE_TABLE',
                payload: {
                  name: filesToFetch[idx].name,
                  newData,
                  timespan: filesToFetch[idx].timespan
                }
              })
            }
          })
        }
      }).catch(() => console.log('error fetching table'));
    }
  }, [shouldFetch, JSON.stringify(filesToFetch)]);

  const returnData = storedData[filesToFetch[0]?.name]
  const dataReady = filesToFetch.length && filesToFetch.every(({name, timespan}) => storedData[name] && storedData[name]?.loaded?.includes(timespan))
  const error = false
  return [returnData, dataReady, error];
}

function useGetGeojson({
  geoda = {},
  geodaReady = false,
  currDataset = {},
  storedGeojson = {},
  dataDispatch = () => {},
}) {
  useMemo(async () => {
    
    if (!geodaReady) return;
    if (storedGeojson[currDataset.file]) {
      return storedGeojson[currDataset.file];
    } else {
      const [mapId, data] = await geoda.loadGeoJSON(
        `${process.env.PUBLIC_URL}/geojson/${currDataset.file}`,
        currDataset.join,
      );

      const properties = indexGeoProps(data, currDataset.join);

      const order = getIdOrder(data?.features || [], currDataset.join);

      dataDispatch({
        type: 'LOAD_GEOJSON',
        payload: {
          [currDataset.file]: {
            data,
            mapId,
            weights: {},
            properties,
            order,
          }
        }})
    }
  }, [JSON.stringify(currDataset), geodaReady]);

  if (!geodaReady){
    return [
      {}, // data
      false, // data ready
      undefined, // error
    ];
  }

  return [
    storedGeojson[currDataset.file], // data
    storedGeojson[currDataset.file] &&
    storedGeojson[currDataset.file].data &&
    storedGeojson[currDataset.file].mapId &&
    true, // data ready
    undefined, // error
  ];
}

function useBackgroundLoadData({
  currentGeography='',
  shouldFetch=false,
  tables=[],
  storedData={},
  dataDispatch=()=>{},
  currTimespans=['latest']
}){  
  const filesToFetch = currTimespans.map(timespan => 
    findAllDefaults(tables, currentGeography)
      .map(dataspec => ({...dataspec, timespan}))
      .filter(filesToFetch => !(storedData[filesToFetch.name] && storedData[filesToFetch.name].loaded?.includes(filesToFetch.timespan)))
    ).flat().filter(f => f.timespan !== false);
  // console.log(filesToFetch)
  useEffect(() => {
    if (shouldFetch && filesToFetch.length) {
      fetcher([filesToFetch[0]]).then(dataArray => {
        if (dataArray.length) {
          dataArray.forEach((response, idx) => {
            const newData = response.value;
            if (!(storedData[filesToFetch[idx]?.name] && storedData[filesToFetch[idx]?.name][filesToFetch[idx]?.loaded?.includes(filesToFetch[idx]?.timespan)])) {
              if (newData && newData.data) {
                dataDispatch({
                  type: 'RECONCILE_TABLE',
                  payload: {
                    name: filesToFetch[idx].name,
                    newData,
                    timespan: filesToFetch[idx].timespan
                  }
                })
              } else if (response.status === 'rejected') {
                dataDispatch({
                  type: 'RECONCILE_TABLE',
                  payload: {
                    name: filesToFetch[idx].name,
                    newData:{},
                    error:true,
                    timespan: filesToFetch[idx].timespan
                  }
                })
              }
              
            }
          })
        }
      })
    }
  }, [shouldFetch, JSON.stringify(filesToFetch)]);
};

function getFetchParams({
  dataParams,
  currDataset,
  tables,
  predicate,
  dateList,
  currTimespans
}){
  const tableName = dataParams[predicate] 
  
  if (tableName === 'properties') {
    return [{
      noFile: true
    }]
  }
  
  return currTimespans.filter(t => !!t).map(timespan => ({
    ...findTableOrDefault(currDataset, tables, tableName),
    timespan
  }))
}

const findSecondaryMonth = (
  index,
  dateList
) => {
  const date = new Date(dateList[index]).getDate();
  if (date > 8 && date < 19) return false
  if (date < 8) return dateList[index-14]?.slice(0,7)
  if (date > 19) return dateLists[index+14]?.slice(0,7)
  return false
};

export default function useLoadData() {
  // pieces of redux state
  const dispatch = useDispatch();
  const dataParams = useSelector((state) => state.dataParams);
  const currentData = useSelector((state) => state.currentData);
  const datasets = useSelector((state) => state.datasets);
  const tables = useSelector((state) => state.tables);
  const [firstLoad, setFirstLoad] = useState(true);

  // current state data params
  const currDataset = findIn(datasets, 'file', currentData)
  const currIndex = dataParams.nIndex||dataParams.dIndex
  const currTimespans = [
    (!currIndex || dateLists.isoDateList.length - currIndex < 45 ) ? 'latest' : dateLists.isoDateList[currIndex]?.slice(0,7),
    (!currIndex || dateLists.isoDateList.length - currIndex < 45 ) 
      ? false 
      : findSecondaryMonth(currIndex, dateLists.isoDateList)
  ]

  const {
    geoda,
    geodaReady
  } = useGeoda();
  const [{
    storedData,
    storedGeojson,
    dotDensityData,
    resourceLayerData
  }, dataDispatch] = useDataStore();
  

  const numeratorParams = getFetchParams({
    dataParams,
    tables,
    currDataset,
    predicate: 'numerator',
    dateList: dateLists['isoDateList'],
    currTimespans
  })
  
  const denominatorParams = getFetchParams({
    dataParams,
    tables,
    currDataset,
    predicate: 'denominator',
    dateList: dateLists['isoDateList'],
    currTimespans
  })
  
  const [numeratorData, numeratorDataReady, numeratorDataError] = useGetTable({
    filesToFetch: numeratorParams,
    shouldFetch: true,
    storedData,
    dataDispatch,
  });

  const [denominatorData, denominatorDataReady, denominatorDataError] =
    useGetTable({
      filesToFetch: denominatorParams,
      shouldFetch: true,
      storedData,
      dataDispatch,
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
    if (firstLoad && numeratorData && numeratorData.dates.slice(-1)[0]){
      dispatch({
        type: 'SET_DATA_PARAMS',
        payload: {
          nIndex: numeratorData.dates.slice(-1)[0]
        }
      })
      setFirstLoad(false)
    }
  },[numeratorData && numeratorData.dates.slice(-1)[0]])

  const backgroundLoading = useBackgroundLoadData({
    currentGeography: currDataset.geography,
    tables,
    shouldFetch: !!numeratorDataReady && !!denominatorDataReady && !!geojsonDataReady,
    storedData,
    dataDispatch,
    currTimespans
  })
  
  return {
    geojsonData,
    numeratorData,
    denominatorData,
    dateIndices,
    dataReady: !!numeratorDataReady && !!denominatorDataReady && !!geojsonDataReady,
  };
}