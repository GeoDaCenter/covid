import * as d3 from 'd3-dsv';

async function getCSV(url){
    const tempData = await fetch(url)
      .then(response => {
        return response.ok ? response.text() : Promise.reject(response.status);
      }).then(text => {
        let data = d3.csvParse(text, d3.autoType)
        
        return data
      })
    
      return tempData
}

export default getCSV