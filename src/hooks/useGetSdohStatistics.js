import { useMemo } from "react";
import useGetQuantileStatistics from "./useGetQuantileStatistics";

const combineObjs = (...objs) => Object.assign({}, ...objs);

export default function useGetSdohStatistics({ geoid = null }) {
  const uninsuredStats = useGetQuantileStatistics({
    variable: "Uninsured Percent",
    geoid,
  });

  const over65stats = useGetQuantileStatistics({
    variable: "Over 65 Years Percent",
    geoid,
  });

  const lifeExpectancy = useGetQuantileStatistics({
    variable: "Life Expectancy",
    geoid,
  });

  const essentialWorkers = useGetQuantileStatistics({
    variable: "Percent Essential Workers",
    geoid,
  });

  const allStats = [
    uninsuredStats,
    over65stats,
    lifeExpectancy,
    essentialWorkers,
  ];

  const name =
    allStats[0] && allStats[0].geoidProperties
      ? "state_abbr" in allStats[0].geoidProperties
        ? `${allStats[0].geoidProperties.NAME}, ${allStats[0].geoidProperties.state_abbr}`
        : allStats[0].geoidProperties.NAME
      : "";

  const columns = [
    {
      Header: "Metric",
      accessor: "variable",
    },
    {
      Header: name,
      accessor: "geoidData",
    },
    {
      Header: allStats[0]?.geoidProperties?.state_abbr
        ? allStats[0].geoidProperties.state_abbr + " Median"
        : "State Median",
      accessor: "stateQ50",
    },
    {
      Header: "National Median",
      accessor: "q50",
    },
  ];

  const dataReady = allStats.every((dataset) => !!dataset.variable);

  const tableData = useMemo(
    () =>
      allStats
        .map((dataset) =>
          combineObjs(
            ...columns.map((column) => ({
              [column.accessor]:
                typeof dataset[column.accessor] === "number"
                  ? Math.round((dataset[column.accessor] || 0) * 100) / 100
                  : dataset[column.accessor],
            }))
          )
        )
        .flat(),
    [dataReady]
  );

  return [tableData, columns, dataReady];
}
