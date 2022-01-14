import { useEffect } from "react";
import {
    findAllDefaults,
    fetcher
} from '../utils';

export default function useBackgroundLoadData({
    currentGeography='',
    shouldFetch=false,
    tables=[],
    storedData={},
    dataDispatch=()=>{},
    currTimespans=['latest'],
    dateLists={}
  }){  
    const filesToFetch = currTimespans.map(timespan => 
      findAllDefaults(tables, currentGeography)
        .map(dataspec => ({...dataspec, timespan}))
        .filter(filesToFetch => !(storedData[filesToFetch.name] && (storedData[filesToFetch.name].loaded?.includes(filesToFetch.timespan)||filesToFetch.date === null)))
      ).flat().filter(f => f.timespan !== false);
    
    useEffect(() => {
      if (shouldFetch && filesToFetch.length) {
        fetcher([filesToFetch[0]], dateLists).then(dataArray => {
          // console.log(filesToFetch[0], dataArray[0])
          if (dataArray.length) {
            dataArray.forEach((response, idx) => {
              const newData = response.value;
              if (!(storedData[filesToFetch[idx]?.name] && storedData[filesToFetch[idx]?.name][filesToFetch[idx]?.loaded?.includes(filesToFetch[idx]?.timespan)])) {
                if (newData && newData.data) {
                  dataDispatch({
                    type: 'RECONCILE_TABLE',
                    payload: {
                      name: filesToFetch[idx].name,
                      newData,
                      timespan: filesToFetch[idx].timespan
                    }
                  })
                } else if (response.status === 'rejected') {
                  dataDispatch({
                    type: 'RECONCILE_TABLE',
                    payload: {
                      name: filesToFetch[idx].name,
                      newData:{},
                      error:true,
                      timespan: filesToFetch[idx].timespan
                    }
                  })
                }
                
              }
            })
          }
        })
      }
    }, [shouldFetch, JSON.stringify(filesToFetch)]);
  };
  