const getCartogramCenter = (cartogramData) => {
    let x = 0;
    let y = 0;
    let keys = Object.keys(cartogramData)
    let dataLength = keys.length

    for (let i=0; i<dataLength; i++) {
        x += cartogramData[keys[i]]['position'][0];
        y += cartogramData[keys[i]]['position'][1];
    };
    return [x/dataLength, y/dataLength]
}

export default getCartogramCenter;