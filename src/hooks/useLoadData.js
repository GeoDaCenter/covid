import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import {
  findAllDefaults,
  findIn,
  getDateLists,
  getIdOrder,
  getParseCSV,
  getParseCsvPromise,
  indexGeoProps,
  parsePbfData
} from '../utils'; //getVarId
// Main data loader
// This functions asynchronously accesses the Geojson data and CSVs
//   then performs a join and loads the data into the store
import { useGeoda } from '../contexts/Geoda';
import * as Pbf from 'pbf';
import * as Schemas from '../schemas';
import { useDataStore } from '../contexts/Data';
import { findTableOrDefault } from '../utils';

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
        );
  }
  return getParseCsvPromise(fileInfo, dateLists[date]);
}

const fetcher = async (filesToFetch=[]) => filesToFetch.length ? await Promise.all(filesToFetch.map(file => fetchFile(file))) : () => [];

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
      {},
      false,
      undefined, // error
    ];
  }

  return [
    storedGeojson[currDataset.file],
    storedGeojson[currDataset.file] &&
    storedGeojson[currDataset.file].data &&
    storedGeojson[currDataset.file].mapId &&
    true,
    undefined, // error
  ];
}

function useBackgroundLoadData({
  currentGeography='',
  shouldFetch=false,
  tables=[],
  storedData={},
  dataDispatch=()=>{},
  currTimespan='latest'
}){  
  const filesToFetch = findAllDefaults(tables, currentGeography).map(dataspec => ({...dataspec, timespan: currTimespan})).filter(filesToFetch => !(storedData[filesToFetch.name] && storedData[filesToFetch.name].loaded?.includes(filesToFetch.timespan)));
  useEffect(() => {
    if (shouldFetch && filesToFetch.length) {
      console.log(filesToFetch[0])
      fetcher([filesToFetch[0]]).then(dataArray => {
        if (dataArray.length) {
          dataArray.forEach((newData, idx) => {
            console.log('loaded ' + filesToFetch[0].name, newData)
            if (newData && newData.data && !(storedData[filesToFetch[idx]?.name] && storedData[filesToFetch[idx]?.name][filesToFetch[idx]?.loaded?.includes(filesToFetch[idx]?.timespan)])) {
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

}

function getFetchParams({
  dataParams,
  currDataset,
  tables,
  predicate,
  dateList,
  currTimespan
}){
  const tableName = dataParams[predicate] 
  const eitherIndex = dataParams.nIndex||dataParams.dIndex
  if (tableName === 'properties') {
    return [{
      noFile: true
    }]
  }
  return [{
    ...findTableOrDefault(currDataset, tables, tableName),
    timespan: currTimespan
  }]
}

export default function useLoadData() {
  // pieces of redux state
  const dataParams = useSelector((state) => state.dataParams);
  const currentData = useSelector((state) => state.currentData);
  const datasets = useSelector((state) => state.datasets);
  const tables = useSelector((state) => state.tables);

  // current state data params
  const currDataset = findIn(datasets, 'file', currentData)
  const currTimespan = (!(dataParams.nIndex||dataParams.dIndex) || dateLists.isoDateList.length - (dataParams.nIndex||dataParams.dIndex) < 45 ) ? 'latest' : dateLists.isoDateList[(dataParams.nIndex||dataParams.dIndex)]?.slice(0,7)


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
    currTimespan
  })
  
  const denominatorParams = getFetchParams({
    dataParams,
    tables,
    currDataset,
    predicate: 'denominator',
    dateList: dateLists['isoDateList'],
    currTimespan
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

  const backgroundLoading = useBackgroundLoadData({
    currentGeography: currDataset.geography,
    tables,
    shouldFetch: !!numeratorDataReady && !!denominatorDataReady && !!geojsonDataReady,
    storedData,
    dataDispatch,
    currTimespan
  })
  
  return {
    geojsonData,
    numeratorData,
    denominatorData,
    dateIndices,
    dataReady: !!numeratorDataReady && !!denominatorDataReady && !!geojsonDataReady,
  };
}