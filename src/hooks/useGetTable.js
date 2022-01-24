import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetcher } from "../utils";

export default function useGetTable({
  filesToFetch = [],
  shouldFetch = false,
  dateLists = {}
}) {
  const dispatch = useDispatch();
  const storedData = useSelector(({data}) => data.storedData);
  useEffect(() => {
    if (shouldFetch) {
      if (!filesToFetch[0].noFile) {
        fetcher(filesToFetch, dateLists)
          .then((dataArray) => {
            if (dataArray.length) {
              dataArray.forEach(({ value: newData }, idx) => {
                const fileExists = !!storedData[filesToFetch[idx]?.name]
                const fileExistsAndIsLoaded = fileExists && !!storedData[filesToFetch[idx]?.name]?.loaded?.includes(filesToFetch[idx]?.timespan)
                if (!fileExists || !fileExistsAndIsLoaded) {
                  dispatch({
                    type: "RECONCILE_TABLE",
                    payload: {
                      name: filesToFetch[idx].name,
                      newData,
                      timespan: filesToFetch[idx].timespan,
                    },
                  });
                }
              });
            }
          })
          .catch(() => console.log("error fetching table"));
      }
    }
  }, [shouldFetch, JSON.stringify(filesToFetch)]);

  const returnData = storedData[filesToFetch[0]?.name];
  const dataReady =
    (filesToFetch.length &&
    filesToFetch.every(
      ({ name, timespan }) => {
        const dataIsLoaded = storedData[name] && storedData[name]?.loaded?.includes(timespan);
        const fileIsNull =  filesToFetch.length === 1 && filesToFetch[0].noFile;
        return (dataIsLoaded || fileIsNull)
      }
    ))
  const error = false;
  return [returnData, dataReady, error];
}
