import { tooltipTables } from '../config';
import { dataFn } from '../utils';

export const parseTooltipData = (geoid, state) => {
    let tooltipData = {}
    const properties = state.storedGeojson[state.currentData].properties[geoid];
    const geography = state.dataPresets[state.currentData].geography;

    if (!(['County','State','County (Hybrid)'].includes(geography))) {
        const varsToCalculate = Object.entries(state.variableTree)
            .filter(treeEntry => treeEntry[1].hasOwnProperty(geography))
            .map(entry => entry[0])
        
        for (let i=0; i<varsToCalculate.length; i++) {
            tooltipData[varsToCalculate[i]] = dataFn(properties, properties, state.variablePresets[varsToCalculate[i]])
        }
        tooltipData = {custom: {...tooltipData, ...(Object.keys(properties).length < 10 ? properties : {})}}
        return tooltipData
    }
    
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
            const tempVal = state.storedData[currentTables[table].file].data[geoid][state.dataParams.nIndex]
            if (tempVal !== null && tempVal !== undefined) tooltipData[table] = tempVal
            
            if (table === 'cases' || table === 'deaths') tooltipData[`daily_${table}`] = state.storedData[currentTables[table].file].data[geoid][state.dataParams.nIndex]-state.storedData[currentTables[table].file].data[geoid][state.dataParams.nIndex-1]
        }
    }
    return tooltipData
}