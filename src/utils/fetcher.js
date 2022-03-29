import * as Pbf from "pbf";
import * as Schemas from "../schemas";

import { getParseCsvPromise, parsePbfData } from "../utils";

const orderInts = (a, b) => a - b;
const onlyUnique = (value, index, self) => self.indexOf(value) === index;

export const fetchFile = (fileInfo, dateLists) => {
  const { name, filetype, timespan, date } = fileInfo;
  if (!name || !filetype) return () => [];
  // console.log(`${process.env.PUBLIC_URL}/pbf/${name}${
  //   timespan ? `.${timespan}` : ""
  // }.pbf`)
  if (filetype === "pbf") {
    return fetch(
      `${process.env.PUBLIC_URL}/pbf/${name}${
        timespan ? `.${timespan}` : ""
      }.pbf`
    )
      .then((r) => r.arrayBuffer())
      .then((ab) => new Pbf(ab))
      .then((pbf) => Schemas.Rows.read(pbf))
      .then((pbfData) => parsePbfData(pbfData, fileInfo, dateLists[date]));
  }
  return getParseCsvPromise(fileInfo, dateLists[date]);
};

export const fetcher = async (filesToFetch = [], dateLists) =>
  filesToFetch && filesToFetch.length && !filesToFetch[0].noFile
    ? await Promise.allSettled(filesToFetch.map((file) => fetchFile(file, dateLists)))
    : () => [];
  
    function reconcileData(payload, storedData){  
      const { name, newData, timespan, error } = payload;
      const dataError =
        (newData?.dates && !newData.dates.length) ||
        (newData &&
          newData.columns &&
          storedData[name] &&
          storedData[name].columns &&
          newData.columns.join("") === storedData[name].columns.join(""));
    
      // If the data doesn't exist, easy. Just plug in the full dataset
      // and move on to the next
      if (!storedData.hasOwnProperty(name)) {
        storedData[name] = {
          ...newData,
          loaded: [timespan],
        };
      } else if (error || dataError) {
        storedData[name].loaded.push(timespan);
      } else {
        const newDates = newData?.dates || [];
        // Otherwise, we need to reconcile based on keys present in the 'dates'
        // property, using the big query data as the most up-to-date vs the
        // static fetched data, which may have been cached client-side
        const datasetKeys = storedData[name].data
          ? Object.keys(storedData[name].data)
          : [];
        // Loop through row (features) and date, using big query values as insertions
        // and static as base, to reduce loop iterations
        for (let x = 0; x < datasetKeys.length; x++) {
          let tempValues = storedData[name].data[datasetKeys[x]];
          for (let n = 0; n < newDates.length; n++) {
            tempValues[newDates[n]] = newData.data[datasetKeys[x]][newDates[n]];
          }
          storedData[name].data[datasetKeys[x]] = tempValues;
        }
    
        // Reconcile and sort date indices
        storedData[name].loaded.push(timespan);
    
        if (storedData[name]?.dates?.length) {
          storedData[name].dates = [
            ...storedData[name].dates,
            ...(newData?.dates || []),
          ]
            .filter(onlyUnique)
            .sort(orderInts);
        }
      }
    
    }

export const fetchAndClean = async (filesToFetch=[], dateLists) => {
  const dataArray = await fetcher(filesToFetch, dateLists);
  if (dataArray.length) {

    const mappedData = dataArray.map((response, idx) => {
      const newData = response.value;
      if (newData && newData.data) {
        return {
          name: filesToFetch[idx].name,
          newData,
          timespan: filesToFetch[idx].timespan
        }
      } else if (response.status === 'rejected') {
        return {
          name: filesToFetch[idx].name,
          newData: {},
          error: true,
          timespan: filesToFetch[idx].timespan
        }
      }
      return {
        name: null,
        newData: {},
        error: true,
        timespan: null
      }
    })
    
    return mappedData
  }
}