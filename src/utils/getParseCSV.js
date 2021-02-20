import * as d3 from 'd3-dsv';
import { findDateIndices } from '../utils';

async function getParseCSV(url, joinCol, accumulate, dateList){

  const tempData = await fetch(url)
    .then(response => {
      return response.ok ? response.text() : Promise.reject(response.status);
    }).then(text => {
      let data = d3.csvParse(text, d3.autoType);
      let rtn = {};
      let n = data.length;
      let selectedJoinColumn;
      let dateIndices = null; 

      joinCol.forEach(colOption => {
        if (data[0].hasOwnProperty(colOption)) selectedJoinColumn = colOption;
      })
      if (dateList !== undefined) dateIndices = findDateIndices(dateList, Object.keys(data[0]))

      if (accumulate) {
        while (n>0){
          n--;
          let i = 0;
          let tempArr = new Array(dateList.length)
          while (i < dateList.length){
            tempArr[i] = ((data[n][dateList[i]]||0)+(tempArr[i-1]||0))||null
            i++;
          }
          rtn[data[n][selectedJoinColumn]] = tempArr
        }
      } else if (dateList !== undefined){
        while (n>0){
          n--;
          let i = 0;
          let tempArr = new Array(dateList.length)
          while (i < dateList.length){
            tempArr[i] = (data[n][dateList[i]]||tempArr[i-1])||null
            i++;
          }
          rtn[data[n][selectedJoinColumn]] = tempArr
        }
      } else {
        while (n>0){
          n--;
          rtn[data[n][selectedJoinColumn]] = Object.values(data[n])
        }
      }
      return [rtn, Object.keys(data[0]), dateIndices]
    });
  return tempData;
}

export default getParseCSV