import { useState } from "react";
import useGetQuantileStatistics from "../hooks/useGetQuantileStatistics";

export const TextStatistics = ({ geoid = null }) => {
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

  const essentialWorkers = useGetQuantileStatistics({
    variable: "Percent Essential Workers",
    geoid,
  });

  const uninsured = useGetQuantileStatistics({
    variable: "Uninsured Percent",
    geoid,
  });
  const name =
    cases100kStats && cases100kStats.geoidProperties
      ? "state_abbr" in cases100kStats.geoidProperties
        ? `${cases100kStats.geoidProperties.NAME}, ${cases100kStats.geoidProperties.state_abbr}`
        : cases100kStats.geoidProperties.NAME
      : "";
  return (
    <p>
      <b>Here's a summary of COVID-19 data for {name}:</b>
      {casesStats.geoidData && cases100kStats.geoidData && (
        <>
          {" "}
          The 7-day average of new cases detected per day is{" "}
          {cases100kStats.geoidData.toFixed(2)} per 100,000 people living in{" "}
          {name}. That places {name} in the highest{" "}
          {Math.round(cases100kStats.geoidQ * 100)} percentile of all counties,
          meaning that the 7-day average COVID case rate in {name} is higher
          than {Math.round(cases100kStats.geoidQ * 100)}% of all counties. The
          7-day average for the total count of cases in {name} is{" "}
          {Math.round(casesStats.geoidData).toLocaleString()} (higher than{" "}
          {Math.round(casesStats.geoidQ * 1000) / 10}% of other counties).
        </>
      )}
      {deaths100kStats.geoidData && deathsStats.geoidData && (
        <>
          {" "}
          Deaths in the last 7 days averaged{" "}
          {deaths100kStats.geoidData.toFixed(2)} (
          {Math.round(deaths100kStats.geoidQ * 1000) / 10} percentile) per 100k
          people, and {deathsStats.geoidData.toFixed(2)} (
          {Math.round(deathsStats.geoidQ * 1000) / 10} percentile) total count.
        </>
      )}
      {vaccinationStats.geoidData && vaccination1DoseStats.geoidData && (
        <>
          {" "}
          {Math.round(vaccinationStats.geoidData * 10) / 10}% of people in{" "}
          {name} are fully vaccinated, and{" "}
          {Math.round(vaccination1DoseStats.geoidData * 10) / 10}% of people
          received at least one dose of the vaccine. This places {name} in the{" "}
          {Math.round(vaccinationStats.geoidQ * 100)} percentile for fully vaccinated
          people, and {Math.round(vaccination1DoseStats.geoidQ * 100)} for
          people who received at least one dose of the vaccine.
        </>
      )}
      {essentialWorkers.geoidData && uninsured.geoidData && (
        <>
          {" "}
          To understand the context of {name}, we also look at the percentage of
          people in {name} who are essential workers.{" "}
          {essentialWorkers.geoidData.toFixed(2)}% of people in {name} are
          essential workers {Math.round(uninsured.geoidData)}% of people in{" "}
          {name} are uninsured.
        </>
      )}
    </p>
  );
};
