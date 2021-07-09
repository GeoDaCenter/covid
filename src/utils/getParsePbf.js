import * as Pbf from 'pbf';

// PBF schemas
import * as Schemas from '../schemas';

export default async function getParsePbf(fileInfo, dateList){
    
    const pbfData = await fetch(`${process.env.PUBLIC_URL}/pbf/${fileInfo.file}`)
        .then(r => r.arrayBuffer())
        .then(ab => new Pbf(ab))
        .then(pbf => Schemas.Rows.read(pbf))
    
    let returnData = {};
    let dateIndices = [];
    let constructorIndices = [];
    let columnNames = ['geoid', ...pbfData.dates]
    // embedded scientific scale exponent in file name
    const scale = (/.e-[0-9]/g).exec(fileInfo.file) ? 10 ** -+(/.e-[0-9]/g).exec(fileInfo.file)[0]?.split('-')[1] : 1

    for (let i=0; i<dateList.length; i++) {
        if (pbfData.dates.includes(dateList[i])){
            dateIndices.push(i);
            constructorIndices.push(true)
        } else {
            constructorIndices.push(false);
        }
    }

    if (fileInfo.accumulate) {
        for (let i=0; i<pbfData.row.length; i++){
            returnData[pbfData.row[i].geoid] = []
            for (let n=0, j=0; n<constructorIndices.length; n++) {
                if (constructorIndices[n]) {
                    returnData[pbfData.row[i].geoid].push(pbfData.row[i].vals[j] === -999 ? null : ((pbfData.row[i].vals[j]*scale||0)+(returnData[pbfData.row[i].geoid][n-1]||0))||null)
                    j++;
                } else {
                    returnData[pbfData.row[i].geoid].push(pbfData.row[i].vals[j] === -999 ? null : pbfData.row[i].vals[j-1]*scale||null)
                }
            }
        }
    } else {
        for (let i=0; i<pbfData.row.length; i++){
            returnData[pbfData.row[i].geoid] = []
            for (let n=0, j=0; n<constructorIndices.length; n++) {
                if (constructorIndices[n]) {
                    returnData[pbfData.row[i].geoid].push(pbfData.row[i].vals[j] === -999 ? null : pbfData.row[i].vals[j]*scale)
                    j++;
                } else {
                    returnData[pbfData.row[i].geoid].push(pbfData.row[i].vals[j-1]*scale||null)
                }
            }
        }
    }
    return {data: returnData, columns: columnNames, dates: dateIndices}

//       return response.ok ? response.text() : Promise.reject(response.status);
//     }).then(text => {
//       let data = d3.csvParse(text, d3.autoType);
//       let rtn = {};
//       let n = data.length;
//       let selectedJoinColumn;
//       let dateIndices = null; 

//       joinCol.forEach(colOption => {
//         if (data[0].hasOwnProperty(colOption)) selectedJoinColumn = colOption;
//       })
//       if (dateList !== undefined) dateIndices = findDateIndices(dateList, Object.keys(data[0]))

//       if (accumulate) {
//         while (n>0){
//           n--;
//           let i = 0;
//           let tempArr = new Array(dateList.length)
//           while (i < dateList.length){
//             tempArr[i] = ((data[n][dateList[i]]||0)+(tempArr[i-1]||0))||null
//             i++;
//           }
//           rtn[data[n][selectedJoinColumn]] = tempArr
//         }
//       } else if (dateList !== undefined){
//         while (n>0){
//           n--;
//           let i = 0;
//           let tempArr = new Array(dateList.length)
//           while (i < dateList.length){
//             tempArr[i] = (data[n][dateList[i]]||tempArr[i-1])||null
//             i++;
//           }
//           rtn[data[n][selectedJoinColumn]] = tempArr
//         }
//       } else {
//         while (n>0){
//           n--;
//           rtn[data[n][selectedJoinColumn]] = Object.values(data[n])
//         }
//       }
//       return [rtn, Object.keys(data[0]), dateIndices]
//     });
//   console.log(tempData)
//   return tempData;
}