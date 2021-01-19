const getCartogramValues = (gda_proxy, dataset, data ) => {
    let cartogramData = gda_proxy.cartogram(dataset, data)
    let tempObj = {}
    for (let i=0; i<cartogramData.length; i++){
        cartogramData[i].value = data[i]
        tempObj[i] = cartogramData[i]
    }
    return tempObj;
}

export default getCartogramValues;