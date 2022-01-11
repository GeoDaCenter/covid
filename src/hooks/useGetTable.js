import { useEffect } from "react";
import { fetcher } from "../utils";

export default function useGetTable({
  filesToFetch = [],
  shouldFetch = false,
  storedData = {},
  dataDispatch = () => {},
  dateLists = {}
}) {
  useEffect(() => {
    if (shouldFetch) {
      if (!filesToFetch[0].noFile) {
        fetcher(filesToFetch, dateLists)
          .then((dataArray) => {
            if (dataArray.length) {
              dataArray.forEach(({ value: newData }, idx) => {
                if (
                  !storedData[filesToFetch[idx]?.name] ||
                  (!!storedData[filesToFetch[idx]?.name] &&
                    !storedData[filesToFetch[idx]?.name]?.loaded?.includes(
                      filesToFetch[idx]?.timespan
                    ))
                ) {
                  dataDispatch({
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
      ({ name, timespan }) =>
        storedData[name] && storedData[name]?.loaded?.includes(timespan)
    )) || filesToFetch.length === 1 && filesToFetch[0].noFile;
  const error = false;
  return [returnData, dataReady, error];
}
