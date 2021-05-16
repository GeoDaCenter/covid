import { INITIAL_STATE } from '../constants/defaults';
import { mapFnNb, mapFnTesting, mapFnHinge, dataFn, getVarId, getCSV, getCartogramCenter, getDataForCharts, getURLParams } from '../utils';
import { colorScales, fixedScales, dataPresets, defaultTables, dataPresetsRedux, variablePresets, tooltipTables } from '../config';

// utils
const getSimpleColor = (value, bins, colorScale, mapType, numerator, storedLisaData, storedGeojson, currentData, GEOID, mapFn) => mapFn(value, bins, colorScale, mapType, numerator);
const getLisaColor = (value, bins, colorScale, mapType, numerator, storedLisaData, storedGeojson, currentData, GEOID) => colorScale[storedLisaData[storedGeojson[currentData].indices['geoidOrder'][GEOID]]]||[240,240,240]
const getColorFunction = (mapType) => mapType === 'lisa' ? getLisaColor : getSimpleColor;
const getMapFunction = (mapType, table) => mapType.includes("hinge") ? mapFnHinge : table.includes('testing') ? mapFnTesting : mapFnNb;
const getHeight = (val, dataParams) => val*(dataParams.scale3D/((dataParams.nType === "time-series" && dataParams.nRange === null) ? (dataParams.nIndex)/10 : 1));
const generateMapData = (state) => {
    if (!state.mapParams.bins.hasOwnProperty("bins") || (state.mapParams.mapType !== 'lisa' && !state.mapParams.bins.breaks)) {
        return state
    };

    let returnObj = {};
    let i = 0;

    const getTable = (i, predicate) => {
        if (state.dataParams[predicate] === 'properties' ) {
            return state.storedGeojson[state.currentData].data.features[i].properties 
        } else {
            try {
                return state.storedData[dataPresetsRedux[state.currentData].tables[state.dataParams[predicate]].file][0][state.storedGeojson[state.currentData].data.features[i].properties.GEOID]
            } catch {
                return state.storedData[defaultTables[dataPresetsRedux[state.currentData].geography][state.dataParams[predicate]].file][0][state.storedGeojson[state.currentData].data.features[i].properties.GEOID];
            }
        }
    }

    const getColor = getColorFunction(state.mapParams.mapType)
    const mapFn = getMapFunction(state.mapParams.mapType, state.dataParams.numerator)

    for (let i=0; i<state.storedGeojson[state.currentData].data.features.length; i++){
        const tempVal = dataFn(getTable(i, 'numerator'), getTable(i, 'denominator'), state.dataParams)
        
        const color = getColor(
            tempVal, 
            state.mapParams.bins.breaks, 
            state.mapParams.colorScale, 
            state.mapParams.mapType, 
            state.dataParams.numerator, 
            state.storedLisaData, 
            state.storedGeojson, 
            state.currentData, 
            state.storedGeojson[state.currentData].data.features[i].properties.GEOID,
            mapFn
        );

        const height = getHeight(tempVal, state.dataParams);

        if (color === null) {
            returnObj[state.storedGeojson[state.currentData].data.features[i].properties.GEOID] = {color:[0,0,0,0],height:0}
            continue;
        }

        returnObj[state.storedGeojson[state.currentData].data.features[i].properties.GEOID] = {color,height}
    }

    return {
        params: getVarId(state.currentData, state.dataParams, state.mapParams),
        data: returnObj
    }
};
const shallowEqual = (object1, object2) => { // Thanks @Dmitri Pavlutin
    const keys = Object.keys(object1);
    if (keys.length !== keys.length) return false; 
    for (let i=0; i<keys.length; i++) {
        if (object1[keys[i]] !== object2[keys[i]]) {
            if (keys[i] !== 'nIndex' && keys[i] !== 'dIndex') return false;  
        }
    }
    return true;
};


// Replace Null/NaN with 0 
const cleanData = (inputData) => inputData.map(d => d >=0 ? d : isNaN(d) || d===null ? 0 : d)

// Performs different operations on the data array output
// Sum, Average, and weighted average
const performOperation = (dataArray, operation, totalPopulation) => {
// Sum up data
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    // Clean data
    let clean = cleanData(dataArray);

    switch(operation) {
        case 'sum':
            return clean.reduce(reducer)
        case 'average':
            return clean.reduce(reducer)/clean.length
        case 'weighted_average':
            return Math.round(clean.reduce(reducer)/totalPopulation*100)/100
        default:
            return null
    }
} 

// // Prepares data for the previous operation
// const aggregateProperty = (dataset, property, operation, specialCase=null) => {
//     let dataArray; 
//     let totalPopulation = 0;
//     // Loop through and collect data from selected geographies in SelectionIndex
//     try {
//         if (operation === 'weighted_average') {
//             dataArray = selectionIndex.map(selection => {
//                 let selectionPop = storedData[currentData][selection]['properties']['population'];
//                 totalPopulation+=selectionPop;
//                 if (specialCase === 'pcp') try { return parseInt(storedData[currentData][selection][dataset][property].split(':')[0])*selectionPop } catch { return 0}
//                 return storedData[currentData][selection][dataset][property]*selectionPop
//             })
//         } else {
//             dataArray = selectionIndex.map(selection => storedData[currentData][selection][dataset][property]);
//         }
//     } catch {
//         return 0
//     }

//     return performOperation(dataArray, operation, totalPopulation);
// }

// // Same as aggregteProperty(), but for time-series data
// const aggregateTimeseries = (dataset, index, operation) => {
//     let dataArray; 
//     let totalPopulation = 0;
//     try {
//         if (operation === 'weighted_average') {
//         dataArray = selectionIndex.map(selection => {
//             let selectionPop = storedData[currentData][selection]['properties']['population'];
//             totalPopulation+=selectionPop;
//             return storedData[currentData][selection][dataset].slice(index,)[0]*selectionPop
//         })
//         } else {
//         dataArray = selectionIndex.map(selection => storedData[currentData][selection][dataset].slice(index,)[0]);
//         }
//     } catch {
//         return 0
//     }

//     return performOperation(dataArray, operation, totalPopulation);
// }

// // Generate data for 2-week line charts
// const aggregate2WeekTimeSeries = (dataset, index, operation) => {
//     let lookbackPeriod = []
//     let rtn;

//     try {
//         for (let i=-13;i<1;i++) {
//         lookbackPeriod.push(index+i)
//         }
//         rtn = lookbackPeriod.map(day => aggregateTimeseries(dataset, day, operation))
//     } catch {
//         return 0
//     }
//     return rtn;
// }

// // For more complete data functions (like population normalized)
// const aggregateDataFunction = (numerator, denominator, params, operation) => {
//     let dataArray; 
//     let totalPopulation = 0;
//     try {
//         if (operation === 'weighted_average') {
//         dataArray = selectionIndex.map(selection => {
//             let selectionPop = storedData[currentData][selection]['properties']['population'];
//             totalPopulation+=selectionPop;
//             return dataFn(storedData[currentData][selection][numerator], storedData[currentData][selection][denominator], params)*selectionPop
//         })
//         } else {
//         dataArray = selectionIndex.map(selection => dataFn(storedData[currentData][selection][numerator], storedData[currentData][selection][denominator], params));
//         }
//     } catch {
//         return 0
//     }

//     return performOperation(dataArray, operation, totalPopulation);
// }

var reducer = (state = INITIAL_STATE, action) => {
    console.log(action.type)
    switch(action.type) {
        case 'INITIAL_LOAD': {
            const dataParams = {
                ...state.dataParams,
                ...action.payload.data.variableParams,
            }
            const mapParams = {
                ...state.mapParams,
                ...action.payload.data.mapParams
            }
            const storedData = {
                ...state.storedData,
                ...action.payload.data.storedData,
            }

            const storedGeojson = {
                ...state.storedGeojson,
                ...action.payload.data.storedGeojson,
            }

            return {
                ...state,
                currentData: action.payload.data.currentData,
                storedGeojson,
                storedData,
                dataParams,
                mapParams,
                currentTable: action.payload.data.currentTable,
                dates: action.payload.data.dates
            }
        }
        case 'ADD_TABLES': {
            const storedData = {
                ...state.storedData,
                ...action.payload.data
            }

            return {
                ...state,
                storedData
            }
        }
        case 'ADD_GEOJSON':{
            const storedGeojson = {
                ...state.storedGeojson,
                ...action.payload.data
            }

            return {
                ...state,
                storedGeojson
            }
        }
        case 'UPDATE_MAP': {
            const mapData = generateMapData(state)
            return {
                ...state,
                mapData
            }
        }
        case 'DATA_LOAD':{
            // main new data loading reducer
            // I: Destructure payload (load) object
            let { storeData, currentData, columnNames, dateIndices,
                storeGeojson, chartData, mapParams, 
                variableParams} = action.payload.load;

            // II: Create copies of existing state objects.
            // This is necessary to avoid mutating the state
            let [
                    dataObj, colDataObj, dateIndexObj, geoDataObj, 
                    mapParamsDataObj, variableParamsDataObj, panelsDataObj
                ] = [
                    {
                    ...state.storedData
                }, {
                    ...state.cols
                }, {
                    ...state.dateIndices
                }, {
                    ...state.storedGeojson,
                }, {
                    ...state.mapParams,
                    ...mapParams
                }, {
                    ...state.dataParams,
                    ...variableParams
                }, {
                    ...state.panelState,
                    info: false
                }];

                dataObj[storeData.name] = storeData.data;
                colDataObj[columnNames.name] = columnNames.data;
                dateIndexObj[dateIndices.name] = dateIndices.data;
                geoDataObj[storeGeojson.name] = storeGeojson.data;
            return {
                ...state,
                storedData: dataObj,
                cols: colDataObj,
                dateIndices: dateIndexObj,
                storedGeojson: geoDataObj,
                mapParams: mapParamsDataObj,
                dataParams: variableParamsDataObj,
                currentData,
                selectionKeys: [],
                selectionIndex: [],
                chartData,
                sidebarData: {},
                panelState: panelsDataObj

            }
        }
        case 'UPDATE_CHART': {
            const currCaseData = dataPresetsRedux[state.currentData].tables[state.chartParams.table]?.file||defaultTables[dataPresetsRedux[state.currentData].geography][state.chartParams.table].file
            let populationData = [];

            if (state.chartParams.populationNormalized){
                populationData.push(0)
                for (let i=0; i<state.storedGeojson[state.currentData].data.features.length; i++){
                    populationData[0] += state.storedGeojson[state.currentData].data.features[i].properties.population
                }
            }
            const additionalParams = {
                populationData
            }
            const chartData = getDataForCharts(state.storedData[currCaseData], state.dates, additionalParams);
            return {
                ...state,
                chartData
            }
        }
        case 'SET_CHART_PARAMS':{
            const chartParams = {
                ...state.chartParams,
                ...action.payload.params
            }

            const currCaseData = dataPresetsRedux[state.currentData].tables[state.chartParams.table]?.file||defaultTables[dataPresetsRedux[state.currentData].geography][state.chartParams.table].file
            const properties = state.storedGeojson[state.currentData].properties

            let populationData = [];

            if (chartParams.populationNormalized){
                if (state.selectionKeys.length){
                    populationData = state.selectionKeys.map(key => properties[key].population)
                } else {
                    populationData.push(0)
                    for (let i=0; i<state.storedGeojson[state.currentData].data.features.length; i++){
                        populationData[0] += state.storedGeojson[state.currentData].data.features[i].properties.population
                    }
                }
            }            
            const additionalParams = {
                populationData,
                geoid:state.selectionKeys,
                name:state.selectionNames
            }
            
            const chartData = getDataForCharts(state.storedData[currCaseData], state.dates, additionalParams);

            return {
                ...state,
                chartParams,
                chartData
            }
        }
        case 'DATA_LOAD_EXISTING':
            
            let [ variableParamsExDataObj, panelsExDataObj ] 
                = [
                    {
                    ...state.dataParams,
                    ...action.payload.load.variableParams
                }, {
                    ...state.panelState,
                    info: false
                }];

            return {
                ...state,
                dataParams: variableParamsExDataObj,
                chartData: action.payload.load.chartData,
                sidebarData: {},
                selectionKeys: [],
                selectionIndex: [],
                panelState: panelsExDataObj

            };
        case 'SET_NEW_BINS':{
            let [ binsVariableParams, binsMapParams] 
                = [{
                    ...state.dataParams,
                    ...action.payload.load.variableParams
                },{
                    ...state.mapParams,
                    ...action.payload.load.mapParams
                }]
            return {
                ...state,
                dataParams: binsVariableParams,
                mapParams: binsMapParams
            }
        }
        case 'SET_GEOID': 
            return {
                ...state,
                currentGeoid: action.payload.geoid
            };
        case 'SET_STORED_DATA':
            let obj = {
                ...state.storedData,
            }
            obj[action.payload.name] = action.payload.data
            return {
                ...state,
                storedData: obj
            };
        case 'SET_STORED_GEOJSON':
            let geojsonObj = {
                ...state.storedGeojson,
            }
            geojsonObj[action.payload.name] = action.payload.data
            return {
                ...state,
                storedGeojson: geojsonObj
            };
        case 'SET_STORED_LISA_DATA':{
            return {
                ...state,
                storedLisaData: action.payload.data,
                mapData: generateMapData({...state, storedLisaData: action.payload.data})
            };
        }
        case 'SET_STORED_CARTOGRAM_DATA':
            return {
                ...state,
                storedCartogramData: action.payload.data
            };
        case 'SET_STORED_MOBILITY_DATA':
            return {
                ...state,
                storedMobilityData: action.payload.data
            }
        case 'SET_CENTROIDS':
            let centroidsObj = {
                ...state.centroids,
            }
            centroidsObj[action.payload.name] = action.payload.data
            return {
                ...state,
                centroids: centroidsObj
            };
        case 'SET_CURRENT_DATA':
            return {
                ...state,
                currentData: action.payload.data
            }
        case 'SET_GEODA_PROXY':
            return {
                ...state,
                geodaProxy: action.payload.proxy
            }
        case 'SET_DATES':
            return {
                ...state,
                dates: action.payload.data
            }
        case 'SET_DATA_FUNCTION':
            return {
                ...state,
                currentDataFn: action.payload.fn
            }
        case 'SET_COLUMN_NAMES':
            let colObj = {
                ...state.cols
            }
            colObj[action.payload.name] = action.payload.data
            return {
                ...state,
                cols: colObj
            }
        case 'SET_CURR_DATE':
            return {
                ...state,
                currDate: action.payload.date
            }
        case 'SET_DATE_INDEX':
            return {
                ...state,
                currDateIndex: action.payload.index
            }
        case 'SET_START_DATE_INDEX':
            return {
                ...state,
                startDateIndex: action.payload.index
            }
        case 'SET_BINS':
            let binsObj = {};
            binsObj['bins'] =  action.payload.bins;
            binsObj['breaks'] =  action.payload.breaks;
            return {
                ...state,
                bins: binsObj
            }
        case 'SET_3D':
            return {
                ...state,
                use3D: !state.use3D
            }
        case 'SET_DATA_SIDEBAR':
            return {
                ...state,
                sidebarData: action.payload.data
            }
        case 'INCREMENT_DATE':{
            let dataParams = {
                ...state.dataParams
            }

            const currIndices = state.storedData[state.currentTable.numerator][2]
            const nextIndex = currIndices[currIndices.indexOf(state.dataParams.nIndex)+action.payload.index]

            if (nextIndex === undefined) {
                return {
                    ...state
                }
            } else {
                dataParams.nIndex = nextIndex;
                dataParams.dIndex = nextIndex;
                return {
                    ...state,
                    dataParams,
                    mapData: generateMapData({...state, dataParams}) 
                }
            }
        }
        case 'SET_START_PLAYING': {
            let dateObj = {
                ...state.dataParams
            }
            let currIndices = state.dateIndices[state.currentData][state.dataParams.numerator]
            let nextIndex = currIndices[currIndices.indexOf(state.dataParams.nIndex)+action.payload.index]

            if (nextIndex === undefined) {
                dateObj.nIndex = currIndices[0]
                dateObj.dIndex = currIndices[0]
                return {
                    ...state,
                    dataParams:dateObj
                }
            } else {
                dateObj.nIndex = nextIndex;
                dateObj.dIndex = nextIndex;
                return {
                    ...state,
                    isPlaying:true,
                    dataParams:dateObj
                }
            }
        }
        case 'SET_STOP_PLAYING': {
            return {
                ...state,
                isPlaying:false,
            }
        }
        case 'SET_VARIABLE_PARAMS':{
            let dataParams = {
                ...state.dataParams,
                ...action.payload.params
            }

            const currentTable = {
                numerator: 
                    dataParams.numerator === "properties" ? "properties" : 
                    dataPresetsRedux[state.currentData].tables.hasOwnProperty(dataParams.numerator) 
                        ? 
                    dataPresetsRedux[state.currentData].tables[dataParams.numerator].file
                        :
                    defaultTables[dataPresetsRedux[state.currentData].geography][dataParams.numerator].file,
                denominator:
                    dataParams.denominator === "properties" ? "properties" : 
                    dataPresetsRedux[state.currentData].tables.hasOwnProperty(dataParams.denominator) 
                        ? 
                    dataPresetsRedux[state.currentData].tables[dataParams.denominator].file
                        :
                    defaultTables[dataPresetsRedux[state.currentData].geography][dataParams.denominator].file,
            }

            if (state.dataParams.zAxisParams !== null) {
                dataParams.zAxisParams.nIndex = dataParams.nIndex;
                dataParams.zAxisParams.dIndex = dataParams.dIndex;
            }

            if (dataParams.nType === 'time-series' && dataParams.nIndex === null) {
                dataParams.nIndex = state.storedIndex;
                dataParams.nRange = state.storedRange;
            }
            if (dataParams.dType === 'time-series' && dataParams.dIndex === null) {
                dataParams.dIndex = state.storedIndex;
                dataParams.dRange = state.storedRange;
            }
            
            const mapData = 
                state.mapParams.binMode !== 'dynamic' && (state.mapParams.mapType !== 'lisa') && shallowEqual(state.dataParams, dataParams)
                    ? 
                generateMapData({...state, dataParams}) 
                    : 
                state.mapData

            if (dataParams.nType === 'characteristic' && state.dataParams.nType === 'time-series') {
                return {
                    ...state,
                    storedIndex: state.dataParams.nIndex,
                    storedRange: state.dataParams.nRange,
                    dataParams,
                    mapData,
                    currentTable
                }
            } else {
                return {
                    ...state,
                    dataParams,
                    mapData,
                    currentTable
                }
            }
        }
        case 'SET_VARIABLE_PARAMS_AND_DATASET':{
            const dataParams = {
                ...state.dataParams,
                ...action.payload.params.params
            };

            const mapParams = {
                ...state.mapParams,
                ...action.payload.params.dataMapParams
            }

            const currentTable = {
                numerator: 
                    dataParams.numerator === "properties" ? "properties" : 
                    dataPresetsRedux[state.currentData].tables.hasOwnProperty(dataParams.numerator) 
                        ? 
                    dataPresetsRedux[state.currentData].tables[dataParams.numerator].file
                        :
                    defaultTables[dataPresetsRedux[state.currentData].geography][dataParams.numerator].file,
                denominator:
                    dataParams.denominator === "properties" ? "properties" : 
                    dataPresetsRedux[state.currentData].tables.hasOwnProperty(dataParams.denominator) 
                        ? 
                    dataPresetsRedux[state.currentData].tables[dataParams.denominator].file
                        :
                    defaultTables[dataPresetsRedux[state.currentData].geography][dataParams.denominator].file,
            }
            
            return {
                ...state,
                dataParams,
                mapParams,
                currentTable,
                selectionKeys: [],
                selectionIndex: [],
                currentData: action.payload.params.dataset
            };
        }
        case 'SET_Z_VARIABLE_PARAMS':
            let paramObjZ = {
                ...state.dataParams,
                zAxisParams: action.payload.params
            }
            
            return {
                ...state,
                currentZVariable: action.payload.variable,
                dataParams: paramObjZ 
            }

        case 'SET_MAP_PARAMS':{
            let mapParams = {
                ...state.mapParams,
                ...action.payload.params
            }

            let dataParams = {
                ...state.dataParams
            }
            let zAxisVariableReset = state.currentZVariable

            if (action.payload.params.vizType !== '3D') {
                dataParams.zAxisParams = null
                zAxisVariableReset = null
            }

            return {
                ...state,
                mapParams,
                dataParams,
                currentZVariable: zAxisVariableReset
            }
        }
        case 'SET_PANELS':
            let panelsObj = {
                ...state.panelState,
                ...action.payload.params
            }
            return {
                ...state,
                panelState: panelsObj 
            }
        case 'SET_VARIABLE_NAME':
            return {
                ...state,
                currentVariable: action.payload.name
            }
        case 'UPDATE_SELECTION':{
            let sidebarData = {}
            let selectionKeys = [...state.selectionKeys]
            let chartData
            
            const properties = state.storedGeojson[state.currentData].properties
            const geography = dataPresetsRedux[state.currentData].geography

            if (!properties || !geography) return state;

            if (action.payload.type === "update"){
                selectionKeys = [action.payload.geoid]
            }
            if (action.payload.type === "append"){
                selectionKeys.push(action.payload.geoid)
            }
            if (action.payload.type === "bulk-append"){
                for (let i=0;i<action.payload.geoid.length; i++) {
                    if (selectionKeys.indexOf(action.payload.geoid[i]) === -1) selectionKeys.push(action.payload.geoid[i])
                }
            }
            if (action.payload.type === "remove"){                
                selectionKeys.splice(selectionKeys.indexOf(action.payload.geoid), 1);
            }
            
            const currCaseData = dataPresetsRedux[state.currentData].tables[state.chartParams.table]?.file||defaultTables[dataPresetsRedux[state.currentData].geography][state.chartParams.table].fil

            const additionalParams = {
                geoid: selectionKeys,
                populationData: state.chartParams.populationNormalized ? selectionKeys.map(key => properties[key].population) : [],
                name: geography === 'County' ? selectionKeys.map(key => properties[key].NAME + ', ' + properties[key].state_abbr) : selectionKeys.map(key => properties[key].name)
            };

            chartData = getDataForCharts(state.storedData[currCaseData], state.dates, additionalParams);
            return {
                ...state,
                chartData,
                selectionKeys,
                selectionNames: additionalParams.name
            }
        }
        case 'SET_ANCHOR_EL':
            return {
                ...state,
                anchorEl: action.payload.anchorEl
            }
        case 'SET_MAP_LOADED':
            return {
                ...state,
                mapLoaded: action.payload.loaded
            }
        case 'SET_NOTIFICATION':{
            return {
                ...state,
                notification: {
                    info: action.payload.info,
                    location: action.payload.location
                }
            }
        }
        case 'SET_URL_PARAMS':
            const { urlParams, presets } = action.payload;

            let preset = urlParams.var ? presets[urlParams.var.replace(/_/g, ' ')] : {};

            let urlMapParamsObj = {
                ...state.mapParams,
                binMode: urlParams.dbin ? 'dynamic' : '',
                mapType: urlParams.mthd || state.mapParams.mapType,
                overlay: urlParams.ovr ||  state.mapParams.overlay,
                resource: urlParams.res || state.mapParams.resource,
                vizType: urlParams.viz || state.mapParams.vizType
            };

            let urlDataParamsObj = {
                ...state.dataParams,
                ...preset,
                nIndex: urlParams.date || state.dataParams.nIndex,
                nRange: urlParams.hasOwnProperty('range') ? urlParams.range === 'null' ? null : urlParams.range : state.dataParams.nRange,
                nProperty: urlParams.prop || state.dataParams.nProperty
            };
            
            let urlCoordObj = {
                lat: urlParams.lat || '',
                lon: urlParams.lon || '',
                z: urlParams.z || ''
            }

            let urlParamsSource = urlParams.src ? 
                `${urlParams.src}.geojson` : 
                state.currentData 

            return {
                ...state,
                currentData: urlParamsSource,
                urlParams: urlCoordObj,
                mapParams: urlMapParamsObj,
                dataParams: urlDataParamsObj
            }
        case "OPEN_CONTEXT_MENU":
            let contextPanelsObj = {
                ...state.panelState,
                context: true,
                contextPos: { 
                    x: action.payload.params.x,
                    y: action.payload.params.y
                }
            }
            return {
                ...state,
                panelState: contextPanelsObj
            }
        case 'SET_TOOLTIP_CONTENT':{
            let tooltipData;
            if (typeof action.payload.data === "number" || typeof action.payload.data === "string"){
                const properties = state.storedGeojson[state.currentData].properties[+action.payload.data];
                const geography = dataPresetsRedux[state.currentData].geography;

                tooltipData = {
                    population: properties.population,
                    name: geography === 'County' ? properties.NAME + ', ' + properties.state_abbr : properties.name
                }
                
                const currentTables = {
                    ...defaultTables[geography],
                    ...dataPresetsRedux[state.currentData].tables
                }

                for (const table in currentTables){
                    if (currentTables[table].file in state.storedData && tooltipTables.includes(table)) {
                        tooltipData[table] = state.storedData[currentTables[table].file][0][+action.payload.data][state.dataParams.nIndex]
                        if (table === 'cases' || table === 'deaths') tooltipData[`daily_${table}`] = state.storedData[currentTables[table].file][0][+action.payload.data][state.dataParams.nIndex]-state.storedData[currentTables[table].file][0][+action.payload.data][state.dataParams.nIndex-1]
                    }
                }
            } else {
                tooltipData = action.payload.data
            }
            const tooltipContent = {
                x: action.payload.x,
                y: action.payload.y,
                data: tooltipData,
            }
            return {
                ...state,
                tooltipContent
            } 
        }
        case 'SET_DOT_DENSITY':
            return {
                ...state,
                dotDensityData: action.payload.data
            }
        case 'CHANGE_DOT_DENSITY_MODE':
            let changeDotDensityObj = {
                ...state.mapParams
            }

            changeDotDensityObj.dotDensityParams.colorCOVID = !changeDotDensityObj.dotDensityParams.colorCOVID;

            return {
                ...state,
                mapParams:changeDotDensityObj
            }
        case 'TOGGLE_DOT_DENSITY_RACE':
            let toggleAcsObj = {
                ...state.mapParams
            }

            toggleAcsObj.dotDensityParams.raceCodes[action.payload.index] = !toggleAcsObj.dotDensityParams.raceCodes[action.payload.index];

            return {
                ...state,
                mapParams:toggleAcsObj
            }
        case 'SET_DOT_DENSITY_BACKGROUND_OPACITY':
            let backgroundOpacityState = {
                ...state.mapParams
            }
            backgroundOpacityState.dotDensityParams.backgroundTransparency = action.payload.opacity
            
            return {
                ...state,
                mapParams:backgroundOpacityState
            }
            
        default:
            return state;
    }
}

export default reducer;