import * as d3 from 'd3-dsv';
import { findDateIndices } from '../utils';

async function getParseCSV(fileInfo, dateList){

  const text = await fetch(`${process.env.PUBLIC_URL}/csv/${fileInfo.file}.csv`).then(response => {return response.ok ? response.text() : Promise.reject(response.status)})
  const data = d3.csvParse(text, d3.autoType)
  let rtn = {};
  let dateIndices = null; 

  if (dateList !== undefined) dateIndices = findDateIndices(dateList, Object.keys(data[0]))

  if (fileInfo.accumulate) {
    for (let n=0; n<data.length; n++){
      let tempArr = new Array(dateList.length)
      for (let i=0; i<dateList.length; i++){
        tempArr[i] = ((data[n][dateList[i]]||0)+(tempArr[i-1]||0))||null
      }
      rtn[data[n][fileInfo.join]] = tempArr
    }
  } else if (dateList !== undefined){
    for (let n=0; n<data.length; n++){
      let tempArr = new Array(dateList.length)
      for (let i=0; i<dateList.length; i++){
        tempArr[i] = (data[n][dateList[i]]||tempArr[i-1])||null
      }
      rtn[data[n][fileInfo.join]] = tempArr
    }
  } else {
    for (let n=0; n<data.length; n++){
      rtn[data[n][fileInfo.join]] = data[n]
    }
  }
  return {data: rtn, columns: Object.keys(data[0]), dates:dateIndices}
}

export default getParseCSV