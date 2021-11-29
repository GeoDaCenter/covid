
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useMemo, useContext } from 'react';
import { 
  getParseCSV, getParsePbf, getDataForBins, getDateLists, indexGeoProps, getIdOrder } from '../utils'; //getVarId
// Main data loader
// This functions asynchronously accesses the Geojson data and CSVs
//   then performs a join and loads the data into the store
import useSWR from 'swr'
import { 
  initialDataLoad, addWeights, addTables, addGeojson, updateMap, updateChart, addTableAndChart, setIsLoading } from '../actions';

import { colorScales, fixedScales } from '../config';
import { GeoDaContext } from '../contexts/GeoDaContext';
import * as Pbf from 'pbf';
import * as Schemas from '../schemas';

const dateLists = getDateLists();
const handleLoadData = (fileInfo) => !fileInfo.file ? () => {} : fileInfo.file.slice(-4,) === '.pbf' ? getParsePbf(fileInfo, dateLists[fileInfo.dates]) : getParseCSV(fileInfo, dateLists[fileInfo.dates])
const handleFetcher = (fileInfo) => !fileInfo.file ? () => {} : 
  fileInfo.file.slice(-4,) === '.pbf' 
    ? file => fetch(`${process.env.PUBLIC_URL}/pbf/${file}`).then(r => r.arrayBuffer()).then(ab => new Pbf(ab)).then(pbf => Schemas.Rows.read(pbf))
    : file => fetch(`${process.env.PUBLIC_URL}/csv/${file}.csv`).then(response => {return response.ok ? response.text() : Promise.reject(response.status)})

function useSwrOuter({
  fetchParams={},
  shouldFetch=false
}) {
  const fetcher = handleFetcher(fetchParams)
  const { data, error } = useSWR(shouldFetch ? fetchParams.file : '', fetcher)

  if (fetchParams.noFile) {
    return [
      {},
      true,
      {}
    ]
  }
  if (error || !data) return [
    data,
    false, // dataReady
    error
  ]
  
  return [
    data,
    true, // dataReady
    error
  ]
}

function useLoadGeojson({
  geoda={},
  datasetParams={}
}){
  const [data, setData] = useState(null)

  useEffect(() => {
    if (geoda) geoda.loadGeoJSON(`${process.env.PUBLIC_URL}/geojson/${datasetParams.geojson}`, datasetParams.id).then(data => setData(data))
  },[JSON.stringify(datasetParams), JSON.stringify(Object.keys(geoda))])

  return [
    !!data ? {
      id: data[0],
      geojson: data[1]
    } : {id:null, geojson:null},
    !!data,
    {}
  ]
}

const getAsyncBins = async (geoda, mapParams, binData) => mapParams.mapType === "natural_breaks" ? 
  await geoda.naturalBreaks(mapParams.nBins, binData) :
  await geoda.hinge15Breaks(binData)  

function useGetBins({
  mapParams,
  dataParams,
  binData,
  geoda
}){
  const [bins, setBins] = useState({})
  useEffect(() => {
    if (geoda && binData) {
      if (mapParams.mapType === 'lisa') {
        setBins(fixedScales['lisa'])
      } else if (dataParams.fixedScale !== null && dataParams.fixedScale !== undefined) {
        setBins(fixedScales[dataParams.fixedScale])
      } else {
        // calculate breaks
        getAsyncBins(geoda, mapParams, binData)
          .then(nb => setBins({
            bins: mapParams.mapType === "natural_breaks" ? nb : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
            breaks: nb
          }))
      }
    }
  },[])
  return bins
}
export default function useLoadData(){
  const dataParams = useSelector(state => state.dataParams);
  const mapParams = useSelector(state => state.mapParams);
  const currentData = useSelector(state => state.currentData);
  const storedData = useSelector(state => state.storedData);
  const storedGeojson = useSelector(state => state.storedGeojson);
  const chartParams = useSelector(state => state.chartParams);
  const dataPresets = useSelector((state) => state.dataPresets);
  const defaultTables = useSelector((state) => state.defaultTables);
  const dispatch = useDispatch();
  const geoda = useContext(GeoDaContext);
  const [isInProcess, setIsInProcess] = useState(false);

  const datasetParams = dataPresets[currentData];
  const firstLoadParams = {
    numerator: datasetParams.tables[dataParams.numerator]||defaultTables[dataParams.numerator],
    denominator: dataParams.denominator !== 'properties' ? datasetParams.tables[dataParams.denominator]||defaultTables[dataParams.denominator] : {noFile: true},
  }

  const [
    priorityNumeratorData,
    priorityNumeratorDataReady,
    priorityNumeratorDataError
  ] = useSwrOuter({
    fetchParams: firstLoadParams.numerator,
    shouldFetch: true,
  })

  const [
    priorityDenominatorData,
    priorityDenominatorDataReady,
    priorityDenominatorDataError
  ] = useSwrOuter({
    fetchParams: firstLoadParams.denominator,
    shouldFetch: true,
  })

  const [
    priorityGeojsonData,
    priorityGeojsonDataReady,
    priorityGeojsonDataError
  ] = useLoadGeojson({
    geoda,
    datasetParams
  })

  const { id: mapId, geojson: geojsonData } = priorityGeojsonData;

  const geojsonProperties = useMemo(() => indexGeoProps(
    geojsonData,
    datasetParams.id
  ), [mapId, currentData])

  const geojsonOrder = useMemo(() => getIdOrder(
    geojsonData ? geojsonData.features : [],
    datasetParams.id
  ), [mapId, currentData])

  const dateIndices = priorityNumeratorData ? priorityNumeratorData.dates : null;

  const binIndex = dateIndices !== null 
    ? mapParams.binMode === 'dynamic' && dateIndices?.indexOf(dataParams.nIndex) !== -1
    ? dataParams.nIndex 
    : dateIndices.slice(-1)[0] 
    : null;
    
  const binData = useMemo(() => getDataForBins({
    numeratorData:  dataParams.numerator === 'properties' ? geojsonData?.data?.features : priorityNumeratorData?.data, 
    denominatorData: dataParams.denominator === 'properties' ? geojsonProperties : priorityDenominatorData?.data, 
    dataParams: dataParams,//{...dataParams, nIndex: binIndex, dIndex: dataParams.dType === 'time-series' ? binIndex : null},
    fixedOrder: Object.values(geojsonOrder.indexOrder),
    dataReady: priorityNumeratorDataReady && priorityDenominatorDataReady && priorityGeojsonDataReady
  }), [JSON.stringify(dataParams), binIndex, priorityDenominatorDataReady, priorityNumeratorDataReady])
  
  const bins = useGetBins({
    mapParams,
    dataParams,
    binData,
    geoda
  })
  
  // const lisaData = mapParams.mapType === 'lisa' ? await getLisaValues(datasetParams.geojson, binData, mapId) : null;  
  // const cartogramData = mapParams.vizType === 'cartogram' ? await getCartogramValues(mapId, binData) : null;

  const getLisaValues = async (currentData, dataForLisa, mapId) => {
    const weights = storedGeojson[currentData] && 'Queen' in storedGeojson[currentData].weights ? storedGeojson[currentData].Weights.Queen : await geoda.getQueenWeights(mapId);
    const lisaValues = await geoda.localMoran(weights, dataForLisa);  
    return lisaValues.clusters
  }

  const getCartogramValues = async (mapId, dataForCartogram) => {
    let cartogramData = await geoda.cartogram(mapId, dataForCartogram);
    let tempArray = new Array(cartogramData.length)
    for (let i=0; i<cartogramData.length; i++){
        cartogramData[i].value = dataForCartogram[i]
        tempArray[i] = cartogramData[i]
    };
    return tempArray
  }

  const firstLoad = useMemo(() => async (datasetParams, defaultTables) => {
    if (geoda === undefined) return;
    setIsInProcess(true)
    const numeratorParams = datasetParams.tables[dataParams.numerator]||defaultTables[dataParams.numerator]
    const denominatorParams = dataParams.denominator !== 'properties' ? datasetParams.tables[dataParams.denominator]||defaultTables[dataParams.denominator] : null

    if ((storedData.hasOwnProperty(numeratorParams?.file)||dataParams.numerator === 'properties') && (storedData.hasOwnProperty(denominatorParams?.file)||dataParams.denominator !== 'properties')) return [numeratorParams.file, denominatorParams && denominatorParams.file]
    const firstLoadPromises = [
      geoda.loadGeoJSON(`${process.env.PUBLIC_URL}/geojson/${datasetParams.geojson}`, datasetParams.id),
      numeratorParams && handleLoadData(numeratorParams),
      denominatorParams && handleLoadData(denominatorParams)
    ];

    const [
      [mapId, geojsonData], 
      numeratorData, 
      denominatorData
    ] = await Promise.all(firstLoadPromises);

    const geojsonProperties = indexGeoProps(
      geojsonData,
      datasetParams.id
    );

    const geojsonOrder = getIdOrder(
      geojsonData.features,
      datasetParams.id
    );
    
    const dateIndices = numeratorData.dates
    const binIndex = dateIndices !== null 
      ? mapParams.binMode === 'dynamic' && dateIndices?.indexOf(dataParams.nIndex) !== -1
      ? dataParams.nIndex 
      : dateIndices.slice(-1)[0] 
      : null;
    
    let binData = getDataForBins(
      dataParams.numerator === 'properties' ? geojsonData.data.features : numeratorData.data, 
      dataParams.denominator === 'properties' ? geojsonProperties : denominatorData.data, 
      {...dataParams, nIndex: binIndex, dIndex: dataParams.dType === 'time-series' ? binIndex : null},
      Object.values(geojsonOrder.indexOrder)
    );

    let bins;
    
    if (mapParams.mapType === 'lisa') {
      bins = fixedScales['lisa']
    } else if (dataParams.fixedScale !== null && dataParams.fixedScale !== undefined) {
      bins = fixedScales[dataParams.fixedScale]
    } else {
      // calculate breaks
      let nb = mapParams.mapType === "natural_breaks" ? 
        await geoda.naturalBreaks(mapParams.nBins, binData) :
        await geoda.hinge15Breaks(binData)  
        
      bins = {
        bins: mapParams.mapType === "natural_breaks" ? nb : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
        breaks: nb
      }
    }
    
    const lisaData = mapParams.mapType === 'lisa' ? await getLisaValues(datasetParams.geojson, binData, mapId) : null;  
    const cartogramData = mapParams.vizType === 'cartogram' ? await getCartogramValues(mapId, binData) : null;
    
    dispatch(
      initialDataLoad({
        storedData: {
          [numeratorParams && numeratorParams.file]:numeratorData,
          [denominatorParams && denominatorParams.file]:denominatorParams,
        },
        currentData: datasetParams.geojson,
        currentTable: {
          numerator:dataParams.numerator === 'properties' ? 'properties' : numeratorParams.file,
          denominator:dataParams.denominator === 'properties' ? 'properties' : denominatorParams.file
        },
        storedGeojson: {
          [datasetParams.geojson]:{
            weights:{},
            properties: geojsonProperties,
            indices: geojsonOrder,
            mapId,
            data: geojsonData
          }
        },
        mapParams: {
          bins,
          colorScale: mapParams.mapType === 'natural_breaks' ? colorScales[dataParams.colorScale || mapParams.mapType] : colorScales[mapParams.mapType || dataParams.colorScale ]
        },
        variableParams: {
          nIndex: dateIndices?.indexOf(dataParams.nIndex) === -1 ? binIndex : dataParams.nIndex,
        },
        dates: dateLists.isoDateList,
        storedLisaData: lisaData,
        storedCartogramData: cartogramData
      })
    )
    setIsInProcess(false)
    return [numeratorParams.file, denominatorParams && denominatorParams.file, mapId]
  },[currentData])


  const secondLoad = useMemo(() => async (datasetParams, defaultTables, loadedTables, mapId) => {
    if (geoda === undefined) return;
    setIsInProcess(true);

    const defaultChartTable = defaultTables[chartParams.table]
    const currCaseData = dataPresets[currentData].hasOwnProperty('tables') ? dataPresets[currentData].tables[chartParams.table]||defaultChartTable : defaultChartTable;

    if (storedData.hasOwnProperty(currCaseData?.file) || loadedTables.indexOf(currCaseData?.file) !== -1){
      dispatch(updateChart());
    } else {
      const table = await handleLoadData(currCaseData);
      dispatch(addTableAndChart({
        [currCaseData.file]: table
      }))
    }
    
    const filesToLoad = [
      ...Object.values(datasetParams.tables),
      ...Object.values(defaultTables)
    ]

    const tablePromises = filesToLoad.map(table => Object.keys(storedData).includes(table.file) ? null : handleLoadData(table))
    const fetchedData = await Promise.all(tablePromises)
    let dataObj = {}
    for (let i=0; i<filesToLoad.length; i++){
      if (loadedTables.includes(filesToLoad[i].file)) {
        continue
      } else {
        dataObj[filesToLoad[i].file] = fetchedData[i]
      }
    }
    dispatch(addTables(dataObj))
    setIsInProcess(false)
    return [datasetParams.geojson, mapId]
  }, [currentData])
  
  const lazyFetchData = useMemo(() => async (dataPresets, loadedTables) => {
    const loadedGeojsons = Object.keys(storedGeojson)
    const geojsonFiles = Object.keys(dataPresets)

    for (let i=0; i<geojsonFiles.length;i++){
      if (isInProcess) return;
      const file = geojsonFiles[i];
      if (!loadedTables.includes(file) && !loadedGeojsons.includes(file) && !(currentData === file)){
        const geojsonData = await geoda.loadGeoJSON(`${process.env.PUBLIC_URL}/geojson/${file}`)
        dispatch(addGeojson({[file]:geojsonData}))
      }
    }

    const allLoadedTables = [...loadedTables, ...Object.keys(storedData)]
    let tableFiles = []
    for (let i=0; i<geojsonFiles.length; i++){
      for (const table in dataPresets[geojsonFiles[i]].tables){
        tableFiles.push(dataPresets[geojsonFiles[i]].tables[table])
      }
    }
    
    for (let i=0; i<tableFiles.length; i++){
      if (isInProcess) return;
      const fileInfo = tableFiles[i];
      if (!allLoadedTables.includes(fileInfo.file)){
        const tableData = await handleLoadData(fileInfo)
        dispatch(addTables({[fileInfo.file]:tableData}))
      }
    }
    return true

  }, [currentData])

  const lazyGenerateWeights = useMemo(() => async (geojsonFile, geojsonId) => {
    if (storedGeojson[geojsonFile] && 'Queen' in storedGeojson[geojsonFile].weights){
      return;
    } else {
      let weights = await geoda.getQueenWeights(geojsonId);
      dispatch(addWeights(geojsonFile, weights))
    }

  }, [currentData])

  // On initial load and after geoda has been initialized, this loads in the default data sets (USA Facts)
  // Otherwise, this side-effect loads the selected data.
  // Each conditions checks to make sure geoda is working.

  // useEffect(() => {
  //   if (geoda !== undefined){
  //     if (!storedGeojson[currentData]) {
  //       dispatch(setIsLoading())
  //       firstLoad(dataPresets[currentData], defaultTables[dataPresets[currentData]['geography']])
  //         .then(primaryTables => {
  //           if (primaryTables !== undefined) dispatch(updateMap());
  //           return primaryTables
  //         }).then(primaryTables => {
  //           return secondLoad(dataPresets[currentData], defaultTables[dataPresets[currentData]['geography']], [...Object.keys(storedData), ...primaryTables.slice(0,-1)], primaryTables.slice(-1,)[0])
  //         }).then(geojsonToLoad => {
  //           lazyGenerateWeights(geojsonToLoad[0], geojsonToLoad[1])
  //         })
  //     } else {
  //       dispatch(updateChart());
  //       dispatch(updateMap());
  //     }
  //   }
  // },[currentData, geoda])

  return [
    firstLoad,
    secondLoad,
    lazyFetchData
  ]
}