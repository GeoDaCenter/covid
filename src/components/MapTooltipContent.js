import React from 'react';
import { useSelector } from 'react-redux';
import { HoverDiv } from '../styled_components';
import { formatNumber } from '../utils';
// This component handles and formats the map tooltip info. 
// The props passed to this component should contain an object of the hovered object (from deck, info.object by default)
export default function MapTooltipContent(){
    // destructure the object for cleaner formatting
    const tooltipContent = useSelector(state => state.tooltipContent);
    if (!tooltipContent.data && !tooltipContent.custom) return <></>;
    
    if (tooltipContent.data.custom) {
        return <HoverDiv style={{position: 'absolute', zIndex: 1, pointerEvents: 'none', left: tooltipContent.x, top: tooltipContent.y}}>
            {Object.entries(tooltipContent.data.custom).map(entry => <><b>{entry[0]}:</b> {typeof entry[1] !== 'object' ? formatNumber(entry[1]) : JSON.stringify(entry[1])}<br/></>)}
        </HoverDiv>
    }
    
    return <HoverDiv style={{position: 'absolute', zIndex: 1, pointerEvents: 'none', left: tooltipContent.x, top: tooltipContent.y}}>
        {tooltipContent.data.name !== undefined && <>
            <h3>{tooltipContent.data.name}</h3>
            <hr/>
        </>}
        {tooltipContent.data.vaccines_fully_vaccinated !== undefined && <>
            Fully Vaccinated: {Math.round((tooltipContent.data.vaccines_fully_vaccinated/tooltipContent.data.population)*1000)/10}%<br/>
        </>}
        {tooltipContent.data.vaccines_one_dose !== undefined && <>
            At least one dose: {Math.round((tooltipContent.data.vaccines_one_dose/tooltipContent.data.population)*1000)/10}%<br/><br/>
        </>}
        {/* {tooltipContent.data.hasOwnProperty(vaccines_one_dose) && <>
            At Least One Dose: {Math.round((vaccines_one_dose[nIndex]/properties.population)*1000)/10}%<br/>
            Doses to be Administered per 100 People: {(Math.round((vaccines_dist[nIndex]/properties.population)*1000)/10)?.toLocaleString()}<br/>
        </>} */}
        {tooltipContent.data.hasOwnProperty('cases') && <>Cases: {tooltipContent.data.cases?.toLocaleString('en')||0}<br/></>}
        {tooltipContent.data.hasOwnProperty('deaths') && <>Deaths: {tooltipContent.data.deaths?.toLocaleString('en')||0}<br/></>}
        {tooltipContent.data.hasOwnProperty('daily_cases') && <>Daily New Cases: {tooltipContent.data.daily_cases?.toLocaleString('en')||0}<br/></>}
        {tooltipContent.data.hasOwnProperty('daily_deaths') && <>Daily New Deaths: {tooltipContent.data.daily_deaths?.toLocaleString('en')||0}<br/></>}
        <br/>
        {tooltipContent.data.hasOwnProperty('testing_wk_pos') && <>7-Day Average Positivity Rate: {Math.round(tooltipContent.data?.testing_wk_pos*10000)/100||0}%<br/></>}
        {tooltipContent.data.hasOwnProperty('testing_tcap') && <>7-Day Average Tests Performed: {tooltipContent.data.testing_tcap?.toLocaleString('en')||0} per 100k<br/></>}
        
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