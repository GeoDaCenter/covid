const getDataForCharts = (data, table, dateIndices, dateList, name=null) => {
    // get list of all features (GEOIDs/FIPS)
    let features = Object.keys(data);
    // counter for days 
    let n = 0;
    // return array
    let rtn = new Array(dateList.length)
    // 7 day average delay -- early data
    let j = -7;

    let countCol;
    let sumCol;
    // based on whether specific to geography, or all cases
    if (name===null) {
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
            rtn[n] = tempObj;
            n++;
            j++;
        } else {
            // loop through features and sum values for index
            let sum = 0;
            let i = 0;
            while (i<features.length) {
                if (data[features[i]][table]!== undefined) sum += data[features[i]][table][n]||0
                // tempObj[`n${i}`] = data[features[i]][table][n]
                i++;
            }
            tempObj[sumCol] = sum
            tempObj.date = dateList[n]
            if (j<0) {
                tempObj[countCol] = sum
            } else {
                tempObj[countCol] = (sum - rtn[j][sumCol])/7
            }
            rtn[n] = tempObj;
            n++;
            j++;
        }
    }
    return rtn;
}

export default getDataForCharts