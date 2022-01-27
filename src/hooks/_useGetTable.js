import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetcher } from "../utils";

export default function useGetTable({
  filesToFetch = [],
  shouldFetch = false,
  dateLists = {},
}) {
  const dispatch = useDispatch();
  const accessedData = useSelector(({ data }) =>
    filesToFetch.map((fileSchema) => data.storedData[fileSchema.name])
  );

  useEffect(() => {
    console.log("loading files...");
    if (shouldFetch) {
      if (filesToFetch[0] && !filesToFetch[0].noFile) {
        const cleanedFilesToFetch = filesToFetch.filter((fileSchema, idx) => {
          const fileExists = !!accessedData[idx];
          const fileExistsAndIsLoaded =
            fileExists &&
            !!accessedData[idx]?.loaded?.includes(fileSchema?.timespan);
          return !fileExists || !fileExistsAndIsLoaded;
        });
        fetcher(cleanedFilesToFetch, dateLists)
          .then((dataArray) => {
            if (dataArray.length) {
              dataArray.forEach(({ value: newData }, idx) => {
                dispatch({
                  type: "RECONCILE_TABLE",
                  payload: {
                    name: filesToFetch[idx].name,
                    newData,
                    timespan: filesToFetch[idx].timespan,
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
    const returnData = dataReady ? accessedData[0] : {};
    const error = false;
    return {
      returnData,
      dataReady,
      error,
    };
  }, [JSON.stringify(accessedData[0]?.loaded)]);
  
  return [returnData, dataReady, error];
}
