// mapbox API token
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg';

export const colors = {
    white: '#ffffff',
    black: '#000000',
    darkgray:'#1a1a1a',
    gray:'#2b2b2b',
    buttongray: '#f5f5f5',
    lightgray: '#d8d8d8',
    yellow: '#FFCE00',
    red: '#EC1E24',
    lightblue: '#A1E1E3',
    strongOrange: '#F16622',
    orange:'#F37E44',
    skyblue: '#c1ebeb',
    blue: '#007bff',
    teal: '#00575c',
    // orange: '#f37e43',
    pink: '#e83e8c',
    pairedColors: {
        count: [
            '#1f78b4',
            '#33a02c',
            '#e31a1c',
            '#ff7f00',
            '#6a3d9a',
            '#b15928'
        ],
        sum: [
            '#a6cee3',
            '#b2df8a',
            '#fb9a99',
            '#fdbf6f',
            '#cab2d6',
            '#ffff99'
        ]
    },
    qualtitiveScale: [
        '#8dd3c7',
        '#ffffb3',
        '#bebada',
        '#fb8072',
        '#80b1d3',
        '#fdb462',
        '#b3de69',
        '#fccde5',
        '#d9d9d9',
        '#bc80bd',
        '#ccebc5',
        '#ffed6f',
    ],
    dotDensity: [
        [],
        [68,187,153], // American Indian or Alaska Native
        [238,136,102], // Asian
        [119,170,221], // Black or African American
        [187,204,51], // Hispanic or Latino
        [187,187,187], // Native Hawaiian or Other Pac. Islander
        [153,221,255], // Other
        [255,255,255], // Two or more
        [255,170,187], // White
    ]
}

export const defaultData = 'county_nyt.geojson';
export const defaultTables = {
    'County': {
        // 'predictions':{
        //     'file':'berkeley_predictions',
        //     'type':'characteristic',
        //     'join':'fips'
        // },
        'cases': {
            'file':'covid_confirmed_usafacts.pbf',
            'dates':'isoDateList',
            'type':'time-series-cumulative'
        },
        'deaths': {
            'file':'covid_deaths_usafacts.pbf',
            'dates':'isoDateList',
            'type':'time-series-cumulative' 
        },
        'chr_health_context':{
            'file':'chr_health_context',
            'type':'characteristic',
            'join':'FIPS'
        },
        'chr_life':{
            'file':'chr_life',
            'type':'characteristic',
            'join':'FIPS'
        },
        'chr_health_factors':{
            'file':'chr_health_factors',
            'type':'characteristic',
            'join':'FIPS'
        },
        'pct_home':{
            'file':'mobility_home_workdays_safegraph.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'pct_parttime':{
            'file':'mobility_parttime_workdays_safegraph.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'pct_fulltime':{
            'file':'mobility_fulltime_workdays_safegraph.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'essential_workers':{
            'file':'context_essential_workers_acs',
            'type':'characteristic',
            'join':'fips'
        },
        'vaccines_one_dose':{
            'file':'vaccination_one_or_more_doses_cdc.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'fips'
        },
        'vaccines_fully_vaccinated':{
            'file':'vaccination_fully_vaccinated_cdc.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'fips'
        },
        'testing':{
            'file':'covid_testing_cdc.e-2.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'testing_wk_pos':{
            'file':'covid_wk_pos_cdc.e-4.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'testing_tcap':{
            'file':'covid_tcap_cdc.e-2.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'testing_ccpt':{
            'file':'covid_ccpt_cdc.e-4.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        }
    },
    'County (Hybrid)':{
        'vaccines_one_dose':{
            'file':'vaccination_one_or_more_doses_cdc_h.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'fips'
        },
        'vaccines_fully_vaccinated':{
            'file':'vaccination_fully_vaccinated_cdc_h.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'fips'
        },
        'chr_health_context':{
            'file':'chr_health_context',
            'type':'characteristic',
            'join':'FIPS'
        },
        'chr_life':{
            'file':'chr_life',
            'type':'characteristic',
            'join':'FIPS'
        },
        'chr_health_factors':{
            'file':'chr_health_factors',
            'type':'characteristic',
            'join':'FIPS'
        },
        'pct_home':{
            'file':'mobility_home_workdays_safegraph.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'pct_parttime':{
            'file':'mobility_parttime_workdays_safegraph.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'pct_fulltime':{
            'file':'mobility_fulltime_workdays_safegraph.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'essential_workers':{
            'file':'context_essential_workers_acs',
            'type':'characteristic',
            'join':'fips'
        },
        'testing':{
            'file':'covid_testing_cdc.e-2.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'testing_wk_pos':{
            'file':'covid_wk_pos_cdc.e-4.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'testing_tcap':{
            'file':'covid_tcap_cdc.e-2.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        },
        'testing_ccpt':{
            'file':'covid_ccpt_cdc.e-4.pbf',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'county'
        }
    },
    'State': {
        'cases': {
            'file':'covid_confirmed_usafacts_state',
            'dates':'isoDateList',
            'type':'time-series-cumulative',
            'join':'StateFIPS'
        },
        'deaths': {
            'file':'covid_deaths_usafacts_state',
            'dates':'isoDateList',
            'type':'time-series-cumulative',
            'join':'StateFIPS'
        },
        'chr_health_context':{
            'file':'chr_health_context_state',
            'type':'characteristic',
            'join':'FIPS'
        },
        'chr_life':{
            'file':'chr_life_state',
            'type':'characteristic',
            'join':'FIPS'
        },
        'chr_health_factors':{
            'file':'chr_health_factors_state',
            'type':'characteristic',
            'join':'FIPS'
        },
        'testing':{
            'file':'covid_testing_cdc_state',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'state_fips'
        },
        'testing_wk_pos':{
            'file':'covid_wk_pos_cdc_state',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'state_fips'
        },
        'testing_tcap':{
            'file':'covid_tcap_cdc_state',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'state_fips'
        },
        'testing_ccpt':{
            'file':'covid_ccpt_cdc_state',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'state_fips'
        },
        'vaccines_one_dose':{
            'file':'vaccination_one_or_more_doses_cdc_state',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'GEOID'
        },
        'vaccines_fully_vaccinated':{
            'file':'vaccination_fully_vaccinated_cdc_state',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'GEOID'
        },
        'vaccines_dist':{
            'file':'vaccination_to_be_distributed_cdc_state',
            'dates':'isoDateList',
            'type':'time-series',
            'join':'GEOID'
        },
    }
}

export const dataPresets = {
    'county_usfacts.geojson': {
        plainName: 'USA Facts County', // Plain english name for dataset
        geojson: 'county_usfacts.geojson', // geospatial data to join to
        id: 'GEOID',
        geography: 'County',
        tables: {
            'cases': {
                'file':'covid_confirmed_usafacts.pbf',
                'dates':'isoDateList',
                'type':'time-series-cumulative'
            },
            'deaths': {
                'file':'covid_deaths_usafacts.pbf',
                'dates':'isoDateList',
                'type':'time-series-cumulative'
            }
        }
    },
    'county_1p3a.geojson': {
        plainName: '1Point3Acres County',
        geojson: 'county_1p3a.geojson',
        id: 'GEOID',
        geography: 'County',
        tables: {
            'cases': {
                'file':'covid_confirmed_1p3a.pbf',
                'dates':'isoDateList',
                'type':'time-series-cumulative'
            },
            'deaths': {
                'file':'covid_deaths_1p3a.pbf',
                'dates':'isoDateList',
                'type':'time-series-cumulative'
            }
        }
    },
    'county_nyt.geojson': {
        plainName: 'New York Times County', // Plain english name for dataset
        geojson: 'county_nyt.geojson', // geospatial data to join to
        id: 'GEOID',
        geography: 'County',
        tables: {
            'cases': {
                'file':'covid_confirmed_nyt.pbf',
                'dates':'isoDateList',
                'type':'time-series-cumulative'
            },
            'deaths': {
                'file':'covid_deaths_nyt.pbf',
                'dates':'isoDateList',
                'type':'time-series-cumulative'
            }
        }
    },
    'cdc.geojson': {
        plainName: 'CDC', // Plain english name for dataset
        geojson: 'cdc.geojson', // geospatial data to join to
        id: 'GEOID',
        geography: 'County',
        tables: {}
    },
    'cdc_h.geojson': {
        plainName: 'CDC', // Plain english name for dataset
        geojson: 'cdc_h.geojson', // geospatial data to join to
        id: 'GEOID',
        geography: 'County (Hybrid)',
        tables: {
            'vaccines_fully_vaccinated':{
                'file':'vaccination_fully_vaccinated_cdc_h.pbf',
                'dates':'isoDateList',
                'type':'time-series-cumulative',
                'join':'fips'
            },
            'vaccines_one_dose':{
                'file':'vaccination_one_or_more_doses_cdc_h.pbf',
                'dates':'isoDateList',
                'type':'time-series-cumulative',
                'join':'fips'
            },
            'cases': {
                'file':'covid_confirmed_usafacts_h.pbf',
                'dates':'isoDateList',
                'type':'time-series'
            },
            'deaths': {
                'file':'covid_deaths_usafacts_h.pbf',
                'dates':'isoDateList',
                'type':'time-series'
            }
        }
    },
    'state_1p3a.geojson': {
        plainName: '1Point3Acres State',
        geojson: 'state_1p3a.geojson', 
        id: 'GEOID',
        geography: 'State',
        tables: {
            'cases': {
                'file':'covid_confirmed_1p3a_state',
                'dates':'isoDateList',
                'type':'time-series-cumulative',
                'join':'GEOID'
            },
            'deaths': {
                'file':'covid_deaths_1p3a_state',
                'dates':'isoDateList',
                'type':'time-series-cumulative',
                'join':'GEOID'
            }
        }
    },
    'state_usafacts.geojson': {
        plainName: 'USA Facts State',
        geojson: 'state_usafacts.geojson', 
        id: 'GEOID',
        geography: 'State',
        tables: {
            'cases': {
                'file':'covid_confirmed_usafacts_state',
                'dates':'isoDateList',
                'type':'time-series-cumulative',
                'join':'StateFIPS'
            },
            'deaths': {
                'file':'covid_deaths_usafacts_state',
                'dates':'isoDateList',
                'type':'time-series-cumulative',
                'join':'StateFIPS'
            }
        }
    },
    'state_nyt.geojson': {
        plainName: 'New York Times County', // Plain english name for dataset
        geojson: 'state_nyt.geojson', // geospatial data to join to
        id: 'GEOID',
        geography: 'State',
        tables: {
            'cases': {
                'file':'covid_confirmed_nyt_state',
                'dates':'isoDateList',
                'type':'time-series-cumulative',
                'join':'fips'
            },
            'deaths': {
                'file':'covid_deaths_nyt_state',
                'dates':'isoDateList',
                'type':'time-series-cumulative',
                'join':'fips'
            }
        }
    }, 
}
export const tooltipTables = ['cases','deaths','testing_wk_pos','testing_tcap','vaccines_fully_vaccinated','vaccines_one_dose']

export const tooltipInfo = {
    Choropleth: <p>A thematic map used to represent data through various shading patterns on predetermined geographic areas (counties, state).</p>,
    NaturalBreaksFixed: <p>A nonlinear algorithm used to group observations such that the within-group homogeneity is maximized for the latest date, bins fixed over time</p>,
    NaturalBreaks: <p>A nonlinear algorithm used to group observations such that the within-group homogeneity is maximized for every day, bins change over time</p>,
    BoxMap: <p>Mapping counterpart of the idea behind a box plot</p>,
    Hotspot: <p>A map showing statisically significant spatial cluster and outlier locations, color coded by type.</p>,
    LocalMoran: <p>Local Moran used to identify local clusters and outliers</p>,
    NotSig:	<p>Area was not statistically signficant as a spatial cluster core or outlier using given parameters.</p>,
    HighHigh: <p>Hot Spot Cluster: area with high values, neighbored by areas with high values</p>,
    LowLow: <p>Cold Spot Cluster: area with low values, neighbored by areas with low values</p>,
    HighLow: <p>Hot Outlier: area with high values, neighbored by areas with low values</p>,
    LowHigh: <p>Low-High	Cold Outlier: area with low values, neighbored by areas with high values</p>,
    PovChldPrc: <p>Percentage of children under age 18 living in poverty</p>,
    IncRt: <p>Ratio of household income at the 80th percentile to income at the 20th percentile</p>,
    MedianHouseholdIncome: <p>The income where half of households in a county earn more and half of households earn less</p>,
    FdInsPrc: <p>Percentage of population who lack adequate access to food</p>,
    UnEmplyPrc: <p>Percentage of population age 16 and older unemployed but seeking work</p>,
    UnInPrc: <p>Percentage of people under age 65 without insurance</p>,
    PrmPhysRt: <p>Ratio of population to primary care physicians</p>,
    PrevHospRt: <p>Rate of hospital stays for ambulatory-care sensitive conditions per 100,000 Medicare enrollees</p>,
    RsiSgrBlckRt: <p>Index of dissimilarity where higher values indicate greater residential segregation between Black and White county residents</p>,
    SvrHsngPrbRt: <p>Percentage of households with at least 1 of 4 housing problems: overcrowding, high housing costs, lack of kitchen facilities, or lack of plumbing facilities</p>,
    Over65YearsPrc: <p>Percentage of people ages 65 and older</p>,
    AdObPrc: <p>Percentage of the adult population (age 20 and older) that reports a body mass index (BMI) greater than or equal to 30 kg/m2</p>,
    AdDibPrc: <p>Percentage of adults aged 20 and above with diagnosed diabetes</p>,
    SmkPrc: <p>Percentage of adults who are current smokers</p>,
    ExcDrkPrc: <p>Percentage of adults reporting binge or heavy drinking</p>,
    DrOverdMrtRt: <p>Number of drug poisoning deaths per 100,000 population</p>,
    LfExpRt: <p>Average number of years a person can expect to live</p>,
    SlfHlthPrc: <p>Percentage of adults reporting fair or poor health</p>,
    // SeverityIndex: <p>Indicates the severity of the local covid-19 outbreak, based on cumulative and predicted deaths</p>,
    PredictedDeaths: <p>Predicted number of deaths for a county</p>,
    PredictedDeathsInterval: <p>Margin of error for predicted death counts for a county </p>,
    healthfactor:<p>Health factors represent those things we can modify to improve community conditions and the length and quality of life for residents</p>,
    healthcontext: <p>Community Health Context reflects the existing health behaviors and demographics of individuals in the community that are influenced by the opportunities to live long and well</p>,
    healthlife:<p>Length and Quality of Life reflects the physical and mental well-being of residents within a community through measures representing how long and how well residents live</p>,
    Hypersegregated: <p>American metropolitan areas where black residents experience hypersegregation, see <a href="https://www.princeton.edu/news/2015/05/18/hypersegregated-cities-face-tough-road-change" target="_blank" rel="noopener noreferrer">here</a></p>,
    BlackBelt: <p>Southern US counties that were at least 30% Black or African American in the 2000 Census, see <a href="https://en.wikipedia.org/wiki/Black_Belt_in_the_American_South" target="_blank" rel="noopener noreferrer">here</a></p>,
    TestingCapacity: <p>New screening (e.g., antigen) and diagnostic (e.g., PCR) testing per capita rates by date. The suggested threshold is {'>'}150 daily tests per 100k people.</p>,
    USCongress: <p>Find your representative <a href="https://www.govtrack.us/" target="_blank" rel="noopener noreferrer">here</a></p>,
    BinModes: <p>Fixed bins represent data relative to the most recent date and show a consistent color scale.<br/> Dynamic bins change over time and generate new color scales based on the selected date.</p>,
    Clinics: <p>FQHC or <a href="https://www.hrsa.gov/opa/eligibility-and-registration/health-centers/fqhc/index.html" target="_blank" rel="noopener noreferrer">Federal Qualified Health Centers</a> are community based health providers receiving funds and certification from <a href="https://www.hrsa.gov/" target="_blank" rel="noopener noreferrer">HRSA</a>.</p>,
    Hospitals: <p>Hospital location data from <a href="https://github.com/covidcaremap/covid19-healthsystemcapacity" target="_blank" rel="noopener noreferrer">CovidCareMap.</a></p>,
    ClinicsAndHospitals: <p>Hospital location data from <a href="https://github.com/covidcaremap/covid19-healthsystemcapacity" target="_blank" rel="noopener noreferrer">CovidCareMap</a> and HRSA data on <a href="https://www.hrsa.gov/opa/eligibility-and-registration/health-centers/fqhc/index.html" target="_blank" rel="noopener noreferrer">Federal Qualified Health Centers.</a></p>,
    essentialWorkers: <p>Percent of adult workers in essential industries based on ACS occupation categories (eg. Food service, Fire and Safety, Construction).</p>,
    vaccinationSites: <p>The White House is supporting large vaccine centers to conduct high-volume vaccinations, and HRSA is partnering with Federally Qualified Health Clinics (FQHCs) to reach disproportionately impacted or hard to reach communities.</p>,
    vaccineCenter: <p>High-volume federally-supported vaccination site.</p>,
    vaccineClinic: <p>Vaccine clinic to assist disproportionately impact or hard to reach communities.</p>,
    vaccineClinicInvited: <p>Invited, but not yet active vaccine clinic to assist disproportionately impact or hard to reach communities.</p>
};

export const variablePresets = {
    "Confirmed Count": {
        variableName:"Confirmed Count",
        numerator: 'cases',
        nType: 'time-series',
        nRange: 7,
        nProperty: null,
        denominator: 'properties',
        dType: null,
        dProperty: null,
        dRange:null,
        dIndex:null,
        scale:1,
        scale3D: 100,
        fixedScale: null,
        colorScale: null,
        dataNote: null,
    },
    "Confirmed Count per 100K Population": {
        variableName:"Confirmed Count per 100K Population",
        numerator: 'cases',
        nType: 'time-series',
        nRange: 7,
        nProperty: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100000,
        scale3D: 1000,
        fixedScale: null,
        colorScale: null,
        dataNote: null,
    },
    "Confirmed Count per Licensed Bed": {
        variableName:"Confirmed Count per Licensed Bed",
        numerator: 'cases',
        nType: 'time-series',
        nRange: 7,
        nProperty: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'beds',
        dRange:null,
        dIndex:null,
        scale:1,
        scale3D: 100000,
        fixedScale: null,
        colorScale: null,
        dataNote: null,
    },
    "Death Count":{
      variableName:"Death Count",
      numerator: 'deaths',
      nType: 'time-series',
      nRange: 7,
      nProperty: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      scale3D: 10000,
      fixedScale: null,
      colorScale: null,
      dataNote: null,      
    }, 
    "Death Count per 100K Population":{
      variableName:"Death Count per 100K Population",
      numerator: 'deaths',
      nType: 'time-series',
      nRange: 7,
      nProperty: null,
      denominator: 'properties',
      dType: 'characteristic',
      dProperty: 'population',
      dRange:null,
      dIndex:null,
      scale:100000,
      scale3D: 15000,
      fixedScale: null,
      colorScale: null,
      dataNote: null,
    },
    "Death Count / Confirmed Count":{
      variableName:"Death Count / Confirmed Count",
      numerator: 'deaths',
      nType: 'time-series',
      nRange: 7,
      nProperty: null,
      denominator: 'cases',
      dType: 'time-series',
      dRange: 7,
      dProperty: null,
      scale:1,
      fixedScale: null,
      colorScale: null,
      dataNote: null,
    },
    "Uninsured Percent":{
      variableName:"Uninsured Percent",
      numerator: 'chr_health_factors',
      nType: 'characteristic',
      nProperty: 'UnInPrc',
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: null,
      colorScale: 'uninsured',
      scale3D: 15000,
      dataNote: null,
    },
    "Over 65 Years Percent":{
      variableName:"Over 65 Years Percent",
      numerator: 'chr_health_context',
      nType: 'characteristic',
      nProperty: 'Over65YearsPrc',
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: null,
      colorScale: 'over65',
      scale3D: 15000,
      dataNote: null
    },
    "Life Expectancy":{
      variableName:"Life Expectancy",
      numerator: 'chr_life',
      nType: 'characteristic',
      nProperty: 'LfExpRt',
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      colorScale: 'lifeExp',
      fixedScale: null,
      scale3D: 1000,
      dataNote: null,
    },
    "7 Day Testing Positivity Rate Percent": {
      variableName:"7 Day Testing Positivity Rate Percent",
      numerator: 'testing_wk_pos',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:100,
      fixedScale: 'testing',
      colorScale: 'testing',
      scale3D: 100000,
      dataNote: null,
    },
    "7 Day Testing Capacity": {
      variableName:"7 Day Testing Capacity",
      numerator: 'testing_tcap',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: 'testingCap',
      colorScale: 'testingCap',
      scale3D: 30,
      dataNote: null,
    }, 
    "7 Day Testing Capacity per 100K": {
      variableName:"7 Day Testing Capacity per 100K Population",
      numerator: 'testing_tcap',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: 'testingCap',
      colorScale: 'testingCap',
      scale3D: 30,
      dataNote: null,
    }, 
    "7 Day Tests Performed per 100K Population": {
      variableName:"7 Day Tests Performed per 100K Population",
      numerator: 'testing_tcap',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      fixedScale: 'testingCap',
      colorScale: 'testingCap',
      scale3D: 10000,
      dataNote: null,
    }, 
    "7 Day Testing Capacity per 100K Population": {
        variableName:"7 Day Testing Capacity per 100K Population",
        numerator: 'testing_tcap',
        nType: 'time-series',
        nProperty: null,
        nRange: null,
        denominator: 'properties',
        dType: null,
        dProperty: null,
        dRange:null,
        dIndex:null,
        scale:1,
        fixedScale: 'testingCap',
        colorScale: 'testingCap',
        scale3D: 3000,
        dataNote: null,
    }, 
    "7 Day Confirmed Cases per Testing %":{
      variableName:"7 Day Confirmed Cases per Testing %",
      numerator: 'testing_ccpt',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:100,
      fixedScale: 'testing',
      colorScale: 'testing',
      scale3D: 10000000,
      dataNote: null,
    },
    "Percent Received First Dose": {
        variableName:"Percent Received First Dose",
        numerator: 'vaccines_one_dose',
        nType: 'time-series',
        nProperty: null,
        nRange: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100,
        scale3D: 1000,
        colorScale: 'YlGnBu8',
        fixedScale: null,
        dataNote: null,
    },
    "Percent Received Second Dose": {
        variableName:"Percent Received Second Dose",
        numerator: 'vaccines_fully_vaccinated',
        nType: 'time-series',
        nProperty: null,
        nRange: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100,
        scale3D: 1000,
        colorScale: 'YlGn8',
        fixedScale: null,
        dataNote: null,
    },
    "Doses to be Administered per 100K Population": {
        variableName:"Doses to be Administered per 100K Population",
        numerator: 'vaccines_dist',
        nType: 'time-series',
        nProperty: null,
        nRange: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100000,
        scale3D: 1000,
        colorScale: 'BuPu8',
        fixedScale: null,
        dataNote: null,
    },
    "Doses Available per 100K Population": {
        variableName:"Doses Available per 100K Population",
        numerator: 'vaccines_dist',
        nType: 'time-series',
        nProperty: null,
        nRange: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100000,
        scale3D: 1000,
        colorScale: 'vaccination',
        fixedScale: null,
        dataNote: null,
    },
    "Percent Received At Least One Dose": {
        variableName:"Percent Received At Least One Dose",
        numerator: 'vaccines_one_dose',
        nType: 'time-series',
        nProperty: null,
        nRange: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100,
        scale3D: 1000,
        colorScale: 'YlGnBu8',
        fixedScale: null,
        dataNote: 'TX & HI report only state-level vaccination rates to the CDC.'
    },
    "Percent Fully Vaccinated": {
        variableName:"Percent Fully Vaccinated",
        numerator: 'vaccines_fully_vaccinated',
        nType: 'time-series',
        nProperty: null,
        nRange: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100,
        scale3D: 500_000,
        colorScale: 'YlGn8',
        fixedScale: null,
        dataNote: 'TX & HI report only state-level vaccination rates to the CDC.'
    },
    "Doses to be Administered per 100 People": {
        variableName:"Doses to be Administered per 100 People",
        numerator: 'vaccines_dist',
        nType: 'time-series',
        nProperty: null,
        nRange: null,
        denominator: 'properties',
        dType: 'characteristic',
        dProperty: 'population',
        dRange:null,
        dIndex:null,
        scale:100,
        scale3D: 10,
        colorScale: 'BuPu8',
        fixedScale: null,
        dataNote: null,
    },

    // "Forecasting (5-Day Severity Index)": {
    //   variableName:"Forecasting (5-Day Severity Index)",
    //   numerator: 'predictions',
    //   nType: 'characteristic',
    //   nProperty: 'severity_index',
    //   nRange: null,
    //   denominator: 'properties',
    //   dType: null,
    //   dProperty: null,
    //   dRange:null,
    //   dIndex:null,
    //   scale:1,
    //   colorScale: 'forecasting',
    //   fixedScale: 'forecasting',
    //   scale3D: 50000,
    //   dataNote: null,
    // },
    "Percent Essential Workers":{
      variableName:"Percent Essential Workers",
      numerator: 'essential_workers',
      nType: 'characteristic',
      nProperty: 'pct_essential',
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:100,
      colorScale: 'lifeExp',
      fixedScale: null,
      scale3D: 1000,
      dataNote: null,
    },  
    "Percent Part Time on Workdays": {
      variableName:"Percent Part Time on Workdays",
      numerator: 'pct_parttime',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      scale3D: 10000,
      colorScale: 'mobilityWork',
      fixedScale: null,
      dataNote: null,
    },
    "Percent Full Time on Workdays": {
      variableName:"Percent Full Time on Workdays",
      numerator: 'pct_fulltime',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      scale3D: 10000,
      colorScale: 'mobilityWork',
      fixedScale: null,
      dataNote: null,
    },
    "Percent Home on Workdays": {
      variableName:"Percent Home on Workdays",
      numerator: 'pct_home',
      nType: 'time-series',
      nProperty: null,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      scale3D: 500000,
      colorScale: 'mobilityHome',
      fixedScale: null,
      dataNote: null,
    },
}

export const variableTree = {
    "HEADER:cases":{},
    "Confirmed Count": {
        "County": ["USA Facts","1point3acres","New York Times"],//"CDC",
        "State": ["USA Facts","1point3acres","New York Times"]
    },
    "Confirmed Count per 100K Population":{
        "County": ["USA Facts","1point3acres","New York Times"],//"CDC",
        "State": ["USA Facts","1point3acres","New York Times"]
    },
    "Confirmed Count per Licensed Bed":{
        "County": ["USA Facts","1point3acres","New York Times"],//"CDC",
        "State": ["USA Facts","1point3acres","New York Times"]
    },
    "HEADER:deaths":{},
    "Death Count":{
        "County": ["USA Facts","1point3acres","New York Times"],//"CDC",
        "State": ["USA Facts","1point3acres","New York Times"]
    },
    "Death Count per 100K Population": {
        "County": ["USA Facts","1point3acres","New York Times"],//"CDC",
        "State": ["USA Facts","1point3acres","New York Times"]
    },
    "Death Count / Confirmed Count": {
        "County": ["USA Facts","1point3acres","New York Times"],//"CDC",
        "State": ["USA Facts","1point3acres","New York Times"]
    },
    "HEADER:testing":{},
    "7 Day Testing Positivity Rate Percent":{
        "County": ["CDC"],
        "State": ["CDC"]
    },
    "7 Day Tests Performed per 100K Population":{
        "County": ["CDC"],
        "State": ["CDC"]
    },
    "HEADER:vaccination":{},
    "Percent Fully Vaccinated":{
        "County (Hybrid)": ["CDC"],
        "County": ["CDC"],
        "State": ["CDC"]
    },
    "Percent Received At Least One Dose":{
        "County (Hybrid)": ["CDC"],
        "County": ["CDC"],
        "State": ["CDC"]
    },
    'Doses to be Administered per 100 People': {
        "State": ["CDC"]
    },
    // "HEADER:forecasting":{},
    // "Forecasting (5-Day Severity Index)":{
    //     "County": ["Yu Group at Berkeley"]
    // },
    "HEADER:community health information":{},
    "Uninsured Percent": {
        "County": ["County Health Rankings"],
        "State": ["County Health Rankings"]
    },
    "Over 65 Years Percent": {
        "County": ["County Health Rankings"],
        "State": ["County Health Rankings"]
    },
    "Life Expectancy": {
        "County": ["County Health Rankings"],
        "State": ["County Health Rankings"]
    },
    "Percent Essential Workers": {
        "County": ['ACS']
    },
    "HEADER:mobility":{},
    "Percent Home on Workdays": {
        "County": ["Safegraph"]
    },
    "Percent Part Time on Workdays": {
        "County": ["Safegraph"]
    },
    "Percent Full Time on Workdays": {
        "County": ["Safegraph"]
    }
}

export const datasetTree = {
    'County (Hybrid)': {
        'CDC':'cdc_h.geojson',
    },
    'County': {
      '1point3acres':'county_1p3a.geojson',
      'New York Times':'county_nyt.geojson',
      'USA Facts':'county_usfacts.geojson',
      'CDC':'cdc.geojson',
    //   'Yu Group at Berkeley':'cdc.geojson',
      'County Health Rankings':'cdc.geojson',
      'ACS':'cdc.geojson',   
      'Safegraph':'cdc.geojson'
    }, 
    'State': {
      '1point3acres':'state_1p3a.geojson',
      'New York Times':'state_nyt.geojson',
      'USA Facts':'state_usafacts.geojson',
      'CDC':'state_1p3a.geojson',
      'County Health Rankings':'state_1p3a.geojson'
    }
  }

export const urlParamsTree = {
    'county_usfacts.geojson': {
        name: 'USA Facts',
        geography: 'County'
    },
    'county_1p3a.geojson': {
        name: '1point3acres',
        geography: 'County'
    },
    'county_nyt.geojson': {
        name: 'New York Times',
        geography: 'County'
    },
    'state_1p3a.geojson': {
        name: '1point3acres',
        geography: 'State'
    },
    'state_usafacts.geojson': {
        name: 'USA Facts',
        geography: 'State'
    }, 
    'state_nyt.geojson': {
        name: 'New York Times',
        geography: 'State'
    },
    'global_jhu.geojson': {
        name: 'John Hopkins University',
        geography: 'Global'
    },
    'cdc.geojson': {
        name: 'CDC',
        geography: 'County'
    },
    'cdc_h.geojson': {
        name: 'CDC',
        geography: 'County (Hybrid)'
    },
    'safegraph.geojson': {
      name: 'Safegraph',
      geography: 'County'
    }
  }
