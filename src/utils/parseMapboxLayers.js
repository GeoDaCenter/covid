export default function parseMapboxLayers(defaultLayers, mapParams, mapRef, globalMap=false){
    if (mapRef !== undefined && mapRef.current === undefined) return;
    const map = mapRef.current.getMap();
    
    // if (mapParams.vizType === 'cartogram' || globalMap){
    //     defaultLayers.forEach(({id}) => map.setLayoutProperty(id, 'visibility', 'none'))
    // } else if (mapParams.vizType === '3D'){
    //     defaultLayers.forEach(({id}) => {
    //         if (id.includes('label') && !(id.includes('water'))){
    //             map.setLayoutProperty(id, 'visibility', 'visible')
    //         } else {
    //             map.setLayoutProperty(id, 'visibility', 'none')
    //         }
    //     })
    // } else if (mapParams.vizType === 'dotDensity'){
    //     defaultLayers.forEach(({id}) => {
    //          else if (id.includes('admin')) {
    //             map.setLayoutProperty(id, 'visibility', 'visible')
    //             map.setPaintProperty(id, 'line-color', "hsl(0,0%,80%)")
    //         } else if (id.includes('settlement-')) {    
    //             map.setPaintProperty(id, 'text-halo-blur', "0")                
    //             if (!(id.includes('major'))){
    //                 map.setPaintProperty(id, 'text-halo-width', "0")  
    //             }
    //         }
    //     })
    // }
    defaultLayers.forEach(({id}) => {
        if (['native_american_reservations','segregated_cities','uscongress-districts'].includes(mapParams.overlay)){
            if (mapParams.resource.includes(id.split('-')[0]) || mapParams.overlay.includes(id.split('-')[0])) {    
                map.setLayoutProperty(id, 'visibility', 'visible')
            } else if (id.includes('label')){
                map.setLayoutProperty(id, 'visibility', 'none')
            }
        }

        if (mapParams.resource.includes(id) || mapParams.overlay.includes(id)) {
            map.setLayoutProperty(id, 'visibility', 'visible')
        }
    })

    // if (mapParams.resource.length){
    //     defaultLayers.forEach(layer => {
    //         if (mapParams.resource.includes(layer.id.split('-')[0]) || mapParams.overlay.includes(layer.id.split('-')[0])) {
    //             return {...layer, layout: {...layer.layout, visibility: "visible"}}
    //         } else {
    //             return layer;
    //         }
    //     })
    // }
}

// map.setLayoutProperty(clickedLayer, 'visibility', 'none');