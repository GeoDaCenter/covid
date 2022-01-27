import useGetQuantileStatistics from "../hooks/useGetQuantileStatistics";
import styled from "styled-components";

const TextReportContainer = styled.span`
  ul {
    list-style: square;
    margin-left: 1.5em;
  }
  ul li {
    /* margin-left:-5px; */
  }
  p.list-header {
    margin-top: .5em;
  }

`;
export const TextStatistics = ({ geoid = null, format = "bullet", dateIndex = false}) => {
  const cases100kStats = useGetQuantileStatistics({
    variable: "Confirmed Count per 100K Population",
    geoid,dateIndex
  });
  const casesStats = useGetQuantileStatistics({
    variable: "Confirmed Count",
    geoid,dateIndex
  });

  const deaths100kStats = useGetQuantileStatistics({
    variable: "Death Count per 100K Population",
    geoid,dateIndex
  });

  const deathsStats = useGetQuantileStatistics({
    variable: "Death Count",
    geoid,dateIndex
  });

  const vaccinationStats = useGetQuantileStatistics({
    variable: "Percent Fully Vaccinated",
    geoid,dateIndex
  });

  const vaccination1DoseStats = useGetQuantileStatistics({
    variable: "Percent Received At Least One Dose",
    geoid,dateIndex
  });

  const testingPositivityStats = useGetQuantileStatistics({
    variable: "7 Day Testing Positivity Rate Percent",
    geoid,dateIndex
  });

  const testingVolumeStats = useGetQuantileStatistics({
    variable: "7 Day Tests Performed per 100K Population",
    geoid,dateIndex
  });

  const name =
    cases100kStats && cases100kStats.geoidProperties
      ? "state_abbr" in cases100kStats.geoidProperties
        ? `${cases100kStats.geoidProperties.NAME}, ${cases100kStats.geoidProperties.state_abbr}`
        : cases100kStats.geoidProperties.NAME
      : "";
  if (format === "paragraph") {
    return (
      <p>
        <b>Here's a summary of COVID-19 data for {name}:</b>
        {casesStats.geoidData && cases100kStats.geoidData && (
          <>
            {" "}
            The 7-day average of new cases detected per day is{" "}
            {cases100kStats.geoidData.toFixed(2)} per 100,000 people living in{" "}
            {name}. That places {name} in the highest{" "}
            {Math.round(cases100kStats.geoidQ * 100)} percentile of all
            counties, meaning that the 7-day average COVID case rate in {name}{" "}
            is higher than {Math.round(cases100kStats.geoidQ * 100)}% of all
            counties. The 7-day average for the total count of cases in {name}{" "}
            is {Math.round(casesStats.geoidData).toLocaleString()} (higher than{" "}
            {Math.round(casesStats.geoidQ * 1000) / 10}% of other counties).
          </>
        )}
        {deaths100kStats.geoidData && deathsStats.geoidData && (
          <>
            {" "}
            Deaths in the last 7 days averaged{" "}
            {deaths100kStats.geoidData.toFixed(2)} (
            {Math.round(deaths100kStats.geoidQ * 1000) / 10} percentile) per
            100k people, and {deathsStats.geoidData.toFixed(2)} (
            {Math.round(deathsStats.geoidQ * 1000) / 10} percentile) total
            count.
          </>
        )}
        {vaccinationStats.geoidData && vaccination1DoseStats.geoidData && (
          <>
            {" "}
            {Math.round(vaccinationStats.geoidData * 10) / 10}% of people in{" "}
            {name} are fully vaccinated, and{" "}
            {Math.round(vaccination1DoseStats.geoidData * 10) / 10}% of people
            received at least one dose of the vaccine. This places {name} in the{" "}
            {Math.round(vaccinationStats.geoidQ * 100)} percentile for fully
            vaccinated people, and{" "}
            {Math.round(vaccination1DoseStats.geoidQ * 100)} for people who
            received at least one dose of the vaccine.
          </>
        )}
      </p>
    );
  }
  if (format === "bullet") {
    return (
      <TextReportContainer>
        <h4>7-Day Average Summary for {name}</h4>
        {cases100kStats.geoidData !== undefined && casesStats.geoidData !== undefined && (
          <>
            <p className="list-header">Cases</p>
            <ul>
              <li>
                The case rate is {cases100kStats.geoidData.toFixed(2)} per 100k people in {name}.
                <br/>
                This case rate is higher than{" "}
                {Math.round(cases100kStats.geoidQ * 100)}% of all counties
              </li>
              <li>
                The daily number of cases is{" "}
                {Math.round(casesStats.geoidData).toLocaleString()} ({">"}{Math.round(casesStats.geoidQ * 1000) / 10}% of counties)
              </li>
            </ul>
          </>
        )}
        {deaths100kStats.geoidData !== undefined && deathsStats.geoidData !== undefined && (
          <>
            <p>Deaths</p>
            <ul>
              <li>
                The death rate is{" "}
                {deaths100kStats.geoidData.toFixed(2)} per 100k people ({">"}{Math.round(deaths100kStats.geoidQ * 1000) / 10}% of counties)
              </li>
              <li>
              The daily number of deaths is{" "}
                {deathsStats.geoidData.toFixed(2)} ({">"}{Math.round(deathsStats.geoidQ * 1000) / 10}% of counties)
              </li>
            </ul>
          </>
        )}
        {vaccinationStats.geoidData !== undefined && vaccination1DoseStats.geoidData !== undefined && (
          <>
            <p>Vaccinations</p>
            <ul>
              <li>
                {vaccinationStats.geoidData.toFixed(2)}% of people are vaccinated ({">"}{Math.round(vaccinationStats.geoidQ * 1000) / 10}% of counties)
              </li>
              <li>
                {vaccination1DoseStats.geoidData.toFixed(2)}% of people have at least 1 dose ({">"}{Math.round(vaccination1DoseStats.geoidQ * 1000) / 10}% of counties)
              </li>
            </ul>
          </>
        )}
        {testingPositivityStats.geoidData !== undefined && testingVolumeStats.geoidData !== undefined && (
          <>
            <p>Testing</p>
            <ul>
              <li>
                {testingPositivityStats.geoidData.toFixed(2)}% of COVID tests were positive ({">"}{Math.round(testingPositivityStats.geoidQ * 1000) / 10}% of counties)
              </li>
              <li>
                {testingVolumeStats.geoidData.toFixed(2)} tests were repoted per 100k people ({">"}{Math.round(testingVolumeStats.geoidQ * 1000) / 10}% of counties)
              </li>
            </ul>
          </>
        )}
      </TextReportContainer>
    );
    //     {essentialWorkers.geoidData && uninsured.geoidData && (
    //       <>
    //         {" "}
    //         To understand the context of {name}, we also look at the percentage of
    //         people in {name} who are essential workers.{" "}
    //         {essentialWorkers.geoidData.toFixed(2)}% of people in {name} are
    //         essential workers {Math.round(uninsured.geoidData)}% of people in{" "}
    //         {name} are uninsured.
    //       </>
    //     )}
    //   </p>
    // );
  }
  return null;
};
