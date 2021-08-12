import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-72724100-4');
ReactGA.pageview(window.location.pathname + window.location.search);

export default function useTrackUserActions(){
    const currentData = useSelector((state) => state.currentData);
    const variableName = useSelector((state) => state.dataParams.variableName);
    const overlay = useSelector((state) => state.mapParams.overlay);
    const resource = useSelector((state) => state.mapParams.resource);
    const vizType = useSelector((state) => state.mapParams.vizType);
    const mapType = useSelector((state) => state.mapParams.mapType);
    const selectionKeys = useSelector(state => state.selectionKeys);
    
    const [hasLogged, setHasLogged] = useState({
        'currentData': [],
        'variableName': [],
        'overlay': [],
        'resource': [],
        'vizType': [],
        'mapType': [],
        'selectionKeys': []
    })

    const checkToLog = (variable, val) => {
        if (hasLogged[variable].indexOf(val) === -1 && val.length) {
            ReactGA.event({
                category: 'Map Interaction',
                action: variable,
                value: val
            })
            return [variable, val]
        }
        return false
    }

    const toLog = [
        ['currentData', currentData],
        ['variableName', variableName],
        ['overlay', overlay],
        ['resource', resource],
        ['vizType', vizType],
        ['mapType', mapType],
        ['selectionKeys', selectionKeys],
    ].map(entry => checkToLog(...entry)).filter(r => r !== false)

    useEffect(() => {
        if (toLog.length){
            setHasLogged(prev => {
                let prevCopy = {...prev}
                toLog.forEach(entry => {
                    prevCopy[entry[0]] = [...prevCopy[entry[0]], entry[1]]
                })

                return prevCopy
            })
        }
    },[toLog])

    return hasLogged
}