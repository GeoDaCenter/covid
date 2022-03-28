import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { fetcher } from "../utils";
import _FetcherWorker from 'comlink-loader!../utils/fetcher';// eslint-disable-line import/no-webpack-loader-syntax
const FetcherWorker = new _FetcherWorker();

export default function useGetTable({
  filesToFetch = [],
  shouldFetch = false,
  dateLists = {},
}) {
  const dispatch = useDispatch();
  const accessedData = useSelector(({ data }) => 
    filesToFetch.map((fileSchema) => {
      return data.storedData[fileSchema.name]
    })
  );
  
  useEffect(() => {
    
    if (shouldFetch) {
      if (filesToFetch[0] && !filesToFetch[0].noFile) {
        const cleanedFilesToFetch = filesToFetch.filter((fileSchema, idx) => {
          const fileExists = !!accessedData[idx];
          const fileExistsAndIsLoaded =
            fileExists &&
            !!accessedData[idx]?.loaded?.includes(fileSchema?.timespan);
          return !fileExists || !fileExistsAndIsLoaded;
        });
        const getData = async () => FetcherWorker.fetcher(cleanedFilesToFetch, dateLists)
        getData()
          .then((dataArray) => {
            if (dataArray.length) {
              dataArray.forEach(({ value: newData }, idx) => {
                dispatch({
                  type: "RECONCILE_TABLE",
                  payload: {
                    name: cleanedFilesToFetch[idx].name,
                    newData,
                    timespan: cleanedFilesToFetch[idx].timespan,
                  },
                });
              });
            }
          })
          .catch(() => console.log("error fetching table"));
      }
    }
  }, [shouldFetch, JSON.stringify(filesToFetch)]);

  const { dataReady, returnData, error } = useMemo(() => {
    const dataReady =
      filesToFetch.length &&
      filesToFetch.every(({ name, timespan }, idx) => {
        const missingParams = !name || !timespan;
        const dataIsLoaded =
          accessedData[idx] && accessedData[idx]?.loaded?.includes(timespan);
        const fileIsNull = filesToFetch.length === 1 && filesToFetch[0].noFile;
        return dataIsLoaded || fileIsNull || missingParams;
      });
    const returnData = dataReady ? accessedData[0] : undefined;
    const error = false;
    return {
      returnData,
      dataReady,
      error,
    };
  }, [JSON.stringify(accessedData[0]?.loaded), JSON.stringify(filesToFetch)]);
  
  return [returnData, dataReady, error];
}
