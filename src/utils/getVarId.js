const getVarId = (currentData, dataParams, mapParams, dataReady) => {
  return `${currentData}-${dataParams.numerator}-${dataParams.nProperty}-${
    dataParams.nIndex
  }-${dataParams.nRange}-${dataParams.denominator}-${dataParams.dProperty}-${
    dataParams.dIndex
  }-${dataParams.dRange}-${dataParams.scale}-${mapParams.mapType}-${
    mapParams.vizType
  }-${mapParams.colorScale}-${
    mapParams.binMode
  }--${dataReady}-${mapParams.bins.bins.slice(2, -2).join('')}`;
};

export default getVarId;
