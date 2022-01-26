
import dataDateRanges from "../config/dataDateRanges";

export const getLastIndex = (arr, val=true) => {
    let tempArr = [...arr].reverse();
    let lastIndex = tempArr.findIndex(item => item === val);
    return lastIndex
};

export const getLastDateIndex = (dataName) => {
    const currDatesAvailable = dataDateRanges[dataName.split('.')[0]];
    return getLastIndex(currDatesAvailable, 1)
}