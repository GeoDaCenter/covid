
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useMemo, useContext } from 'react';
import { 
  getParseCSV, parsePbfData, getDateLists, indexGeoProps, getIdOrder } from '../utils'; //getVarId
// Main data loader
// This functions asynchronously accesses the Geojson data and CSVs
//   then performs a join and loads the data into the store
import useSWR from 'swr'
import { addGeojson } from '../actions';
import { GeoDaContext } from '../contexts/GeoDaContext';
import * as Pbf from 'pbf';
import * as Schemas from '../schemas';

const dateLists = getDateLists();

const handleFetcher = (fileInfo) => {
  if (!fileInfo.file) return () => {};
  if (fileInfo.file.slice(-4,) === '.pbf') {
    return () => fetch(`${process.env.PUBLIC_URL}/pbf/${fileInfo.file}`).then(r => r.arrayBuffer()).then(ab => new Pbf(ab)).then(pbf => Schemas.Rows.read(pbf)).then(pbfData => parsePbfData(pbfData, fileInfo, dateLists[fileInfo.dates]))
  }
  return fileInfo => getParseCSV(fileInfo, dateLists[fileInfo.dates])
}   

function useGetTable({
  fetchParams={},
  shouldFetch=false,
  storedData={},
  dispatch=()=>{}
}) {
  const fetcher = handleFetcher(fetchParams)

  const fetchResponse = useSWR(shouldFetch && !storedData[fetchParams.file] ? fetchParams.file : null, fetcher)

  const data = storedData[fetchParams.file] || fetchResponse.data;
  const error = fetchResponse.error;

  useEffect(() => {
    if(data && !error && !storedData[fetchParams.file]){
        dispatch({
        type:'RECONCILE_TABLES',
        payload: {
          data: {
            [fetchParams.file]: data
          }
        }
      })
    }
  },[JSON.stringify(data?.columns)])

  if (fetchParams.noFile) return [{},true,{}]
  if (error || !data) return [data,false,error]
  return [data,true,error]
}

function useGetGeojson({
  geoda={},
  datasetParams={},
  storedGeojson={},
  dispatch=()=>{}
}){
  
  useMemo(async () => {
    if (storedGeojson[datasetParams.file]) {
      return storedGeojson[datasetParams.file]
    } else {
      const [
        mapId,
        data
      ] = await geoda.loadGeoJSON(`${process.env.PUBLIC_URL}/geojson/${datasetParams.geojson}`, datasetParams.id)

      const properties = indexGeoProps(
        data,
        datasetParams.id
      )
      
      const order = getIdOrder(
        data?.features || [],
        datasetParams.id
      )

      dispatch(addGeojson({[datasetParams.geojson]:{
        data,
        mapId,
        weights:{},
        properties,
        order
      }}))
    }
  },[JSON.stringify(datasetParams), typeof geoda])
  
  return [
    storedGeojson[datasetParams.geojson],
    (storedGeojson[datasetParams.geojson] && storedGeojson[datasetParams.geojson].data && storedGeojson[datasetParams.geojson].mapId) && true, 
    undefined // error
  ]
}

export default function useLoadData(){
  const dataParams = useSelector(state => state.dataParams);
  const currentData = useSelector(state => state.currentData);
  const storedData = useSelector(state => state.storedData);
  const storedGeojson = useSelector(state => state.storedGeojson);
  const dataPresets = useSelector((state) => state.dataPresets);
  const defaultTables = useSelector((state) => state.defaultTables);
  const dispatch = useDispatch();
  const geoda = useContext(GeoDaContext);

  const datasetParams = dataPresets[currentData];

  const firstLoadParams = {
    numerator: datasetParams.tables[dataParams.numerator]||defaultTables[dataParams.numerator],
    denominator: dataParams.denominator !== 'properties' ? datasetParams.tables[dataParams.denominator]||defaultTables[dataParams.denominator] : {noFile: true},
  }

  const [
    numeratorData,
    numeratorDataReady,
    numeratorDataError
  ] = useGetTable({
    fetchParams: firstLoadParams.numerator,
    shouldFetch: true,
    storedData,
    dispatch
  })

  const [
    denominatorData,
    denominatorDataReady,
    denominatorDataError
  ] = useGetTable({
    fetchParams: firstLoadParams.denominator,
    shouldFetch: true,
    storedData,
    dispatch
  })

  const [
    geojsonData,
    geojsonDataReady,
    geojsonDataError
  ] = useGetGeojson({
    geoda,
    datasetParams,
    storedGeojson,
    dispatch
  })
  
  const dateIndices = numeratorData ? numeratorData.dates : null;

  return {
    geojsonData,
    numeratorData,
    denominatorData,
    dateIndices,
    dataReady: numeratorDataReady && denominatorDataReady && geojsonDataReady
  }
}



// dispatch(
//   initialDataLoad({
//     storedData: {
//       [numeratorParams && numeratorParams.file]:numeratorData,
//       [denominatorParams && denominatorParams.file]:denominatorParams,
//     },
//     currentData: datasetParams.geojson,
//     currentTable: {
//       numerator:dataParams.numerator === 'properties' ? 'properties' : numeratorParams.file,
//       denominator:dataParams.denominator === 'properties' ? 'properties' : denominatorParams.file
//     },
//     storedGeojson: {
//       [datasetParams.geojson]:{
//         weights:{},
//         properties: geojsonProperties,
//         indices: geojsonOrder,
//         mapId,
//         data: geojsonData
//       }
//     },
//     mapParams: {
//       bins,
//       colorScale: mapParams.mapType === 'natural_breaks' ? colorScales[dataParams.colorScale || mapParams.mapType] : colorScales[mapParams.mapType || dataParams.colorScale ]
//     },
//     variableParams: {
//       nIndex: dateIndices?.indexOf(dataParams.nIndex) === -1 ? binIndex : dataParams.nIndex,
//     },
//     dates: dateLists.isoDateList,
//     storedLisaData: lisaData,
//     storedCartogramData: cartogramData
//   })
// )
// setIsInProcess(false)
// return [numeratorParams.file, denominatorParams && denominatorParams.file, mapId]
// },[currentData])


  // const secondLoad = useMemo(() => async (datasetParams, defaultTables, loadedTables, mapId) => {
  //   if (geoda === undefined) return;
  //   setIsInProcess(true);

  //   const defaultChartTable = defaultTables[chartParams.table]
  //   const currCaseData = dataPresets[currentData].hasOwnProperty('tables') ? dataPresets[currentData].tables[chartParams.table]||defaultChartTable : defaultChartTable;

  //   if (storedData.hasOwnProperty(currCaseData?.file) || loadedTables.indexOf(currCaseData?.file) !== -1){
  //     dispatch(updateChart());
  //   } else {
  //     const table = await handleLoadData(currCaseData);
  //     dispatch(addTableAndChart({
  //       [currCaseData.file]: table
  //     }))
  //   }
    
  //   const filesToLoad = [
  //     ...Object.values(datasetParams.tables),
  //     ...Object.values(defaultTables)
  //   ]

  //   const tablePromises = filesToLoad.map(table => Object.keys(storedData).includes(table.file) ? null : handleLoadData(table))
  //   const fetchedData = await Promise.all(tablePromises)
  //   let dataObj = {}
  //   for (let i=0; i<filesToLoad.length; i++){
  //     if (loadedTables.includes(filesToLoad[i].file)) {
  //       continue
  //     } else {
  //       dataObj[filesToLoad[i].file] = fetchedData[i]
  //     }
  //   }
  //   dispatch(addTables(dataObj))
  //   setIsInProcess(false)
  //   return [datasetParams.geojson, mapId]
  // }, [currentData])
  
  // const lazyFetchData = useMemo(() => async (dataPresets, loadedTables) => {
  //   const loadedGeojsons = Object.keys(storedGeojson)
  //   const geojsonFiles = Object.keys(dataPresets)

  //   for (let i=0; i<geojsonFiles.length;i++){
  //     if (isInProcess) return;
  //     const file = geojsonFiles[i];
  //     if (!loadedTables.includes(file) && !loadedGeojsons.includes(file) && !(currentData === file)){
  //       const geojsonData = await geoda.loadGeoJSON(`${process.env.PUBLIC_URL}/geojson/${file}`)
  //       dispatch(addGeojson({[file]:geojsonData}))
  //     }
  //   }

  //   const allLoadedTables = [...loadedTables, ...Object.keys(storedData)]
  //   let tableFiles = []
  //   for (let i=0; i<geojsonFiles.length; i++){
  //     for (const table in dataPresets[geojsonFiles[i]].tables){
  //       tableFiles.push(dataPresets[geojsonFiles[i]].tables[table])
  //     }
  //   }
    
  //   for (let i=0; i<tableFiles.length; i++){
  //     if (isInProcess) return;
  //     const fileInfo = tableFiles[i];
  //     if (!allLoadedTables.includes(fileInfo.file)){
  //       const tableData = await handleLoadData(fileInfo)
  //       dispatch(addTables({[fileInfo.file]:tableData}))
  //     }
  //   }
  //   return true

  // }, [currentData])

  // const lazyGenerateWeights = useMemo(() => async (geojsonFile, geojsonId) => {
  //   if (storedGeojson[geojsonFile] && 'Queen' in storedGeojson[geojsonFile].weights){
  //     return;
  //   } else {
  //     let weights = await geoda.getQueenWeights(geojsonId);
  //     dispatch(addWeights(geojsonFile, weights))
  //   }

  // }, [currentData])


  

// // const lisaData = mapParams.mapType === 'lisa' ? await getLisaValues(datasetParams.geojson, binData, mapId) : null;  
// // const cartogramData = mapParams.vizType === 'cartogram' ? await getCartogramValues(mapId, binData) : null;

// const getLisaValues = async (currentData, dataForLisa, mapId) => {
// const weights = storedGeojson[currentData] && 'Queen' in storedGeojson[currentData].weights ? storedGeojson[currentData].Weights.Queen : await geoda.getQueenWeights(mapId);
// const lisaValues = await geoda.localMoran(weights, dataForLisa);  
// return lisaValues.clusters
// }

// const getCartogramValues = async (mapId, dataForCartogram) => {
// let cartogramData = await geoda.cartogram(mapId, dataForCartogram);
// let tempArray = new Array(cartogramData.length)
// for (let i=0; i<cartogramData.length; i++){
//     cartogramData[i].value = dataForCartogram[i]
//     tempArray[i] = cartogramData[i]
// };
// return tempArray
// }
