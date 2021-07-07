import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Helper and Utility functions //
// first row: data loading
// second row: data parsing for specific outputs
// third row: data accessing
import { 
  getParseCSV, getParsePbf, mergeData, getColumns,
  getDataForBins, getDataForCharts, getDataForLisa, getDateLists,
  getDateIndices } from '../../utils'; //getVarId

// Actions -- Redux state manipulation following Flux architecture //
// first row: data storage
// second row: data and metadata handling 
// third row: map and variable parameters
import { 
  dataLoad, dataLoadExisting, storeLisaValues, storeCartogramData, setDates, setNotification,
  setMapParams, setUrlParams, setPanelState, setVariableParams } from '../../actions';

import { MapSection, NavBar, VariablePanel, Legend,  TopPanel, Preloader,
  DataPanel, MainLineChart, Scaleable, Draggable, InfoBox,
  NotificationBox, Popover, MapTooltipContent } from '../../components';  

import { colorScales, fixedScales, dataPresets, variablePresets, colors } from '../../config';

import JsGeoDaWorker from '../../JsGeoDaWorker';

const gdaProxy = new JsGeoDaWorker();

// Main function, App. This function does 2 things:
// 1: App manages the majority of the side effects when the state changes.
//    This takes the form of React's UseEffect hook, which listens
//    for changes in the state and then performs the functions in the hook.
//    App listens for different state changes and then calculates the relevant
//    side effects (such as binning calculations and GeoDa functions, column parsing)
//    and then dispatches new data to the store.
// 2: App assembles all of the components together and sends Props down
//    (as of 12/1 only Preloader uses props and is a higher order component)

const getDefaultDimensions = () => ({
  defaultX: window.innerWidth <= 1024 ? window.innerWidth*.1 : window.innerWidth <= 1400 ? window.innerWidth-400 : window.innerWidth -500, 
  defaultXLong: window.innerWidth <= 1024 ? window.innerWidth*.1 : window.innerWidth <= 1400 ? window.innerWidth-450 : window.innerWidth -550,
  defaultY: window.innerWidth <= 1024 ? window.innerHeight*.25 : 75,
  defaultWidth: window.innerWidth <= 1024 ? window.innerWidth*.8 : 300,
  defaultWidthLong: window.innerWidth <= 1024 ? window.innerWidth*.8 : window.innerWidth <= 1400 ? 400 : 500,
  defaultHeight: window.innerWidth <= 1024 ? window.innerHeight*.4 : 300,
  defaultHeightManual: window.innerWidth <= 1024 ? window.innerHeight*.7 : window.innerHeight*.5,
  defaultWidthManual: window.innerWidth <= 1024 ? window.innerWidth*.5 : window.innerWidth*.35,
  defaultXManual: window.innerWidth <= 1024 ? window.innerWidth*.25 : window.innerWidth*.25,
  defaultYManual: window.innerWidth <= 1024 ? window.innerHeight*.15 : window.innerHeight*.325,
  minHeight: window.innerWidth <= 1024 ? window.innerHeight*.5 : 200,
  minWidth: window.innerWidth <= 1024 ? window.innerWidth*.5 : 200,
})

export default function Map() {

  const dateLists = getDateLists()
  // These selectors access different pieces of the store. While App mainly
  // dispatches to the store, we need checks to make sure side effects
  // are OK to trigger. Issues arise with missing data, columns, etc.
  const storedData = useSelector(state => state.storedData);
  const storedGeojson = useSelector(state => state.storedGeojson);
  const currentData = useSelector(state => state.currentData);
  const mapParams = useSelector(state => state.mapParams);
  const dataParams = useSelector(state => state.dataParams);
  const dateIndices = useSelector(state => state.dateIndices);
  const mapLoaded = useSelector(state => state.mapLoaded);
  const panelState = useSelector(state => state.panelState);
  // const fullState = useSelector(state => state)
  // gdaProxy is the WebGeoda proxy class. Generally, having a non-serializable
  // data in the state is poor for performance, but the App component state only
  // contains gdaProxy.
  const [defaultDimensions, setDefaultDimensions] = useState({...getDefaultDimensions()})
  const [isLoading, setIsLoading] = useState(false);
  const [binDataset, setBinDataset] = useState(`${currentData}`);
  const dispatch = useDispatch();  
  // // Dispatch helper functions for side effects and data handling
  // Get centroid data for cartogram
  // const getCentroids = (geojson, gdaProxy) =>  dispatch(setCentroids(gdaProxy.GetCentroids(geojson), geojson))
  
  // Main data loader
  // This functions asynchronously accesses the Geojson data and CSVs
  //   then performs a join and loads the data into the store
  const loadData = async (params) => {
    setIsLoading(true)
    if (!gdaProxy.ready) await gdaProxy.init()
    // destructure parameters
    const { geojson, csvs, joinCols, tableNames, accumulate, dateList } = params
    // promise all data fetching - CSV and Json
    const tabularDataPromises = csvs.map(csv => 
      csv.slice(-4,) === '.pbf' ? 
        getParsePbf(csv, accumulate.includes(csv), dateLists[dateList[csv]])
      :
        getParseCSV(
          `${process.env.PUBLIC_URL}/csv/${csv}.csv`, 
          joinCols[1], 
          accumulate.includes(csv),
          dateLists[dateList[csv]]
        )
      )
    
    const values = await Promise.all([
      gdaProxy.LoadGeojson(`${process.env.PUBLIC_URL}/geojson/${geojson}`),
      ...tabularDataPromises
    ])

    let tempData = mergeData(values[0]['data'], joinCols[0], values.slice(1,), tableNames, joinCols[1]);
    let ColNames = getColumns(values.slice(1,), tableNames);
    let DateIndices = getDateIndices(values.slice(1,), tableNames);
    let denomIndices = DateIndices[dataParams.numerator]
    let lastIndex = denomIndices !== null ? denomIndices.slice(-1,)[0] : null;
    let chartData = getDataForCharts(tempData, 'cases', DateIndices['cases'], dateLists.isoDateList);
    let binData = getDataForBins(tempData, {...dataParams, nIndex: lastIndex || dataParams.nIndex, binIndex: lastIndex || dataParams.binIndex});
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

      // store data, data name, and column names
    dispatch(
      dataLoad({
        storeData: {
          data: tempData, 
          name: geojson
        },
        currentData: geojson,
        columnNames: {
          data: ColNames,
          name: geojson
        },
        dateIndices: {
          data: DateIndices,
          name: geojson
        },
        storeGeojson: {
          data: values[0].indices,
          name: geojson
        },
        chartData: chartData,
        mapParams: {
          bins,
          colorScale: colorScales[dataParams.colorScale || mapParams.mapType]
        },
        variableParams: {
          nIndex: lastIndex || dataParams.nIndex,
          binIndex: lastIndex || dataParams.binIndex
        },
      })
    )
    setIsLoading(false)
  }

  const updateBins = useMemo(() => async (params) => { 
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
    }, 
    [dataParams.numerator, dataParams.nProperty, dataParams.nRange, dataParams.denominator, dataParams.dProperty, dataParams.dRange, mapParams.mapType, mapParams.vizType, currentData],
  )

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

  // After runtime is initialized, this loads in gdaProxy to the state
  // TODO: Recompile WebGeoda and load it into a worker
  useEffect(() => {
    let paramsDict = {}; 
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams ) { paramsDict[key] = value; }

    if (!paramsDict.hasOwnProperty('v')) {
      // do nothing, most of the time
    } else if (paramsDict['v'] === '2') {
      dispatch(
        setUrlParams(paramsDict, variablePresets)
      );
    } else if (paramsDict['v'] === '1') {
      dispatch(setNotification(`
          <h2>Welcome to the Atlas v2!</h2>
          <p>
          The share link you have entered is for an earlier release of the US Covid Atlas. 
          Explore the new version here, or continue using your current share link by click below.
          <a href="./vintage/map.html${window.location.search}" target="_blank" rel="noopener noreferrer" style="color:${colors.yellow}; text-align:center;">
            <h3 style="text-align:center">
              US Covid Atlas v1
            </h3>  
          </a>
          </p>
        `,
        'center'))
    }

    if (window.innerWidth <= 1024) {
      dispatch(setPanelState({
        variables:false,
        info:false,
        tutorial:false,
        lineChart: false
      }))
    }

    dispatch(setDates(dateLists.isoDateList))
  },[])


  // On initial load and after gdaProxy has been initialized, this loads in the default data sets (USA Facts)
  // Otherwise, this side-effect loads the selected data.
  // Each conditions checks to make sure gdaProxy is working.
  useEffect(() => {
    setBinDataset(currentData + '')
    if (storedData === {}||(storedData[currentData] === undefined)) {
      loadData(dataPresets[currentData])
    } else if (dateIndices[currentData] !== undefined) {
      let denomIndices = dateIndices[currentData][dataParams.numerator]
      let lastIndex = denomIndices !== null ? denomIndices.slice(-1,)[0] : null;
      dispatch(
        dataLoadExisting({
          variableParams: {
            nIndex: lastIndex || dataParams.nIndex,
            dIndex: dataParams.dType === 'time-series' ? lastIndex : dataParams.dType,
            dRange: dataParams.dType === 'time-series' ? dataParams.nRange : dataParams.dRange,
            binIndex: lastIndex || dataParams.nIndex,
          },
          chartData: getDataForCharts(storedData[currentData],'cases', dateIndices[currentData]['cases'], dateLists.isoDateList)
        })
      )
      updateBins( { storedData, currentData, mapParams, colorScales,
        dataParams: { 
          ...dataParams,  
          nIndex: lastIndex,
          binIndex: lastIndex,
        }, 
      })
    }
  },[currentData])


  
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

  // Trigger on parameter change for metric values
  // Gets bins and sets map parameters
  useEffect(() => {
    setBinDataset(currentData + '')
    if (currentData === binDataset && storedData.hasOwnProperty(currentData) && gdaProxy.ready && mapParams.binMode !== 'dynamic' && mapParams.mapType !== 'lisa') {
      let binParams = {...dataParams};
      
      if (dateIndices[currentData][dataParams.numerator]?.indexOf(dataParams.nIndex) === -1){
        binParams.nIndex = dateIndices[currentData][dataParams.numerator].slice(-1,)[0];
        binParams.dIndex = dataParams.dIndex !== null ? dateIndices[currentData][dataParams.numerator].slice(-1,)[0] : dataParams.dIndex;
        dispatch(setVariableParams(binParams));
      }

      updateBins( { storedData, currentData, dataParams: binParams, mapParams, colorScales } );
    }

  }, [dataParams.variableName, dataParams.nRange, dataParams.numerator, mapParams.mapType] );

  // Trigger on index change while dynamic bin mode
  useEffect(() => {
    if (storedData.hasOwnProperty(currentData) && gdaProxy.ready && mapParams.binMode === 'dynamic' && mapParams.mapType !== 'lisa') {
      updateBins( { storedData, currentData, dataParams: { ...dataParams, binIndex: dataParams.nIndex }, mapParams, colorScales } );
    }
  }, [dataParams.nIndex, mapParams.binMode] ); 

  // default width handlers on resize
  useEffect(() => {
    setDefaultDimensions({...getDefaultDimensions()})
  }, [window.innerHeight, window.innerWidth])
  // const dragHandlers = {onStart: this.onStart, onStop: this.onStop};

  // const testData = async (url) => {
  //   const jsonData = await gdaProxy.LoadGeojson(`${process.env.PUBLIC_URL}/geojson/county_1p3a.geojson`)
  //   console.log(jsonData)
  // }
  // testData(`${process.env.PUBLIC_URL}/geojson/county_1p3a.geojson`)

  return (
    <div className="Map-App" style={{overflow:'hidden'}}>
      <Preloader loaded={mapLoaded} />
      <NavBar />
      {isLoading && <div id="loadingIcon" style={{backgroundImage: `url('${process.env.PUBLIC_URL}assets/img/bw_preloader.gif')`}}></div>}
      {/* <header className="App-header" style={{position:'fixed', left: '20vw', top:'100px', zIndex:10}}>
        <button onClick={() => console.log(fullState)}>Log state</button>
      </header> */}
      <div id="mainContainer" className={isLoading ? 'loading' : ''}>
        <MapSection />
        <TopPanel />
        <Legend 
          variableName={dataParams.variableName} 
          colorScale={mapParams.colorScale}
          bins={mapParams.bins.bins}
          fixedScale={dataParams.fixedScale}
          resource={mapParams.resource}
          note={dataParams.dataNote}
          />
        <VariablePanel />
        <DataPanel />
        <Popover /> 
        <NotificationBox />  
        {panelState.lineChart && <Draggable 
          z={9}
          defaultX={defaultDimensions.defaultXLong}
          defaultY={defaultDimensions.defaultY}
          title="lineChart"
          content={
          <Scaleable 
            content={
              <MainLineChart />
            } 
            title="lineChart"
            defaultWidth={defaultDimensions.defaultWidthLong}
            defaultHeight={defaultDimensions.defaultHeight}
            minHeight={defaultDimensions.minHeight}
            minWidth={defaultDimensions.minWidth} />
        }/>} 
        {panelState.tutorial && <Draggable 
          z={10}
          defaultX={defaultDimensions.defaultXManual}
          defaultY={defaultDimensions.defaultYManual}
          title="tutorial"
          content={
          <Scaleable 
            content={
              <InfoBox />
            } 
            title="tutorial"
            defaultWidth={defaultDimensions.defaultWidthManual}
            defaultHeight={defaultDimensions.defaultHeightManual}
            minHeight={defaultDimensions.minHeight}
            minWidth={defaultDimensions.minWidth} />
        }/>}
        <MapTooltipContent />

      </div>
    </div>
  );
}