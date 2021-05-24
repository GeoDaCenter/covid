
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useMemo } from 'react';
import { 
  getParseCSV, getParsePbf, mergeData, getColumns, loadJson,
  getDataForBins, getDataForCharts, getDataForLisa, getDateLists,
  getLisaValues, getCartogramValues, getDateIndices } from '../utils'; //getVarId
// Main data loader
// This functions asynchronously accesses the Geojson data and CSVs
//   then performs a join and loads the data into the store

import { 
  initialDataLoad, addTables, addGeojson, dataLoad, dataLoadExisting, storeLisaValues, storeCartogramData, setDates, setNotification,
  setMapParams, setUrlParams, setPanelState, updateMap, updateChart, addTableAndChart } from '../actions';

import { colorScales, fixedScales, dataPresets, defaultTables, dataPresetsRedux, variablePresets, colors } from '../config';

const dateLists = getDateLists();
const handleLoadData = (fileInfo) => fileInfo.file.slice(-4,) === '.pbf' ? getParsePbf(fileInfo, dateLists[fileInfo.dates]) : getParseCSV(fileInfo, dateLists[fileInfo.dates])

export default function useLoadData(gdaProxy){
  
  const dataParams = useSelector(state => state.dataParams);
  const mapParams = useSelector(state => state.mapParams);
  const currentData = useSelector(state => state.currentData);
  const storedData = useSelector(state => state.storedData);
  const storedGeojson = useSelector(state => state.storedGeojson);
  const chartParams = useSelector(state => state.chartParams);

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isInProcess, setIsInProcess] = useState(false);
  const [lazyFetched, setLazyFetched] = useState(false);

  const getLisaValues = async (geojsonData, currentData, dataParams, numeratorTable, denominatorTable) => {
    const dataForLisa = getDataForBins(
      dataParams.numerator === 'properties' ? geojsonData.properties : numeratorTable, 
      dataParams.denominator === 'properties' ? geojsonData.properties : denominatorTable, 
      dataParams,
      Object.values(geojsonData.indices.indexOrder)
    );
    const weight_uid = 'Queen' in gdaProxy.geojsonMaps[currentData] ? gdaProxy.geojsonMaps[currentData].Queen : await gdaProxy.CreateWeights.Queen(currentData);
    const lisaValues = await gdaProxy.Cluster.LocalMoran(currentData, weight_uid, dataForLisa);  
    return lisaValues.clusters
  }

  const firstLoad = useMemo(() => async (datasetParams, defaultTables) => {
    setIsInProcess(true)
    if (!gdaProxy.ready) await gdaProxy.init()  
    const numeratorParams = datasetParams.tables[dataParams.numerator]||defaultTables[dataParams.numerator]
    const denominatorParams = dataParams.denominator !== 'properties' ? datasetParams.tables[dataParams.denominator]||defaultTables[dataParams.denominator] : null

    if ((storedData.hasOwnProperty(numeratorParams?.file)||dataParams.numerator === 'properties') && (storedData.hasOwnProperty(denominatorParams?.file)||dataParams.denominator !== 'properties')) return [numeratorParams.file, denominatorParams && denominatorParams.file]
    const firstLoadPromises = [
      gdaProxy.LoadGeojson(`${process.env.PUBLIC_URL}/geojson/${datasetParams.geojson}`),
      numeratorParams && handleLoadData(numeratorParams),
      denominatorParams && handleLoadData(denominatorParams)
    ] 

    let [geojsonData, numeratorData, denominatorData] = await Promise.all(firstLoadPromises)

    const dateIndices = numeratorData.dates
    const binIndex = dateIndices !== null ? mapParams.binMode === 'dynamic' ? dataParams.nIndex : dateIndices.slice(-1)[0] : null;
    
    let binData = getDataForBins(
      dataParams.numerator === 'properties' ? geojsonData.data.features : numeratorData.data, 
      dataParams.denominator === 'properties' ? geojsonData.properties : denominatorData.data, 
      {...dataParams, nIndex: binIndex, dIndex: dataParams.dType === 'time-series' ? binIndex : null}
    );

    let bins;
    
    if (mapParams.mapType === 'lisa') {
      bins = fixedScales['lisa']
    } else if (dataParams.fixedScale !== null && dataParams.fixedScale !== undefined) {
      bins = fixedScales[dataParams.fixedScale]
    } else {
      // calculate breaks
      let nb = mapParams.mapType === "natural_breaks" ? 
        await gdaProxy.Bins.NaturalBreaks(mapParams.nBins, binData) :
        await gdaProxy.Bins.Hinge15(mapParams.nBins, binData)  
      bins = {
        bins: mapParams.mapType === "natural_breaks" ? nb.bins : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
        breaks: [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]
      }
    }

    const lisaData = mapParams.mapType === 'lisa' ? await getLisaValues(geojsonData, datasetParams.geojson, dataParams, numeratorData?.data, denominatorData?.data) : null;  
    
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
          [datasetParams.geojson]:geojsonData
        },
        mapParams: {
          bins,
          colorScale: colorScales[dataParams.colorScale || mapParams.mapType]
        },
        variableParams: {
          nIndex: dataParams.nIndex || binIndex,
        },
        dates: dateLists.isoDateList,
        storedLisaData: lisaData
      })
    )
    setIsInProcess(false)
    return [numeratorParams.file, denominatorParams && denominatorParams.file]
  },[currentData])


  const secondLoad = useMemo(() => async (datasetParams, defaultTables, loadedTables) => {
    setIsInProcess(true);

    const defaultChartTable = defaultTables[chartParams.table]
    const currCaseData = dataPresetsRedux[currentData].hasOwnProperty('tables') ? dataPresetsRedux[currentData].tables[chartParams.table]||defaultChartTable : defaultChartTable;

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
    return filesToLoad.map(d => d.file)
  }, [currentData])
  
  const lazyFetchData = useMemo(() => async (dataPresets, loadedTables) => {
    const loadedGeojsons = Object.keys(storedGeojson)
    const geojsonFiles = Object.keys(dataPresets)

    for (let i=0; i<geojsonFiles.length;i++){
      if (isInProcess) return;
      const file = geojsonFiles[i];
      if (!loadedTables.includes(file) && !loadedGeojsons.includes(file) && !(currentData === file)){
        const geojsonData = await gdaProxy.LoadGeojson(`${process.env.PUBLIC_URL}/geojson/${file}`)
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

  const lazyGenerateWeights = useMemo(() => async (dataPresets) => {
    const geojsonFiles = Object.keys(gdaProxy.geojsonMaps)

    for (let i=0; i<geojsonFiles.length;i++){
      if (isInProcess) return;
      const file = geojsonFiles[i];
      if ('Queen' in gdaProxy.geojsonMaps[file]){
        continue
      } else {
        let weights = await gdaProxy.CreateWeights.Queen(file);
      }
    }

  }, [currentData])

  // On initial load and after gdaProxy has been initialized, this loads in the default data sets (USA Facts)
  // Otherwise, this side-effect loads the selected data.
  // Each conditions checks to make sure gdaProxy is working.
  useEffect(() => {
    if (!storedGeojson[currentData]) {
      setIsLoading(true)
      firstLoad(dataPresetsRedux[currentData], defaultTables[dataPresetsRedux[currentData]['geography']])
        .then(primaryTables => {
          dispatch(updateMap());
          setIsLoading(false);
          return primaryTables
        }).then(primaryTables => {
          return secondLoad(dataPresetsRedux[currentData], defaultTables[dataPresetsRedux[currentData]['geography']], [...Object.keys(storedData), ...primaryTables])
        // }).then(allLoadedTables => {
        //   if (!lazyFetched && allLoadedTables) {
        //     return lazyFetchData(dataPresetsRedux, allLoadedTables)
        //   } else {
        //     return true
        //   }
        }).then(() => {
          lazyGenerateWeights(dataPresetsRedux);

        })
    } else {
      dispatch(updateChart());
    }
  },[currentData])

  return [
    firstLoad,
    secondLoad,
    lazyFetchData,
    isLoading
  ]
}