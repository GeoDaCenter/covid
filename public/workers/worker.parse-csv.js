importScripts(
  "https://unpkg.com/papaparse@5.3.1/papaparse.min.js",
  "./comlink.js"
);

const findDateIndices = (dateList, columnList) => {
  let validIndices = [];
  for (let i = 0; i < dateList.length; i++) {
    if (columnList.indexOf(dateList[i]) !== -1) validIndices.push(i);
  }
  return validIndices;
};

const getDateIndices = (data, names) => {
  let rtn = {};

  for (let i = 0; i < data.length; i++) {
    rtn[names[i]] = data[i][2];
  }

  return rtn;
};

function parseCsv(csvString) {
  const data = Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  }).data;
  let rtn = {};
  let dateIndices = null;

  if (dateList !== undefined)
    dateIndices = findDateIndices(dateList, Object.keys(data[0]));

  if (fileInfo.accumulate) {
    for (let n = 0; n < data.length; n++) {
      let tempArr = new Array(dateList.length);
      for (let i = 0; i < dateList.length; i++) {
        tempArr[i] =
          (data[n][dateList[i]] || 0) + (tempArr[i - 1] || 0) || null;
      }
      rtn[data[n][fileInfo.join]] = tempArr;
    }
  } else if (dateList !== undefined) {
    for (let n = 0; n < data.length; n++) {
      let tempArr = new Array(dateList.length);
      for (let i = 0; i < dateList.length; i++) {
        tempArr[i] = data[n][dateList[i]] || tempArr[i - 1] || null;
      }
      rtn[data[n][fileInfo.join]] = tempArr;
    }
  } else {
    for (let n = 0; n < data.length; n++) {
      rtn[data[n][fileInfo.join]] = data[n];
    }
  }
  return { data: rtn, columns: Object.keys(data[0]), dates: dateIndices };
}

Comlink.expose(parseCsv);
