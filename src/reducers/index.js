import { INITIAL_STATE } from '../constants/defaults';
import { getDataForCharts, generateMapData, generateReport, shallowEqual, parseTooltipData  } from '../utils';

var reducer = (state = INITIAL_STATE, action) => {
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
                dates: action.payload.data.dates,
                storedLisaData: action.payload.data.storedLisaData||{},
                storedCartogramData: action.payload.data.storedCartogramData||{}
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
        case 'ADD_TABLES_AND_UPDATE': {
            const storedData = {
                ...state.storedData,
                ...action.payload.data
            }

            return {
                ...state,
                storedData,
                shouldUpdate: true
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
            return {
                ...state,
                mapData: generateMapData(state),
                shouldUpdate: false,
                isLoading:false
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
            let currCaseData;
            try {
                currCaseData = 
                    state.dataPresets[state.currentData].tables[state.chartParams.table]?.file
                    ||state.defaultTables[state.dataPresets[state.currentData].geography][state.chartParams.table].file
            } catch {
                return {
                    ...state
                }
            }
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
            return {
                ...state,
                chartData: getDataForCharts(state.storedData[currCaseData], state.dates, additionalParams)
            }
        }
        case 'ADD_TABLE_AND_CHART': {
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

            const storedData = {
                ...state.storedData,
                ...action.payload.data
            }

            return {
                ...state,
                chartData: getDataForCharts(Object.values(action.payload.data)[0], state.dates, additionalParams),
                storedData
            }
        }
        case 'SET_CHART_PARAMS':{
            const chartParams = {
                ...state.chartParams,
                ...action.payload.params
            }

            const currCaseData = state.dataPresets[state.currentData].tables[state.chartParams.table]?.file||state.defaultTables[state.dataPresets[state.currentData].geography][state.chartParams.table].file
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
        case 'SET_STORED_DATA':{
            const storedData = {
                ...state.storedData,
                [action.payload.name]: action.payload.data
            }
            return {
                ...state,
                storedData
            };
        }
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
        case 'SET_STORED_CARTOGRAM_DATA':{
            return {
                ...state,
                mapData: generateMapData({...state, storedCartogramData: action.payload.data}),
                storedCartogramData: action.payload.data
            };
        }
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
        case 'SET_CURRENT_DATA':{
            const currentTable = {
                numerator: 
                    state.dataParams.numerator === "properties" ? "properties" : 
                    state.dataPresets[action.payload.data].tables.hasOwnProperty(state.dataParams.numerator) 
                        ? 
                    state.dataPresets[action.payload.data].tables[state.dataParams.numerator].file
                        :
                    state.defaultTables[state.dataPresets[action.payload.data].geography][state.dataParams.numerator].file,
                denominator:
                    state.dataParams.denominator === "properties" ? "properties" : 
                    state.dataPresets[action.payload.data].tables.hasOwnProperty(state.dataParams.denominator) 
                        ? 
                    state.dataPresets[action.payload.data].tables[state.dataParams.denominator].file
                        :
                    state.defaultTables[state.dataPresets[action.payload.data].geography][state.dataParams.denominator].file,
            }

            return {
                ...state,
                currentData: action.payload.data,
                selectionKeys: [],
                selectionNaes: [],
                sidebarData: {},
                currentTable
            }
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

            const currIndices = state.storedData[state.currentTable.numerator].dates
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
                    tooltipContent: {
                        x: state.tooltipContent.x,
                        y: state.tooltipContent.y,
                        data: state.tooltipContent.geoid ? parseTooltipData(state.tooltipContent.geoid, state) : state.tooltipContent.data,
                        geoid: state.tooltipContent.geoid
                    },
                    mapData: generateMapData({...state, dataParams}),
                    sidebarData: state.selectionKeys.length ? generateReport(state.selectionKeys, state) : state.sidebarData
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
                    state.dataPresets[state.currentData].tables.hasOwnProperty(dataParams.numerator) 
                        ? 
                    state.dataPresets[state.currentData].tables[dataParams.numerator].file
                        :
                    state.defaultTables[state.dataPresets[state.currentData].geography][dataParams.numerator].file,
                denominator:
                    dataParams.denominator === "properties" ? "properties" : 
                    state.dataPresets[state.currentData].tables.hasOwnProperty(dataParams.denominator) 
                        ? 
                    state.dataPresets[state.currentData].tables[dataParams.denominator].file
                        :
                    state.defaultTables[state.dataPresets[state.currentData].geography][dataParams.denominator].file,
            }

            if (state.dataParams.zAxisParams !== null) {
                dataParams.zAxisParams.nIndex = dataParams.nIndex;
                dataParams.zAxisParams.dIndex = dataParams.dIndex;
            }

            if (action.payload.params.variableName !== undefined && (dataParams.variableName !== state.dataParams.variable)){
                if (dataParams.nType === 'time-series' && state.dataParams.nType === 'time-series'){
                    dataParams.nRange = dataParams.nRange !== null && state.dataParams.nRange !== null ? state.dataParams.nRange : dataParams.nRange;
                } 
                
                if (dataParams.nType === 'time-series' && state.storedData[currentTable.numerator]?.dates?.indexOf(dataParams.nIndex) === -1) {
                    const nearestIndex = state.storedData[currentTable.numerator]?.dates?.reduce((a, b) => {return Math.abs(b - dataParams.nIndex) < Math.abs(a - dataParams.nIndex) ? b : a})
                    if (Math.abs(dataParams.nIndex-nearestIndex) < 14){
                        dataParams.nIndex = nearestIndex
                    } else {
                        dataParams.nIndex = state.storedData[currentTable.numerator]?.dates.slice(-1,)[0]
                    }
                }
    
                if (dataParams.dType === 'time-series') {
                    dataParams.dIndex = dataParams.nIndex
                    dataParams.dRange = dataParams.nRange
                }

                if (dataParams.nType === 'time-series' && dataParams.nIndex === null) {
                    dataParams.nIndex = state.storedIndex;
                    dataParams.nRange = state.storedRange;
                }
                if (dataParams.dType === 'time-series' && dataParams.dIndex === null) {
                    dataParams.dIndex = state.storedIndex;
                    dataParams.dRange = state.storedRange;
                }   
            }

            return {
                ...state,
                storedIndex: (dataParams.nType === 'characteristic' && state.dataParams.nType === 'time-series') ? state.dataParams.nIndex : state.storedIndex,
                storedRange: (dataParams.nType === 'characteristic' && state.dataParams.nType === 'time-series') ? state.dataParams.nRange : state.storedRange,
                dataParams,
                mapData: state.mapParams.binMode !== "dynamic" && state.mapParams.mapType !== 'lisa' && shallowEqual(state.dataParams, dataParams)
                        ? 
                    generateMapData({...state, dataParams}) 
                        : 
                    state.mapData,
                currentTable,
                tooltipContent: {
                    x: state.tooltipContent.x,
                    y: state.tooltipContent.y,
                    data: state.tooltipContent.geoid ? parseTooltipData(state.tooltipContent.geoid, state) : state.tooltipContent.data,
                    geoid: state.tooltipContent.geoid
                },
                sidebarData: state.selectionKeys.length ? generateReport(state.selectionKeys, state) : state.sidebarData
            }
        }
        case 'SET_VARIABLE_PARAMS_AND_DATASET':{
            let dataParams = {
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
                    state.dataPresets[action.payload.params.dataset].tables.hasOwnProperty(dataParams.numerator) 
                        ? 
                    state.dataPresets[action.payload.params.dataset].tables[dataParams.numerator].file
                        :
                    state.defaultTables[state.dataPresets[action.payload.params.dataset].geography][dataParams.numerator].file,
                denominator:
                    dataParams.denominator === "properties" ? "properties" : 
                    state.dataPresets[action.payload.params.dataset].tables.hasOwnProperty(dataParams.denominator) 
                        ? 
                    state.dataPresets[action.payload.params.dataset].tables[dataParams.denominator].file
                        :
                    state.defaultTables[state.dataPresets[action.payload.params.dataset].geography][dataParams.denominator].file,
            }

            if (action.payload.params.variableName !== undefined && (dataParams.variableName !== state.dataParams.variable)){
                if (dataParams.nType === 'time-series' && state.dataParams.nType === 'time-series'){
                    dataParams.nRange = dataParams.nRange !== null && state.dataParams.nRange !== null ? state.dataParams.nRange : dataParams.nRange;
                } 
                
                if (dataParams.nType === 'time-series' && state.storedData[currentTable.numerator]?.dates?.indexOf(dataParams.nIndex) === -1) {
                    const nearestIndex = state.storedData[currentTable.numerator]?.dates?.reduce((a, b) => {return Math.abs(b - dataParams.nIndex) < Math.abs(a - dataParams.nIndex) ? b : a})
                    if (Math.abs(dataParams.nIndex-nearestIndex) < 14){
                        dataParams.nIndex = nearestIndex
                    } else {
                        dataParams.nIndex = state.storedData[currentTable.numerator]?.dates.slice(-1,)[0]
                    }
                }

                if (dataParams.dType === 'time-series') {
                    dataParams.dIndex = dataParams.nIndex
                    dataParams.dRange = dataParams.nRange
                }
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

            if (state.storedData[state.currentTable.numerator]?.dates?.indexOf(dataParams.nIndex) === -1) dataParams.nIndex = state.storedData[state.currentTable.numerator]?.dates.slice(-1,)[0]
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
            let selectionKeys = [...state.selectionKeys];
            
            const properties = state.storedGeojson[state.currentData].properties
            const geography = state.dataPresets[state.currentData].geography

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

            const currCaseData = state.dataPresets[state.currentData].tables[state.chartParams.table]?.file||state.defaultTables[state.dataPresets[state.currentData].geography][state.chartParams.table].file;

            const additionalParams = {
                geoid: selectionKeys,
                populationData: state.chartParams.populationNormalized ? selectionKeys.map(key => properties[key].population) : [],
                name: ['County', 'County (Hybrid)'].includes(geography) ? selectionKeys.map(key => properties[key].NAME + ', ' + properties[key].state_abbr) : selectionKeys.map(key => properties[key].name)
            };
            
            return {
                ...state,
                selectionKeys,
                selectionNames: additionalParams.name,
                chartData: getDataForCharts(state.storedData[currCaseData], state.dates, additionalParams),
                sidebarData: generateReport(selectionKeys, state),
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
        case 'SET_IS_LOADING':{
            return {
                ...state,
                isLoading: true
            }
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
                tooltipData = parseTooltipData(action.payload.data, state)
            } else {
                tooltipData = action.payload.data
            }
            const tooltipContent = {
                x: action.payload.x,
                y: action.payload.y,
                data: tooltipData,
                geoid: +action.payload.data
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
        case 'SET_COLOR_FILTER': {
            return {
                ...state,
                colorFilter: action.payload
            }
        }
        case 'ADD_WEIGHTS':{
            const storedGeojson = {
                ...state.storedGeojson,
                [action.payload.file]: {
                    ...state.storedGeojson[action.payload.file],
                    weights: {
                        'Queen': action.payload.weights
                    }
                }
            }
            return {
                ...state,
                storedGeojson
            }
        }
        case 'ADD_CUSTOM_DATA': {
            const rootName = action.payload.selectedFile?.name.split('.geojson')[0];
            let dataName = action.payload.selectedFile?.name.split('.geojson')[0]
            if (state.storedGeojson.hasOwnProperty(dataName)){
                let i=2;
                while (state.storedGeojson.hasOwnProperty(dataName)) {
                    dataName = `${rootName}-${i}`
                    i++;
                }
            }

            const storedGeojson = {
                ...state.storedGeojson,
                [dataName]: {
                    ...action.payload.geojson,
                    weights: {},
                    dateIndices: [],
                    properties: indexGeoProps(
                        action.payload.geojson.data, 
                        false
                    ),
                    indices: getIdOrder(
                        action.payload.geojson.data.features,
                        false
                    )
                }
            }

            let variablePresets = {
                ...state.variablePresets
            }

            const datasetTree = {
                ...state.datasetTree,
                [dataName]: {
                    [dataName]:dataName,
                }
            }

            const defaultTables = {
                ...state.defaultTables,
                [dataName]: {}
            }

            const dataPresets = {
                ...state.dataPresets,
                [dataName]: {
                    plainName: dataName,
                    geojson: dataName,
                    id: 'idx',
                    geography: dataName,
                    tables: {}
                }
            }

            let variableTree = {
                [`HEADER: ${dataName}`]:{},
            }

            for (let i=0; i<action.payload.variables.length; i++){
                let currVariable = action.payload.variables[i].variableName
                variablePresets[currVariable] = action.payload.variables[i]
                variableTree[currVariable] = {
                    [dataName]: [dataName]
                }
            }
            variableTree = {
                ...variableTree,
                ...state.variableTree
            }

            const urlParamsTree = {
                ...state.urlParamsTree,
                [dataName]:{
                    name: dataName,
                    geography: dataName
                }
            }

            return {
                ...state,
                dataPresets,
                datasetTree,
                defaultTables,
                storedGeojson,
                urlParamsTree,
                variableTree,
                variablePresets,
                currentData: dataName,
                dataParams: {
                    ...action.payload.variables[0]
                },
                currentTable: {
                    numerator: "properties",
                    denominator: "properties"
                },
                mapParams: {
                    ...state.mapParams,
                    vizType: "2D",
                    dotDensityParams: {
                        ...state.mapParams.dotDensityParams,
                        colorCOVID: false
                    }
                },
                shouldPanMap: true
            }
        }
        case 'MAP_DID_PAN':{
            return {
                ...state,
                shouldPanMap: false
            }
        }
        default:
            return state;
    }
}

export default reducer;