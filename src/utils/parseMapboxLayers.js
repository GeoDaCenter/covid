export default function parseMapboxLayers(defaultLayers, mapParams, globalMap=false){
    const layers = mapParams.vizType === 'cartogram' || globalMap
        ? defaultLayers.map(layer => { return {...layer, layout: {...layer.layout, visibility: "none"}}
            })
        : mapParams.vizType === '3D'
        ? defaultLayers.map(layer => {
            if (layer.id.includes('label') && !(layer.id.includes('water'))) return layer
            return {...layer, layout: {...layer.layout, visibility: "none"}}
            })
        : mapParams.vizType === 'dotDensity'
        ? defaultLayers.map(layer => {
            if (mapParams.resource.includes(layer.id) || mapParams.overlay.includes(layer.id)) {
                return {...layer, layout: {...layer.layout, visibility: "visible"}}
            } else if (layer.id.includes('admin')) {
                return {...layer, paint: {...layer.paint, 'line-color': "hsl(0,0%,80%)"}}
            } else if (layer.id.includes('settlement-')) {                    
                return layer.id.includes('major')
                    ? {...layer, paint: {...layer.paint, 'text-halo-blur': 0}}
                    : {...layer, paint: {...layer.paint, 'text-halo-blur': 0, 'text-halo-width': 2}}
            } else {
                return layer
            }
            })
        : ['native_american_reservations','segregated_cities','uscongress-districts'].includes(mapParams.overlay)
        ? defaultLayers.map(layer => {
            if (mapParams.resource.includes(layer.id.split('-')[0]) || mapParams.overlay.includes(layer.id.split('-')[0])) {
                return {...layer, layout: {...layer.layout, visibility: "visible"}}
            } else if (layer.id.includes('label')){
                return {...layer, layout: {...layer.layout, visibility: "none"}}
            } else {
                return layer;
            }
            })
        : defaultLayers.map(layer => {
            if (mapParams.resource.includes(layer.id.split('-')[0]) || mapParams.overlay.includes(layer.id.split('-')[0])) {
                return {...layer, layout: {...layer.layout, visibility: "visible"}}
            } else {
                return layer;
            }
        });
    return layers
}