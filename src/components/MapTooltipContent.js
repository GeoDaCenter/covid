import React from 'react';
import { useSelector } from 'react-redux';
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
      <HoverDiv
        style={{
          position: 'absolute',
          zIndex: 1,
          pointerEvents: 'none',
          left: x,
          top: y,
        }}
      >
        {Object.entries(data.custom).map((entry) => (
          <>
            <b>{entry[0]}:</b>{' '}
            {typeof entry[1] !== 'object' ? entry[1] : JSON.stringify(entry[1])}
            <br />
          </>
        ))}
      </HoverDiv>
    );
  }

  return (
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

      {tooltipContent['Hospital Type'] && (
        <>
          <h3>{tooltipContent['Name']}</h3>
          <hr />
          {tooltipContent['Hospital Type']}
          <br />
          {tooltipContent.Address} <br />
          {tooltipContent.Address_2 &&
            `${tooltipContent.Address_2}${(<br />)}`}
          {tooltipContent.City}, {tooltipContent.State}
          <br />
          {tooltipContent.Zipcode}
          <br />
        </>
      )}
      {tooltipContent.testing_status && (
        <>
          <h3>{tooltipContent.name}</h3>
          <hr />
          {tooltipContent.address}
          <br />
          {tooltipContent.city},{tooltipContent.st_abbr} <br />
          {tooltipContent.phone}
          <br />
          <br />
          {tooltipContent.data.testing_status === 'Yes'
            ? 'This location offers COVID-19 testing.'
            : 'Currently, this location does not offer COVID-19 testing.'}
          <br />
        </>
      )}
      {'volume' in tooltipContent && (
        <>
          <h3>{tooltipContent.name}</h3>
          {tooltipContent.type === 0 && (
            <>
              <b>Invited</b> vaccination clinic
            </>
          )}
          {tooltipContent.type === 1 && (
            <>Participating vaccination clinic</>
          )}
          {tooltipContent.type === 3 && <>Large scale vaccination site</>}
          <hr />
          {tooltipContent.address}
          <br />
          {tooltipContent.phone && (
            <>
              <br />
              {tooltipContent.phone}
              <br />
            </>
          )}
          {tooltipContent.volumne && (
            <>
              <br />
              <br />
              Expected Vaccination Volume: {tooltipContent.volume}/day
              <br />
              <br />
            </>
          )}
          {tooltipContent.description && (
            <>
              <br />
              {tooltipContent.description}
              <br />
              <br />
            </>
          )}
        </>
      )}
    </HoverDiv>
  );
}
