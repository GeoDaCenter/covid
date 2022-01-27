import { useMemo } from "react";
import useGetQuantileStatistics from "./useGetQuantileStatistics";

const combineObjs = (...objs) => Object.assign({}, ...objs);
export default function useGetCovidStatistics({
  geoid = null,
  includedColumns = ["variable", "geoidData", "stateQ50", "q50"],
  neighborIds = [],
  dateIndex= false
}) {
  const allStats = [
    useGetQuantileStatistics({
      variable: "Confirmed Count per 100K Population",
      geoid,neighborIds,dateIndex
    }),
    useGetQuantileStatistics({
      variable: "Confirmed Count",
      geoid,neighborIds,dateIndex
    }),
    useGetQuantileStatistics({
      variable: "Death Count per 100K Population",
      geoid,neighborIds,dateIndex
    }),
    useGetQuantileStatistics({
      variable: "Death Count",
      geoid,neighborIds,dateIndex
    }),
    useGetQuantileStatistics({
      variable: "Percent Fully Vaccinated",
      geoid,neighborIds,dateIndex
    }),
    useGetQuantileStatistics({
      variable: "Percent Received At Least One Dose",
      geoid,neighborIds,dateIndex
    }),
    useGetQuantileStatistics({
      variable: "7 Day Testing Positivity Rate Percent",
      geoid,neighborIds,dateIndex
    }),
    useGetQuantileStatistics({
      variable: "7 Day Tests Performed per 100K Population",
      geoid,neighborIds,dateIndex
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
      Header: "Region Median",
      accessor: "regionQ50",
    },
    {
      Header: "Region Summary",
      accessor: "regionSummary",
    },
    {
      Header: "National Summary",
      accessor: "nationalSummary",
    },
    {
      Header: "Median (50th pctile)",
      accessor: "q50",
    },
    {
      Header: "25th Percentile",
      accessor: "q25",
    },
    {
      Header: "75th Percentile",
      accessor: "q75",
    },
    {
      Header: "Region Lowest",
      accessor: "regionMin",
    },
    {
      Header: "Region Highest",
      accessor: "regionMax",
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
    [dataReady, JSON.stringify(neighborIds)]
  );
  return [tableData, columns, dataReady];
}
