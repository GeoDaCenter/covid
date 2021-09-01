export default function parseMapboxLayers(defaultLayers, mapParams, mapRef, globalMap=false){
    if (mapRef.current === undefined) return;
    const map = mapRef.current.getMap();

    if (mapParams.vizType === 'cartogram' || globalMap){
        defaultLayers.forEach(layer => { return {...layer, layout: {...layer.layout, visibility: "none"}}})
    }

    if (mapParams.vizType === '3D'){
        defaultLayers.forEach(layer => {
            if (layer.id.includes('label') && !(layer.id.includes('water'))) return layer
            return {...layer, layout: {...layer.layout, visibility: "none"}}
        })
    }
    
    if (mapParams.vizType === 'dotDensity'){
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
    }

    if (['native_american_reservations','segregated_cities','uscongress-districts'].includes(mapParams.overlay)){
        defaultLayers.forEach(layer => {
            if (mapParams.resource.includes(layer.id.split('-')[0]) || mapParams.overlay.includes(layer.id.split('-')[0])) {
                return {...layer, layout: {...layer.layout, visibility: "visible"}}
            } else if (layer.id.includes('label')){
                return {...layer, layout: {...layer.layout, visibility: "none"}}
            } else {
                return layer;
            }
        })
    }

    if (mapParams.resource.length){
        defaultLayers.forEach(layer => {
            if (mapParams.resource.includes(layer.id.split('-')[0]) || mapParams.overlay.includes(layer.id.split('-')[0])) {
                return {...layer, layout: {...layer.layout, visibility: "visible"}}
            } else {
                return layer;
            }
        })
    }
}

// map.setLayoutProperty(clickedLayer, 'visibility', 'none');