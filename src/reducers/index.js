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

const parseTooltipData = (geoid, state) => {
    let tooltipData = {}
    const properties = state.storedGeojson[state.currentData].properties[geoid];
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
            tooltipData[table] = state.storedData[currentTables[table].file][0][geoid][state.dataParams.nIndex]
            if (table === 'cases' || table === 'deaths') tooltipData[`daily_${table}`] = state.storedData[currentTables[table].file][0][geoid][state.dataParams.nIndex]-state.storedData[currentTables[table].file][0][geoid][state.dataParams.nIndex-1]
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
const aggregateProperty = (table, properties, geoids, column, operation, specialCase=null) => {
    let dataArray = []
    let totalPopulation = 0;
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
const aggregateDataFunction = (numeratorTable, denominatorTable, properties, geoids, operation, params) => {
    let dataArray = []; 
    let totalPopulation = 0;
    console.log(numeratorTable, denominatorTable, properties, geoids, operation, params)
    
    if (operation === 'weighted_average') {
        for (let i=0; i<geoids.length; i++){
            let selectionPop = properties[geoids[i]].population;
            totalPopulation+=selectionPop;
            console.log(dataFn(numeratorTable[geoids[i]], denominatorTable[geoids[i]], params))
            dataArray.push(dataFn(numeratorTable[geoids[i]], denominatorTable[geoids[i]], params)*selectionPop)
        }
    } else {
        for (let i=0; i<geoids.length; i++){
            dataArray.push(dataFn(numeratorTable[geoids[i]], denominatorTable[geoids[i]], params))
        }
    }
    console.log(dataArray)

    return performOperation(dataArray, operation, totalPopulation);
}

const generateReport = (geoids, state, dataPresetsRedux, defaultTables) => {
    let report = {}

    const properties = state.storedGeojson[state.currentData].properties;
    const geography = dataPresetsRedux[state.currentData].geography;
    const currentTables = {...defaultTables[geography], ...dataPresetsRedux[state.currentData].tables}

    report.name = 
        geoids.length > 3 
            ? 
        geography === "County" ? 'Selected Counties' : 'Selected States'
            :
        geography === "County" ? geoids.map(key => properties[key].NAME + ', ' + properties[key].state_abbr).join(", ") : geoids.map(key => properties[key].name).join(", ")
    
    report.population = aggregateProperty(properties, properties, geoids, 'population', 'sum')

    report.cases = aggregateTimeseries(state.storedData[currentTables.cases.file][0], properties, geoids, state.dataParams.nIndex, 'sum')
    report.cases7d = (report.cases - aggregateTimeseries(state.storedData[currentTables.cases.file][0], properties, geoids, state.dataParams.nIndex-7, 'sum'))/7
    report.cases100k = (report.cases7d/report.population)*100_000
    report.cases14 = aggregate2WeekTimeSeries(state.storedData[currentTables.cases.file][0], geoids, state.dataParams.nIndex)    
    
    report.deaths = aggregateTimeseries(state.storedData[currentTables.deaths.file][0], properties, geoids, state.dataParams.nIndex, 'sum')
    report.deaths7d = (report.deaths - aggregateTimeseries(state.storedData[currentTables.deaths.file][0], properties, geoids, state.dataParams.nIndex-7, 'sum'))/7
    report.deaths100k = (report.deaths7d/report.population)*100_000
    report.deaths14 = aggregate2WeekTimeSeries(state.storedData[currentTables.deaths.file][0], geoids, state.dataParams.nIndex)

    report.beds = aggregateProperty(properties, properties, geoids, 'beds', 'sum')
    report.casesPerBed = report.cases7d / report.beds

    if (state.storedData.hasOwnProperty(currentTables.vaccines_fully_vaccinated?.file)){
        report.fully_vaccinated = aggregateTimeseries(state.storedData[currentTables.vaccines_fully_vaccinated?.file][0], properties, geoids, state.dataParams.nIndex, 'weighted_average')
        report.fully_vaccinated14 = aggregate2WeekTimeSeries(state.storedData[currentTables.vaccines_fully_vaccinated?.file][0], geoids, state.dataParams.nIndex)
        report.fully_vaccinatedPc = report.fully_vaccinated / report.population
    }
    
    if (state.storedData.hasOwnProperty(currentTables.vaccines_one_dose?.file)){
        report.one_dose = aggregateTimeseries(state.storedData[currentTables.vaccines_one_dose?.file][0], properties, geoids, state.dataParams.nIndex, 'weighted_average')
        report.one_dose14 = aggregate2WeekTimeSeries(state.storedData[currentTables.vaccines_one_dose?.file][0], geoids, state.dataParams.nIndex)
        report.one_dosePc = report.one_dose / report.population
    }
    
    if (state.storedData.hasOwnProperty(currentTables.vaccines_dist?.file)){
        report.doses_dist = aggregateTimeseries(state.storedData[currentTables.vaccines_dist?.file][0], properties, geoids, state.dataParams.nIndex, 'weighted_average')
        report.doses_dist14 = aggregate2WeekTimeSeries(state.storedData[currentTables.vaccines_dist?.file][0], geoids, state.dataParams.nIndex)
        report.doses_dist100 = (report.doses_dist / report.population) * 100
    }

    
    if (state.storedData.hasOwnProperty(currentTables.testing.file)){
        report.wk_pos = aggregateTimeseries(state.storedData[currentTables.testing_wk_pos.file][0], properties, geoids, state.dataParams.nIndex, 'weighted_average')
        report.doses_dist14 = aggregate2WeekTimeSeries(state.storedData[currentTables.vaccines_dist?.file][0], geoids, state.dataParams.nIndex)
        report.doses_dist14 = aggregate2WeekTimeSeries(state.storedData[currentTables.vaccines_dist?.file][0], geoids, state.dataParams.nIndex)
        report.doses_dist100 = (report.doses_dist / report.population) * 100
    }    

    // if (state.storedData.hasOwnProperty(currentTables.chr_health_factors.file)){
    //     report.child_poverty = 
    // }
//     <ReportSection>
//     <h2>Community Health Factors<Tooltip id="healthfactor"/></h2>
//     <h6>Source: <a href="https://www.countyhealthrankings.org/" target="_blank" rel="noopener noreferrer">County Health Rankings</a></h6>
//     <p>Children in poverty</p><Tooltip id="PovChldPrc"/>
//     <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'PovChldPrc'), 'weighted_average')}%</h3>
//     <p>Income inequality<Tooltip id="IncRt"/></p>
//     <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'IncRt'), 'weighted_average')}</h3>

//     <p>Median household income</p><Tooltip id="MedianHouseholdIncome"/>
//     <h3>${aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'MedianHouseholdIncome'), 'weighted_average').toLocaleString('en')}</h3>

//     <p>Food insecurity</p><Tooltip id="FdInsPrc"/>
//     <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'FdInsPrc'), 'weighted_average')}%</h3>

//     <p>Unemployment</p><Tooltip id="UnEmplyPrc"/>
//     <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'UnEmplyPrc'), 'weighted_average')}%</h3>

//     <p>Uninsured</p><Tooltip id="UnInPrc"/>
//     <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'UnInPrc'), 'weighted_average')}%</h3>

//     <p>Primary care physicians</p><Tooltip id="PrmPhysRt"/>
//     <h3>{Math.round(aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'PrmPhysRt'), 'weighted_average', 'pcp'))}:1</h3>

//     <p>Preventable hospital stays</p><Tooltip id="PrevHospRt"/>
//     <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'PrevHospRt'), 'sum')}</h3>

//     <p>Residential segregation <br/>black / white</p>
//     <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'RsiSgrBlckRt'), 'weighted_average')}</h3>

//     <p>Severe housing problems</p><Tooltip id="SvrHsngPrbRt"/>
//     <h3>{aggregateProperty('chr_health_factors', colLookup(cols, currentData, 'chr_health_factors', 'SvrHsngPrbRt'), 'weighted_average')}%</h3>
//   </ReportSection>
    return report
}

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
                currentData: action.payload.data,
                selectionKeys: [],
                selectionNaes: [],
                sidebarData: {}
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
            
            const tooltipContent = {
                x: state.tooltipContent.x,
                y: state.tooltipContent.y,
                data: state.tooltipContent.geoid ? parseTooltipData(state.tooltipContent.geoid, state) : state.tooltipContent,
                geoid: state.tooltipContent.geoid
            }
            
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
                    tooltipContent,
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

            const tooltipContent = {
                x: state.tooltipContent.x,
                y: state.tooltipContent.y,
                data: state.tooltipContent.geoid ? parseTooltipData(state.tooltipContent.geoid, state) : state.tooltipContent,
                geoid: state.tooltipContent.geoid
            }
                
            if (dataParams.nType === 'characteristic' && state.dataParams.nType === 'time-series') {
                return {
                    ...state,
                    storedIndex: state.dataParams.nIndex,
                    storedRange: state.dataParams.nRange,
                    dataParams,
                    mapData,
                    currentTable,
                    tooltipContent
                }
            } else {
                return {
                    ...state,
                    dataParams,
                    mapData,
                    currentTable,
                    tooltipContent
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
            const reportData = generateReport(selectionKeys, state, dataPresetsRedux, defaultTables)
            console.log(reportData)
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
            
        default:
            return state;
    }
}

export default reducer;