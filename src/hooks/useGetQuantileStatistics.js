import { useSelector } from "react-redux";
import { useDataStore } from "../contexts/Data";
import useGetVariable from "./useGetVariable";
import { quantile, quantileRank } from 'simple-statistics'

export default function useGetQuantileStatistics({
    variable="Confirmed Count per 100K Population",
    dataset=null,
    geoid=null
}){
    const [{ storedGeojson }] = useDataStore();
    // pieces of redux state
    const currentData = useSelector((state) => state.currentData);
    const geojsonData = storedGeojson[dataset||currentData];
    const geoidProperties = geojsonData?.properties && geojsonData.properties[geoid];
    const data = useGetVariable({
        variable,
    });
    
    if (data.length) {
        const geoidIdx = geoid !== null ? geojsonData.order.geoidOrder[geoid] : null;
        const geoidData = geoidIdx !== null ? data[geoidIdx] : null;
        const [min, max] = [Math.min(...data), Math.max(...data)];
        const [q25, q50, q75] = [.25, .5, .75].map(q => quantile(data, q))
        const geoidQ = geoidData !== null ? quantileRank(data, geoidData) : false;
        return {
            min,
            max,
            q25,
            q50,
            q75,
            geoidQ,
            geoidData,
            geoidProperties
        }
    }
    
    return {}
}