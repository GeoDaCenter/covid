import { tooltipTables } from '../config';
import { closestIndex } from '../utils';

export const parseTooltipData = (geoid, {currentData, storedData, storedGeojson, dataPresets, defaultTables, dataParams}) => {
    let tooltipData = {}
    const properties = storedGeojson[currentData].properties[geoid];
    const geography = dataPresets[currentData].geography;

    tooltipData = {
        population: properties.population,
        name: ['County', 'County (Hybrid)'].includes(geography) ? properties.NAME + ', ' + properties.state_abbr : properties.NAME
    }
    
    const currentTables = {
        ...defaultTables[geography],
        ...dataPresets[currentData].tables
    }

    for (const table in currentTables){
        if (storedData.hasOwnProperty(currentTables[table].file) && tooltipTables.includes(table) && storedData[currentTables[table].file].data.hasOwnProperty(geoid)){
            const index = closestIndex(storedData[currentTables[table].file].dates, dataParams.nIndex)
            tooltipData[table] = storedData[currentTables[table].file].data[geoid][index]
            if (table === 'cases' || table === 'deaths') tooltipData[`daily_${table}`] = storedData[currentTables[table].file].data[geoid][index]-storedData[currentTables[table].file].data[geoid][index-1]
        }
    }
    return tooltipData
}