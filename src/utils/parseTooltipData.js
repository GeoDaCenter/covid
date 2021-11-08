import { tooltipTables } from '../config';

export const parseTooltipData = (geoid, state) => {
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