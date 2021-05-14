const getVarId = (currentData, dataParams, mapParams) => {
    return `${currentData}-${dataParams.numerator}-${dataParams.nProperty}-${dataParams.nIndex}-${dataParams.nRange}-${dataParams.denominator}-${dataParams.dProperty}-${dataParams.dIndex}-${dataParams.dRange}-${dataParams.scale}-${mapParams.mapType}-${mapParams.colorScale}-${mapParams.bins.bins.join('')}`
}

export default getVarId;