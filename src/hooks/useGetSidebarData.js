import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { findAllDefaults, findIn, generateReport } from '../utils';
export default function useGetSidebarData({
    selectionKeys=[],
    panelOpen=false
}){
    // pieces of redux state
    const currentData = useSelector(({params}) => params.currentData);
    const dates = useSelector(({params}) => params.dates);
    const dataParams = useSelector(({params}) => params.dataParams);
    const datasets = useSelector(({params}) => params.datasets);
    const tables = useSelector(({params}) => params.tables);

    // current state data params
    const currIndex = dataParams.nIndex||dataParams.dIndex;
    const currDataset = findIn(datasets, 'file', currentData)
    const currTables = [
        ...Object.values(currDataset.tables).map(tableId => findIn(tables, 'id', tableId)),
        ...findAllDefaults(tables, currDataset.geography).map(dataspec => ({...dataspec}))
    ].filter((entry, index, self) => self.findIndex(f => f.table === entry.table) === index)
    
    const storedGeojson = useSelector(({data}) => data.storedGeojson);
    const storedData = useSelector(({data}) => data.storedData);
    
    const sidebarData = useMemo(() => {
        if (!panelOpen || !selectionKeys.length) 
        return {};
        return generateReport({
            currentData,
            currDataset,
            currIndex,
            dates,
            currTables,
            selectionKeys,
            storedData,
            storedGeojson,
        })
    })   

    return sidebarData
}