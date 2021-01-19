const addSelectedChartData = (chartData, geogData) => {
    for (let i=0; i<geogData.length; i++) {
        chartData[i].selectedGeog = geogData[i]
    }

    return chartData;
}

export default addSelectedChartData;