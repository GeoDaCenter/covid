import { closestIndex } from '../utils';
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

export const generateReport = (geoids, {
    currentData,
    dataParams,
    dataPresets,
    dates,
    defaultTables,
    storedData,
    storedGeojson,
}) => {
    let report = {}

    const properties = storedGeojson[currentData].properties;
    const geography = dataPresets[currentData].geography;
    const currentTables = {...defaultTables[geography], ...dataPresets[currentData].tables}

    report.name = 
        geoids.length > 3 
        ? ['County', 'County (Hybrid)'].includes(geography) 
            ? 'Selected Counties' 
            : 'Selected States'
        : ['County', 'County (Hybrid)'].includes(geography) 
            ? geoids.map(key => properties[key].NAME + ', ' + properties[key].state_abbr).join(", ") 
            : geoids.map(key => properties[key].name).join(", ")

    report.population = aggregateProperty(properties, properties, geoids, 'population', 'sum')
    report.date = dates[dataParams.nIndex]
    
    const idx = closestIndex(storedData[currentTables.cases?.file].dates, dataParams.nIndex)        
    report.cases = aggregateTimeseries(storedData[currentTables.cases.file].data, properties, geoids, idx, 'sum')
    report.cases7d = (report.cases - aggregateTimeseries(storedData[currentTables.cases.file].data, properties, geoids, idx-7, 'sum'))/7
    report.cases100k = (report.cases7d/report.population)*100_000
    report.cases14 = aggregate2WeekTimeSeries(storedData[currentTables.cases.file].data, geoids, idx)    
  
    report.deaths = aggregateTimeseries(storedData[currentTables.deaths.file].data, properties, geoids, idx, 'sum')
    report.deaths7d = (report.deaths - aggregateTimeseries(storedData[currentTables.deaths.file].data, properties, geoids, idx-7, 'sum'))/7
    report.deaths100k = (report.deaths7d/report.population)*100_000
    report.deaths14 = aggregate2WeekTimeSeries(storedData[currentTables.deaths.file].data, geoids, idx)

    report.beds = aggregateProperty(properties, properties, geoids, 'beds', 'sum')
    report.casesPerBed = report.cases7d / report.beds
    try {
        if (storedData.hasOwnProperty(currentTables.vaccines_fully_vaccinated?.file)){
            const idx = closestIndex(storedData[currentTables.vaccines_fully_vaccinated?.file].dates, dataParams.nIndex)
            report.fully_vaccinated = aggregateTimeseries(storedData[currentTables.vaccines_fully_vaccinated?.file].data, properties, geoids, idx, 'weighted_average')
            report.fully_vaccinated14 = aggregate2WeekTimeSeries(storedData[currentTables.vaccines_fully_vaccinated?.file].data, geoids, idx)
            report.fully_vaccinatedPc = report.fully_vaccinated / report.population
        }
    } catch {}
    
    try {
        if (storedData.hasOwnProperty(currentTables.vaccines_one_dose?.file)){
            const idx = closestIndex(storedData[currentTables.vaccines_one_dose?.file].dates, dataParams.nIndex)
            report.one_dose = aggregateTimeseries(storedData[currentTables.vaccines_one_dose?.file].data, properties, geoids, idx, 'weighted_average')
            report.one_dose14 = aggregate2WeekTimeSeries(storedData[currentTables.vaccines_one_dose?.file].data, geoids, idx)
            report.one_dosePc = report.one_dose / report.population
        }
    } catch {}
    
    try {
        if (storedData.hasOwnProperty(currentTables.vaccines_dist?.file)){
            const idx = closestIndex(storedData[currentTables.vaccines_dist?.file].dates, dataParams.nIndex)
            report.doses_dist = aggregateTimeseries(storedData[currentTables.vaccines_dist?.file].data, properties, geoids, idx, 'weighted_average')
            report.doses_dist14 = aggregate2WeekTimeSeries(storedData[currentTables.vaccines_dist?.file].data, geoids, idx)
            report.doses_dist100 = (report.doses_dist / report.population) * 100
        }
    } catch {}

    try {
        if (storedData.hasOwnProperty(currentTables.testing?.file)){
            const idx = closestIndex(storedData[currentTables.testing?.file].dates, dataParams.nIndex)
            report.wk_pos = Math.round(aggregateTimeseries(storedData[currentTables.testing_wk_pos.file].data, properties, geoids, idx, 'weighted_average')*10000)/100
            report.wk_pos14 = aggregate2WeekTimeSeries(storedData[currentTables.testing_wk_pos.file].data, geoids, idx)
            report.tcap = aggregateTimeseries(storedData[currentTables.testing_tcap.file].data, properties, geoids, idx, 'weighted_average')
            report.tcap14 = aggregate2WeekTimeSeries(storedData[currentTables.testing_tcap.file].data, geoids, idx)
            report.testing = Math.round(aggregateTimeseries(storedData[currentTables.testing.file].data, properties, geoids, idx, 'sum')*100)/100
            report.ccpt = Math.round(aggregateTimeseries(storedData[currentTables.testing_ccpt.file].data, properties, geoids, idx, 'weighted_average')*10000)/100
        }    
    } catch {}
    
    try {
        if (storedData.hasOwnProperty(currentTables.chr_health_factors?.file)){
            report.PovChldPrc = aggregateProperty(storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'PovChldPrc', 'weighted_average')
            report.IncRt = aggregateProperty(storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'IncRt', 'weighted_average')
            report.MedianHouseholdIncome = aggregateProperty(storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'MedianHouseholdIncome', 'weighted_average')
            report.FdInsPrc = aggregateProperty(storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'FdInsPrc', 'weighted_average')
            report.UnEmplyPrc = aggregateProperty(storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'UnEmplyPrc', 'weighted_average')
            report.UnInPrc = aggregateProperty(storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'UnInPrc', 'weighted_average')
            report.PrmPhysRt = aggregateProperty(storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'PrmPhysRt', 'weighted_average', 'pcp')
            report.PrevHospRt = aggregateProperty(storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'PrevHospRt', 'sum')
            report.RsiSgrBlckRt = aggregateProperty(storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'RsiSgrBlckRt', 'weighted_average')
            report.SvrHsngPrbRt = aggregateProperty(storedData[currentTables.chr_health_factors.file].data, properties, geoids, 'SvrHsngPrbRt', 'weighted_average')
        }
    } catch {}

    try {
        if (storedData.hasOwnProperty(currentTables.essential_workers?.file)){
            report.EssentialPct = aggregateProperty(storedData[currentTables.essential_workers.file].data, properties, geoids, 'pct_essential', 'weighted_average')
        }
    } catch {}

    try {
        if (storedData.hasOwnProperty(currentTables.chr_health_context?.file)){
            report.Over65YearsPrc = aggregateProperty(storedData[currentTables.chr_health_context.file].data, properties, geoids, 'Over65YearsPrc', 'weighted_average')
            report.AdObPrc = aggregateProperty(storedData[currentTables.chr_health_context.file].data, properties, geoids, 'AdObPrc', 'weighted_average')
            report.AdDibPrc = aggregateProperty(storedData[currentTables.chr_health_context.file].data, properties, geoids, 'AdDibPrc', 'weighted_average')
            report.SmkPrc = aggregateProperty(storedData[currentTables.chr_health_context.file].data, properties, geoids, 'SmkPrc', 'weighted_average')
            report.ExcDrkPrc = aggregateProperty(storedData[currentTables.chr_health_context.file].data, properties, geoids, 'ExcDrkPrc', 'weighted_average')
            report.DrOverdMrtRt = aggregateProperty(storedData[currentTables.chr_health_context.file].data, properties, geoids, 'DrOverdMrtRt', 'sum')
        }
    } catch {}

    try {
        if (storedData.hasOwnProperty(currentTables.chr_life?.file)){
            report.LfExpRt = aggregateProperty(storedData[currentTables.chr_life.file].data, properties, geoids, 'LfExpRt', 'weighted_average')
            report.SlfHlthPrc = aggregateProperty(storedData[currentTables.chr_life.file].data, properties, geoids, 'SlfHlthPrc', 'weighted_average')
        }
    } catch {}

    // try {
    //     if (storedData.hasOwnProperty(currentTables.predictions?.file)){
    //         report.severity_index = aggregateProperty(storedData[currentTables.predictions.file].data, properties, geoids, 'severity_index', 'weighted_average')
    //         report.predDates = []
    //         for (let i = 2; i < 15; i+=2) report.predDates.push(storedData[currentTables.predictions.file].columns[i])
    //         report.pred1 = aggregateProperty(storedData[currentTables.predictions.file].data, properties, geoids, 2, 'sum')
    //         report.pred2 = aggregateProperty(storedData[currentTables.predictions.file].data, properties, geoids, 4, 'sum')
    //         report.pred3 = aggregateProperty(storedData[currentTables.predictions.file].data, properties, geoids, 6, 'sum')
    //         report.pred4 = aggregateProperty(storedData[currentTables.predictions.file].data, properties, geoids, 8, 'sum')
    //         report.pred5 = aggregateProperty(storedData[currentTables.predictions.file].data, properties, geoids, 10, 'sum')
    //         report.pred6 = aggregateProperty(storedData[currentTables.predictions.file].data, properties, geoids, 12, 'sum')
    //         report.pred7 = aggregateProperty(storedData[currentTables.predictions.file].data, properties, geoids, 14, 'sum')
    //     }
    // } catch {}
    
    try {
        if (storedData.hasOwnProperty(currentTables.pct_home?.file)){
            const idx = closestIndex(storedData[currentTables.pct_home?.file].dates, dataParams.nIndex)
            report.pct_home = aggregateTimeseries(storedData[currentTables.pct_home.file].data, properties, geoids, idx, 'weighted_average')
            report.pct_fulltime = aggregateTimeseries(storedData[currentTables.pct_fulltime.file].data, properties, geoids, idx, 'weighted_average')
            report.pct_parttime = aggregateTimeseries(storedData[currentTables.pct_parttime.file].data, properties, geoids, idx, 'weighted_average')
        }
    } catch {}
    
    return report
}