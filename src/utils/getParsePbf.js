import * as Pbf from 'pbf';

// PBF schemas
import * as Schemas from '../schemas';

const filterVal = (val, scale) => {
  if (val > -998) {
    return val * scale;
  }
  if (val === -999) {
    return null;
  }
  if (val === -9999) {
    return undefined;
  }
  if (isNaN(val)) {
    return null;
  }
  return val * scale;
};
export const parsePbfData = (pbfData, fileInfo, dateList) => {
  let returnData = {};
  let dateIndices = [];
  let constructorIndices = [];
  let columnNames = ['geoid', ...pbfData.dates];
  // embedded scientific scale exponent in file name
  const scale = /.e-[0-9]/g.exec(fileInfo.name)
    ? 10 ** -+/.e-[0-9]/g.exec(fileInfo.name)[0]?.split('-')[1]
    : 1;

  for (let i = 0; i < dateList.length; i++) {
    if (pbfData.dates.includes(dateList[i])) {
      dateIndices.push(i);
      constructorIndices.push(true);
    } else {
      constructorIndices.push(false);
    }
  }

  if (fileInfo.accumulate) {
    for (let i = 0; i < pbfData.row.length; i++) {
      returnData[pbfData.row[i].geoid] = [];
      for (let n = 0, j = 0; n < constructorIndices.length; n++) {
        if (constructorIndices[n]) {
          returnData[pbfData.row[i].geoid].push(
            pbfData.row[i].vals[j] <= -999
              ? pbfData.row[i].vals[j] === -999
                ? null
                : undefined
              : (pbfData.row[i].vals[j] * scale || 0) +
                  (returnData[pbfData.row[i].geoid][n - 1] || 0) || null,
          );
          j++;
        } else {
          returnData[pbfData.row[i].geoid].push(
            pbfData.row[i].vals[j] <= -999
              ? pbfData.row[i].vals[j] === -999
                ? null
                : undefined
              : pbfData.row[i].vals[j - 1] * scale || null,
          );
        }
      }
    }
  } else {
    for (let i = 0; i < pbfData.row.length; i++) {
      returnData[pbfData.row[i].geoid] = [];
      for (let n = 0, j = 0; n < constructorIndices.length; n++) {
        if (constructorIndices[n]) {
          returnData[pbfData.row[i].geoid].push(
            filterVal(pbfData.row[i].vals[j], scale),
          );
          j++;
        } else {
          returnData[pbfData.row[i].geoid].push(
            filterVal(pbfData.row[i].vals[j - 1], scale),
          );
        }
      }
    }
  }
  return { data: returnData, columns: columnNames, dates: dateIndices };
};

export default async function getParsePbf(fileInfo, dateList) {
  return fetch(`${process.env.PUBLIC_URL}/pbf/${fileInfo.file}`)
    .then((r) => r.arrayBuffer())
    .then((ab) => new Pbf(ab))
    .then((pbf) => Schemas.Rows.read(pbf))
    .then((pbfData) => parsePbfData(pbfData, fileInfo, dateList));
}
