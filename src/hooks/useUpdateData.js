import { useSelector, useDispatch } from 'react-redux';
import {useEffect} from 'react';
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

export default function useUpdateData(gdaProxy){

    const dispatch = useDispatch();
    const dataParams = useSelector(state => state.dataParams);
    const mapParams = useSelector(state => state.mapParams);
    const currentData = useSelector(state => state.currentData);
    const storedData = useSelector(state => state.storedData);
    const storedGeojson = useSelector(state => state.storedGeojson);

    const updateBins =  async (params) => { 
      const { storedData, currentData, dataParams, mapParams, colorScales } = params;
      if (
        !storedData.hasOwnProperty(currentData) || 
        !storedData[currentData][0].hasOwnProperty(dataParams.numerator)
      ) { return };

      if (gdaProxy.ready && storedData.hasOwnProperty(currentData) && mapParams.mapType !== "lisa"){
        if (dataParams.fixedScale === null || mapParams.mapType !== 'natural_breaks') {
          let binData = getDataForBins( storedData[currentData], dataParams);
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
      }
    }

  const updateLisa = async (currentData, storedData, storedGeojson, dataParams) => {
    const dataForLisa = getDataForLisa(
      storedData, 
      dataParams,
      storedGeojson.indexOrder
    );
    const weight_uid = 'Queen' in gdaProxy.geojsonMaps[currentData] ? gdaProxy.geojsonMaps[currentData].Queen : await gdaProxy.CreateWeights.Queen(currentData);
    const lisaValues = await gdaProxy.Cluster.LocalMoran(currentData, weight_uid, dataForLisa);
    dispatch(storeLisaValues(lisaValues.clusters))
  }

  const updateCartogram = async (currentData, storedData, dataParams, storedGeojson) => {
    const data = await getDataForLisa(
      storedData[currentData], 
      dataParams, 
      storedGeojson[currentData].indexOrder
    );
    const cartogramData = await gdaProxy.cartogram(currentData, data);
    let tempArray = new Array(cartogramData.length)
    for (let i=0; i<cartogramData.length; i++){
        cartogramData[i].value = data[i]
        tempArray[i] = cartogramData[i]
    };
    dispatch(storeCartogramData(tempArray));
  }

  // Trigger on parameter change for metric values
  // Gets bins and sets map parameters
  useEffect(() => {
    if (storedData.hasOwnProperty(currentData) && gdaProxy.ready && mapParams.binMode !== 'dynamic' && mapParams.mapType !== 'lisa') {
      updateBins( { storedData, currentData, dataParams, mapParams, colorScales } );
    }
  }, [dataParams.numerator, dataParams.nProperty, dataParams.nRange, dataParams.denominator, dataParams.dProperty, dataParams.dRange, mapParams.mapType, mapParams.vizType] );
  
  // This listens for gdaProxy events for LISA and Cartogram calculations
  // Both of these are computationally heavy.
  useEffect(() => {
    if (gdaProxy.ready && mapParams.mapType === "lisa" && storedGeojson[currentData] !== undefined){
      updateLisa(currentData, storedData[currentData], storedGeojson[currentData], dataParams)
    }
    if (gdaProxy.ready && mapParams.vizType === 'cartogram' && storedGeojson[currentData] !== undefined){
      // let tempId = getVarId(currentData, dataParams)
      if (storedGeojson[currentData] !== undefined) {
        updateCartogram(currentData, storedData, dataParams, storedGeojson)
      }
    }
  }, [currentData, storedGeojson[currentData], dataParams.numerator, dataParams.nProperty, dataParams.nRange, dataParams.denominator, dataParams.dProperty, dataParams.nIndex, dataParams.dIndex, mapParams.binMode, dataParams.variableName, mapParams.mapType, mapParams.vizType])

  // Trigger on index change while dynamic bin mode
  useEffect(() => {
    if (storedData.hasOwnProperty(currentData) && gdaProxy.ready && mapParams.binMode === 'dynamic' && mapParams.mapType !== 'lisa') {
      updateBins( { storedData, currentData, dataParams: { ...dataParams, binIndex: dataParams.nIndex }, mapParams, colorScales } );
    }
  }, [dataParams.nIndex, dataParams.dIndex, mapParams.binMode, dataParams.variableName, dataParams.nRange, mapParams.mapType, mapParams.vizType] ); 


  return [
      updateBins,
      updateLisa,
      updateCartogram
  ]
}