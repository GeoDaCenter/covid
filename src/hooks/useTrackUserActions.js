import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-72724100-4');
ReactGA.pageview(window.location.pathname + window.location.search);

export default function useTrackUserActions() {
  // What dataset is being viewed?
  // const currentData = useSelector(({params}) => params.currentData);
  // // What variable is being selected?
  // const variableName = useSelector((state) => state.dataParams.variableName);
  // // What overlay layer is being used?
  // const overlay = useSelector((state) => state.mapParams.overlay);
  // // What resource layer is being used?
  // const resource = useSelector((state) => state.mapParams.resource);
  // // What vizType (2d, 3d) is being used?
  // const vizType = useSelector((state) => state.mapParams.vizType);
  // // What map mode (lisa, natural breaks) is being used?
  // const mapType = useSelector((state) => state.mapParams.mapType);
  // // What counties or states are being selected?
  // const selectionKeys = useSelector(state => state.selectionKeys);
  // What are the default datasets?
  const datasets = useSelector(({params}) => params.datasets);
  const baseDatasetNum = useRef(datasets.length);

  useEffect(() => {
    const customDatasetsLoaded =
      datasets.length - baseDatasetNum.current;
    if (customDatasetsLoaded > 0) {
      ReactGA.event({
        category: 'Custom Data',
        action: 'Loaded Datasets',
        value: customDatasetsLoaded,
      });
    }
  }, [datasets.length]);

  // const [hasLogged, setHasLogged] = useState({
  //     'currentData': [],
  //     'variableName': [],
  //     'overlay': [],
  //     'resource': [],
  //     'vizType': [],
  //     'mapType': [],
  //     'selectionKeys': []
  // })

  // const checkToLog = (variable, val) => {
  //     if (variable === 'selectionKeys' && val.length && window.location.pathname.includes('map')){
  //         for (let i=0;i<val.length;i++) {
  //             if (hasLogged[variable].indexOf(val[i]) === -1){
  //                 ReactGA.event({
  //                     category: 'Map Interaction',
  //                     action: variable,
  //                     value: val[i]
  //                 })
  //             }
  //         }
  //         return [variable, val]
  //     } else if (hasLogged[variable].indexOf(val) === -1 && val.length && window.location.pathname.includes('map')) {
  //         ReactGA.event({
  //             category: 'Map Interaction',
  //             action: variable,
  //             value: val
  //         })
  //         return [variable, val]
  //     }
  //     return false
  // }

  // const toLog = [
  //     ['currentData', currentData],
  //     ['variableName', variableName],
  //     ['overlay', overlay],
  //     ['resource', resource],
  //     ['vizType', vizType],
  //     ['mapType', mapType],
  //     ['selectionKeys', selectionKeys],
  // ].map(entry => checkToLog(...entry)).filter(r => r !== false)

  // useEffect(() => {
  //     if (toLog.length){
  //         setHasLogged(prev => {
  //             let prevCopy = {...prev}
  //             toLog.forEach(entry => {
  //                 prevCopy[entry[0]] = entry[1] === 'selectionKeys'
  //                     ? [...prevCopy[entry[0]], ...entry[1]]
  //                     : [...prevCopy[entry[0]], entry[1]]
  //             })

  //             return prevCopy
  //         })
  //     }
  // },[toLog])

  // return hasLogged
}
