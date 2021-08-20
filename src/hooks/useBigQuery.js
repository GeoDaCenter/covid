import { useSelector } from "react-redux";

export default function useBigQuery(){
    const dates = useSelector((state) => state.dates);
    const getRecentSnapshot = async (datasets) => {
        const response = await fetch(`${process.env.PUBLIC_URL}/.netlify/functions/query?type=snapshot&datasets=${JSON.stringify(datasets)}`).then(r => r.json())
        const dummyArray = new Array(dates.length).fill(null)
        let parsedData = {
            dates: response.data[0].dateRange.map(f => dates.indexOf(f)),
            data: {}
        }
        const firstDate = parsedData.dates[0]

        for (let i=0; i<response.data[0].rows.length; i++) {
            parsedData.data[response.data[0].rows[i].id] = [ ...(dummyArray.slice(0,firstDate)), ...(response.data[0].rows[i].vals)]
        }

        return parsedData        
    }

    return {
        getRecentSnapshot
    }
} 