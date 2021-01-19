import React from 'react';


// This component handles and formats the map tooltip info. 
// The props passed to this component should contain an object of the hovered object (from deck, info.object by default)
const MapTooltipContent = (props) => {
    // destructure the object for cleaner formatting

    const { properties, cases, deaths, // county data
            testing_ccpt, testing_tcap, testing_wk_pos, testing // state data
     } = props.content;

    // get lengths of time series data for reference below
    let caseN = cases && props.index;
    let deathN = deaths && props.index;
    let testingN = testing && props.index;

    // conditional returns for combination of information
    // this is not elegant but a bit more reliable than JSX conditional rendering
    if (properties && cases && deaths && testing) { // State Feature
        return (
            <div>
                <h3>
                    {properties.NAME}
                </h3>
                <div>
                    <hr />
                    Cases: {cases[caseN]?.toLocaleString('en')}<br/>
                    New Cases: {(cases[caseN]-cases[caseN-1])?.toLocaleString('en')}<br/>
                    Deaths: {deaths[deathN]?.toLocaleString('en')}<br/>
                    New Deaths: {(deaths[deathN]-deaths[deathN-1])?.toLocaleString('en')}<br/>
                    Total Testing: {(testing[testingN])?.toLocaleString('en')}<br/>
                    7-Day Positivity Rate: {(testing_wk_pos[testingN]*100)?.toFixed(2)}%<br/>
                    7-Day Testing Capacity: {(testing_tcap[testingN])?.toFixed(2)}<br/>
                    7-Day Confirmed Cases per Testing: {(testing_ccpt[testingN]*100)?.toFixed(2)}%<br/>
                    Testing Criterion: {properties.criteria}<br/>
                </div>
            </div>
        )
    } else if (properties && cases && deaths){ // County Feature
        return (
            <div>
                <h3>
                    {properties.NAME} {properties.state_name && `, ${properties.state_name}`}
                </h3>
                <div>
                    <hr />
                    Cases: {cases[caseN]?.toLocaleString('en')}<br/>
                    Deaths: {deaths[deathN]?.toLocaleString('en')}<br/>
                    New Cases: {(cases[caseN]-cases[caseN-1])?.toLocaleString('en')}<br/>
                    New Deaths: {(deaths[deathN]-deaths[deathN-1])?.toLocaleString('en')}<br/>
                </div>
            </div>
        )
    } else if (props.content['Hospital Type']) { // Hospital Feature
        return (
            <div>
                <h3>{props.content['Name']}</h3>
                <div>
                    <hr />
                    {props.content['Hospital Type']}<br/>
                    {props.content.Address} <br />
                    {props.content.Address_2 && `${props.content.Address_2}${<br/>}`}
                    {props.content.City}, {props.content.State}<br/>
                    {props.content.Zipcode}<br/>
                </div>
            </div>
        )
    } else if (props.content.testing_status) { // clinic feature
        return (
            <div>
                <h3>{props.content.name}</h3>
                <div>
                    <hr />
                    {props.content.address}<br/>
                    {props.content.city},{props.content.st_abbr} <br />
                    {props.content.phone}<br/><br/>
                    {props.content.testing_status === 'Yes' ? 'This location offers COVID-19 testing.' : 'Currently, this location does not offer COVID-19 testing.'}<br/>
                </div>
            </div>
        )
    
    } else {
        return (
            <div></div>
        )
    }
}

export default MapTooltipContent