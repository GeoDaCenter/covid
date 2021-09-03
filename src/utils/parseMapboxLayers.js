const resourceOverlayCheck = (mapParams, property, value) => {
    console.log(value)
    console.log(mapParams)
    if (mapParams.vizType === '3D') return [['setLayoutProperty', 'visiblity', 'none']]
    if (mapParams[property] === value) return [['setLayoutProperty', 'visiblity', 'visible']]
    return [['setLayoutProperty', 'visiblity', 'none']]
}

const check3d = (mapParams) => {
    if (mapParams.vizType === '3D') return [['setLayoutProperty', 'visiblity', 'none']]
    return [['setLayoutProperty', 'visiblity', 'visible']]
}

const checkAdmin = (mapParams) => {
    if (mapParams.vizType === '3D') return [['setLayoutProperty', 'visiblity', 'none']]
    if (mapParams.vizType === 'dotDensity') {
        return [
            ['setLayoutProperty', 'visiblity', 'visible'],
            ['setPaintProperty', 'line-color', "hsl(0,0%,80%)"]
        ]
    }
    return [['setLayoutProperty', 'visiblity', 'visible']]
}

const checkLabel = (mapParams) => {
    if (mapParams.overlay.length) return [['setLayoutProperty', 'visiblity', 'none']]
    return [['setLayoutProperty', 'visiblity', 'visible']]
}

const layerDictionary = {
    'blackbelt-geom': (mapParams) => resourceOverlayCheck(mapParams, 'overlay', 'blackbelt'),
    'segregated_cities-geom':  (mapParams) => resourceOverlayCheck(mapParams, 'overlay', 'segregated_cities'),
    'native_american_reservations-geom': (mapParams) => resourceOverlayCheck(mapParams, 'overlay', 'native_american_reservations'),
    'uscongress-districts-geom': (mapParams) => resourceOverlayCheck(mapParams, 'overlay', 'uscongress-districts'),
    'hillshade': check3d,
    'water': check3d,
    'admin-1-boundary-bg': checkAdmin,
    'admin-0-boundary-bg': checkAdmin,
    'admin-1-boundary': checkAdmin,
    'admin-0-boundary': checkAdmin,
    'admin-0-boundary-disputed': checkAdmin,
    'waterway-label': check3d,
    'natural-line-label': check3d,
    'natural-point-label': check3d,
    'water-line-label': check3d,
    'water-point-label': check3d,
    'poi-label': checkLabel,
    'settlement-minor-label':  checkLabel,
    'settlement-major-label':  checkLabel,
    'state-label':  checkLabel,
    'uscongress-label':  (mapParams) => resourceOverlayCheck(mapParams, 'overlay', 'segregated_cities'),
    'segregated_cities-label':  (mapParams) => resourceOverlayCheck(mapParams, 'overlay', 'uscongress-districts'),
    'native_american_reservations-label':  (mapParams) => resourceOverlayCheck(mapParams, 'overlay', 'native_american_reservations')
}

export default function parseMapboxLayers(defaultLayers, mapParams, mapRef, globalMap=false){
    console.log(mapRef)

    if (mapRef !== undefined && mapRef.current === undefined) return;
    const map = mapRef.current.getMap();
    console.log(map)
    // if (mapParams.vizType === 'cartogram' || globalMap){
    //     defaultLayers.forEach(({id}) => map.setLayoutProperty(id, 'visibility', 'none'))
    // } else {
    //     defaultLayers.forEach(({id}) => {
    //         const ops = layerDictionary[id](mapParams)
    //         console.log(ops)
    //         ops.forEach(op => map[op[0]](id, op[1], op[2]))
    //     })
    // }
}