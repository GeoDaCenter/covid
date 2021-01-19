const getGeoids = (data) => {
    let rtn = [];
    let keys = Object.keys(data.features);
    let i = keys.length
    while (i>0) {
        i--;
        rtn.unshift(data.features[keys[i]].properties.GEOID)
    }

    return rtn;
}
export default getGeoids