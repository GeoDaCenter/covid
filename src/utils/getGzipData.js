// import {inflate} from 'pako';
// import * as d3 from 'd3-dsv';

// const getGzipData = async (url) => {
//     const tempData = await fetch(url)
//         .then(response => {
//         return response.ok ? response.arrayBuffer() : Promise.reject(response.status);
//         }).then(compressed => {
        
//         // convert to binary
//         const binData = new Uint8Array(compressed);

//         // inflate
//         return inflate(binData, { to: 'string' })
//         }).then(data => {
//         let parsed =  d3.csvParse(data, d3.autoType)
//         let keys = Object.keys(parsed[0]);
//         let n = parsed.length;
//         let rtn = {};
//         while (n>0){
//             n--;
//             rtn[keys[n]] = Object.values(parsed[n])
//         }
//         return rtn;
//         })
//     return tempData;
// };

// export default getGzipData