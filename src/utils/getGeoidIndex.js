const getGeoidIndex = (features) => {
    let geoidOrder = {};
    let indexOrder = {};
    let i = 0
    while (i<features.length) {
        geoidOrder[features[i].properties.GEOID] = i
        indexOrder[i] = features[i].properties.GEOID
        i++;
    }

    return {geoidOrder, indexOrder};
}
export default getGeoidIndex