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
            <h3>{properties.NAME}</h3>
            <hr />
        </>}
        {(cases && deaths) && <>
            Cases: {cases[nIndex]?.toLocaleString('en')||0}<br/>
            Deaths: {deaths[nIndex]?.toLocaleString('en')||0}<br/>
            <br/>
            Daily New Cases: {(cases[nIndex]-cases[nIndex-1])?.toLocaleString('en')||0}<br/>
            Daily New Deaths: {(deaths[nIndex]-deaths[nIndex-1])?.toLocaleString('en')||0}<br/>
            <br/>
        </>}
        </HoverDiv>
}

//     // get lengths of time series data for reference below
//     let caseN = cases && props.index;
//     let deathN = deaths && props.index;
//     let testingN = testing && props.index;
//     // conditional returns for combination of information
//     // this is not elegant but a bit more reliable than JSX conditional rendering
//     if (properties && cases && deaths && testing && vaccines_one_dose) { // State Feature
//         return (
//             <div>
//                 <h3>
//                     {properties.NAME}
//                 </h3>
//                 <div>

//                     Total Testing: {testing[testingN].toLocaleString('en')}<br/>
//                     7-Day Positivity Rate: {(testing_wk_pos[testingN]*100)?.toFixed(2)}%<br/>
//                     7-Day Testing Capacity per 100K: {(testing_tcap[testingN])?.toFixed(2)}<br/>
//                     <br/>
//                     At Least One Dose: {Math.round((vaccines_one_dose[testingN]/properties.population)*1000)/10}%<br/>
//                     Fully Vaccinated: {Math.round((vaccines_fully_vaccinated[testingN]/properties.population)*1000)/10}%<br/>
//                     Doses to be Administered per 100 People: {(Math.round((vaccines_dist[testingN]/properties.population)*1000)/10)?.toLocaleString()}<br/>
//                 </div>
//             </div>
//         )
//     } else if (properties && cases && deaths && testing) { // State Feature
//         return (
//             <div>
//                 <h3>
//                     {properties.NAME}
//                 </h3>
//                 <div>
//                     <hr />
//                     Cases: {cases[caseN]?.toLocaleString('en')}<br/>
//                     Deaths: {deaths[deathN]?.toLocaleString('en')}<br/>
//                     <br/>
//                     Daily New Cases: {(cases[caseN]-cases[caseN-1])?.toLocaleString('en')}<br/>
//                     Daily New Deaths: {(deaths[deathN]-deaths[deathN-1])?.toLocaleString('en')}<br/>
//                     <br/>
//                     Total Testing: {(testing[testingN])?.toLocaleString('en')}<br/>
//                     7-Day Positivity Rate: {(testing_wk_pos[testingN]*100)?.toFixed(2)}%<br/>
//                     7-Day Testing Capacity per 100K: {(testing_tcap[testingN])?.toFixed(2)}<br/>
//                 </div>
//             </div>
//         )
//     } else if (properties && cases && deaths){ // County Feature
//         return (
//             <div>
//                 <h3>
//                     {`${properties.NAME}${properties.state_name && `, ${properties.state_name}`}`}
//                 </h3>
//                 <div>
//                     <hr />
//                     Cases: {cases[caseN]===null ? 0 : cases[caseN]?.toLocaleString('en')}<br/>
//                     Deaths: {deaths[deathN]===null ? 0 : deaths[deathN]?.toLocaleString('en')||0}<br/>
//                     <br/>
//                     Daily New Cases: {cases[caseN]===null ? 0 : (cases[caseN]-cases[caseN-1])?.toLocaleString('en')}<br/>
//                     Daily New Deaths: {deaths[deathN]===null ? 0 : (deaths[deathN]-deaths[deathN-1])?.toLocaleString('en')}<br/>
//                 </div>
//             </div>
//         )
//     } else if (properties && cases){ // County Feature PR NYT
//         return (
//             <div>
//                 <h3>
//                     {`${properties.NAME}${properties.state_name && `, ${properties.state_name}`}`}
//                 </h3>
//                 <div>
//                     <hr />
//                     Cases: {cases[caseN]===null ? 0 : cases[caseN]?.toLocaleString('en')}<br/>
//                     <br/>
//                     Daily New Cases: {cases[caseN]===null ? 0 : (cases[caseN]-cases[caseN-1])?.toLocaleString('en')}<br/>
//                 </div>
//             </div>
//         )
//     } else if (props.content['Hospital Type']) { // Hospital Feature
//         return (
//             <div>
//                 <h3>{props.content['Name']}</h3>
//                 <div>
//                     <hr />
//                     {props.content['Hospital Type']}<br/>
//                     {props.content.Address} <br />
//                     {props.content.Address_2 && `${props.content.Address_2}${<br/>}`}
//                     {props.content.City}, {props.content.State}<br/>
//                     {props.content.Zipcode}<br/>
//                 </div>
//             </div>
//         )
//     } else if (props.content.testing_status) { // clinic feature
//         return (
//             <div>
//                 <h3>{props.content.name}</h3>
//                 <div>
//                     <hr />
//                     {props.content.address}<br/>
//                     {props.content.city},{props.content.st_abbr} <br />
//                     {props.content.phone}<br/><br/>
//                     {props.content.testing_status === 'Yes' ? 'This location offers COVID-19 testing.' : 'Currently, this location does not offer COVID-19 testing.'}<br/>
//                 </div>
//             </div>
//         )
    
//     } else if (props.content.hasOwnProperty('volume')) { // vaccination feature
//         return (
//             <div>
//                 <h3>{props.content.name}</h3>
//                 <div>
//                     {props.content.type === 0 && <><b>Invited</b> vaccination clinic</>}
//                     {props.content.type === 1 && <>Participating vaccination clinic</>}
//                     {props.content.type === 3 && <>Large scale vaccination site</>}
//                     <hr />
//                     {props.content.address}<br/>
//                     {props.content.phone && <><br/>{props.content.phone}<br/></>}
//                     {props.content.volumne && <><br/><br/>Expected Vaccination Volume: {props.content.volume}/day<br/><br/></>}
//                     {props.content.description && <><br/>{props.content.description}<br/><br/></>}
//                 </div>
//             </div>
//         )
    
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