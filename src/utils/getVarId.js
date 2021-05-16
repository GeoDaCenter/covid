const getVarId = (currentData, dataParams, mapParams) => {
    return `${currentData}-${dataParams.numerator}-${dataParams.nProperty}-${dataParams.nIndex}-${dataParams.nRange}-${dataParams.denominator}-${dataParams.dProperty}-${dataParams.dIndex}-${dataParams.dRange}-${dataParams.scale}-${mapParams.mapType}-${mapParams.colorScale}-${mapParams.binMode}-${mapParams.bins.bins.slice(2,-2).join('')}`
}

export default getVarId;