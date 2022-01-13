import React, {useMemo} from 'react';
import { useSelector } from 'react-redux';
import { useDataStore } from '../contexts/Data';
import { findIn, findAllDefaults, parseTooltipData } from '../utils';

export default function useGetTooltipContent({
    data=false,
    geoid=null
}){
    // pieces of redux state
    const currentData = useSelector((state) => state.currentData);
    const dates = useSelector((state) => state.dates);
    const dataParams = useSelector((state) => state.dataParams);
    const datasets = useSelector((state) => state.datasets);
    const tables = useSelector((state) => state.tables);

    // current state data params
    const currIndex = dataParams.nIndex||dataParams.dIndex;
    const currDataset = findIn(datasets, 'file', currentData)
    const currTables = [
        ...Object.values(currDataset.tables).map(tableId => findIn(tables, 'id', tableId)),
        ...findAllDefaults(tables, currDataset.geography).map(dataspec => ({...dataspec}))
    ].filter((entry, index, self) => self.findIndex(f => f.table === entry.table) === index)
    
    const [{
      storedData,
      storedGeojson,
    }] = useDataStore();

    const tooltipContent = useMemo(() => {
        if (data) {
            return data
        } else {
            return parseTooltipData({
                currentData,
                currDataset,
                currIndex,
                currTables,
                geoid,
                storedGeojson,
                storedData
            })
        }
    },[JSON.stringify(data), geoid, currIndex, currentData])

    return tooltipContent

}