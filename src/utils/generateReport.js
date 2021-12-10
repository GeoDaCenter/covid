// Replace Null/NaN with 0
const cleanData = (inputData) =>
  inputData.map((d) => (d >= 0 ? d : isNaN(d) || d === null ? 0 : d));

// Performs different operations on the data array output
// Sum, Average, and weighted average
const performOperation = (dataArray, operation, totalPopulation) => {
  // Sum up data
  const reducer = (a, b) => a + b;
  // Clean data
  const clean = cleanData(dataArray);

  switch (operation) {
    case 'sum':
      return clean.reduce(reducer);
    case 'average':
      return clean.reduce(reducer) / clean.length;
    case 'weighted_average':
      return Math.round((clean.reduce(reducer) / totalPopulation) * 100) / 100;
    default:
      return null;
  }
};
// Prepares data for the previous operation
const aggregateProperty = (
  table,
  properties,
  geoids,
  prop,
  operation,
  specialCase = null,
) => {
  let dataArray = [];
  let totalPopulation = 0;
  const column =
    typeof prop === 'string'
      ? prop
      : Object.keys(Object.values(table)[0])[prop];
  // Loop through and collect data from selected geographies in SelectionIndex
  if (operation === 'weighted_average') {
    for (let i = 0; i < geoids.length; i++) {
      let selectionPop = properties[geoids[i]].population;
      totalPopulation += selectionPop;

      if (specialCase !== null) {
        if (specialCase === 'pcp') {
          try {
            dataArray.push(
              parseInt(table[geoids[i]][column].split(':')[0]) * selectionPop,
            );
          } catch {
            dataArray.push(0);
          }
        }
      } else {
        dataArray.push(table[geoids[i]][column] * selectionPop);
      }
    }
  } else {
    for (let i = 0; i < geoids.length; i++) {
      dataArray.push(table[geoids[i]][column]);
    }
  }
  return performOperation(dataArray, operation, totalPopulation);
};

// Same as aggregteProperty(), but for time-series data
const aggregateTimeseries = (table, properties, geoids, index, operation) => {
  let dataArray = [];
  let totalPopulation = 0;
  if (operation === 'weighted_average') {
    for (let i = 0; i < geoids.length; i++) {
      let selectionPop = properties[geoids[i]].population;
      totalPopulation += selectionPop;
      dataArray.push(table[geoids[i]][index] * selectionPop);
    }
  } else {
    for (let i = 0; i < geoids.length; i++) {
      dataArray.push(table[geoids[i]][index]);
    }
  }

  return performOperation(dataArray, operation, totalPopulation);
};

// Generate data for 2-week line charts
const aggregate2WeekTimeSeries = (table, geoids, endIndex) => {
  let twoWeek = new Array(14).fill(0);
  for (let i = 0, n = 13; i < 14; i++, n--) {
    for (let g = 0; g < geoids.length; g++) {
      twoWeek[n] += table[geoids[g]][endIndex - i];
    }
  }
  return twoWeek;
};

// // For more complete data functions (like population normalized)
// const aggregateDataFunction = (numeratorTable, denominatorTable, properties, geoids, operation, params) => {
//     let dataArray = [];
//     let totalPopulation = 0;

//     if (operation === 'weighted_average') {
//         for (let i=0; i<geoids.length; i++){
//             let selectionPop = properties[geoids[i]].population;
//             totalPopulation+=selectionPop;
//             dataArray.push(dataFn(numeratorTable[geoids[i]], denominatorTable[geoids[i]], params)*selectionPop)
//         }
//     } else {
//         for (let i=0; i<geoids.length; i++){
//             dataArray.push(dataFn(numeratorTable[geoids[i]], denominatorTable[geoids[i]], params))
//         }
//     }

//     return performOperation(dataArray, operation, totalPopulation);
// }

export const generateReport = (geoids, state) => {
  let report = {};

  const properties = state.storedGeojson[state.currentData].properties;
  const geography = state.dataPresets[state.currentData].geography;
  const currentTables = {
    ...state.defaultTables[geography],
    ...state.dataPresets[state.currentData].tables,
  };

  report.name =
    geoids.length > 3
      ? ['County', 'County (Hybrid)'].includes(geography)
        ? 'Selected Counties'
        : 'Selected States'
      : ['County', 'County (Hybrid)'].includes(geography)
      ? geoids
          .map(
            (key) => properties[key].NAME + ', ' + properties[key].state_abbr,
          )
          .join(', ')
      : geoids.map((key) => properties[key].name).join(', ');

  report.population = aggregateProperty(
    properties,
    properties,
    geoids,
    'population',
    'sum',
  );
  report.date = state.dates[state.dataParams.nIndex];

  report.cases = aggregateTimeseries(
    state.storedData[currentTables.cases.file].data,
    properties,
    geoids,
    state.dataParams.nIndex,
    'sum',
  );
  report.cases7d =
    (report.cases -
      aggregateTimeseries(
        state.storedData[currentTables.cases.file].data,
        properties,
        geoids,
        state.dataParams.nIndex - 7,
        'sum',
      )) /
    7;
  report.cases100k = (report.cases7d / report.population) * 100_000;
  report.cases14 = aggregate2WeekTimeSeries(
    state.storedData[currentTables.cases.file].data,
    geoids,
    state.dataParams.nIndex,
  );

  report.deaths = aggregateTimeseries(
    state.storedData[currentTables.deaths.file].data,
    properties,
    geoids,
    state.dataParams.nIndex,
    'sum',
  );
  report.deaths7d =
    (report.deaths -
      aggregateTimeseries(
        state.storedData[currentTables.deaths.file].data,
        properties,
        geoids,
        state.dataParams.nIndex - 7,
        'sum',
      )) /
    7;
  report.deaths100k = (report.deaths7d / report.population) * 100_000;
  report.deaths14 = aggregate2WeekTimeSeries(
    state.storedData[currentTables.deaths.file].data,
    geoids,
    state.dataParams.nIndex,
  );

  report.beds = aggregateProperty(
    properties,
    properties,
    geoids,
    'beds',
    'sum',
  );
  report.casesPerBed = report.cases7d / report.beds;
  try {
    if (
      state.storedData.hasOwnProperty(
        currentTables.vaccines_fully_vaccinated?.file,
      )
    ) {
      report.fully_vaccinated = aggregateTimeseries(
        state.storedData[currentTables.vaccines_fully_vaccinated?.file].data,
        properties,
        geoids,
        state.dataParams.nIndex,
        'sum',
      );
      report.fully_vaccinated14 = aggregate2WeekTimeSeries(
        state.storedData[currentTables.vaccines_fully_vaccinated?.file].data,
        geoids,
        state.dataParams.nIndex,
      );
      report.fully_vaccinatedPc = report.fully_vaccinated / report.population;
    }
  } catch {}

  try {
    if (
      state.storedData.hasOwnProperty(currentTables.vaccines_one_dose?.file)
    ) {
      report.one_dose = aggregateTimeseries(
        state.storedData[currentTables.vaccines_one_dose?.file].data,
        properties,
        geoids,
        state.dataParams.nIndex,
        'sum',
      );
      report.one_dose14 = aggregate2WeekTimeSeries(
        state.storedData[currentTables.vaccines_one_dose?.file].data,
        geoids,
        state.dataParams.nIndex,
      );
      report.one_dosePc = report.one_dose / report.population;
    }
  } catch {}

  try {
    if (state.storedData.hasOwnProperty(currentTables.vaccines_dist?.file)) {
      report.doses_dist = aggregateTimeseries(
        state.storedData[currentTables.vaccines_dist?.file].data,
        properties,
        geoids,
        state.dataParams.nIndex,
        'weighted_average',
      );
      report.doses_dist14 = aggregate2WeekTimeSeries(
        state.storedData[currentTables.vaccines_dist?.file].data,
        geoids,
        state.dataParams.nIndex,
      );
      report.doses_dist100 = (report.doses_dist / report.population) * 100;
    }
  } catch {}

  try {
    if (state.storedData.hasOwnProperty(currentTables.testing?.file)) {
      report.wk_pos =
        Math.round(
          aggregateTimeseries(
            state.storedData[currentTables.testing_wk_pos.file].data,
            properties,
            geoids,
            state.dataParams.nIndex,
            'weighted_average',
          ) * 10000,
        ) / 100;
      report.wk_pos14 = aggregate2WeekTimeSeries(
        state.storedData[currentTables.testing_wk_pos.file].data,
        geoids,
        state.dataParams.nIndex,
      );
      report.tcap = aggregateTimeseries(
        state.storedData[currentTables.testing_tcap.file].data,
        properties,
        geoids,
        state.dataParams.nIndex,
        'weighted_average',
      );
      report.tcap14 = aggregate2WeekTimeSeries(
        state.storedData[currentTables.testing_tcap.file].data,
        geoids,
        state.dataParams.nIndex,
      );
      report.testing =
        Math.round(
          aggregateTimeseries(
            state.storedData[currentTables.testing.file].data,
            properties,
            geoids,
            state.dataParams.nIndex,
            'sum',
          ) * 100,
        ) / 100;
      report.ccpt =
        Math.round(
          aggregateTimeseries(
            state.storedData[currentTables.testing_ccpt.file].data,
            properties,
            geoids,
            state.dataParams.nIndex,
            'weighted_average',
          ) * 10000,
        ) / 100;
    }
  } catch {}

  try {
    if (
      state.storedData.hasOwnProperty(currentTables.chr_health_factors?.file)
    ) {
      report.PovChldPrc = aggregateProperty(
        state.storedData[currentTables.chr_health_factors.file].data,
        properties,
        geoids,
        'PovChldPrc',
        'weighted_average',
      );
      report.IncRt = aggregateProperty(
        state.storedData[currentTables.chr_health_factors.file].data,
        properties,
        geoids,
        'IncRt',
        'weighted_average',
      );
      report.MedianHouseholdIncome = aggregateProperty(
        state.storedData[currentTables.chr_health_factors.file].data,
        properties,
        geoids,
        'MedianHouseholdIncome',
        'weighted_average',
      );
      report.FdInsPrc = aggregateProperty(
        state.storedData[currentTables.chr_health_factors.file].data,
        properties,
        geoids,
        'FdInsPrc',
        'weighted_average',
      );
      report.UnEmplyPrc = aggregateProperty(
        state.storedData[currentTables.chr_health_factors.file].data,
        properties,
        geoids,
        'UnEmplyPrc',
        'weighted_average',
      );
      report.UnInPrc = aggregateProperty(
        state.storedData[currentTables.chr_health_factors.file].data,
        properties,
        geoids,
        'UnInPrc',
        'weighted_average',
      );
      report.PrmPhysRt = aggregateProperty(
        state.storedData[currentTables.chr_health_factors.file].data,
        properties,
        geoids,
        'PrmPhysRt',
        'weighted_average',
        'pcp',
      );
      report.PrevHospRt = aggregateProperty(
        state.storedData[currentTables.chr_health_factors.file].data,
        properties,
        geoids,
        'PrevHospRt',
        'sum',
      );
      report.RsiSgrBlckRt = aggregateProperty(
        state.storedData[currentTables.chr_health_factors.file].data,
        properties,
        geoids,
        'RsiSgrBlckRt',
        'weighted_average',
      );
      report.SvrHsngPrbRt = aggregateProperty(
        state.storedData[currentTables.chr_health_factors.file].data,
        properties,
        geoids,
        'SvrHsngPrbRt',
        'weighted_average',
      );
    }
  } catch {}

  try {
    if (
      state.storedData.hasOwnProperty(currentTables.essential_workers?.file)
    ) {
      report.EssentialPct = aggregateProperty(
        state.storedData[currentTables.essential_workers.file].data,
        properties,
        geoids,
        'pct_essential',
        'weighted_average',
      );
    }
  } catch {}

  try {
    if (
      state.storedData.hasOwnProperty(currentTables.chr_health_context?.file)
    ) {
      report.Over65YearsPrc = aggregateProperty(
        state.storedData[currentTables.chr_health_context.file].data,
        properties,
        geoids,
        'Over65YearsPrc',
        'weighted_average',
      );
      report.AdObPrc = aggregateProperty(
        state.storedData[currentTables.chr_health_context.file].data,
        properties,
        geoids,
        'AdObPrc',
        'weighted_average',
      );
      report.AdDibPrc = aggregateProperty(
        state.storedData[currentTables.chr_health_context.file].data,
        properties,
        geoids,
        'AdDibPrc',
        'weighted_average',
      );
      report.SmkPrc = aggregateProperty(
        state.storedData[currentTables.chr_health_context.file].data,
        properties,
        geoids,
        'SmkPrc',
        'weighted_average',
      );
      report.ExcDrkPrc = aggregateProperty(
        state.storedData[currentTables.chr_health_context.file].data,
        properties,
        geoids,
        'ExcDrkPrc',
        'weighted_average',
      );
      report.DrOverdMrtRt = aggregateProperty(
        state.storedData[currentTables.chr_health_context.file].data,
        properties,
        geoids,
        'DrOverdMrtRt',
        'sum',
      );
    }
  } catch {}

  try {
    if (state.storedData.hasOwnProperty(currentTables.chr_life?.file)) {
      report.LfExpRt = aggregateProperty(
        state.storedData[currentTables.chr_life.file].data,
        properties,
        geoids,
        'LfExpRt',
        'weighted_average',
      );
      report.SlfHlthPrc = aggregateProperty(
        state.storedData[currentTables.chr_life.file].data,
        properties,
        geoids,
        'SlfHlthPrc',
        'weighted_average',
      );
    }
  } catch {}

  try {
    if (state.storedData.hasOwnProperty(currentTables.predictions?.file)) {
      report.severity_index = aggregateProperty(
        state.storedData[currentTables.predictions.file].data,
        properties,
        geoids,
        'severity_index',
        'weighted_average',
      );
      report.predDates = [];
      for (let i = 2; i < 15; i += 2)
        report.predDates.push(
          state.storedData[currentTables.predictions.file].columns[i],
        );
      report.pred1 = aggregateProperty(
        state.storedData[currentTables.predictions.file].data,
        properties,
        geoids,
        2,
        'sum',
      );
      report.pred2 = aggregateProperty(
        state.storedData[currentTables.predictions.file].data,
        properties,
        geoids,
        4,
        'sum',
      );
      report.pred3 = aggregateProperty(
        state.storedData[currentTables.predictions.file].data,
        properties,
        geoids,
        6,
        'sum',
      );
      report.pred4 = aggregateProperty(
        state.storedData[currentTables.predictions.file].data,
        properties,
        geoids,
        8,
        'sum',
      );
      report.pred5 = aggregateProperty(
        state.storedData[currentTables.predictions.file].data,
        properties,
        geoids,
        10,
        'sum',
      );
      report.pred6 = aggregateProperty(
        state.storedData[currentTables.predictions.file].data,
        properties,
        geoids,
        12,
        'sum',
      );
      report.pred7 = aggregateProperty(
        state.storedData[currentTables.predictions.file].data,
        properties,
        geoids,
        14,
        'sum',
      );
    }
  } catch {}

  try {
    if (state.storedData.hasOwnProperty(currentTables.pct_home?.file)) {
      report.pct_home = aggregateTimeseries(
        state.storedData[currentTables.pct_home.file].data,
        properties,
        geoids,
        state.dataParams.nIndex,
        'weighted_average',
      );
      report.pct_fulltime = aggregateTimeseries(
        state.storedData[currentTables.pct_fulltime.file].data,
        properties,
        geoids,
        state.dataParams.nIndex,
        'weighted_average',
      );
      report.pct_parttime = aggregateTimeseries(
        state.storedData[currentTables.pct_parttime.file].data,
        properties,
        geoids,
        state.dataParams.nIndex,
        'weighted_average',
      );
    }
  } catch {}

  return report;
};
