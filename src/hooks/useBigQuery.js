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
    const getRecentSnapshot = async (datasets, days=30, dateIndex=false) => {
        const queryUrl = `${process.env.PUBLIC_URL}/.netlify/functions/query?type=snapshot&datasets=${JSON.stringify(datasets)}&days=${days}${!!dateIndex ? `&startDate=${dates[dateIndex]}` : ''}`
        const response = await fetch(queryUrl).then(r => r.text()).then(r => JSON.parse(r.replace(/-9999/g, null).replace(/-999/g, null)))
        const dummyArray = new Array(dates.length).fill(null)
        if (response.data.length === 1){
            return parseData(response.data[0],dates, dummyArray)   
        } else {
            return response.data.map(data => parseData(data, dates, dummyArray))
        }
    }

    const getTimeSeries = async (dataset, geoid=[]) => {
        console.log(geoid)
        const data = await fetch(`${process.env.PUBLIC_URL}/.netlify/functions/query?type=timeseries&datasets=${dataset}${geoid.length ? '&geoid=' + geoid : ''}`).then(r => r.json())
        console.log(data)
        return data
    }
    
    return {
        getRecentSnapshot,
        getTimeSeries
    }
} 