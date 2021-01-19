import dataFn from './dataFunction';
// this function loops through the current data set and provides data for GeodaJS to create custom breaks 
const getDataForBins = (tableData, dataParams) => {

    const { numerator, nProperty, nIndex, denominator, dType, dIndex} = dataParams;
    if (tableData[0][denominator] === undefined) return;
    // declare empty array for return variables
    let rtn = [];

    // length of data table to loop through
    let n = tableData.length;

    // this checks if the bins generated should be dynamic (generating for each date) or fixed (to the most recent date)
    if (nIndex === null && nProperty === null) {
        // if fixed, get the most recent date
        let tempIndex = tableData[0][numerator].length-1;
        // if the denominator is time series data (eg. deaths / cases this week), make the indices the same (most recent)
        let tempDIndex = dType === 'time-series' ? tableData[0][denominator].length-1 : dIndex;
        // loop through, do appropriate calculation. add returned value to rtn array
        while (n>0) {
            n--;
            rtn.unshift(dataFn(tableData[n][numerator], tableData[n][denominator], {...dataParams, nIndex:tempIndex, dIndex: tempDIndex})||0)
        }
    } else {
       while (n>0) {
            n--;
            rtn.unshift(dataFn(tableData[n][numerator], tableData[n][denominator], dataParams)||0)
        }
    }
    return rtn;   
}
export default getDataForBins