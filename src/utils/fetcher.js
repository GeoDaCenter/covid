import * as Pbf from "pbf";
import * as Schemas from "../schemas";

import { getParseCsvPromise, getDateLists, parsePbfData } from "../utils";

export const fetchFile = (fileInfo, dateLists) => {
  const { name, filetype, timespan, date } = fileInfo;
  if (!name || !filetype) return () => [];
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
