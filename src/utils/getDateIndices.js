
import { findClosestValue } from ".";
import dataDateRanges from "../config/dataDateRanges";

export const getLastIndex = (arr, val=true) => {
    let tempArr = [...arr].reverse();
    let lastIndex = tempArr.findIndex(item => item === val);
    return arr.length - lastIndex - 1;
};

export const getClosestIndex = (index, dataName) => {
    const currDatesAvailable = dataDateRanges[dataName.split('.')[0]];
    if (index !== null){
        return findClosestValue(index, currDatesAvailable, true);
    } else {
        return getLastIndex(currDatesAvailable||[], 1)
    }
}