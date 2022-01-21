import { useSelector } from "react-redux";
import { useDataStore } from "../contexts/Data";
import useGetVariable from "./useGetVariable";
import { quantile, quantileRank } from 'simple-statistics'
import { useEffect, useState } from "react";

export default function useGetQuantileStatistics({
    variable="Confirmed Count per 100K Population",
    dataset=null,
    geoid=null,
    getStateStats=true,
}){
    const [{ storedGeojson }] = useDataStore();
    const [stats, setStats] = useState({});
    // pieces of redux state
    const currentData = useSelector((state) => state.currentData);
    const geojsonData = storedGeojson[dataset||currentData];
    const geoidProperties = geojsonData?.properties && geojsonData.properties[geoid];
    const data = useGetVariable({
        variable,
    });
    useEffect(() => {
        if (data.length) {
            let tempResults = {
                geoidProperties,
                variable
            };
            tempResults.geoidIdx = geoid !== null ? geojsonData.order.geoidOrder[geoid] : null;
            tempResults.geoidData = tempResults.geoidIdx !== null ? data[tempResults.geoidIdx] : null;
            [tempResults.min, tempResults.max] = [Math.min(...data), Math.max(...data)];
            [tempResults.q25, tempResults.q50, tempResults.q75] = [.25, .5, .75].map(q => quantile(data, q))
            tempResults.geoidQ = tempResults.geoidData !== null ? quantileRank(data, tempResults.geoidData) : false;            
            if (getStateStats) {
                const stateIndices = geojsonData?.order?.indexOrder && Object.entries(geojsonData.order.indexOrder).filter((f) => Math.floor(+f[1]/1000) === Math.floor(+geoid/1000)).map((f) => +f[0]);
                if (stateIndices) {
                    const stateData = data.filter((_,idx) => stateIndices.includes(idx));
                    [tempResults.stateMin, tempResults.stateMax] = [Math.min(...stateData), Math.max(...stateData)];
                    [tempResults.stateQ25, tempResults.stateQ50, tempResults.stateQ75] = [.25, .5, .75].map(q => quantile(stateData, q))
                    tempResults.stateGeoidQ = tempResults.geoidData !== null ? quantileRank(stateData, tempResults.geoidData) : false; 
                }
            }
            setStats(tempResults)
        }

    },[data.length, geoid, dataset, variable, getStateStats])
    
    return stats
}