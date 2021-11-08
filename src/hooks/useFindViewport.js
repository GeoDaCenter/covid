
import { GeoDaContext } from '../contexts/GeoDaContext';
import {fitBounds} from '@math.gl/web-mercator';
import { useEffect, useState, useContext } from 'react';
import { isCompositeComponent } from 'react-dom/test-utils';


export default function useFindViewport(mapId){
    const geoda = useContext(GeoDaContext);
    const [currViewport, setCurrViewport] = useState({})

    const findViewport = async (mapId) => {
        if (!mapId) return;
        const extents = await geoda.getBounds(mapId)
        if (!extents) return;
        const viewport = fitBounds({
            width: window.innerWidth,
            height: window.innerHeight,
            bounds: [
                [extents[0], extents[2]],
                [extents[1], extents[3]]
            ]
        })
        if (!viewport) return;
        setCurrViewport({
            latitude: viewport.latitude,
            longitude: viewport.longitude,
            zoom: viewport.zoom*0.93
        })
    } 

    useEffect(() => {
        findViewport(mapId)
    }, [])

    useEffect(() => {
        findViewport(mapId)
    }, [mapId])

    return currViewport
}