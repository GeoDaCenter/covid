import { useSelector } from "react-redux";

const parseData = (data, dates, dummyArray) => {
    let parsedData = {
        dates: data.dateRange.map(f => dates.indexOf(f)),
        data: {}
    }
    
    for (let i=0; i<data.rows.length; i++) {
        parsedData.data[data.rows[i].id] = [...dummyArray]
        for (let j=0; j<parsedData.dates.length;j++){
            parsedData.data[data.rows[i].id][parsedData.dates[j]] = data.rows[i].vals[j]
        }
    }
    
    return parsedData
}

export default function useBigQuery(){
    const dates = useSelector((state) => state.dates);
    const getRecentSnapshot = async (datasets, days=30, dateIndex=false) => {
        const queryUrl = `${process.env.PUBLIC_URL}/.netlify/functions/query?type=snapshot&datasets=${JSON.stringify(datasets)}&days=${days}${!!dateIndex ? `&startDate=${dates[dateIndex]}` : ''}`
        const response = await fetch(queryUrl).then(r => r.text()).then(r => JSON.parse(r.replace(/-9999/g, null).replace(/-999/g, null)))
        const dummyArray = new Array(dates.length).fill(null)
        if (response.data.length === 1){
            console.log(response.data[0])
            return parseData(response.data[0],dates, dummyArray)   
        } else {
            return response.data.map(data => parseData(data, dates, dummyArray))
        }
    }

    const getTimeSeries = async (dataset, geoid=[]) => {
        const data = await fetch(`${process.env.PUBLIC_URL}/.netlify/functions/query?type=timeseries&datasets=${dataset}${geoid.length ? '&geoid=' + geoid : ''}`).then(r => r.json())
        return data
    }
    
    return {
        getRecentSnapshot,
        getTimeSeries
    }
} 