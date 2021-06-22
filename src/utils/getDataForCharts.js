const getDataForCharts = (data, table, dateIndices, dateList, name=null, interval=1) => {
    // get list of all features (GEOIDs/FIPS)
    let features = Object.keys(data);
    // counter for days 
    let n = 0;
    // return array
    let rtn = new Array((Math.ceil(dateList.length/interval))).fill(null)
    // 7 day average delay -- early data
    let j = interval === 1 ? 7 : 1;

    let countCol;
    let sumCol;
    // based on whether specific to geography, or all cases
    if (name === null) {
        countCol = 'count'
        sumCol = 'sum'
    } else {
        countCol = name + ' Daily Count'
        sumCol = name + ' Total Cases'
    }
    
    while (n<dateList.length) {
        let tempObj = {};
        // if we are missing data for that date, skip it
        if (dateIndices.indexOf(n)===-1){
            tempObj[sumCol] = null;
            tempObj[countCol] = null;
            rtn[n/interval] = tempObj;
            n+=interval;
        } else {
            // loop through features and sum values for index
            let sum = 0;
            let i = 0;
            while (i<features.length) {
                if (data[features[i]][table] !== undefined) sum += data[features[i]][table][n]||0
                // tempObj[`n${i}`] = data[features[i]][table][n]
                i++;
            }
            tempObj[sumCol] = sum
            tempObj.date = dateList[n]
            if ((n < 7 && j === 7)||(n < 1 && j === 1)) {
                tempObj[countCol] = sum
            } else {
                tempObj[countCol] = (sum - rtn[n/interval-j][sumCol])/(j)
            }
            rtn[n/interval] = tempObj;
            n+=interval;
        }
    }
    return rtn;
}

export default getDataForCharts