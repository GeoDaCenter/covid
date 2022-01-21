import { useMemo } from "react";
import useGetQuantileStatistics from "./useGetQuantileStatistics";

const combineObjs = (...objs) => Object.assign({}, ...objs);
export default function useGetCovidStatistics({ geoid = null }) {
  const cases100kStats = useGetQuantileStatistics({
    variable: "Confirmed Count per 100K Population",
    geoid,
  });
  const casesStats = useGetQuantileStatistics({
    variable: "Confirmed Count",
    geoid,
  });

  const deaths100kStats = useGetQuantileStatistics({
    variable: "Death Count per 100K Population",
    geoid,
  });

  const deathsStats = useGetQuantileStatistics({
    variable: "Death Count",
    geoid,
  });

  const vaccinationStats = useGetQuantileStatistics({
    variable: "Percent Fully Vaccinated",
    geoid,
  });

  const vaccination1DoseStats = useGetQuantileStatistics({
    variable: "Percent Received At Least One Dose",
    geoid,
  });

  const name =
    cases100kStats && cases100kStats.geoidProperties
      ? "state_abbr" in cases100kStats.geoidProperties
        ? `${cases100kStats.geoidProperties.NAME}, ${cases100kStats.geoidProperties.state_abbr}`
        : cases100kStats.geoidProperties.NAME
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
      Header: cases100kStats?.geoidProperties?.state_abbr ? cases100kStats.geoidProperties.state_abbr + ' Median' : "State Median",
      accessor: "stateQ50",
    },
    {
      Header: "National Median",
      accessor: "q50",
    },
  ];

  const tableData = useMemo(
    () =>
      [
        cases100kStats,
        casesStats,
        deaths100kStats,
        deathsStats,
        vaccinationStats,
        vaccination1DoseStats,
      ]
        .map((dataset) =>
          combineObjs(
            ...columns.map((column) => ({
              [column.accessor]: typeof dataset[column.accessor] === 'number' ? Math.round((dataset[column.accessor]||0)*100)/100 : dataset[column.accessor],
            }))
          )
        )
        .flat(),
    [
      cases100kStats.variable,
      casesStats.variable,
      deaths100kStats.variable,
      deathsStats.variable,
      vaccinationStats.variable,
      vaccination1DoseStats.variable,
    ]
  );

  return [
    tableData,
    columns,
    !!cases100kStats.variable &&
      !!casesStats.variable &&
      !!deaths100kStats.variable &&
      !!deathsStats.variable &&
      !!vaccinationStats.variable &&
      !!vaccination1DoseStats.variable,
  ];
}
