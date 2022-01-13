import React from 'react';
import { useSelector } from 'react-redux';
import {ErrorBoundary} from 'react-error-boundary'
import { HoverDiv } from '../styled_components';
import useGetTooltipContent from '../hooks/useGetTooltipContent';
// This component handles and formats the map tooltip info.
// The props passed to this component should contain an object of the hovered object (from deck, info.object by default)


export default function MapTooltipContent() {
  // destructure the object for cleaner formatting
  const {x,y,data,geoid} = useSelector((state) => state.tooltipInfo)||{};
  const tooltipContent = useGetTooltipContent({data,geoid});
  if (!tooltipContent || !Object.keys(tooltipContent).length) return <></>;
  if (data) {
    return (
      <ErrorBoundary>
        <HoverDiv
          style={{
            position: 'absolute',
            zIndex: 1,
            pointerEvents: 'none',
            left: x,
            top: y,
          }}
        >
          {'Hospital Type' in data && 
            <>
              <h3>{data['Name']}</h3>
              <hr />
              {data['Hospital Type']}
              <br />
              {data.Address} <br />
              {data.Address_2 &&
                `${data.Address_2}${(<br />)}`}
              {data.City}, {data.State}
              <br />
              {data.Zipcode}
              <br />
            </>
          }
          {'testing_status' in data && <>
              <h3>{data.name}</h3>
              <hr />
              {data.address}
              <br />
              {data.city},{data.st_abbr} <br />
              {data.phone}
              <br />
              <br />
              {data.testing_status === 'Yes'
                ? 'This location offers COVID-19 testing.'
                : 'Currently, this location does not offer COVID-19 testing.'}
              <br />
            </>
            }
          {'type' in data && <>
              <h3>{data.name}</h3>
              {data.type === 0 && (
                <>
                  <b>Invited</b> vaccination clinic
                </>
              )}
              {data.type === 1 && (
                <>Participating vaccination clinic</>
              )}
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
            </>}
          {'custom' in data && Object.entries(data.custom).map((entry) => (
            <>
              <b>{entry[0]}:</b>{' '}
              {typeof entry[1] !== 'object' ? entry[1] : JSON.stringify(entry[1])}
              <br />
            </>
          ))}
        </HoverDiv>
      </ErrorBoundary>
    );
  } else {

    return (
      <ErrorBoundary>
        <HoverDiv
          style={{
            position: 'absolute',
            zIndex: 1,
            pointerEvents: 'none',
            left: x,
            top: y,
          }}
        >
          {/* {tooltipContent.name !== undefined && (
            <>
              <h3>{tooltipContent.name}</h3>
              <hr />
            </>
          )} */}
          {Object.entries(tooltipContent).map((entry) => 
            <p><b>{entry[0]}:</b> {entry[1]}</p>
          )}
        </HoverDiv>
      </ErrorBoundary>
    );
  }
}
