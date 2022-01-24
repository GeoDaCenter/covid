import { useSelector } from 'react-redux';
import dataDateRanges from "../config/dataDateRanges";

export default function useCurrentDateIndices() {
    const storedData = useSelector(({ data }) => data.storedData);
    const nIndex = useSelector(({params}) => params.dataParams.nIndex);
    const dIndex = useSelector(({params}) => params.dataParams.dIndex);
    const nRange = useSelector(({params}) => params.dataParams.nRange);
    const dRange = useSelector(({params}) => params.dataParams.dRange);
    const rangeType = useSelector(({params}) => params.dataParams.rangeType)
    const dates = useSelector(({params}) => params.dates);
    const currentTable = useSelector(({params}) => params.currentTable);
    const currDates = storedData[currentTable?.numerator?.name?.split('.')[0]]?.dates;
    const currDatesAvailable = dataDateRanges[currentTable?.numerator?.name?.split('.')[0]];
    const currentIndex = (nIndex||dIndex) === null 
        ? currDatesAvailable?.slice(-1)[0] || dates.length-1
        : (nIndex||dIndex)
    const currRange = nRange||dRange; 
    return [
        currentIndex||1,
        currDates||[],
        currDatesAvailable||[],
        dates||[],
        currRange,
        rangeType
    ]
}