const getDataForCharts = (table, dates, additionalParams = {}) => {
  const {
    populationData = [],
    name = [],
    interval = 1,
    geoid = [],
  } = additionalParams;
  const data = table.data;
  const dateIndices = table.dates;
  // eslint-disable-next no-self-compare
  const populationModifier = populationData.length
    ? (val, population) => val && (val / population) * 100_000
    : (val) => val;

  // get list of all features (GEOIDs/FIPS)
  const features = Object.keys(data);
  // return array
  let rtn = new Array(Math.ceil(dates.length / interval)).fill({});
  // 7 day average delay -- early data
  let j = interval === 1 ? 7 : 1;

  // based on whether specific to geography, or all cases
  const countCol = 'count';
  const sumCol = 'sum';

  let maximums = {
    count: 0,
    sum: 0,
  };

  if (geoid.length) {
    for (let y = 0; y < geoid.length; y++) {
      const currName = name[y];
      const currGeoid = geoid[y];

      for (let n = 0; n < dates.length; n += interval) {
        let tempObj = {};
        // if we are missing data for that date, skip it
        if (dateIndices.indexOf(n) === -1) {
          tempObj[sumCol] = null;
          tempObj[currName] = null;
          rtn[n / interval] = { ...rtn[n / interval], ...tempObj };
        } else {
          // loop through features and sum values for index
          tempObj[sumCol] = rtn[n / interval][sumCol] || 0 + data[currGeoid][n];
          tempObj.date = dates[n];
          if ((n < 7 && j === 7) || (n < 1 && j === 1)) {
            tempObj[currName] = populationModifier(
              data[currGeoid][n],
              populationData[y] || null,
            );
          } else {
            tempObj[currName] = populationModifier(
              (data[currGeoid][n] - data[currGeoid][n - j] || 0) / j,
              populationData[y] || null,
            );
          }
          rtn[n / interval] = { ...rtn[n / interval], ...tempObj };
        }
        if (tempObj[sumCol] > maximums.sum) maximums.sum = tempObj[sumCol];
        if (tempObj[currName] > maximums.count)
          maximums.count = tempObj[currName];
      }
    }
  } else {
    for (let n = 0; n < dates.length; n += interval) {
      let tempObj = {};
      // if we are missing data for that date, skip it
      if (dateIndices.indexOf(n) === -1) {
        tempObj[sumCol] = null;
        tempObj[countCol] = null;
        rtn[n / interval] = tempObj;
      } else {
        // loop through features and sum values for index
        let sum = 0;
        for (let i = 0; i < features.length; i++) {
          sum += data[features[i]][n] || 0;
        }
        tempObj[sumCol] = sum;
        tempObj.date = dates[n];
        if ((n < 7 && j === 7) || (n < 1 && j === 1)) {
          tempObj[countCol] = sum;
        } else {
          tempObj[countCol] = (sum - rtn[n / interval - j][sumCol]) / j;
        }
        rtn[n / interval] = tempObj;
      }
      if (tempObj[sumCol] > maximums.sum) maximums.sum = tempObj[sumCol];
      if (tempObj[countCol] > maximums.count)
        maximums.count = tempObj[countCol];
    }
  }

  if (populationData.length) {
    const populationSum = populationData.reduce((a, b) => a + b);
    if (geoid.length) {
      for (let i = 0; i < rtn.length; i++) {
        if (dateIndices.indexOf(i) !== -1)
          rtn[i][sumCol] = populationModifier(rtn[i][sumCol], populationSum);
      }
    } else {
      for (let i = 0; i < rtn.length; i++) {
        rtn[i][sumCol] = populationModifier(rtn[i][sumCol], populationSum);
        rtn[i][countCol] = populationModifier(rtn[i][countCol], populationSum);
      }
      maximums.count = populationModifier(maximums.count);
    }
    maximums.sum = populationModifier(maximums.sum);
  }
  return { data: rtn, maximums };
};

export default getDataForCharts;
