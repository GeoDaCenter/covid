const getVarId = (currentData, dataParams) => {
    return `${currentData}-${dataParams.numerator}-${dataParams.nIndex}-${dataParams.nRange}-${dataParams.denominator}-${dataParams.dProperty}-${dataParams.dIndex}-${dataParams.dRange}-${dataParams.scale}`
}

export default getVarId;