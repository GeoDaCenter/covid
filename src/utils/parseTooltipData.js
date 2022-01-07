import { findIn } from '../utils';
import { tooltipTables } from '../config/defaults';

export const parseTooltipData = ({
  currentData,
  currDataset,
  currIndex,
  currTables,
  geoid,
  storedGeojson,
  storedData
}) => {
  if (!currDataset || !storedGeojson[currentData] || !currTables) return {}
  let tooltipData = {};
  const { file, geography, join, name, tables } = currDataset;
  const properties = storedGeojson[currentData].properties;

  const locProperties = properties[geoid]
  const pop = locProperties && locProperties.population;
  
  if (locProperties){
    tooltipData.name = ['County', 'County (Hybrid)'].includes(geography)
        ? locProperties.NAME + ', ' + locProperties.state_abbr
        : locProperties.NAME
  }
  for (let i=0; i<currTables.length; i++){
    const tableName = currTables[i];
    const data = storedData[tableName.name];
    if (data?.data && data.data[geoid] && data?.dates && data.dates.includes(currIndex)) {
      tooltipData[`${tableName.table}`] = data.data[geoid][currIndex]
    }
  }

  // for (const table in currentTables) {
  //   if (
  //     state.storedData.hasOwnProperty(currentTables[table].file) &&
  //     tooltipTables.includes(table) &&
  //     state.storedData[currentTables[table].file].data.hasOwnProperty(geoid)
  //   ) {
  //     const tempVal =
  //       state.storedData[currentTables[table].file].data[geoid][
  //         state.dataParams.nIndex
  //       ];
  //     if (tempVal !== null && tempVal !== undefined)
  //       tooltipData[table] = tempVal;

  //     if (table === 'cases' || table === 'deaths')
  //       tooltipData[`daily_${table}`] =
  //         state.storedData[currentTables[table].file].data[geoid][
  //           state.dataParams.nIndex
  //         ] -
  //         state.storedData[currentTables[table].file].data[geoid][
  //           state.dataParams.nIndex - 1
  //         ];
  //   }
  // }
  return tooltipData;
};
