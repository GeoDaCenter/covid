import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import { HoverDiv } from "../../components";
import useGetTooltipContent from "../../hooks/useGetTooltipContent";
import { hasProps } from "../../utils";
// This component handles and formats the map tooltip info.
// The props passed to this component should contain an object of the hovered object (from deck, info.object by default)

export default function MapTooltipContent() {
  // destructure the object for cleaner formatting
  const { x, y, data, geoid } = useSelector(({ui}) => ui.tooltipInfo) || {};
  const tooltipRef = useRef(null);
  const tooltipContent = useGetTooltipContent({ data, geoid });
  if (!tooltipContent || !Object.keys(tooltipContent).length) return <></>;
  const bounds =
    tooltipRef.current && tooltipRef.current.getBoundingClientRect();
  const transposeProps = {
    transform: `translate(${
      bounds && window && window.innerWidth - bounds.right < 200 ? "-100%" : 0
    }, 
      ${
        bounds && window && window.innerHeight - bounds.bottom < 200
          ? "-100%"
          : 0
      })`,
  };

  return (
    <ErrorBoundary>
      <HoverDiv
        style={{
          position: "fixed",
          pointerEvents: "none",
          left: x,
          top: y,
          transition: "transform 0.2s ease-in-out",
          ...transposeProps,
        }}
        ref={tooltipRef}
      >
        {data ? (
          <>
            {"Hospital Type" in data && (
              <>
                <h3>{data["Name"]}</h3>
                <hr />
                {data["Hospital Type"]}
                <br />
                {data.Address} <br />
                {data.Address_2 && `${data.Address_2}${(<br />)}`}
                {data.City}, {data.State}
                <br />
                {data.Zipcode}
                <br />
              </>
            )}
            {"testing_status" in data && (
              <>
                <h3>{data.name}</h3>
                <hr />
                {data.address}
                <br />
                {data.city},{data.st_abbr} <br />
                {data.phone}
                <br />
                <br />
                {data.testing_status === "Yes"
                  ? "This location offers COVID-19 testing."
                  : "Currently, this location does not offer COVID-19 testing."}
                <br />
              </>
            )}
            {"type" in data && (
              <>
                <h3>{data.name}</h3>
                {data.type === 0 && (
                  <>
                    <b>Invited</b> vaccination clinic
                  </>
                )}
                {data.type === 1 && <>Participating vaccination clinic</>}
                {data.type === 3 && <>Large scale vaccination site</>}
                <hr />
                {data.address}
                <br />
                {data.phone && (
                  <>
                    <br />
                    {data.phone}
                    <br />
                  </>
                )}
                {data.volumne && (
                  <>
                    <br />
                    <br />
                    Expected Vaccination Volume: {data.volume}/day
                    <br />
                    <br />
                  </>
                )}
                {data.description && (
                  <>
                    <br />
                    {data.description}
                    <br />
                    <br />
                  </>
                )}
              </>
            )}
            {"custom" in data &&
              Object.entries(data.custom).map((entry) => (
                <>
                  <b>{entry[0]}:</b>{" "}
                  {typeof entry[1] !== "object"
                    ? entry[1]
                    : JSON.stringify(entry[1])}
                  <br />
                </>
              ))}
          </>
        ) : (
          <>
            {"name" in tooltipContent && (
              <>
                <h3>{tooltipContent.name}</h3>
                <hr />
              </>
            )}
            {hasProps(tooltipContent, [
              "population",
              "vaccines_fully_vaccinated",
              "vaccines_one_dose",
            ]) && (
              <>
                Fully Vaccinated:{" "}
                {Math.round(
                  (tooltipContent.vaccines_fully_vaccinated /
                    tooltipContent.population) *
                    1000
                ) / 10}
                %<br />
                At least one dose:{" "}
                {Math.round(
                  (tooltipContent.vaccines_one_dose /
                    tooltipContent.population) *
                    1000
                ) / 10}
                %<br />
                <br />
              </>
            )}
            {hasProps(tooltipContent, [
              "cases",
              "daily_cases",
              "deaths",
              "daily_deaths",
            ]) && (
              <>
                Cases: {(tooltipContent.cases||0).toLocaleString("en") || 0}
                <br />
                Deaths: {(tooltipContent.deaths||0).toLocaleString("en") || 0}
                <br />
                Daily New Cases:{" "}
                {(tooltipContent.daily_cases||0).toLocaleString("en") || 0}
                <br />
                Daily New Deaths:{" "}
                {(tooltipContent.daily_deaths||0).toLocaleString("en") || 0}
                <br />
                <br />
              </>
            )}
            {"testing_wk_pos" in tooltipContent && (
              <>
                7-Day Average Positivity Rate:
                {Math.round(tooltipContent?.testing_wk_pos * 10000) /
                  100 || 0}
                %<br />
              </>
            )}
            {"testing_tcap" in tooltipContent && (
              <>
                7-Day Average Tests Performed:
                {tooltipContent.testing_tcap?.toLocaleString("en") || 0}{" "}
                per 100k
                <br />
              </>
            )}
          </>
        )}
      </HoverDiv>
    </ErrorBoundary>
  );
}
