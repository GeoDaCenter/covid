import { useSelector } from "react-redux";
import useGetVariable from "./useGetVariable";
import { quantile, quantileRank } from 'simple-statistics'
import { useEffect, useState } from "react";

export default function useGetQuantileStatistics({
    variable="Confirmed Count per 100K Population",
    dataset=null,
    geoid=null,
    getStateStats=true,
}){
    const storedGeojson = useSelector(({ data }) => data.storedGeojson);
    const [stats, setStats] = useState({});
    // pieces of redux state
    const currentData = useSelector(({params}) => params.currentData);
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
            if (geoid === null){
                tempResults.sum = data.reduce((a,b) => a+b);
                tempResults.mean = tempResults.sum/data.length;
                tempResults.totalPop = geojsonData?.data?.features?.reduce((a,b) => a+b.properties.population, 0);
                tempResults.nationalSummary = variable.includes("per 100K") || variable.includes("Percent") 
                    ? data.reduce((a,b,idx) => a+b*geojsonData.properties[geojsonData.order.indexOrder[idx]]?.population,0) / tempResults.totalPop
                    : data.reduce((a,b) => a+b);
            }
            [tempResults.min, tempResults.max] = [Math.min(...data), Math.max(...data)];
            [tempResults.q25, tempResults.q50, tempResults.q75] = [.25, .5, .75].map(q => quantile(data, q))
            if (geoid !== null){
                tempResults.geoidIdx = geoid !== null ? geojsonData.order.geoidOrder[geoid] : null;
                tempResults.geoidData = tempResults.geoidIdx !== null ? data[tempResults.geoidIdx] : null;
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
            }
            setStats(tempResults)
        }

    },[data.length, geoid, dataset, variable, getStateStats])
    
    return stats
}