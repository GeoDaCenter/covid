import { useMemo } from "react";
import useGetQuantileStatistics from "./useGetQuantileStatistics";

const combineObjs = (...objs) => Object.assign({}, ...objs);
export default function useGetCovidStatistics({
  geoid = null,
  includedColumns = ["variable", "geoidData", "stateQ50", "q50"],
}) {
  const allStats = [
    useGetQuantileStatistics({
      variable: "Confirmed Count per 100K Population",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Confirmed Count",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Death Count per 100K Population",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Death Count",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Percent Fully Vaccinated",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Percent Received At Least One Dose",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "7 Day Testing Positivity Rate Percent",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "7 Day Tests Performed per 100K Population",
      geoid,
    }),
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
      Header: "National Total",
      accessor: "nationalSummary",
    },
    {
      Header: "National Median",
      accessor: "q50",
    },
    {
      Header: "25th Percentile",
      accessor: "q25",
    },
    {
      Header: "75 Percentile",
      accessor: "q75",
    },
    {
      Header: "Lowest",
      accessor: "min",
    },
    {
      Header: "Highest",
      accessor: "max",
    },
  ].filter((c) => includedColumns.includes(c.accessor));

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
