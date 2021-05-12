
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { 
  getParseCSV, getParsePbf, mergeData, getColumns, loadJson,
  getDataForBins, getDataForCharts, getDataForLisa, getDateLists,
  getLisaValues, getCartogramValues, getDateIndices } from '../utils'; //getVarId
// Main data loader
// This functions asynchronously accesses the Geojson data and CSVs
//   then performs a join and loads the data into the store

import { 
  initialDataLoad, addTables, dataLoad, dataLoadExisting, storeLisaValues, storeCartogramData, setDates, setNotification,
  setMapParams, setUrlParams, setPanelState, updateMap, updateChart } from '../actions';

import { colorScales, fixedScales, dataPresets, defaultTables, dataPresetsRedux, variablePresets, colors } from '../config';

const dateLists = getDateLists();
const handleLoadData = (fileInfo) => fileInfo.file.slice(-4,) === '.pbf' ? getParsePbf(fileInfo, dateLists[fileInfo.dates]) : getParseCSV(fileInfo, dateLists[fileInfo.dates])

export default function useLoadData(gdaProxy){
  
  const dataParams = useSelector(state => state.dataParams);
  const mapParams = useSelector(state => state.mapParams);
  const currentData = useSelector(state => state.currentData);
  const storedGeojson = useSelector(state => state.storedGeojson);
  const storedLisaData = useSelector(state => state.storedLisaData);
  const dispatch = useDispatch();

  useEffect(() => {
    if (storedGeojson[currentData]) dispatch(updateMap());
  }, [dataParams.nIndex, storedGeojson])

  useEffect(() => {
    if (storedGeojson[currentData] && mapParams.mapType !== 'lisa' ) dispatch(updateMap());
  }, [mapParams.bins.breaks])

  useEffect(() => {
    if (storedGeojson[currentData] && mapParams.mapType === 'lisa' ) dispatch(updateMap());
  }, [storedLisaData])

  const firstLoad = useMemo(() => async (datasetParams, defaultTables) => {

    if (!gdaProxy.ready) await gdaProxy.init()  
    const numeratorParams = datasetParams.tables[dataParams.numerator]||defaultTables[datasetParams['geography']][dataParams.numerator]
    const denominatorParams = dataParams.denominator != 'properties' ? datasetParams.tables[dataParams.denominator]||defaultTables[datasetParams['geography']][dataParams.denominator] : null

    const firstLoadPromises = [
      gdaProxy.LoadGeojson(`${process.env.PUBLIC_URL}/geojson/${datasetParams.geojson}`),
      numeratorParams && handleLoadData(numeratorParams),
      denominatorParams && handleLoadData(denominatorParams)
    ] 

    let [geojsonData, numeratorData, denominatorData] = await Promise.all(firstLoadPromises)

    let dateIndices = numeratorData[2]
    let lastIndex = dateIndices !== null ? dateIndices.slice(-1)[0] : null;
    let binData = getDataForBins(
      dataParams.numerator === 'properties' ? geojsonData.data.features : numeratorData[0], 
      dataParams.denominator === 'properties' ? geojsonData.properties : denominatorData[0], 
      {...dataParams, nIndex: lastIndex || dataParams.nIndex, binIndex: lastIndex || dataParams.binIndex}
    );
    let bins;
    if (dataParams.fixedScale === null || dataParams.fixedScale === undefined){
      // calculate breaks
      let nb = mapParams.mapType === "natural_breaks" ? 
        await gdaProxy.Bins.NaturalBreaks(mapParams.nBins, binData) :
        await gdaProxy.Bins.Hinge15(mapParams.nBins, binData)  
      bins = {
        bins: mapParams.mapType === "natural_breaks" ? nb.bins : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
        breaks: [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]
      }
    } else {
      bins = fixedScales[dataParams.fixedScale]
    }
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
          nIndex: lastIndex || dataParams.nIndex,
          binIndex: lastIndex || dataParams.binIndex
        },
        dates: dateLists.isoDateList
      })
    )
    return [numeratorParams.file, denominatorParams && denominatorParams.file]
  },[currentData])


  const secondLoad = useMemo(() => async (datasetParams, defaultTables, loadedTables) => {
    dispatch(updateChart());
    const filesToLoad = [
      ...Object.values(datasetParams.tables),
      ...Object.values(defaultTables)
    ]

    const tablePromises = filesToLoad.map(table => loadedTables.includes(table.file) ? null : handleLoadData(table))
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
    
    return filesToLoad.map(d => d.file)
  }, [currentData])
  
  const lazyFetchData = useMemo(() => async (dataPresets, loadedTables) => {
    console.log(dataPresets)
    // let toCache = [...new Set(Object.values(dataPresets).map(dataset => dataset.tables).flat())]
  
    // for (const dataset of toCache){
    //   let test = await fetch(dataset.slice(-4,) === '.pbf' ? `${process.env.PUBLIC_URL}/pbf/${dataset}` : `${process.env.PUBLIC_URL}/csv/${dataset}.csv`);
    //   if (!test) console.log(`${dataset} failed to cache.`)
    // }
    // setLazyFetched(true)
  }, [currentData])

  return [
    firstLoad,
    secondLoad,
    lazyFetchData
  ]
}