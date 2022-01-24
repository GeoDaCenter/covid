import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    findAllDefaults,
    fetcher
} from '../utils';

export default function useBackgroundLoadData({
    currentGeography='',
    shouldFetch=false,
    tables=[],
    currTimespans=['latest'],
    dateLists={},
    numeratorParams={},
    denominatorParams={},
    adjacentMonths=[],
  }){  
    const dispatch = useDispatch();
    const storedData = useSelector(({data}) => data.storedData);
    const adjacentMainToFetch = adjacentMonths.map(timespan => [
      {...numeratorParams[0], timespan},
      {...denominatorParams[0], timespan},
    ]).flat()
    const tablesToFetch = currTimespans.map(timespan => 
      findAllDefaults(tables, currentGeography)
        .map(dataspec => ({...dataspec, timespan}))).flat()
    const filesToFetch = [...adjacentMainToFetch, ...tablesToFetch]
        .filter(filesToFetch => !(storedData[filesToFetch.name] && (storedData[filesToFetch.name].loaded?.includes(filesToFetch.timespan)||filesToFetch.date === null)))
        .flat().filter(f => !f.noFile && f.timespan !== false && f.timespan !== undefined);

    useEffect(() => {
      if (shouldFetch && filesToFetch.length) {
        fetcher([filesToFetch[0]], dateLists).then(dataArray => {
          // console.log(filesToFetch[0], dataArray[0])
          if (dataArray.length) {
            dataArray.forEach((response, idx) => {
              const newData = response.value;
              if (!(storedData[filesToFetch[idx]?.name] && storedData[filesToFetch[idx]?.name][filesToFetch[idx]?.loaded?.includes(filesToFetch[idx]?.timespan)])) {
                if (newData && newData.data) {
                  dispatch({
                    type: 'RECONCILE_TABLE',
                    payload: {
                      name: filesToFetch[idx].name,
                      newData,
                      timespan: filesToFetch[idx].timespan
                    }
                  })
                } else if (response.status === 'rejected') {
                  dispatch({
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
  