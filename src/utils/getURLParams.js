const getURLParams = (params) => {
    const { dataParams, mapParams, coords, currentData, lastDateIndex } = params;

    let mapCoords = `?lat=${Math.round(coords.latitude*1000)/1000}&lon=${Math.round(coords.longitude*1000)/1000}&z=${Math.round(coords.zoom*10)/10}`;
    let source = `&src=${currentData.split('.geojson')[0]}`
    let variable = dataParams.variableName !== 'Confirmed Count per 100K Population' ? `&var=${dataParams.variableName.replace(/ /g,"_")}` : ''
    let method = mapParams.mapType !== 'natural_breaks' ? `&mthd=${mapParams.mapType}` : '';
    let prop = dataParams.nProperty !== null ? `&propCol=${dataParams.nProperty}` : '';
    let bin = mapParams.binMode !== '' ? '&dbin=True' : ''        
    let date = lastDateIndex !== null && dataParams.nIndex !== lastDateIndex.slice(-1,)[0] ? `&date=${dataParams.nIndex}` : '';
    let dateRange = dataParams.nRange !== 7 && dataParams.nType === 'time-series' ? `&range=${dataParams.nRange}` : ''
    let overlay = mapParams.overlay ? `&ovr=${mapParams.overlay}` : '';
    let resource = mapParams.resource ? `&res=${mapParams.resource}` : '';
    let mapType = mapParams.vizType === "cartogram" ? `&viz=cartogram` : mapParams.vizType === '3D' ? '&viz=3D' : '';
  
    return `${mapCoords}${source}${variable}${method}${prop}${bin}${date}${dateRange}${overlay}${resource}${mapType}&v=2`
}

export default getURLParams;