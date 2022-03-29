const fs = require("fs");
const Pbf = require("pbf");
const path = require("path");
const Rows = require("./pbfReadSchema").Rows;
const Schema = require("./pbfWriteSchema");
const Papa = require("papaparse");

const directoryPath = path.join(__dirname, "../public/pbf/");

const cleanVals = (vals, multiplier) => {
  const returnVals = [];
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] === -999 || vals[i] === -9999) {
      returnVals.push(0);
    } else {
      returnVals.push(vals[i] * multiplier);
    }
  }
  return returnVals;
};
//passsing directoryPath and callback function
console.log("Building timeseries...");
const makeFolder = (fileName) => {
  try {
    fs.mkdirSync(path.join(__dirname, `../public/timeseries`));
  } catch {}

  try {
    fs.mkdirSync(path.join(__dirname, `../public/timeseries/${fileName}`));
  } catch {}
};

const generateIndividualFiles = (fileName, multiplier, row) => {
  let sumData = [];
  for (let i = 0; i < row.length; i++) {
    const entry = row[i];
    const values = cleanVals(entry.vals, multiplier);
    fs.writeFileSync(path.join(__dirname, `../public/timeseries/${fileName}/${entry.geoid}.json`),
      `${JSON.stringify(values)}`
    );
    for (let j = 0; j < values.length; j++) {
      sumData[j] = (values[j] || 0) + (sumData[j] || 0);
    }
  }
  return sumData;
};

const generateSummary = (fileName, dates, sumData, multiplier, row) => {
  fs.writeFileSync(path.join(__dirname, `../public/timeseries/${fileName}/index.json`),
    `{
        "dates": ${JSON.stringify(dates)},
        "sumData": ${JSON.stringify(sumData)},
        "multiplier": ${multiplier},
        "count": ${row.length},
        "ids": ${JSON.stringify(row.map((entry) => entry.geoid))}
    }`
  );
};
const onlyUnique = (value, index, self) => self.indexOf(value) === index;

const splitPbfs = (fileList) => {
  console.log(`Splitting ${fileList.length} files.`);

  fileList.forEach(function (file, idx) {
    const fileName = file.split(".").slice(0,-1).join(".");
    console.log(`${fileName}, writing ${idx + 1}/${fileList.length}...`);
    makeFolder(fileName);
    const multiplier =
      file.split(".").length > 2 ? +file.split(".")[1].split("-")[1] : 1;
    const { dates, row } = Rows.read(
      new Pbf(fs.readFileSync(path.join(__dirname, `../public/pbf/${file}`)))
    );
    const reversedDates = [...dates].reverse();
    const sumData = generateIndividualFiles(fileName, multiplier, row);
    generateSummary(fileName, dates, sumData, multiplier, row);
    const months = dates.map((date) => date.slice(0, -3)).filter(onlyUnique);
    const indexRanges = months.reduce(
      (prev, curr) => [
        ...prev,
        [
          dates.findIndex((date) => date.includes(curr)),
          dates.length - reversedDates.findIndex((date) => date.includes(curr)),
        ],
      ],
      []
    );
    // generate rows
    for (let i = 0; i < months.length; i++) {
      const month = i === months.length - 1 ? "latest" : months[i];
      const range = indexRanges[i];
      const monthData = new Schema.Rows();
      const rowData = row.map((data) => {
        const entry = new Schema.Entry();
        entry.setGeoid(data.geoid);
        entry.setValsList(data.vals.slice(range[0], range[1]));
        return entry;
      });
      monthData.setDatesList(dates.slice(range[0], range[1]));
      monthData.setRowList(rowData);
      const binaryData = monthData.serializeBinary();
      const pathName = path.join(__dirname, `../public/pbf/${fileName}.${month}.pbf`);
      console.log(`Exporting ${pathName}`)
      fs.writeFileSync(pathName, binaryData);
    }
  });
}
const parseCsvLikePbf = (csvData, idCol, dataIndex) => {
  let returnObj = [];
  for (let i = 0; i < csvData.length; i++) {
    returnObj.push({
      geoid: csvData[i][idCol],
      vals: Object.values(csvData[i]).slice(dataIndex),
    })
  }
  return returnObj;
}

const splitCsvs = (fileList) => {
  const multiplier = 1;
  fileList.forEach(function ({file, idCol, dataIndex}, idx) {
    const fileName = file.split(".").slice(0,-1).join(".");
    makeFolder(fileName);
    fs.readFile(path.join(__dirname, `../public/csv/${file}`), 'utf8', function(err, string) {
      if (err) throw err;
      const {data} = Papa.parse(string, {header: true});
      const parsed = parseCsvLikePbf(data, idCol, dataIndex);
      const sumData = generateIndividualFiles(fileName, multiplier, parsed);
      const dates = Object.keys(data[0]).slice(dataIndex)
      generateSummary(fileName, dates, sumData, multiplier, parsed);
    });
  })
}

const excludeList = [
  'covid_ccpt_cdc.pbf',
  'covid_confirmed_cdc.e-2.pbf',
  'covid_confirmed_cdc.pbf',
  'covid_confirmed_usafacts_h.pbf',
  'covid_deaths_cdc.e-2.pbf',
  'covid_deaths_cdc.pbf',
  'covid_deaths_usafacts_h.pbf',
  'covid_tcap_cdc.pbf',
  'covid_wk_pos_cdc.pbf',
  'vaccination_fully_vaccinated_cdc_h.pbf',
  'vaccination_one_or_more_doses_cdc_h.pbf'
]

const t0 = new Date();
const parsePbf = () => {
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }

    const fileList = files.filter(
      (file) =>
        !(
          // exclude dot density and already-parsed files.
          (
            file.includes("2020") ||
            file.includes("2021") ||
            file.includes("2022") ||
            file.includes("latest") ||
            file.includes("dotDensity")
          )
        )
    ).filter(file => !(excludeList.includes(file)))
    splitPbfs(fileList);
    console.log(`Done in ${new Date() - t0} ms`);
  });
}
const csvsToParse = [
  {
    file: 'covid_confirmed_nyt_state.csv',
    idCol: 'fips',
    dataIndex: 1
  },
  {
    file: 'covid_confirmed_usafacts_state.csv',
    idCol: 'StateFIPS',
    dataIndex: 2
  },
  {
    file: 'covid_confirmed_1p3a_state.csv',
    idCol: 'GEOID',
    dataIndex: 2
  },
  {
    file: 'covid_deaths_nyt_state.csv',
    idCol: 'fips',
    dataIndex: 1
  },
  {
    file: 'covid_deaths_usafacts_state.csv',
    idCol: 'StateFIPS',
    dataIndex: 2
  },
  {
    file: 'covid_deaths_1p3a_state.csv',
    idCol: 'GEOID',
    dataIndex: 2
  },
  {
    file: 'covid_wk_pos_cdc_state.csv',
    idCol: 'state_fips',
    dataIndex: 1
  },
  {
    file: 'vaccination_fully_vaccinated_cdc_state.csv',
    idCol: 'GEOID',
    dataIndex: 1
  },
]

parsePbf()
splitCsvs(csvsToParse)
