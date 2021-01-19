import React from 'react';

const highlightFeature = ( selector, backup=false ) => {
    try {
        if (backup && ((document.querySelector(selector).getBoundingClientRect().x < 0) || (document.querySelector('#variablePanel').getBoundingClientRect().x > window.innerWidth))) selector = backup 
        if (selector === null) return;
        document.querySelector(selector).classList.add('highlighted')
    } catch { return }
}

const unhighlightFeature = ( selector, backup=false ) => {
    try {
        if (backup && ((document.querySelector(selector).getBoundingClientRect().x < 0) || (document.querySelector('#variablePanel').getBoundingClientRect().x > window.innerWidth))) selector = backup 
        if (selector === null) return;
        document.querySelector(selector).classList.remove('highlighted')
    } catch { return }
}

const HoverButton = (props) => {
    let {selector, backup } = props

    return (
        <button 
            className="hoverButton"
            onMouseEnter={() => highlightFeature(selector, backup)}
            onMouseLeave={() => unhighlightFeature(selector, backup)}
        >
            {props.text}
        </button>
    )
}

export const pages = {
    "welcome": {
        "pageName": "Welcome",
        "icon": "logo",
        "content": 
            <div>
                <h1>Welcome to the US Covid Atlas v2</h1>
                <h3>1/12 Notes</h3>
                <p>
                    Welcome to the refactored US Covid Atlas. We have greatly expanded the functionality, usability, and 
                    portability of the Atlas by refactoring the project into the frontend framework, React.
                </p>
                <p>
                    While we've worked to maintain the general structure of the Atlas, we've introduced a few new features and
                    interface elements we hope will make the Atlas more robust and usable for more people.
                </p>
                <p>
                    This wiki serves as a useful reference guide for tutorials, features, and data description. We recommend exploring the 
                    rest of the US Covid Atlas website for more in depth documentation on methods, data sources, and FAQs.
                </p>
            </div>
    },
    "getting-started": {
        "pageName": "Getting Started",
        "icon": "info",
        "content": 
            <div>
                <h1>Getting Started with the Atlas</h1>
                <p>
                    In a quickly changing pandemic landscape, our tool connects COVID case data and community indicators across 
                    the United States from its beginning to today. The Atlas helps you access current, validated county-level data 
                    and spatial analysis to better understand the spread in communities and to bolster planning efforts.
                </p>
                <p>
                    Features and use cases for the Atlas include identifying regional hotspots for mitigation, tracking patterns to plan ahead,
                    interacting and forecasting the viral spread at both state and county levels, and making vulnerable communities visible. Read more on 
                    potential use cases on our <a href="./">landing page</a>.
                </p>
                <hr />
                <h3>Tutorials</h3>
                <p>
                    Below are tutorials to help you get started using the Atlas. Each has <HoverButton selector={null} text="Highlighted Text" id="exText" /> that will 
                    highlight the related interface component to help you get started.
                </p>
            </div>
    },
    "new-features": {
        "pageName": "New Features",
        "icon": "info",
        "content": 
            <div>
                <h3>Changelog 1/12</h3>
                <p>Refactor Update</p>
                <ul>
                    <li>The US Covid Atlas has been refactored into the React javascript framework with Redux used for state management</li>
                    <li>Major features updates:
                        <ul>
                            <li>Improved temporal controls including custom date range and date selection</li>
                            <li>Multiple geography selection and aggregation tools</li>
                            <li>3D visualization mode</li>
                            <li>Floating information panels for information and tutorials and line chart</li>
                            <li>Improved performance and user interface</li>
                            <li>Improved responsive design on phone and tablet</li>
                        </ul>
                    </li>
                    <li>New data sources:
                        <ul>
                            <li>New York Times county and state data sources are now available</li>
                            <li>CDC county level data is now available, aggregated 7-Day rolling averages</li>
                            <li>CDC state level vaccination data is now available</li>
                        </ul>
                    </li>
                    <li>New variables:
                        <ul>
                            <li>County level CDC data now includes testing volume and positivity rates</li>
                            <li>Vaccination data at the state level includes distribution and administration numbers</li>
                            <li>Time scale (cumulative, daily new, 7 day average) are now selected in the timeline panel</li>
                        </ul>
                    </li>
                </ul>
            </div>
    },
    // "tutorials":{
    //     "pageName":"Tutorials"
    // },
    "choropleth-tutorial": {
        "pageName":null,
        "content": 
            <div>
                <h1>Choropleth Maps</h1>
                <p>
                    Choropleth maps use color to show the count or percentage of a variable.
                </p>
                <p> 
                    The Atlas uses color to show the count and percentage of all coronavirus cases, daily new cases, deaths, and hospital beds. 
                    Use choropleth maps to see data about the virus on a particular day.
                </p>
                <p>
                    For more details on how the Atlas created the choropleth maps, please see the <a href="./methods.html">Methods page</a>.
                </p>
                <hr/>
                <ol className="tutorialSteps">
                    <li>
                        <p>
                            The choropleth map is the default display for the atlas webpage. To change data settings, 
                            use the <HoverButton selector="#variablePanel" backup="#showHideLeft" text="Variables Panel" />
                        </p>
                    </li>
                    <li>
                        <p>
                            Select the <HoverButton selector="#dataSource" backup="#showHideLeft" text="Data Source"/> and <HoverButton selector="#variableSelect" backup="#showHideLeft" text="Variable"/> you would like to map.
                        </p>
                    </li>
                    <li>
                        <p>
                            Click on "Natural Breaks" in the <HoverButton selector="#mapType" backup="#showHideLeft" text="Map Type"/> button group, if not already selected.
                        </p>
                    </li>
                    <li>
                        <p>
                            Use the <HoverButton selector="#bottomPanel" text="Color Ramp"/> at the bottom of the screen to interpret the count or percentage for each county or state.
                            Brighter reds represent larger counts and percentages. Paler yellows represent smaller counts and percentages.
                        </p>
                    </li>
                </ol>
            </div>
    },
    "interface":{
        "pageName": "Interface",
        "icon": "info",
        "content": 
        <div>
            <h1>Interface Overview</h1>
            <p>
                The interface for navigating and controlling the map contains 4 main panels and the map itself. This page will briefly describe the functions of each panel and where to find them. <HoverButton selector={null} text="Highlighted Text" id="exText" /> will 
                highlight the relevant interface feature to help easily identify it.
            </p>
            <h3>Data Sources &amp; Map Variables</h3>
            <p>
                The <HoverButton selector="#variablePanel" backup="#showHideLeft" text="Data Sources and Map Variables Panel" /> contains
                the controls to change data sources, the variable being visualized, how it is visualized, and any informational overlays.
            </p>
            <p>
                The <HoverButton selector="#dataSource" backup="#showHideLeft" text="Data Source"/> selection contains the county and state 
                level datasets currently available in the Atlas. Different datasets are available at the state and county level, and contain
                different variables depending on the published data. Explore different datasets or read more in the data sources tab below.
            </p>
            <p>
                The <HoverButton selector="#variableSelect" backup="#showHideLeft" text="Variable"/> selection contains the available variables
                for your selected dataset, including data like cases, deaths, testing rates, forecasting, and community health factors.
            </p>
            <p>
                The <HoverButton selector="#mapType" backup="#showHideLeft" text="Map Type"/> buttons change how the map is colored and how the data is symbolized.
                Natural breaks (jenks) uses a non-linear algorithm to classify (bin) data into groups, box map uses the same concept as a box plot chart, and hotspots 
                identify clusters of high and low rates based on LISA methods. Read more on the <a href="./methods.html" target="_blank" rel="noopener noreferrer">methods</a> page.
            </p>
            <p>
                The <HoverButton selector="#visualizationType" backup="#showHideLeft" text="Visualization Type"/> buttons change the visual representation of the map. The 2D map is 
                a traditional, flat map, the 3D map scales the vertical height of geographies to reflect the selected variable, and the cartogram map scales the geographies as circles 
                based on the variable values.
            </p>
            <p>
                The <HoverButton selector="#overlaysResources" backup="#showHideLeft" text="Overlays and Resources"/> selection boxes contain useful contextual information, and highlight 
                potentially vulnerable areas.
            </p>
            <h3>Timeline</h3>
            <p>
                The <HoverButton selector="#timelinePanel" text="Timeline Panel" /> contains all of the temporal controls for the Atlas. Here, you can select a date, change the timescale (daily, weekly, etc.)
                and change how the data is binned - relative to the selected date or relative to the most recent date.
            </p>
            <p>
                The <HoverButton selector="#timeSlider" text="Slider" /> can change the date selection for your selected variable. 
                The <HoverButton selector="#dateSelector" text="Timescale" /> dropdown can change the aggregation over time between daily, weekly, cumulative, or custom date ranges. 
                The <HoverButton selector="#binModeSwitch" text="Binning Switch" /> can change between fixed bins relative to the today and bins relative to the selected date. 
                You can animate the map by clicking the <HoverButton selector="#playPause" text="Play/Pause Button" />.
            </p>

            
        </div>
    },
    "datasets": {
        "pageName": "Data Sources",
        "icon": "info",
        "content":
            <div>
                <h1 id="data-sources">Data Sources</h1>
                <p><i>Read detailed information <a href="https://theuscovidatlas.org/data.html">here</a></i></p>
                <h2 id="covid-data">COVID Data</h2>
                <h3 id="-usa-facts-https-usafacts-org-visualizations-coronavirus-covid-19-spread-map-"><a href="https://usafacts.org/visualizations/coronavirus-covid-19-spread-map">USA Facts</a></h3>
                <p>Available at the county level this data aggregates from CDC, state- and local-level public health agencies. </p>
                <h3 id="-1p3a-https-coronavirus-1point3acres-com-en-"><a href="https://coronavirus.1point3acres.com/en">1P3A</a></h3>
                <p>Available at the state and county level, 1P3A was the initial, crowdsourced data project that served as a volunteer project led by 1P3acres.com and Dr. Yu Gao, Head of Machine Learning Platform at Uber. </p>
                <h3 id="-new-york-times-https-github-com-nytimes-covid-19-data-"><a href="https://github.com/nytimes/covid-19-data">New York Times</a></h3>
                <p>The New York Times has made data available aggregated from dozens of journalists working to collect and monitor data from new conferences. They communicate with public officials to clarify and categorize cases. </p>
                <h3 id="-cdc-https-covid-cdc-gov-covid-data-tracker-"><a href="https://covid.cdc.gov/covid-data-tracker/">CDC</a></h3>
                <p>CDC data includes detailed historic testing data and case data aggregated to rolling 7-day averages.</p>
                <h3 id="-forecasting-statistics-https-github-com-yu-group-covid19-severity-prediction-"><a href="https://github.com/Yu-Group/covid19-severity-prediction">Forecasting Statistics</a></h3>
                <p>The Yu Group at UC Berkeley Statistics and EECS has compiled, cleaned and continues to update a large corpus of hospital- and county-level data from a variety of public sources to aid data science efforts to combat COVID-19 (see covidseverity.com).</p>
                <h2 id="county-and-state-data">County and State Data</h2>
                <h3 id="-covidcaremap-https-github-com-covidcaremap-covid19-healthsystemcapacity-tree-v0-2-data-"><a href="https://github.com/covidcaremap/covid19-healthsystemcapacity/tree/v0.2/data">COVIDCareMap</a></h3>
                <p>Healthcare System Capacity includes Staffed beds, Staffed ICU beds, Licensed Beds by County. The data is from 2018 facility reports with additions/edits allowed in real-time.</p>
                <h3 id="-american-community-survey-https-www-census-gov-programs-surveys-acs-"><a href="https://www.census.gov/programs-surveys/acs">American Community Survey</a></h3>
                <p>The American Community Survey data contains demographic information about states, counties, and other geographic units. We use ACS population counts to generate normalized rates for COVID cases and deaths.</p>
                <h3 id="-county-health-rankings-roadmaps-chr-r-https-www-countyhealthrankings-org-explore-health-rankings-rankings-data-documentation-"><a href="https://www.countyhealthrankings.org/explore-health-rankings/rankings-data-documentation">County Health Rankings &amp; Roadmaps (CHR&amp;R)</a></h3>
                <p>CHR&amp;R includes socioeconomic data, health access and care metrics, and demographic information about counties and states. CHR&amp;R is a collaboration between the Robert Wood Johnson Foundation and the University of Wisconsin Population Health Institute.</p>
            </div>
    },
    "variables":{
        "pageName": "Variables",
        "icon": "info",
        "content": 
            <div>
                <h1>Variables</h1>
                <h3>Cases</h3>
                <i>Times-series data</i>
                <ul>
                    <li>Confirmed Count: Number of cases reported in selected time scale</li>
                    <li>Confirmed Count per 100K Population: Number of cases normalized to population and scaled to number of cases per 100,000 residents of the county or state</li>
                    <li>Confirmed Count per Licensed Bed: Number of cases normalized to the available beds in the county or state</li>
                </ul>

                <h3>Deaths</h3>
                <i>Times-series data</i>
                <ul>
                    <li>Death Count: Number of deaths reported in selected time scale</li>
                    <li>Death Count per 100K Population: Number of deaths normalized to population and scaled to number of deaths per 100,000 residents of the county or state</li>
                    <li>Death Count per Licensed Bed: Number of deaths normalized to the available beds in the county or state</li>
                </ul>

                <h3> Testing</h3>
                <i>Times-series data</i>
                <ul>
                    <li>7 Day Testing Positivity Rate %: The percentage of COVID tests returning positive results, aggregated to a 7-day rolling average</li>
                    <li>7 Day Testing Capacity: The number of COVID tests administered in the county or state normalized to tests per 100,000 population</li>
                    <li>7 Day Confirmed Cases per Testing %: The number of positive COVID cases per number of COVID tests as a percentage</li>
                </ul>

                <h3>Vaccination</h3>
                <i>Times-series data</i>
                <ul>
                    <li>Vaccinations Administered per 100K Population: The number of vaccination doses that have been administered in the state, normalized to number of doses administered per 100K population.</li>
                    <li>Vaccinations Distributed per 100K Population: The total number of vaccination doses that have been distributed in the state, normalized to number of doses distributed per 100K population. </li>
                </ul>
                
                <h3>Forecasting</h3>
                <i>Current snapshot data</i>
                <ul>
                    <li>Severity Index: Data and models (updated daily) for forecasting COVID-19 severity for individual counties and hospitals in the US</li>
                </ul>

                <h3>Community Health</h3>
                <i>Characteristic data</i>
                <ul>
                    <li>Uninsured % (Community Health Factor): Percentage of the county or state that does not have health insurance</li>
                    <li>Over 65 Years % (Community Health Context): Percentage of the county or state this is over 65 years of age</li>
                    <li>Life expectancy (Length and Quality of Life): Average life expectancy for individuals living in the state or county</li>
                </ul>
            </div>
    },
    "bug-report":{
        "pageName": "Bug Report",
        "icon": "info",
        "content": 
        <div>
            <h1>Found a bug or have a suggestion?</h1>
            
            <p>
                The US Covid Atlas team is always working to improve the platform and its ability to generate insights.
            </p>
            <p>
                Please contact the team at <a href="mailto:contact@theuscovidatlas.org">contact@theuscovidatlas.org</a> or reach out on social media below.
            </p>
            <div className="social-container">
                <a href="https://twitter.com/covid_atlas" target="_blank" rel="noopener noreferrer">
                    <img src="./icons/twitter-icon.png" alt="Twitter Icon" />
                </a>
                <a href="https://github.com/GeoDaCenter/covid" target="_blank" rel="noopener noreferrer">
                    <img src="./icons/github-icon.png" alt="Twitter Icon" />
                </a>
            </div>
        </div>
    }
}