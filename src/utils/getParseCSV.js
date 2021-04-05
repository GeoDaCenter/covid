import * as d3 from 'd3-dsv';
import { findDateIndices } from '../utils';

async function getParseCSV(url, joinCol, accumulate, dateList){

  const tempData = await fetch(url)
    .then(response => {
      return response.ok ? response.text() : Promise.reject(response.status);
    }).then(text => {
      let data = d3.csvParse(text, d3.autoType);
      let rtn = [];
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
          let tempArr = new Array(dateIndices.length)
          while (i < dateIndices.length){
            tempArr[i] = 
              data[n][dateList[dateIndices[i]]] === undefined || data[n][dateList[dateIndices[i]]] === null ? 'NULL' 
              : tempArr[i-1] === 'NULL' || i === 0 ? data[n][dateList[dateIndices[i]]]
              : (data[n][dateList[dateIndices[i]]])+(tempArr[i-1])               
            i++;
          }
          rtn.push([data[n][selectedJoinColumn],...tempArr]);
        }
      } else if (dateList !== undefined){
        while (n>0){
          n--;
          let i = 0;
          let tempArr = new Array(dateIndices.length)
          while (i < dateIndices.length){
            tempArr[i] = (data[n][dateList[dateIndices[i]]]||tempArr[i-1])||'NULL'
            i++;
          }
          rtn.push([data[n][selectedJoinColumn], ...tempArr]);
        }
      } else {
        while (n>0){
          n--;
          rtn.push(Object.values(data[n]));
        }
      }
      const colList = dateIndices === null ? Object.keys(data[0]) : [selectedJoinColumn, ...dateIndices.map(d => dateList[d])];
      return [rtn, colList, dateIndices]
    });
  return tempData;
}

export default getParseCSV