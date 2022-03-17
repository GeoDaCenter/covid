const fs = require("fs");
const path = require('path');
const axios = require("axios");
var AdmZip = require("adm-zip");

const BASE_URL = "https://d27o3hdsxhdrv9.cloudfront.net/zip/";
const filesToUnpack = ["csv.zip", "pbf.zip", "geojson.zip"];

const makeFolder = (folderName) => {
  try {
    fs.mkdirSync(path.join(__dirname, `../public/${folderName}`));
  } catch { }
};

const main = async () => {
  console.log('fetching data')
  filesToUnpack.forEach(file => makeFolder(file.split('.')[0]))
  const [latestCsv, latestPbf, latestGeoJson] = await Promise.all(
    filesToUnpack.map((file) =>
      axios
        .get(BASE_URL + file, {
          responseType: "arraybuffer",
        })
        .then((r) => r.data)
    )
  );
  console.log('fetched data, parsing csv')
  new AdmZip(latestCsv).extractAllTo(path.join(__dirname, "../public/csv/"), true);
  console.log('...parsing pbf...')
  new AdmZip(latestPbf).extractAllTo(path.join(__dirname, "../public/pbf/"), true);
  console.log('...parsing geojson...')
  new AdmZip(latestGeoJson).extractAllTo(path.join(__dirname, "../public/geojson/"), true);
  console.log('Parsing complete. Generating time-series data.')
};

main();
