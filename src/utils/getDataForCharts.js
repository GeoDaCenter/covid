import { sum } from "lodash";

const getDataForCharts = (table, dates, additionalParams={}) => {
    const [data,_,dateIndices] = table;
    const { populationData=null, name=null, interval=1 } = additionalParams;
    
    let populationModifier = null;
    if (populationData) {
        let populationSum = 0;
        if (populationData.length) {
            for (let i=0; i<populationData.length; i++) {
                populationSum+=populationData[i].properties.population
            }
        } else {
            populationSum = populationData;
        }
        populationModifier = (val) => (val/populationSum)*100_000
    }

    // get list of all features (GEOIDs/FIPS)
    const features = Object.keys(data);
    // return array
    let rtn = new Array((Math.ceil(dates.length/interval))).fill(null)
    // 7 day average delay -- early data
    let j = interval === 1 ? 7 : 1;


    // based on whether specific to geography, or all cases
    const countCol = name === null ? 'count' : name +  ' Daily Count';
    const sumCol = name === null ? 'sum' : name +  ' Total Cases';
    
    let maximums = {
        [countCol]:0,
        [sumCol]:0
    }

    for (let n=0; n<dates.length; n+=interval) {
        let tempObj = {};
        // if we are missing data for that date, skip it
        if (dateIndices.indexOf(n)===-1){
            tempObj[sumCol] = null;
            tempObj[countCol] = null;
            rtn[n/interval] = tempObj;
        } else {
            // loop through features and sum values for index
            let sum = 0;
            for (let i=0; i<features.length; i++) {
                sum += data[features[i]][n]||0
            }
            tempObj[sumCol] = sum
            tempObj.date = dates[n]
            if ((n < 7 && j === 7)||(n < 1 && j === 1)) {
                tempObj[countCol] = sum
            } else {
                tempObj[countCol] = (sum - rtn[n/interval-j][sumCol])/(j)
            }
            rtn[n/interval] = tempObj;
        }
        if (tempObj[sumCol] > maximums[sumCol]) maximums[sumCol] = tempObj[sumCol]
        if (tempObj[countCol] > maximums[countCol]) maximums[countCol] = tempObj[countCol]
    }
    if (populationModifier !== null){
        for (let i=0; i<rtn.length; i++) {
            rtn[i][sumCol] = populationModifier(rtn[i][sumCol])
            rtn[i][countCol] = populationModifier(rtn[i][countCol])
        }
        maximums[sumCol] = populationModifier(maximums[sumCol])
        maximums[countCol] = populationModifier(maximums[countCol])
    }
    return {data: rtn, maximums};
}

export default getDataForCharts