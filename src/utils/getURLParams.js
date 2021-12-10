const getURLParams = (params) => {
  const { dataParams, mapParams, coords, currentData, dateIndex } = params;
  let mapCoords = `?lat=${Math.round(coords.latitude * 1000) / 1000}&lon=${
    Math.round(coords.longitude * 1000) / 1000
  }&z=${Math.round(coords.zoom * 10) / 10}`;
  let source = `&src=${currentData.split('.geojson')[0]}`;
  let variable = `&var=${dataParams.variableName.replace(/ /g, '_')}`;
  let method = `&mthd=${mapParams.mapType}`;
  let prop =
    dataParams.nProperty !== null ? `&propCol=${dataParams.nProperty}` : '';
  let bin = mapParams.binMode !== '' ? '&dbin=True' : '';
  let date = dataParams.nType === 'time-series' ? `&date=${dateIndex}` : '';
  let dateRange =
    dataParams.nType === 'time-series' ? `&range=${dataParams.nRange}` : '';
  let overlay = mapParams.overlay ? `&ovr=${mapParams.overlay}` : '';
  let resource = mapParams.resource ? `&res=${mapParams.resource}` : '';
  let mapType = `&viz=${mapParams.vizType}`;

  return `${mapCoords}${source}${variable}${method}${prop}${bin}${date}${dateRange}${overlay}${resource}${mapType}&v=2`;
};

export default getURLParams;
