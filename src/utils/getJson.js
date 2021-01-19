import { getJsonPure, geojsonArrayBuffer } from '../utils';

// async function getJson(url, gda_proxy){
//     const tempData = await fetch(url).then(response => {
//       const responseFromJson = response.clone();        
//       const data = loadGeojsonToGeoda(responseFromJson, url, gda_proxy).then(
//         () =>
//           {
//             return response.json()
//           }
//       )
//       return data;
//     }).then(data => {
//       console.log('loaded json')
//       return {
//         data: data,
//         geoidIndex: getGeoidIndex(data.features)
//       }
//     });        
//     return tempData;
// }

const getJson = async (url) => {
  const response = await getJsonPure(url)
  const responseFromJson = response.clone();        
  const abResponse = await geojsonArrayBuffer(responseFromJson);
  return { response, ab: abResponse }
}

export default getJson;
