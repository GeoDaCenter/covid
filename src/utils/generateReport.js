import { findIn } from ".";

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
    case "sum":
      return clean.reduce(reducer);
    case "average":
      return clean.reduce(reducer) / clean.length;
    case "weighted_average":
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
  specialCase = null
) => {
  let dataArray = [];
  let totalPopulation = 0;
  const column =
    typeof prop === "string"
      ? prop
      : Object.keys(Object.values(table)[0])[prop];
  // Loop through and collect data from selected geographies in SelectionIndex
  if (operation === "weighted_average") {
    for (let i = 0; i < geoids.length; i++) {
      let selectionPop = properties[geoids[i]].population;
      totalPopulation += selectionPop;

      if (specialCase !== null) {
        if (specialCase === "pcp") {
          try {
            dataArray.push(
              parseInt(table[geoids[i]][column].split(":")[0]) * selectionPop
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
  try {
    if (operation === "weighted_average") {
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
  } catch {
    return null;
  }
};

// Generate data for 2-week line charts
const aggregate2WeekTimeSeries = (table, geoids, endIndex) => {
  try {
    let twoWeek = new Array(14).fill(0);
    for (let i = 0, n = 13; i < 14; i++, n--) {
      for (let g = 0; g < geoids.length; g++) {
        twoWeek[n] += table[geoids[g]][endIndex - i];
      }
    }
    return twoWeek;
  } catch {
    return {};
  }
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

export const generateReport = ({
  currentData,
  currDataset,
  currIndex,
  currTables,
  dates,
  // defaultTables,
  selectionKeys,
  storedData,
  storedGeojson,
}) => {
  let report = {};
  const { geography } = currDataset; //file, geography, join, name, tables
  const properties = storedGeojson[currentData].properties;

  report.name =
    selectionKeys.length > 3
      ? ["County"].includes(geography)
        ? "Selected Counties"
        : "Selected States"
      : ["County"].includes(geography)
      ? selectionKeys
          .map(
            (key) => properties[key].NAME + ", " + properties[key].state_abbr
          )
          .join(", ")
      : selectionKeys.map((key) => properties[key].name).join(", ");

  report.population = aggregateProperty(
    properties,
    properties,
    selectionKeys,
    "population",
    "sum"
  );

  report.date = dates[currIndex];

  // case data
  const cases = storedData[findIn(currTables, "table", "cases").name];
  if (cases?.dates && cases.dates.includes(currIndex)) {
    report.cases = aggregateTimeseries(
      cases.data,
      properties,
      selectionKeys,
      currIndex,
      "sum"
    );

    report.cases7d =
      (report.cases -
        aggregateTimeseries(
          cases.data,
          properties,
          selectionKeys,
          currIndex - 7,
          "sum"
        )) /
      7;
    report.cases100k = (report.cases7d / report.population) * 100_000;
    report.cases14 = aggregate2WeekTimeSeries(
      cases.data,
      selectionKeys,
      currIndex
    );
  }

  // death  data
  const deaths = storedData[findIn(currTables, "table", "deaths").name];
  if (deaths?.dates && deaths.dates.includes(currIndex)) {
    report.deaths = aggregateTimeseries(
      deaths.data,
      properties,
      selectionKeys,
      currIndex,
      "sum"
    );
    report.deaths7d =
      (report.deaths -
        aggregateTimeseries(
          deaths.data,
          properties,
          selectionKeys,
          currIndex - 7,
          "sum"
        )) /
      7;
    report.deaths100k = (report.deaths7d / report.population) * 100_000;
    report.deaths14 = aggregate2WeekTimeSeries(
      deaths.data,
      selectionKeys,
      currIndex
    );
  }

  // beds
  report.beds = aggregateProperty(
    properties,
    properties,
    selectionKeys,
    "beds",
    "sum"
  );
  report.casesPerBed = report.cases7d / report.beds;

  // vaccination
  const fullyVaccinated =
    storedData[findIn(currTables, "table", "vaccines_fully_vaccinated").name];
  const oneDoseVaccinated =
    storedData[findIn(currTables, "table", "vaccines_one_dose").name];

  const vaccineIndex =
    fullyVaccinated?.dates && fullyVaccinated.dates.includes(currIndex)
      ? currIndex
      : fullyVaccinated?.dates && fullyVaccinated.dates.slice(-1)[0];

  if (vaccineIndex !== currIndex) {
    report.vaccine_index = vaccineIndex;
  }

  if (fullyVaccinated?.dates) {
    report.fully_vaccinated = aggregateTimeseries(
      fullyVaccinated.data,
      properties,
      selectionKeys,
      vaccineIndex,
      "sum"
    );
    report.fully_vaccinated14 = aggregate2WeekTimeSeries(
      fullyVaccinated.data,
      selectionKeys,
      vaccineIndex
    );
    report.fully_vaccinatedPc = report.fully_vaccinated / report.population;
  }

  if (oneDoseVaccinated?.dates) {
    report.one_dose = aggregateTimeseries(
      oneDoseVaccinated.data,
      properties,
      selectionKeys,
      vaccineIndex,
      "sum"
    );

    report.one_dose14 = aggregate2WeekTimeSeries(
      oneDoseVaccinated.data,
      selectionKeys,
      vaccineIndex
    );
    report.one_dosePc = report.one_dose / report.population;
  }

  // testing
  const testing = storedData[findIn(currTables, "table", "testing").name];
  const testingPositivity =
    storedData[findIn(currTables, "table", "testing_wk_pos").name];
  const testingCapacity =
    storedData[findIn(currTables, "table", "testing_tcap").name];
  const testingCcpt =
    storedData[findIn(currTables, "table", "testing_ccpt").name];
  const testingIndex =
    testing?.dates && testing.dates.includes(currIndex)
      ? currIndex
      : testing?.dates && testing.dates.slice(-1)[0];

  if (testingIndex !== currIndex) {
    report.testing_index = testingIndex;
  }

  if (
    testing?.dates &&
    testingPositivity?.dates &&
    testingCapacity?.dates &&
    testingCcpt?.dates
  ) {
    report.wk_pos =
      Math.round(
        aggregateTimeseries(
          testingPositivity.data,
          properties,
          selectionKeys,
          testingIndex,
          "weighted_average"
        ) * 10000
      ) / 100;
    report.wk_pos14 = aggregate2WeekTimeSeries(
      testingPositivity.data,
      selectionKeys,
      testingIndex
    );
    report.tcap = aggregateTimeseries(
      testingCapacity.data,
      properties,
      selectionKeys,
      testingIndex,
      "weighted_average"
    );
    report.tcap14 = aggregate2WeekTimeSeries(
      testingCapacity.data,
      selectionKeys,
      testingIndex
    );
    report.testing =
      Math.round(
        aggregateTimeseries(
          testing.data,
          properties,
          selectionKeys,
          testingIndex,
          "sum"
        ) * 100
      ) / 100;
    report.ccpt =
      Math.round(
        aggregateTimeseries(
          testingCcpt.data,
          properties,
          selectionKeys,
          testingIndex,
          "weighted_average"
        ) * 10000
      ) / 100;
  }

  // context
  const healthFactors =
    storedData[findIn(currTables, "table", "chr_health_factors").name];
  const healthContext =
    storedData[findIn(currTables, "table", "chr_health_context").name];
  const lifeExpectancy =
    storedData[findIn(currTables, "table", "chr_life").name];
  const essentialWorkers =
    storedData[findIn(currTables, "table", "essential_workers").name];

  if (
    healthFactors?.data &&
    healthContext?.data &&
    lifeExpectancy?.data &&
    essentialWorkers?.data
  ) {
    report.PovChldPrc = aggregateProperty(
      healthFactors.data,
      properties,
      selectionKeys,
      "PovChldPrc",
      "weighted_average"
    );
    report.IncRt = aggregateProperty(
      healthFactors.data,
      properties,
      selectionKeys,
      "IncRt",
      "weighted_average"
    );
    report.MedianHouseholdIncome = aggregateProperty(
      healthFactors.data,
      properties,
      selectionKeys,
      "MedianHouseholdIncome",
      "weighted_average"
    );
    report.FdInsPrc = aggregateProperty(
      healthFactors.data,
      properties,
      selectionKeys,
      "FdInsPrc",
      "weighted_average"
    );
    report.UnEmplyPrc = aggregateProperty(
      healthFactors.data,
      properties,
      selectionKeys,
      "UnEmplyPrc",
      "weighted_average"
    );
    report.UnInPrc = aggregateProperty(
      healthFactors.data,
      properties,
      selectionKeys,
      "UnInPrc",
      "weighted_average"
    );
    report.PrmPhysRt = aggregateProperty(
      healthFactors.data,
      properties,
      selectionKeys,
      "PrmPhysRt",
      "weighted_average",
      "pcp"
    );
    report.PrevHospRt = aggregateProperty(
      healthFactors.data,
      properties,
      selectionKeys,
      "PrevHospRt",
      "sum"
    );
    report.RsiSgrBlckRt = aggregateProperty(
      healthFactors.data,
      properties,
      selectionKeys,
      "RsiSgrBlckRt",
      "weighted_average"
    );
    report.SvrHsngPrbRt = aggregateProperty(
      healthFactors.data,
      properties,
      selectionKeys,
      "SvrHsngPrbRt",
      "weighted_average"
    );
    report.EssentialPct = aggregateProperty(
      essentialWorkers.data,
      properties,
      selectionKeys,
      "pct_essential",
      "weighted_average"
    );
    report.Over65YearsPrc = aggregateProperty(
      healthContext.data,
      properties,
      selectionKeys,
      "Over65YearsPrc",
      "weighted_average"
    );
    report.AdObPrc = aggregateProperty(
      healthContext.data,
      properties,
      selectionKeys,
      "AdObPrc",
      "weighted_average"
    );
    report.AdDibPrc = aggregateProperty(
      healthContext.data,
      properties,
      selectionKeys,
      "AdDibPrc",
      "weighted_average"
    );
    report.SmkPrc = aggregateProperty(
      healthContext.data,
      properties,
      selectionKeys,
      "SmkPrc",
      "weighted_average"
    );
    report.ExcDrkPrc = aggregateProperty(
      healthContext.data,
      properties,
      selectionKeys,
      "ExcDrkPrc",
      "weighted_average"
    );
    report.DrOverdMrtRt = aggregateProperty(
      healthContext.data,
      properties,
      selectionKeys,
      "DrOverdMrtRt",
      "sum"
    );
    report.LfExpRt = aggregateProperty(
      lifeExpectancy.data,
      properties,
      selectionKeys,
      "LfExpRt",
      "weighted_average"
    );
    report.SlfHlthPrc = aggregateProperty(
      lifeExpectancy.data,
      properties,
      selectionKeys,
      "SlfHlthPrc",
      "weighted_average"
    );
  }

  // mobility
  const pctHome = storedData[findIn(currTables, "table", "pct_home").name];
  const pctFulltime =
    storedData[findIn(currTables, "table", "pct_fulltime").name];
  const pctParttime =
    storedData[findIn(currTables, "table", "pct_parttime").name];

  const mobilityIndex =
    pctHome?.dates && pctHome.dates.includes(currIndex)
      ? currIndex
      : pctHome?.dates && pctHome.dates.slice(-1)[0];

  if (mobilityIndex !== currIndex) {
    report.mobility_index = mobilityIndex;
  }

  if (pctHome?.dates && pctFulltime?.dates && pctParttime?.dates) {
    report.pct_home = aggregateTimeseries(
      pctHome.data,
      properties,
      selectionKeys,
      mobilityIndex,
      "weighted_average"
    );
    report.pct_fulltime = aggregateTimeseries(
      pctFulltime.data,
      properties,
      selectionKeys,
      mobilityIndex,
      "weighted_average"
    );
    report.pct_parttime = aggregateTimeseries(
      pctParttime.data,
      properties,
      selectionKeys,
      mobilityIndex,
      "weighted_average"
    );
  }

  // depricated - predictions
  // try {
  //   if (state.storedData.hasOwnProperty(currentTables.predictions?.file)) {
  //     report.severity_index = aggregateProperty(
  //       state.storedData[currentTables.predictions.file].data,
  //       properties,
  //       geoids,
  //       'severity_index',
  //       'weighted_average',
  //     );
  //     report.predDates = [];
  //     for (let i = 2; i < 15; i += 2)
  //       report.predDates.push(
  //         state.storedData[currentTables.predictions.file].columns[i],
  //       );
  //     report.pred1 = aggregateProperty(
  //       state.storedData[currentTables.predictions.file].data,
  //       properties,
  //       geoids,
  //       2,
  //       'sum',
  //     );
  //     report.pred2 = aggregateProperty(
  //       state.storedData[currentTables.predictions.file].data,
  //       properties,
  //       geoids,
  //       4,
  //       'sum',
  //     );
  //     report.pred3 = aggregateProperty(
  //       state.storedData[currentTables.predictions.file].data,
  //       properties,
  //       geoids,
  //       6,
  //       'sum',
  //     );
  //     report.pred4 = aggregateProperty(
  //       state.storedData[currentTables.predictions.file].data,
  //       properties,
  //       geoids,
  //       8,
  //       'sum',
  //     );
  //     report.pred5 = aggregateProperty(
  //       state.storedData[currentTables.predictions.file].data,
  //       properties,
  //       geoids,
  //       10,
  //       'sum',
  //     );
  //     report.pred6 = aggregateProperty(
  //       state.storedData[currentTables.predictions.file].data,
  //       properties,
  //       geoids,
  //       12,
  //       'sum',
  //     );
  //     report.pred7 = aggregateProperty(
  //       state.storedData[currentTables.predictions.file].data,
  //       properties,
  //       geoids,
  //       14,
  //       'sum',
  //     );
  //   }
  // } catch {}

  // depricated -- vaccines distributed but not used

  // try {
  //   if (state.storedData.hasOwnProperty(currentTables.vaccines_dist?.file)) {
  //     report.doses_dist = aggregateTimeseries(
  //       state.storedData[currentTables.vaccines_dist?.file].data,
  //       properties,
  //       geoids,
  //       state.dataParams.nIndex,
  //       'weighted_average',
  //     );
  //     report.doses_dist14 = aggregate2WeekTimeSeries(
  //       state.storedData[currentTables.vaccines_dist?.file].data,
  //       geoids,
  //       state.dataParams.nIndex,
  //     );
  //     report.doses_dist100 = (report.doses_dist / report.population) * 100;
  //   }
  // } catch {}

  return report;
};
