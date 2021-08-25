import { useSelector } from "react-redux";

const parseData = (data, dates, dummyArray) => {
    let parsedData = {
        dates: data.dateRange.map(f => dates.indexOf(f)),
        data: {}
    }

    const firstDate = parsedData.dates[0]
    for (let i=0; i<data.rows.length; i++) {
        parsedData.data[data.rows[i].id] = [ 
            ...(dummyArray.slice(0,firstDate)),
            ...(data.rows[i].vals)
        ]
    }
    return parsedData
}

export default function useBigQuery(){
    const dates = useSelector((state) => state.dates);
    const getRecentSnapshot = async (datasets) => {
        const response = await fetch(`${process.env.PUBLIC_URL}/.netlify/functions/query?type=snapshot&datasets=${JSON.stringify(datasets)}`).then(r => r.json())
        const dummyArray = new Array(dates.length).fill(null)
        if (response.data.length === 1){
            return parseData(response.data[0],dates, dummyArray)   
        } else {
            console.log(response.data.map(data => parseData(data, dates, dummyArray)))
            return response.data.map(data => parseData(data, dates, dummyArray))
        }     
    }

    return {
        getRecentSnapshot
    }
} 