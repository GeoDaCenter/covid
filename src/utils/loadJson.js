import { getJson, getGeoidIndex } from '../utils';

const loadJson = async (url, gda_proxy) => {
const data = getJson(url).then(values => {
    gda_proxy.ReadGeojsonMap(url.split('/').slice(-1,)[0], values.ab);
    return values.response.json().then(
    data => {
        return {
        data: data,
        geoidIndex: getGeoidIndex(data.features)
        }
    })
})
return data;
}

export default loadJson;