import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import {
  getParseCSV,
  parsePbfData,
  getDateLists,
  indexGeoProps,
  getIdOrder,
} from '../utils'; //getVarId
// Main data loader
// This functions asynchronously accesses the Geojson data and CSVs
//   then performs a join and loads the data into the store
// import useSWR from 'swr';
import { useGeoda } from '../contexts/Geoda';
import * as Pbf from 'pbf';
import * as Schemas from '../schemas';
import { useDataStore } from '../contexts/Data';

const dateLists = getDateLists();

const fetchFile = (fileInfo) => {
  const {
    name,
    type,
    timespan,
    dates
  } = fileInfo; 
  if (!name || !type || !timespan) return () => {};
  if (type === 'pbf') {
    return () =>
      fetch(`${process.env.PUBLIC_URL}/pbf/${name}.${timespan}.pbf`)
        .then((r) => r.arrayBuffer())
        .then((ab) => new Pbf(ab))
        .then((pbf) => Schemas.Rows.read(pbf))
        .then((pbfData) =>
          parsePbfData(pbfData, fileInfo, dateLists[dates]),
        );
  }
  return (fileInfo) => getParseCSV(fileInfo, dateLists[dates]);
}

const fetcher = async (filesToFetch=[]) => filesToFetch.length ? Promise.all(filesToFetch.map(fetchFile)) : () => [];

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
          dataArray.forEach((newData, idx) => {
            if (!(storedData[filesToFetch[idx]?.name] && storedData[filesToFetch[idx]?.name][filesToFetch[idx]?.loaded?.includes(filesToFetch[idx]?.timespan)])) {
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
      })
    }
  }, [shouldFetch, JSON.stringify(filesToFetch)]);

  const returnData = storedData[filesToFetch[0]?.name]
  console.log(filesToFetch)
  const dataReady = filesToFetch.every(({name, timespan}) => storedData[name] && storedData[name]?.loaded?.includes(timespan))
  const error = false
  return [returnData, dataReady, error];
}

function useGetGeojson({
  geoda = {},
  geodaReady = false,
  datasetParams = {},
  storedGeojson = {},
  dataDispatch = () => {},
}) {
  useMemo(async () => {
    
    if (!geodaReady) return;
    if (storedGeojson[datasetParams.file]) {
      return storedGeojson[datasetParams.file];
    } else {
      const [mapId, data] = await geoda.loadGeoJSON(
        `${process.env.PUBLIC_URL}/geojson/${datasetParams.geojson}`,
        datasetParams.id,
      );

      const properties = indexGeoProps(data, datasetParams.id);

      const order = getIdOrder(data?.features || [], datasetParams.id);

      dataDispatch({
        type: 'LOAD_GEOJSON',
        payload: {
          [datasetParams.geojson]: {
            data,
            mapId,
            weights: {},
            properties,
            order,
          }
        }})
    }
  }, [JSON.stringify(datasetParams), geodaReady]);

  if (!geodaReady){
    return [
      {},
      false,
      undefined, // error
    ];
  }

  return [
    storedGeojson[datasetParams.geojson],
    storedGeojson[datasetParams.geojson] &&
    storedGeojson[datasetParams.geojson].data &&
    storedGeojson[datasetParams.geojson].mapId &&
    true,
    undefined, // error
  ];
}

// function useBackgroundLoadData({
//   currentGeography='',
//   shouldFetch=false,
//   defaultTables={currentGeography:{}},
//   loadedTables=[],
//   dataDispatch=()=>{},
// }){  
//   const fetchParams = defaultTables[currentGeography] ? Object.values(defaultTables[currentGeography]).filter(f => loadedTables.indexOf(f.file) === -1)[0] : false;
//   const controller = new AbortController()
//   const fetcher = handleFetcher(!!fetchParams ? fetchParams : {}, controller.signal);
//   const { data, error } = useSWR(
//     shouldFetch && !!fetchParams ? fetchParams.file : null,
//     fetcher,
//   );
  
//   useEffect(() => {
//     if (!shouldFetch) {
//       try {
//         controller.abort()
//       } catch(e){
//         console.log(e)
//       }
//     }
//   },[shouldFetch])

//   useEffect(() => {
//     if (data && !error && !loadedTables.includes(fetchParams.file)) {
//       dataDispatch({
//         type: 'RECONCILE_TABLES',
//         payload: {
//           data: {
//             [fetchParams.file]: data,
//           },
//         },
//       });
//     }
//   }, [JSON.stringify(data?.columns)]);

// }
function getFetchParams({
  dataParams,
  datasetParams,
  defaultTables,
  predicate,
  dateList
}){
  const tableName = dataParams[predicate] 
  const eitherIndex = dataParams.nIndex||dataParams.dIndex
  if (tableName === 'properties') {
    return {
      noFile: true
    }
  }
  return {
    ...(datasetParams?.tables[tableName]||defaultTables[tableName]),
    timespan: (!eitherIndex || dateList?.length - eitherIndex < 45 ) ? 'latest' : dateList[eitherIndex]?.slice(0,7)
  }
}

export default function useLoadData() {
  const dataParams = useSelector((state) => state.dataParams);
  const currentData = useSelector((state) => state.currentData);
  const dataPresets = useSelector((state) => state.dataPresets);
  const defaultTables = useSelector((state) => state.defaultTables);

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
  
  const datasetParams = dataPresets[currentData];

  const numeratorParams = getFetchParams({
    dataParams,
    datasetParams,
    defaultTables,
    predicate: 'numerator',
    dateList: dateLists['isoDateList']
  })
  
  const denominatorParams = getFetchParams({
    dataParams,
    datasetParams,
    defaultTables,
    predicate: 'denominator',
    dateList: dateLists['isoDateList']
  })
  console.log(numeratorParams, denominatorParams)
  
  const [numeratorData, numeratorDataReady, numeratorDataError] = useGetTable({
    fetchParams: numeratorParams,
    shouldFetch: true,
    storedData,
    dataDispatch,
  });

  const [denominatorData, denominatorDataReady, denominatorDataError] =
    useGetTable({
      fetchParams: denominatorParams,
      shouldFetch: true,
      storedData,
      dataDispatch,
    });

  const [geojsonData, geojsonDataReady, geojsonDataError] = useGetGeojson({
    geoda,
    geodaReady,
    datasetParams,
    storedGeojson,
    dataDispatch,
  });

  const dateIndices = numeratorData ? numeratorData.dates : null;

  // const backgroundLoading = useBackgroundLoadData({
  //   currentGeography: dataPresets[currentData].geography,
  //   defaultTables,
  //   shouldFetch: !!numeratorDataReady && !!denominatorDataReady && !!geojsonDataReady,
  //   loadedTables: Object.keys(storedData),
  //   dataDispatch
  // })
  
  return {
    geojsonData,
    numeratorData,
    denominatorData,
    dateIndices,
    dataReady: !!numeratorDataReady && !!denominatorDataReady && !!geojsonDataReady,
  };
}