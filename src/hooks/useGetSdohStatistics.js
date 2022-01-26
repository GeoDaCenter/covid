import { useMemo } from "react";
import useGetQuantileStatistics from "./useGetQuantileStatistics";

const combineObjs = (...objs) => Object.assign({}, ...objs);

export default function useGetSdohStatistics({ geoid = null }) {
  const allStats = [
    useGetQuantileStatistics({
      variable: "Uninsured Percent",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Over 65 Years Percent",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Life Expectancy",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Percent Essential Workers",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Severe Housing Problems",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Residential Segregation (Black - White)",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Preventable Hospital Stays",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Unemployment",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Food Insecurity",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Median Household Income",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Income Inequality",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Children in Poverty",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Drug Overdose Deaths",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Excessive Drinking",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Adult Smoking",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Diabetes Prevalence",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Adult Obesity",
      geoid,
    }),
    useGetQuantileStatistics({
      variable: "Self-rated Health",
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
