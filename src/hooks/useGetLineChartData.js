import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { findIn, findAllDefaults } from "../utils";
import dataDateRanges from "../config/dataDateRanges";

async function fetchTimeSeries({
  currentGeojson,
  currentTimeseriesDataset,
  selectionKeys,
  totalPopulation,
}) {
  const keysToFetch = selectionKeys.length
    ? ["index", ...selectionKeys]
    : ["index"];
  const timeseriesData = await Promise.allSettled(
    keysToFetch.map((key) =>
      fetch(
        `${process.env.PUBLIC_URL}/timeseries/${currentTimeseriesDataset}/${key}.json`
      ).then((r) => r.json())
    )
  );

  let chartData = [];
  for (let i = 0; i < keysToFetch.length; i++) {
    const id = keysToFetch[i];
    const data = timeseriesData[i].value;
    if (i === 0) {
      const pop = totalPopulation;
      for (let j = 0; j < data.dates.length; j++) {
        const delta1 = j === 0 ? 0 : 1;
        const delta2 = j < 6 ? j : 7;
        chartData.push({
          date: data.dates[j],
          sum: data.sumData[j],
          sum100k: (data.sumData[j] / pop) * 100000,
          daily: data.sumData[j] - data.sumData[j - delta1],
          daily100k:
            ((data.sumData[j] - data.sumData[j - delta1]) / pop) * 100000,
          weekly: (data.sumData[j] - data.sumData[j - delta2]) / 7,
          weekly100k:
            (((data.sumData[j] - data.sumData[j - delta2]) / pop) * 100000) / 7,
        });
      }
    } else {
      const pop = currentGeojson[id].population;
      for (let j = 0; j < data.length; j++) {
        const delta1 = j === 0 ? 0 : 1;
        const delta2 = j < 6 ? j : 7;
        chartData[j] = {
          ...chartData[j],
          keySum: chartData[j]?.keySum || 0 + data[j],
          keySum100k: chartData[j]?.keySum100k || 0 + (data[j] / pop) * 100000,
          keyDaily: chartData[j]?.keyDaily || 0 + (data[j] - data[j - delta1]),
          keyDaily100k:
            chartData[j]?.keyDaily100k ||
            0 + ((data[j] - data[j - delta1]) / pop) * 100000,
          keyWeekly:
            chartData[j]?.keyWeekly || 0 + (data[j] - data[j - delta2]) / 7,
          keyWeekly100k:
            chartData[j]?.keyWeekly100k ||
            0 + (((data[j] - data[j - delta2]) / pop) * 100000) / 7,
          [`${id}Sum`]: data[j],
          [`${id}Sum100k`]: (data[j] / pop) * 100000,
          [`${id}Daily`]: data[j] - data[j - delta1],
          [`${id}Daily100k`]: ((data[j] - data[j - delta1]) / pop) * 100000,
          [`${id}Weekly`]: (data[j] - data[j - delta2]) / 7,
          [`${id}Weekly100k`]:
            (((data[j] - data[j - delta2]) / pop) * 100000) / 7,
        };
      }
    }
  }

  let maximums = {
    sum: chartData.slice(-1)[0].sum,
    sum100k: chartData.slice(-1)[0].sum100k,
    idSum: Math.max(
      ...keysToFetch.slice(1).map((id) => chartData.slice(-1)[0][`${id}Sum`])
    ),
    idSum100k: Math.max(
      ...keysToFetch
        .slice(1)
        .map((id) => chartData.slice(-1)[0][`${id}Sum100k`])
    ),
    keySum: chartData.slice(-1)[0].keySum,
    keySum100k: chartData.slice(-1)[0].keySum100k,
  };
  for (let i = 0; i < chartData.length; i++) {
    maximums.daily = Math.max(chartData[i].daily, maximums.daily || 0);
    maximums.daily100k = Math.max(
      chartData[i].daily100k,
      maximums.daily100k || 0
    );
    maximums.weekly = Math.max(chartData[i].weekly, maximums.weekly || 0);
    maximums.weekly100k = Math.max(
      chartData[i].weekly100k,
      maximums.weekly100k || 0
    );
    maximums.keyDaily = Math.max(chartData[i].keyDaily, maximums.keyDaily || 0);
    maximums.keyDaily100k = Math.max(
      chartData[i].keyDaily100k,
      maximums.keyDaily100k || 0
    );
    maximums.keyWeekly = Math.max(
      chartData[i].keyWeekly,
      maximums.keyWeekly || 0
    );
    maximums.keyWeekly100k = Math.max(
      chartData[i].keyWeekly100k,
      maximums.keyWeekly100k || 0
    );
    maximums.idDaily = Math.max(
      ...keysToFetch.slice(1).map((id) => chartData[i][`${id}Daily`]),
      maximums.idDaily || 0
    );
    maximums.idDaily100k = Math.max(
      ...keysToFetch.slice(1).map((id) => chartData[i][`${id}Daily100k`]),
      maximums.idDaily100k || 0
    );
    maximums.idWeekly = Math.max(
      ...keysToFetch.slice(1).map((id) => chartData[i][`${id}Weekly`]),
      maximums.idWeekly || 0
    );
    maximums.idWeekly100k = Math.max(
      ...keysToFetch.slice(1).map((id) => chartData[i][`${id}Weekly100`]),
      maximums.idWeekly100k || 0
    );
  }

  return {
    maximums,
    chartData,
  };
}

export default function useGetLineChartData({ table = "cases", geoid = [] }) {
  const [data, setData] = useState({
    maximums: {},
    chartData: [],
  });

  // pieces of redux state
  const currentData = useSelector(({params}) => params.currentData);
  const datasets = useSelector(({params}) => params.datasets);
  const dataParams = useSelector(({params}) => params.dataParams);
  const tables = useSelector(({params}) => params.tables);
  const stateKeys = useSelector(({params}) => params.selectionKeys);
  const selectionKeys = geoid.length ? geoid : stateKeys;
  
  const storedGeojson = useSelector(({data}) => data.storedGeojson);
  // current state data params
  const currDataset = findIn(datasets, "file", currentData);
  const currTables = [
    ...Object.values(currDataset.tables).map((tableId) =>
      findIn(tables, "id", tableId)
    ),
    ...findAllDefaults(tables, currDataset.geography).map((dataspec) => ({
      ...dataspec,
    })),
  ].filter(
    (entry, index, self) =>
      self.findIndex((f) => f.table === entry.table) === index
  );
  
  const currentTimeseriesDataset = currTables.find(
    (t) => t.table === table
  )?.name;

  const currentGeojson =
    storedGeojson[currentData] && storedGeojson[currentData].properties;
  const getName = ["County"].includes(currDataset.geography)
    ? (key) => currentGeojson[key].NAME + ", " + currentGeojson[key].state_abbr
    : (key) => currentGeojson[key].NAME;
  const selectionNames = selectionKeys.map(getName);
  const totalPopulation =
    currentGeojson &&
    Object.values(currentGeojson).reduce(
      (acc, curr) => acc + curr.population,
      0
    );

  useEffect(() => {
    if (totalPopulation && currentGeojson) {
      fetchTimeSeries({
        currentGeojson,
        currentTimeseriesDataset,
        selectionKeys,
        totalPopulation,
      }).then((data) => setData(data));
    }
  }, [JSON.stringify(selectionKeys), totalPopulation, table]);
  
  const currIndex = dataParams.nType.includes("time")
    ? dataParams.nIndex === null
      ? dataDateRanges[currentTimeseriesDataset].lastIndexOf(1)
      : dataParams.nIndex
    : false

  return {
    ...data,
    isTimeseries: dataParams.nType.includes("time"),
    selectionKeys,
    selectionNames,
    currRange: dataParams.nType.includes("time") ? dataParams.nRange||dataParams.nIndex : false,
    currIndex,
    currentData
  };
}
