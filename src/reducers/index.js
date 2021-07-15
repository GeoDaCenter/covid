import { INITIAL_STATE } from '../constants/defaults';
import { mapFnNb, mapFnTesting, mapFnHinge, dataFn, getVarId, getDataForCharts } from '../utils';
import { tooltipTables } from '../config';

// utils
const getSimpleColor = (value, bins, colorScale, mapType, numerator, storedLisaData, storedGeojson, currentData, GEOID, mapFn) => mapFn(value, bins, colorScale, mapType, numerator);
const getLisaColor = (value, bins, colorScale, mapType, numerator, storedLisaData, storedGeojson, currentData, GEOID) => colorScale[storedLisaData[storedGeojson[currentData].indices['geoidOrder'][GEOID]]]||[240,240,240]
const getColorFunction = (mapType) => mapType === 'lisa' ? getLisaColor : getSimpleColor;
const getMapFunction = (mapType, table) => mapType.includes("hinge") ? mapFnHinge : table.includes('testing') ? mapFnTesting : mapFnNb;
const getHeight = (val, dataParams) => val*(dataParams.scale3D/((dataParams.nType === "time-series" && dataParams.nRange === null) ? (dataParams.nIndex)/7 : 1));

const generateMapData = (state) => {
    if (!state.mapParams.bins.hasOwnProperty("bins") || (state.mapParams.mapType !== 'lisa' && !state.mapParams.bins.breaks)) {
        return state
    };

    let returnObj = {};

    const getTable = (i, predicate) => {
        if (state.dataParams[predicate] === 'properties' ) {
            return state.storedGeojson[state.currentData].data.features[i].properties 
        } else {
            try {
                return state.storedData[state.dataPresets[state.currentData].tables[state.dataParams[predicate]].file].data[state.storedGeojson[state.currentData].data.features[i].properties.GEOID]
            } catch {
                return state.storedData[state.defaultTables[state.dataPresets[state.currentData].geography][state.dataParams[predicate]].file].data[state.storedGeojson[state.currentData].data.features[i].properties.GEOID];
            }
        }
    }

    const getColor = getColorFunction(state.mapParams.mapType)
    const mapFn = getMapFunction(state.mapParams.mapType, state.dataParams.numerator)

    if (state.mapParams.vizType === "cartogram"){
        for (let i=0; i<state.storedCartogramData.length; i++){
            const currGeoid = state.storedGeojson[state.currentData].indices.indexOrder[state.storedCartogramData[i].properties.id]

            const color = getColor(
                state.storedCartogramData[i].value, 
                state.mapParams.bins.breaks, 
                state.mapParams.colorScale, 
                state.mapParams.mapType, 
                state.dataParams.numerator, 
                state.storedLisaData, 
                state.storedGeojson, 
                state.currentData, 
                currGeoid,
                mapFn
            );
            if (color === null) {
                returnObj[currGeoid] = {color:[0,0,0,0]}
                continue;
            }
    
            returnObj[currGeoid] = {
                ...state.storedCartogramData[i],
                color
            }
        }
        return {
            params: getVarId(state.currentData, state.dataParams, state.mapParams),
            data: returnObj
        }
    }

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
    if (keys.length !== Object.keys(object2).length) return false; 
    for (let i=0; i<keys.length; i++) {
        if (object1[keys[i]] !== object2[keys[i]]) {
            if (keys[i] !== 'nIndex' && keys[i] !== 'dIndex') return false;  
        }
    }
    return true;
};

const parseTooltipData = (geoid, state) => {
    let tooltipData = {}
    const properties = state.storedGeojson[state.currentData].properties[geoid];
    const geography = state.dataPresets[state.currentData].geography;

    tooltipData = {
        population: properties.population,
        name: ['County', 'County (Hybrid)'].includes(geography) ? properties.NAME + ', ' + properties.state_abbr : properties.NAME
    }
    
    const currentTables = {
        ...state.defaultTables[geography],
        ...state.dataPresets[state.currentData].tables
    }

    for (const table in currentTables){
        if (state.storedData.hasOwnProperty(currentTables[table].file) && tooltipTables.includes(table) && state.storedData[currentTables[table].file].data.hasOwnProperty(geoid)){
            tooltipData[table] = state.storedData[currentTables[table].file].data[geoid][state.dataParams.nIndex]
            if (table === 'cases' || table === 'deaths') tooltipData[`daily_${table}`] = state.storedData[currentTables[table].file].data[geoid][state.dataParams.nIndex]-state.storedData[currentTables[table].file].data[geoid][state.dataParams.nIndex-1]
        }
    }
    return tooltipData
}

// Replace Null/NaN with 0 
const cleanData = (inputData) => inputData.map(d => d >=0 ? d : isNaN(d) || d===null ? 0 : d)

// Performs different operations on the data array output
// Sum, Average, and weighted average
const performOperation = (dataArray, operation, totalPopulation) => {
// Sum up data
    const reducer = (a, b) => a + b;
    // Clean data
    const clean = cleanData(dataArray);

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
// Prepares data for the previous operation
const aggregateProperty = (table, properties, geoids, prop, operation, specialCase=null) => {
    let dataArray = []
    let totalPopulation = 0;
    const column = typeof prop === "string" ? prop : Object.keys(Object.values(table)[0])[prop];
    // Loop through and collect data from selected geographies in SelectionIndex
    if (operation === 'weighted_average') {
        for (let i=0; i<geoids.length; i++){
            let selectionPop = properties[geoids[i]].population;
            totalPopulation+=selectionPop;

            if (specialCase !== null) {
                if (specialCase === 'pcp'){
                    try { 
                        dataArray.push(parseInt(table[geoids[i]][column].split(':')[0])*selectionPop)
                    } catch { dataArray.push(0) }
                } 
                
            } else {
                dataArray.push(table[geoids[i]][column]*selectionPop)
            }
        }
    } else {
        for (let i=0; i<geoids.length; i++){
            dataArray.push(table[geoids[i]][column])
        }
    }
    return performOperation(dataArray, operation, totalPopulation);
}

// Same as aggregteProperty(), but for time-series data
const aggregateTimeseries = (table, properties, geoids, index, operation) => {
    let dataArray = [];
    let totalPopulation = 0;
    if (operation === 'weighted_average') {
        for (let i=0; i<geoids.length; i++){
            let selectionPop = properties[geoids[i]].population;
            totalPopulation+=selectionPop;
            dataArray.push(table[geoids[i]][index]*selectionPop)
        }
    } else {
        for (let i=0; i<geoids.length; i++){
            dataArray.push(table[geoids[i]][index])
        }
    }

    return performOperation(dataArray, operation, totalPopulation);
}

// Generate data for 2-week line charts
const aggregate2WeekTimeSeries = (table, geoids, endIndex) => {
    let twoWeek = new Array(14).fill(0)
    for (let i=0, n=13;i<14;i++, n--){
        for (let g=0; g<geoids.length; g++){
            twoWeek[n] += table[geoids[g]][endIndex - i]
        }
    }
    return twoWeek
}

// // For more complete data functions (like population normalized)
// const aggregateDataFunction = (numeratorTable, denominatorTable, properties, geoids, operation, params) => {
//     let dataArray = []; 
//     let totalPopulation = 0;
    
//     if (operation === 'weighted_average') {
//         for (let i=0; i<geoids.length; i++){
//             let selectionPop = properties[geoids[i]].population;
//             totalPopulation+=selectionPop;
//             dataArray.push(dataFn(numeratorTable[geoids[i]], denominatorTable[geoids[i]], params)*selectionPop)
//         }
//     } else {
//         for (let i=0; i<geoids.length; i++){
//             dataArray.push(dataFn(numeratorTable[geoids[i]], denominatorTable[geoids[i]], params))
//         }
//     }

//     return performOperation(dataArray, operation, totalPopulation);
// }

const generateReport = (geoids, state) => {
    let report = {}

    const properties = state.storedGeojson[state.currentData].properties;
    const geography = state.dataPresets[state.currentData].geography;
    const currentTables = {...state.defaultTables[geography], ...state.dataPresets[state.currentData].tables}

    report.name = 
        geoids.length > 3 
        ? ['County', 'County (Hybrid)'].includes(geography) 
            ? 'Selected Counties' 
            : 'Selected States'
        : ['County', 'County (Hybrid)'].includes(geography) 
            ? geoids.map(key => properties[key].NAME + ', ' + properties[key].state_abbr).join(", ") 
            : geoids.map(key => properties[key].name).join(", ")

    report.population = aggregateProperty(properties, properties, geoids, 'population', 'sum')
    report.date = state.dates[state.dataParams.nIndex]

    report.cases = aggregateTimeseries(state.storedData[currentTables.cases.file].data, properties, geoids, state.dataParams.nIndex, 'sum')
    report.cases7d = (report.cases - aggregateTimeseries(state.storedData[currentTables.cases.file].data, properties, geoids, state.dataParams.nIndex-7, 'sum'))/7
    report.cases100k = (report.cases7d/report.population)*100_000
    report.cases14 = aggregate2WeekTimeSeries(state.storedData[currentTables.cases.file].data, geoids, state.dataParams.nIndex)    
  
    report.deaths = aggregateTimeseries(state.storedData[currentTables.deaths.file].data, properties, geoids, state.dataParams.nIndex, 'sum')
    report.deaths7d = (report.deaths - aggregateTimeseries(state.storedData[currentTables.deaths.file].data, properties, geoids, state.dataParams.nIndex-7, 'sum'))/7
    report.deaths100k = (report.deaths7d/report.population)*100_000
    report.deaths14 = aggregate2WeekTimeSeries(state.storedData[currentTables.deaths.file].data, geoids, state.dataParams.nIndex)

    report.beds = aggregateProperty(properties, properties, geoids, 'beds', 'sum')
    report.casesPerBed = report.cases7d / report.beds

    try {
        if (state.storedData.hasOwnProperty(currentTables.vaccines_fully_vaccinated?.file)){
            
            report.fully_vaccinated = aggregateTimeseries(state.storedData[currentTables.vaccines_fully_vaccinated?.file].data, properties, geoids, state.dataParams.nIndex, 'weighted_average')
            report.fully_vaccinated14 = aggregate2WeekTimeSeries(state.storedData[currentTables.vaccines_fully_vaccinated?.file].data, geoids, state.dataParams.nIndex)
            report.fully_vaccinatedPc = report.fully_vaccinated / report.population
        }
        
        if (state.storedData.hasOwnProperty(currentTables.vaccines_one_dose?.file)){
            report.one_dose = aggregateTimeseries(state.storedData[currentTables.vaccines_one_dose?.file].data, properties, geoids, state.dataParams.nIndex, 'weighted_average')
            report.one_dose14 = aggregate2WeekTimeSeries(state.storedData[currentTables.vaccines_one_dose?.file].data, geoids, state.dataParams.nIndex)
            report.one_dosePc = report.one_dose / report.population
        }
        
        if (state.storedData.hasOwnProperty(currentTables.vaccines_dist?.file)){
            report.doses_dist = aggregateTimeseries(state.storedData[currentTables.vaccines_dist?.file].data, properties, geoids, state.dataParams.nIndex, 'weighted_average')
            report.doses_dist14 = aggregate2WeekTimeSeries(state.storedData[currentTables.vaccines_dist?.file].data, geoids, state.dataParams.nIndex)
            report.doses_dist100 = (report.doses_dist / report.population) * 100
        }
    } catch {}

    if (state.storedData.hasOwnProperty(currentTables.testing?.file)){
        report.wk_pos = Math.round(aggregateTimeseries(state.storedData[currentTables.testing_wk_pos.file].data, properties, geoids, state.dataParams.nIndex, 'weighted_average')*10000)/10000
        report.wk_pos14 = aggregate2WeekTimeSeries(state.storedData[currentTables.testing_wk_pos.file].data, geoids, state.dataParams.nIndex)
        report.tcap = aggregateTimeseries(state.storedData[currentTables.testing_tcap.file].data, properties, geoids, state.dataParams.nIndex, 'weighted_average')
        report.tcap14 = aggregate2WeekTimeSeries(state.storedData[currentTables.testing_tcap.file].data, geoids, state.dataParams.nIndex)
        report.testing = aggregateTimeseries(state.storedData[currentTables.testing.file].data, properties, geoids, state.dataParams.nIndex, 'sum')
        report.ccpt = Math.round(aggregateTimeseries(state.storedData[currentTables.testing_ccpt.file].data, properties, geoids, state.dataParams.nIndex, 'weighted_average')*10000)/10000
    }    
    
    if (state.storedData.hasOwnProperty(currentTables.chr_health_factors?.file)){
        report.PovChldPrc = aggregateProperty(state.storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'PovChldPrc', 'weighted_average')
        report.IncRt = aggregateProperty(state.storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'IncRt', 'weighted_average')
        report.MedianHouseholdIncome = aggregateProperty(state.storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'MedianHouseholdIncome', 'weighted_average')
        report.FdInsPrc = aggregateProperty(state.storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'FdInsPrc', 'weighted_average')
        report.UnEmplyPrc = aggregateProperty(state.storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'UnEmplyPrc', 'weighted_average')
        report.UnInPrc = aggregateProperty(state.storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'UnInPrc', 'weighted_average')
        report.PrmPhysRt = aggregateProperty(state.storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'PrmPhysRt', 'weighted_average', 'pcp')
        report.PrevHospRt = aggregateProperty(state.storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'PrevHospRt', 'sum')
        report.RsiSgrBlckRt = aggregateProperty(state.storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'RsiSgrBlckRt', 'weighted_average')
        report.SvrHsngPrbRt = aggregateProperty(state.storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'SvrHsngPrbRt', 'weighted_average')
    }

    if (state.storedData.hasOwnProperty(currentTables.essential_workers?.file)){
        report.EssentialPct = aggregateProperty(state.storedData[currentTables.essential_workers.file].data, properties, geoids, 'pct_essential', 'weighted_average')
    }

    if (state.storedData.hasOwnProperty(currentTables.chr_health_context?.file)){
        report.Over65YearsPrc = aggregateProperty(state.storedData[currentTables.chr_health_context.file].data, properties, geoids, 'Over65YearsPrc', 'weighted_average')
        report.AdObPrc = aggregateProperty(state.storedData[currentTables.chr_health_context.file].data, properties, geoids, 'AdObPrc', 'weighted_average')
        report.AdDibPrc = aggregateProperty(state.storedData[currentTables.chr_health_context.file].data, properties, geoids, 'AdDibPrc', 'weighted_average')
        report.SmkPrc = aggregateProperty(state.storedData[currentTables.chr_health_context.file].data, properties, geoids, 'SmkPrc', 'weighted_average')
        report.ExcDrkPrc = aggregateProperty(state.storedData[currentTables.chr_health_context.file].data, properties, geoids, 'ExcDrkPrc', 'weighted_average')
        report.DrOverdMrtRt = aggregateProperty(state.storedData[currentTables.chr_health_context.file].data, properties, geoids, 'DrOverdMrtRt', 'sum')
    }

    if (state.storedData.hasOwnProperty(currentTables.chr_life?.file)){
        report.LfExpRt = aggregateProperty(state.storedData[currentTables.chr_life.file].data, properties, geoids, 'LfExpRt', 'weighted_average')
        report.SlfHlthPrc = aggregateProperty(state.storedData[currentTables.chr_life.file].data, properties, geoids, 'SlfHlthPrc', 'weighted_average')
    }

    if (state.storedData.hasOwnProperty(currentTables.predictions?.file)){
        report.severity_index = aggregateProperty(state.storedData[currentTables.predictions.file].data, properties, geoids, 'severity_index', 'weighted_average')
        report.predDates = []
        for (let i = 2; i < 15; i+=2) report.predDates.push(state.storedData[currentTables.predictions.file].columns[i])
        report.pred1 = aggregateProperty(state.storedData[currentTables.predictions.file].data, properties, geoids, 2, 'sum')
        report.pred2 = aggregateProperty(state.storedData[currentTables.predictions.file].data, properties, geoids, 4, 'sum')
        report.pred3 = aggregateProperty(state.storedData[currentTables.predictions.file].data, properties, geoids, 6, 'sum')
        report.pred4 = aggregateProperty(state.storedData[currentTables.predictions.file].data, properties, geoids, 8, 'sum')
        report.pred5 = aggregateProperty(state.storedData[currentTables.predictions.file].data, properties, geoids, 10, 'sum')
        report.pred6 = aggregateProperty(state.storedData[currentTables.predictions.file].data, properties, geoids, 12, 'sum')
        report.pred7 = aggregateProperty(state.storedData[currentTables.predictions.file].data, properties, geoids, 14, 'sum')
    }
    
    if (state.storedData.hasOwnProperty(currentTables.pct_home?.file)){
        report.pct_home = aggregateTimeseries(state.storedData[currentTables.pct_home.file].data, properties, geoids, state.dataParams.nIndex, 'weighted_average')
        report.pct_fulltime = aggregateTimeseries(state.storedData[currentTables.pct_fulltime.file].data, properties, geoids, state.dataParams.nIndex, 'weighted_average')
        report.pct_parttime = aggregateTimeseries(state.storedData[currentTables.pct_parttime.file].data, properties, geoids, state.dataParams.nIndex, 'weighted_average')
    }
    
    return report
}

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
            const currCaseData = state.dataPresets[state.currentData].tables[state.chartParams.table]?.file||state.defaultTables[state.dataPresets[state.currentData].geography][state.chartParams.table].file
            
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
        default:
            return state;
    }
}

export default reducer;