import { useSelector, useDispatch } from 'react-redux';
import {useState, useEffect} from 'react';
import { 
  getParseCSV, getParsePbf, mergeData, getColumns, loadJson,
  getDataForBins, getDataForCharts, getDataForLisa, getDateLists,
  getLisaValues, getCartogramValues, getDateIndices } from '../utils'; //getVarId
// Main data loader
// This functions asynchronously accesses the Geojson data and CSVs
//   then performs a join and loads the data into the store

import { 
  initialDataLoad, addTables, dataLoad, dataLoadExisting, storeLisaValues, storeCartogramData, setDates, setNotification,
  setMapParams, setUrlParams, setPanelState, updateMap } from '../actions';

import { colorScales, fixedScales, dataPresets, defaultTables, dataPresetsRedux, variablePresets, colors } from '../config';
import { set } from 'immutable';

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
      var context = this, args = arguments;
      var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
  };
};

export default function useUpdateData(gdaProxy){

    const dispatch = useDispatch();
    const dataParams = useSelector(state => state.dataParams);
    const mapParams = useSelector(state => state.mapParams);
    const currentData = useSelector(state => state.currentData);
    const currentTable = useSelector(state => state.currentTable);
    const storedData = useSelector(state => state.storedData);
    const storedGeojson = useSelector(state => state.storedGeojson);
    const storedLisaData = useSelector(state => state.storedLisaData);
    const [isCalculating, setIsCalculating] = useState(false)

    const updateBins =  async () => { 
      setIsCalculating(true)
      if (gdaProxy.ready && (storedData[currentTable.numerator]||dataParams.numerator==='properties') && mapParams.mapType !== "lisa"){
        if (dataParams.fixedScale === null || mapParams.mapType !== 'natural_breaks') {
          let binData = getDataForBins(
            dataParams.numerator === 'properties' ? storedGeojson[currentData].properties : storedData[currentTable.numerator][0], 
            dataParams.denominator === 'properties' ? storedGeojson[currentData].properties : storedData[currentTable.denominator][0], 
            dataParams
          );
          let nb = mapParams.mapType === "natural_breaks" ? 
            await gdaProxy.Bins.NaturalBreaks(mapParams.nBins, binData) :
            await gdaProxy.Bins.Hinge15(mapParams.nBins, binData)  
          dispatch(
            setMapParams({
              bins: {
                bins: mapParams.mapType === 'natural_breaks' ? nb.bins : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
                breaks: [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]
              },
              colorScale: mapParams.mapType === 'natural_breaks' ? colorScales[dataParams.colorScale || mapParams.mapType] : colorScales[mapParams.mapType || dataParams.colorScale]
            })
          )
        } else {
          dispatch(
            setMapParams({
              bins: fixedScales[dataParams.fixedScale],
              colorScale: colorScales[dataParams.fixedScale]
            })
          )
        }
        setIsCalculating(false)
      }
    }

  const updateLisa = async () => {
    setIsCalculating(true)
    const dataForLisa = getDataForBins(
      dataParams.numerator === 'properties' ? storedGeojson[currentData].properties : storedData[currentTable.numerator][0], 
      dataParams.denominator === 'properties' ? storedGeojson[currentData].properties : storedData[currentTable.denominator][0], 
      dataParams,
      Object.values(storedGeojson[currentData].indices.indexOrder)
    );
    const weight_uid = 'Queen' in gdaProxy.geojsonMaps[currentData] ? gdaProxy.geojsonMaps[currentData].Queen : await gdaProxy.CreateWeights.Queen(currentData);
    const lisaValues = await gdaProxy.Cluster.LocalMoran(currentData, weight_uid, dataForLisa);
    dispatch(storeLisaValues(lisaValues.clusters));
    setIsCalculating(false)
  }

  const updateCartogram = async () => {
    setIsCalculating(true)
    const dataForCartogram = getDataForBins(
      dataParams.numerator === 'properties' ? storedGeojson[currentData].properties : storedData[currentTable.numerator][0], 
      dataParams.denominator === 'properties' ? storedGeojson[currentData].properties : storedData[currentTable.denominator][0], 
      dataParams,
      Object.values(storedGeojson[currentData].indices.indexOrder)
    );
    const cartogramData = await gdaProxy.cartogram(currentData, dataForCartogram);
    let tempArray = new Array(cartogramData.length)
    for (let i=0; i<cartogramData.length; i++){
        cartogramData[i].value = dataForCartogram[i]
        tempArray[i] = cartogramData[i]
    };
    dispatch(storeCartogramData(tempArray));
    setIsCalculating(false)
  }

  // This listens for gdaProxy events for LISA and Cartogram calculations
  // Both of these are computationally heavy.
  useEffect(() => {
    if (!isCalculating && gdaProxy.ready) {
      if (mapParams.mapType === "lisa" ){
        updateLisa()
      }
      if (mapParams.vizType === 'cartogram'){
        updateCartogram()
      }
    }
  }, [currentData, storedGeojson[currentData], dataParams.numerator, dataParams.nProperty, dataParams.nRange, dataParams.denominator, dataParams.dProperty, dataParams.nIndex, dataParams.dIndex, mapParams.binMode, dataParams.variableName, mapParams.mapType, mapParams.vizType])

  // Trigger on index change while dynamic bin mode
  useEffect(() => {
    if (!isCalculating && storedData[currentTable.numerator] && gdaProxy.ready && mapParams.binMode === 'dynamic' && mapParams.mapType !== 'lisa') {
      updateBins()
    }
  }, [dataParams.nIndex, dataParams.dIndex, mapParams.binMode, dataParams.variableName, dataParams.nRange, mapParams.mapType, mapParams.vizType] ); 

  // Trigger on parameter change for metric values
  // Gets bins and sets map parameters
  useEffect(() => {
    if (!isCalculating && storedGeojson[currentData] && storedData[currentTable.numerator] && gdaProxy.ready && mapParams.binMode !== 'dynamic' && mapParams.mapType !== 'lisa') {
      console.log(currentTable.numerator)
      updateBins();
    }
  }, [dataParams.numerator, dataParams.nProperty, dataParams.nRange, dataParams.denominator, dataParams.dProperty, dataParams.dRange, mapParams.mapType, mapParams.vizType] );
  
  useEffect(() => {
    if (storedGeojson[currentData]) dispatch(updateMap());
  }, [dataParams.nIndex, storedGeojson])

  useEffect(() => {
    if (storedGeojson[currentData] && mapParams.mapType !== 'lisa' ) dispatch(updateMap());
  }, [mapParams.bins.breaks])

  useEffect(() => {
    if (storedGeojson[currentData] && mapParams.mapType === 'lisa' ) dispatch(updateMap());
  }, [storedLisaData])

  return [
      updateBins,
      updateLisa,
      updateCartogram
  ]
}