import React from 'react';
import { useSelector } from 'react-redux';
import { HoverDiv } from '../styled_components';
// This component handles and formats the map tooltip info. 
// The props passed to this component should contain an object of the hovered object (from deck, info.object by default)
export default function MapTooltipContent(){
    // destructure the object for cleaner formatting
    const tooltipContent = useSelector(state => state.tooltipContent);
    const nIndex = useSelector(state => state.dataParams.nIndex);
    
    if (!tooltipContent.data) return <></>;

    const { properties, cases, deaths, // county data
        testing_tcap, testing_wk_pos, testing, vaccines_one_dose, vaccines_fully_vaccinated, vaccines_dist // state data
    } = tooltipContent.data;
    
    return <HoverDiv style={{position: 'absolute', zIndex: 1, pointerEvents: 'none', left: tooltipContent.x, top: tooltipContent.y}}>
        {properties && <>
            <h3>{properties.NAME}{properties.state_name !== undefined && `, ${properties.state_name}`}</h3>
            <hr />
        </>}
        {vaccines_fully_vaccinated && <>
            Fully Vaccinated: {Math.round((vaccines_fully_vaccinated[nIndex]/properties.population)*1000)/10}%<br/>
        </>}
        {vaccines_one_dose && <>
            At Least One Dose: {Math.round((vaccines_one_dose[nIndex]/properties.population)*1000)/10}%<br/>
            Doses to be Administered per 100 People: {(Math.round((vaccines_dist[nIndex]/properties.population)*1000)/10)?.toLocaleString()}<br/>
        </>}
        {(cases && deaths) && <>
            <br/>
            Cases: {cases[nIndex]?.toLocaleString('en')||0}<br/>
            Deaths: {deaths[nIndex]?.toLocaleString('en')||0}<br/>
            <br/>
            Daily New Cases: {(cases[nIndex]-cases[nIndex-1])?.toLocaleString('en')||0}<br/>
            Daily New Deaths: {(deaths[nIndex]-deaths[nIndex-1])?.toLocaleString('en')||0}<br/>
            <br/>
        </>}
        {testing && <>
            Total Testing: {testing[nIndex].toLocaleString('en')}<br/>
            7-Day Positivity Rate: {(testing_wk_pos[nIndex]*100)?.toFixed(2)}%<br/>
            7-Day Testing Capacity per 100K: {(testing_tcap[nIndex])?.toFixed(2)}<br/>
            <br/>
        </>}
        {tooltipContent.data['Hospital Type'] && <>
            <h3>{tooltipContent.data['Name']}</h3>
            <hr />
            {tooltipContent.data['Hospital Type']}<br/>
            {tooltipContent.data.Address} <br />
            {tooltipContent.data.Address_2 && `${tooltipContent.data.Address_2}${<br/>}`}
            {tooltipContent.data.City}, {tooltipContent.data.State}<br/>
            {tooltipContent.data.Zipcode}<br/>
        </>}
        {tooltipContent.data.testing_status && <>
            <h3>{tooltipContent.data.name}</h3>
            <hr />
            {tooltipContent.data.address}<br/>
            {tooltipContent.data.city},{tooltipContent.data.st_abbr} <br />
            {tooltipContent.data.phone}<br/><br/>
            {tooltipContent.data.testing_status === 'Yes' ? 'This location offers COVID-19 testing.' : 'Currently, this location does not offer COVID-19 testing.'}<br/>
        </>}
        {'volume' in tooltipContent.data && <>
            <h3>{tooltipContent.data.name}</h3>
            {tooltipContent.data.type === 0 && <><b>Invited</b> vaccination clinic</>}
            {tooltipContent.data.type === 1 && <>Participating vaccination clinic</>}
            {tooltipContent.data.type === 3 && <>Large scale vaccination site</>}
            <hr />
            {tooltipContent.data.address}<br/>
            {tooltipContent.data.phone && <><br/>{tooltipContent.data.phone}<br/></>}
            {tooltipContent.data.volumne && <><br/><br/>Expected Vaccination Volume: {tooltipContent.data.volume}/day<br/><br/></>}
            {tooltipContent.data.description && <><br/>{tooltipContent.data.description}<br/><br/></>}
        </>}
        </HoverDiv>
}
//     } else if (properties){ // County Feature PR NYT
//         return (
//             <div>
//                 <h3>
//                     {`${properties.NAME}${properties.state_name && `, ${properties.state_name}`}`}
//                 </h3>
//             </div>
//         )
//     } else {
//         return (
//             <div></div>
//         )
//     }
// }

// export default MapTooltipContent