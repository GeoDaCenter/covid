export const colorScales = {
    'natural_breaks': [
        [240,240,240],
        [255,255,204],
        [255,237,160],
        [254,217,118],
        [254,178,76],
        [253,141,60],
        [252,78,42],
        [227,26,28],
        [177,0,38],
    ],
    'lisa': [
        [255,255,255],
        [255,0,0],
        [0,0,255],
        [167, 173, 249],
        [244, 173, 168],
        // [70, 70, 70],
        // [153, 153, 153]
    ],
    'hinge15_breaks': [
        [1, 102, 94],
        [90, 180, 172],
        [199, 234, 229],
        [246, 232, 195],
        [216, 179, 101],
        [140, 81, 10],
    ],    
    'uninsured':[
        [240,240,240],
        [247,252,253],
        [224,236,244],
        [191,211,230],
        [158,188,218],
        [140,150,198],
        [140,107,177],
        [136,65,157],
        [129,15,124],
        // [77,0,75],
      ],
    'over65':[
        [240,240,240],
        [247,252,240],
        [224,243,219],
        [204,235,197],
        [168,221,181],
        [123,204,196],
        [78,179,211],
        [43,140,190],
        [8,104,172],
        // [8,64,129],
    ],
    'lifeExp':[
        [240,240,240],
        [247,252,240],
        [224,243,219],
        [204,235,197],
        [168,221,181],
        [123,204,196],
        [78,179,211],
        [43,140,190],
        [8,104,172],
        // [8,64,129],
    ],
    'forecasting': [
        [239, 239, 239],
        [254,232,200],
        [253,187,132],
        [227,74,51],
    ],
    'testing' : [
        [240,240,240],
        [13,8,135],
        [92,1,166],
        [156,23,158],
        [203,70,121],
        [237,121,83],
        [253,180,47],
        [240,249,33],
      ],
      'testingCap':[
        [240,240,240],
        [247,251,255],
        [222,235,247],
        [198,219,239],
        [158,202,225],
        [107,174,214],
        [66,146,198],
        [33,113,181],
        [8,81,156],
        [8,48,107],
      ],
      'BuPu8':[
        [240,240,240],
        [247,252,253],
        [224,236,244],
        [191,211,230],
        [158,188,218],
        [140,150,198],
        [140,107,177],
        [136,65,157],
        [110,1,107],
      ],
      'purpleSingleHue8':[
        [240,240,240],
        [252, 251, 253],
        [238, 236, 245],
        [217, 216, 234],
        [188, 188, 219],
        [158, 155, 201],
        [129, 123, 185],
        [106, 81, 164],
        [84, 40, 143],
      ],
      'greenSingleHue8': [
        [240,240,240],
        [247,252,245],
        [229,245,224],
        [199,233,192],
        [161,217,155],
        [116,196,118],
        [65,171,93],
        [35,139,69],
        [0,90,50],
      ],
      'YlGnBu8':[
        [240,240,240],
        [255,255,217],
        [237,248,177],
        [199,233,180],
        [127,205,187],
        [65,182,196],
        [29,145,192],
        [34,94,168],
        [12,44,132],
      ],
      'YlGn8': [
        [240,240,240],
        [255,255,229],
        [247,252,185],
        [217,240,163],
        [173,221,142],
        [120,198,121],
        [65,171,93],
        [35,132,67],
        [0,90,50],
      ],
      'mobilityDivergingWork':[
        [240,240,240],
        [50,136,189],
        [102,194,165],
        [171,221,164],
        [230,245,152],
        [254,224,139],
        [253,174,97],
        [244,109,67],
        [213,62,79],
      ],
      'mobilityDivergingHome':[
        [240,240,240],
        [118,42,131],
        [153,112,171],
        [194,165,207],
        [231,212,232],
        [217,240,211],
        [166,219,160],
        [90,174,97],
        [27,120,55],
      ],
      'mobilityHome':[
        [240,240,240],
        [252,251,253],
        [239,237,245],
        [218,218,235],
        [188,189,220],
        [158,154,200],
        [128,125,186],
        [106,81,163],
        [74,20,134]
      ],
      'mobilityWork':[
        [240,240,240],
        [255,245,235],
        [254,230,206],
        [253,208,162],
        [253,174,107],
        [253,141,60],
        [241,105,19],
        [217,72,1],
        [140,45,4],
      ]
}

export const fixedScales = {
    'testing': {
        bins: ['No Data','<3%','5%','10%','15%','20%','>25%'],
        breaks:[0,.03,.05,.10,.15,.20,.25,Math.pow(10, 12)]
    },
    'testingCap': {
        bins: ['No Data','<50','100','150','200','250','300','350','>400'],
        breaks:[0,50,100,150,200,250,300,350,400,Math.pow(10, 12)]
    },
    'lisa':{
        bins: ["Not significant tooltip:NotSig", "High-High tooltip:HighHigh", "Low-Low tooltip:LowLow", "Low-High  tooltip:LowHigh", "High-Low  tooltip:HighLow"] //"Undefined", "Isolated"
    },
    'forecasting': {
        bins: ['N/A','Low', 'Medium', 'High'],
        breaks:[1,2,3,4]

    }
}

// mapbox API token
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg';

export const colors = {
    white: '#ffffff',
    black: '#00000',
    darkgray:'#1a1a1a',
    gray:'#2b2b2b',
    buttongray: '#f5f5f5',
    lightgray: '#d8d8d8',
    yellow: '#FFCE00',
    lightblue: '#A1E1E3',
    red: '#EC1E24',
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

export const defaultData = 'county_usfacts.geojson';

export const dataPresets = {
    'county_usfacts.geojson': {
        plainName: 'USA Facts County', // Plain english name for dataset
        geojson: 'county_usfacts.geojson', // geospatial data to join to
        csvs: [ // list of CSVs to join
            'covid_confirmed_usafacts.pbf',
            'covid_deaths_usafacts.pbf',
            'berkeley_predictions',
            'chr_health_context',
            'chr_life',
            'chr_health_factors',
            'mobility_home_workdays_safegraph.pbf',
            'mobility_parttime_workdays_safegraph.pbf',
            'mobility_fulltime_workdays_safegraph.pbf',
            'context_essential_workers_acs',
            'vaccine_fully_vaccinated_cdc'
        ], 
        tableNames: [ // table names in order of CSVs
            'cases',
            'deaths',
            'predictions',
            'chr_health_context',
            'chr_life',
            'chr_health_factors',
            'pct_home',
            'pct_parttime',
            'pct_fulltime',
            'essential_workers',
            'vaccines_fully_vaccinated'
        ],
        joinCols: ['GEOID', ['FIPS','fips','countyFIPS', 'county', 'geoid']], // geospatial data join column and then list of valid table join columns
        accumulate: [], // CSV names to accumulate over time
        dateList: { // date lists to parse: isoDateList (eg. '2020-01-01') or usDateList (eg. '01/01/20')
            'covid_confirmed_usafacts.pbf': 'isoDateList', 
            'covid_deaths_usafacts.pbf': 'isoDateList',
            'mobility_home_workdays_safegraph.pbf': 'isoDateList',
            'mobility_parttime_workdays_safegraph.pbf': 'isoDateList',
            'mobility_fulltime_workdays_safegraph.pbf': 'isoDateList',
            'vaccine_fully_vaccinated_cdc': 'isoDateList',
        }
    },
    'county_1p3a.geojson': {
        plainName: '1Point3Acres County',
        geojson: 'county_1p3a.geojson', 
        csvs: [
            'covid_confirmed_1p3a.pbf',
            'covid_deaths_1p3a.pbf',
            'berkeley_predictions',
            'chr_health_context',
            'chr_life',
            'chr_health_factors',
            'vaccine_fully_vaccinated_cdc'
        ], 
        tableNames: [
            'cases',
            'deaths',
            'predictions', 
            'chr_health_context', 
            'chr_life', 
            'chr_health_factors',
            'vaccines_fully_vaccinated'
        ],
        joinCols: ['GEOID', ['FIPS','fips','countyFIPS', 'GEOID','geoid']], 
        accumulate: ['covid_confirmed_1p3a','covid_deaths_1p3a'],
        dateList: {
            'covid_confirmed_1p3a.pbf': 'isoDateList', 
            'covid_deaths_1p3a.pbf': 'isoDateList',
            'vaccine_fully_vaccinated_cdc': 'isoDateList',
        }
    },
    'county_nyt.geojson': {
        plainName: 'New York Times County',
        geojson: 'county_nyt.geojson', 
        csvs: [
            'covid_confirmed_nyt.pbf', 
            'covid_deaths_nyt.pbf', 
            'berkeley_predictions', 
            'chr_health_context', 
            'chr_life', 
            'chr_health_factors',
            'context_essential_workers_acs',
            'vaccine_fully_vaccinated_cdc'
        ],  
        tableNames: [
            'cases', 
            'deaths', 
            'predictions', 
            'chr_health_context', 
            'chr_life', 
            'chr_health_factors',
            'essential_workers',
            'vaccines_fully_vaccinated'
        ],
        joinCols: ['GEOID', ['FIPS','fips','countyFIPS']],
        accumulate: [],
        dateList: {
            'covid_confirmed_nyt.pbf': 'isoDateList',
            'covid_deaths_nyt.pbf': 'isoDateList',
            'vaccine_fully_vaccinated_cdc': 'isoDateList',
        }
    },
    'state_1p3a.geojson': {
        plainName: '1Point3Acres State',
        geojson: 'state_1p3a.geojson', 
        csvs: [
        	'covid_confirmed_1p3a_state',
			'covid_deaths_1p3a_state',
			'chr_health_context_state',
			'chr_life_state',
			'chr_health_factors_state',
			'covid_testing_cdc_state',
			'covid_wk_pos_cdc_state',
			'covid_tcap_cdc_state',
			'covid_ccpt_cdc_state',
			'vaccination_one_or_more_doses_cdc',
			'vaccination_fully_vaccinated_cdc',
			'vaccination_to_be_distributed_cdc'
		], 
        tableNames: [
	        'cases',
			'deaths',
			'chr_health_context',
			'chr_life',
			'chr_health_factors',
			'testing',
			'testing_wk_pos',
			'testing_tcap',
			'testing_ccpt',
			'vaccines_one_dose',
			'vaccines_fully_vaccinated',
			'vaccines_dist'
        ],
        joinCols: ['GEOID', ['FIPS','fips','fips_code','state_fips','countyFIPS','GEOID','geoid']], 
        accumulate: ['covid_confirmed_1p3a_state','covid_deaths_1p3a_state','covid_testing_cdc_state'],
        dateList: {
            'covid_confirmed_1p3a_state': 'isoDateList', 
            'covid_deaths_1p3a_state': 'isoDateList', 
            'covid_testing_cdc_state': 'isoDateList', 
            'covid_wk_pos_cdc_state': 'isoDateList', 
            'covid_tcap_cdc_state': 'isoDateList', 
            'covid_ccpt_cdc_state': 'isoDateList', 
            'vaccination_one_or_more_doses_cdc': 'isoDateList', 
            'vaccination_fully_vaccinated_cdc': 'isoDateList', 
            'vaccination_to_be_distributed_cdc': 'isoDateList'
        }
    },
    'state_usafacts.geojson': {
        plainName: 'USA Facts State',
        geojson: 'state_usafacts.geojson', 
        csvs: [
            'covid_confirmed_usafacts_state',
            'covid_deaths_usafacts_state',
            'chr_health_context_state',
            'chr_life_state',
            'chr_health_factors_state',
            'covid_testing_cdc_state',
            'covid_wk_pos_cdc_state',
            'covid_tcap_cdc_state',
            'covid_ccpt_cdc_state',
			'vaccination_one_or_more_doses_cdc',
			'vaccination_fully_vaccinated_cdc',
			'vaccination_to_be_distributed_cdc'
        ],  
        tableNames: [
            'cases',
            'deaths',
            'chr_health_context',
            'chr_life',
            'chr_health_factors',
            'testing',
            'testing_wk_pos',
            'testing_tcap',
            'testing_ccpt',
			'vaccines_one_dose',
			'vaccines_fully_vaccinated',
			'vaccines_dist'
        ],
        joinCols: ['GEOID', ['FIPS','fips','fips_code','state_fips','stateFIPS','geoid']],
        accumulate: ['covid_testing_cdc_state'],
        dateList: {
            'covid_confirmed_1p3a_state': 'isoDateList', 
            'covid_deaths_1p3a_state': 'isoDateList', 
            'covid_testing_cdc_state': 'isoDateList', 
            'covid_wk_pos_cdc_state': 'isoDateList', 
            'covid_tcap_cdc_state': 'isoDateList', 
            'covid_ccpt_cdc_state': 'isoDateList', 
            'vaccination_one_or_more_doses_cdc': 'isoDateList', 
            'vaccination_fully_vaccinated_cdc': 'isoDateList', 
            'vaccination_to_be_distributed_cdc': 'isoDateList'
        }
    },
    'state_nyt.geojson': {
        plainName: 'New York Times State',
        geojson: 'state_nyt.geojson', 
        csvs: [
            'covid_confirmed_nyt_state',
            'covid_deaths_nyt_state',
            'chr_health_context_state',
            'chr_life_state',
            'chr_health_factors_state',
            'covid_testing_1p3a_state',
            'covid_wk_pos_1p3a_state',
            'covid_tcap_1p3a_state',
            'covid_ccpt_1p3a_state',
			'vaccination_one_or_more_doses_cdc',
			'vaccination_fully_vaccinated_cdc',
			'vaccination_to_be_distributed_cdc'
        ], 
        joinCols: ['GEOID', ['FIPS','fips','countyFIPS','geoid']], 
        tableNames: [
            'cases', 
            'deaths', 
            'chr_health_context', 
            'chr_life', 
            'chr_health_factors', 
            'testing', 
            'testing_wk_pos', 
            'testing_tcap', 
            'testing_ccpt',
			'vaccines_one_dose',
			'vaccines_fully_vaccinated',
			'vaccines_dist'
        ],
        accumulate: ['covid_testing_cdc_state'],
        dateList: {
            'covid_confirmed_nyt_state': 'isoDateList', 
            'covid_deaths_nyt_state': 'isoDateList',
            'covid_testing_cdc_state': 'isoDateList', 
            'covid_wk_pos_cdc_state': 'isoDateList', 
            'covid_tcap_cdc_state': 'isoDateList', 
            'covid_ccpt_cdc_state': 'isoDateList', 
            'vaccination_one_or_more_doses_cdc': 'isoDateList', 
            'vaccination_fully_vaccinated_cdc': 'isoDateList', 
            'vaccination_to_be_distributed_cdc': 'isoDateList'
        }
    },
    'global_jhu.geojson': {
        plainName: 'John Hopkins University (Global)',
        geojson: 'global_jhu.geojson', 
        csvs: [
            'covid_confirmed_jhu',
            'covid_deaths_jhu'
        ], 
        tableNames: [
            'cases',
            'deaths'
        ],
        joinCols: ['GEOID', ['UID','geoid']], 
        accumulate: []
    },
    'cdc.geojson': {
        plainName: 'Center for Disease Control County',
        geojson: 'cdc.geojson', 
        csvs: [
            'covid_confirmed_usafacts.pbf',
            'covid_deaths_usafacts.pbf',
            'berkeley_predictions', 
            'chr_health_context', 
            'chr_life', 
            'chr_health_factors',
            'covid_testing_cdc.pbf',
            'covid_wk_pos_cdc.pbf', 
            'covid_tcap_cdc.pbf', 
            'covid_ccpt_cdc.pbf',
            'context_essential_workers_acs',
            'vaccine_fully_vaccinated_cdc'
        ],  
        tableNames: [
            'cases',
            'deaths', 
            'predictions', 
            'chr_health_context', 
            'chr_life', 
            'chr_health_factors',
            'testing', 
            'testing_wk_pos', 
            'testing_tcap', 
            'testing_ccpt',
            'essential_workers',
            'vaccines_fully_vaccinated'
        ],
        joinCols: ['GEOID', ['fips_code', 'fips', 'FIPS', 'countyFIPS','geoid']],
        accumulate: [],
        dateList: {
            'covid_confirmed_usafacts.pbf': 'isoDateList', 
            'covid_deaths_usafacts.pbf': 'isoDateList',
            'covid_testing_cdc.pbf': 'isoDateList', 
            'covid_wk_pos_cdc.pbf': 'isoDateList', 
            'covid_tcap_cdc.pbf': 'isoDateList', 
            'covid_ccpt_cdc.pbf': 'isoDateList',
            'vaccine_fully_vaccinated_cdc': 'isoDateList',
        }
    },
}

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
    SeverityIndex: <p>Indicates the severity of the local covid-19 outbreak, based on cumulative and predicted deaths</p>,
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
      nProperty: 9,
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
      nProperty: 3,
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
      nProperty: 3,
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
      scale:1,
      fixedScale: 'testing',
      colorScale: 'testing',
      scale3D: 10000000,
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
      scale3D: 3000,
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
      scale3D: 3000,
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
      scale:1,
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
        dataNote: 'Data prior to 2/28/21 include any doses administered in the state and may include residents of other states.'
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
        scale3D: 1000,
        colorScale: 'YlGn8',
        fixedScale: null,
        dataNote: 'Data prior to 2/28/21 include any doses administered in the state and may include residents of other states.'
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

    "Forecasting (5-Day Severity Index)": {
      variableName:"Forecasting (5-Day Severity Index)",
      numerator: 'predictions',
      nType: 'characteristic',
      nProperty: 1,
      nRange: null,
      denominator: 'properties',
      dType: null,
      dProperty: null,
      dRange:null,
      dIndex:null,
      scale:1,
      colorScale: 'forecasting',
      fixedScale: 'forecasting',
      scale3D: 50000,
      dataNote: null,
    },
    "Percent Essential Workers":{
      variableName:"Percent Essential Workers",
      numerator: 'essential_workers',
      nType: 'characteristic',
      nProperty: 1,
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

export const allGeographies = ['County', 'State']
export const allDatasets = ['1point3acres', 'USA Facts', 'New York Times', 'CDC', 'County Health Rankings', 'Yu Group at Berkeley', 'ACS', 'Safegraph'] 
export const variableTree = {
    "HEADER:cases":{},
    "Confirmed Count": {
        "County": {
            "USA Facts": {
                "geojson":'county_usfacts.geojson',
                "csv":['covid_confirmed_usafacts'] 
            },
            "1point3acres": {
                "geojson":'county_1p3a.geojson',
                "csv":['covid_confirmed_1p3a']
            },
            "New York Times": {
                "geojson":'county_nyt.geojson',
                "csv":['covid_confirmed_nyt']  
            }
        },
        "State": {
            "1point3acres": {
                "geojson":'state_1p3a.geojson',
                "csv":['covid_confirmed_1p3a_state']
            },
            "New York Times": {
                "geojson":'state_nyt.geojson',
                "csv":['covid_confirmed_nyt_state']
            }, 
        }
    },
    "Confirmed Count per 100K Population":{
        "County": {
            "USA Facts": {
                "geojson":'county_usfacts.geojson',
                "csv":['covid_confirmed_usafacts'] 
            },
            "1point3acres": {
                "geojson":'county_1p3a.geojson',
                "csv":['covid_confirmed_1p3a']
            },
            "New York Times": {
                "geojson":'county_nyt.geojson',
                "csv":['covid_confirmed_nyt']  
            }
        },
        "State": {
            "1point3acres": {
                "geojson":'state_1p3a.geojson',
                "csv":['covid_confirmed_1p3a_state']
            },
            "New York Times": {
                "geojson":'state_nyt.geojson',
                "csv":['covid_confirmed_nyt_state']
            }, 
        }
    },
    "Confirmed Count per Licensed Bed":{
        "County": {
            "USA Facts": {
                "geojson":'county_usfacts.geojson',
                "csv":['covid_confirmed_usafacts'] 
            },
            "1point3acres": {
                "geojson":'county_1p3a.geojson',
                "csv":['covid_confirmed_1p3a']
            },
            "New York Times": {
                "geojson":'county_nyt.geojson',
                "csv":['covid_confirmed_nyt']  
            }
        },
        "State": {
            "1point3acres": {
                "geojson":'state_1p3a.geojson',
                "csv":['covid_confirmed_1p3a_state']
            },
            "New York Times": {
                "geojson":'state_nyt.geojson',
                "csv":['covid_confirmed_nyt_state']
            }, 
        }
    },
    "HEADER:deaths":{},
    "Death Count":{
        "County": {
            "USA Facts": {
                "geojson":'county_usfacts.geojson',
                "csv":['covid_deaths_usafacts'] 
            },
            "1point3acres": {
                "geojson":'county_1p3a.geojson',
                "csv":['covid_deaths_1p3a']
            },
            "New York Times": {
                "geojson":'county_nyt.geojson',
                "csv":['covid_deaths_nyt']  
            }
        },
        "State": {
            "1point3acres": {
                "geojson":'state_1p3a.geojson',
                "csv":['covid_deaths_1p3a_state']
            },
            "New York Times": {
                "geojson":'state_nyt.geojson',
                "csv":['covid_deaths_nyt_state']
            }, 
        }
    },
    "Death Count per 100K Population": {
        "County": {
            "USA Facts": {
                "geojson":'county_usfacts.geojson',
                "csv":['covid_deaths_usafacts'] 
            },
            "1point3acres": {
                "geojson":'county_1p3a.geojson',
                "csv":['covid_deaths_1p3a']
            },
            "New York Times": {
                "geojson":'county_nyt.geojson',
                "csv":['covid_deaths_nyt']  
            }
        },
        "State": {
            "1point3acres": {
                "geojson":'state_1p3a.geojson',
                "csv":['covid_deaths_1p3a_state']
            },
            "New York Times": {
                "geojson":'state_nyt.geojson',
                "csv":['covid_deaths_nyt_state']
            }, 
        }
    },
    "Death Count / Confirmed Count": {
        "County": {
            "USA Facts": {
                "geojson":'county_usfacts.geojson'
            },
            "1point3acres": {
                "geojson":'county_1p3a.geojson'
            },
            "New York Times": {
                "geojson":'county_nyt.geojson'
            }
        },
        "State": {
            "1point3acres": {
                "geojson":'state_1p3a.geojson'
            },
            "New York Times": {
                "geojson":'state_nyt.geojson'
            }, 
        }
    },
    "HEADER:testing":{},
    "7 Day Testing Positivity Rate Percent":{
        "County": {
            "CDC": {
                "geojson": "cdc.geojson"
            }
        },
        "State": {
            "CDC": {
                "geojson":'state_1p3a.geojson'
            },
        }
    },
    "7 Day Testing Capacity per 100K Population":{
        "County": {
            "CDC": {
                "geojson": "cdc.geojson"
            }
        },
        "State": {
            "CDC": {
                "geojson":'state_1p3a.geojson'
            },
        }
    },
    "HEADER:vaccination":{},
    "Percent Fully Vaccinated":{
        "County": {
            "CDC": {
                "geojson": "cdc.geojson",
            }
        },
        "State": {
            "CDC": {
                "geojson": "state_1p3a.geojson",
            }
        },
    },
    "Percent Received At Least One Dose":{
        "State": {
            "CDC": {
                "geojson": "state_1p3a.geojson"
            }
        },
    },
    "Doses to be Administered per 100 People":{
        "State": {
            "CDC": {
                "geojson": "state_1p3a.geojson"
            }
        },
    },
    "HEADER:forecasting":{},
    "Forecasting (5-Day Severity Index)":{
        "County": {
            "Yu Group at Berkeley": {
                "geojson":'county_usfacts.geojson'
            }
        }
    },
    "HEADER:community health information":{},
    "Uninsured Percent": {
        "County": {
            "County Health Rankings": {
                "geojson":'county_usfacts.geojson',
                "csv":['chr_health_factors']
            }
        },
        "State": {
            "County Health Rankings": {
                "geojson":'state_1p3a.geojson'
            }
        }
    },
    "Over 65 Years Percent": {
        "County": {
            "County Health Rankings": {
                "geojson":'county_usfacts.geojson'
            }
        },
        "State": {
            "County Health Rankings": {
                "geojson":'state_1p3a.geojson'
            }
        }
    },
    "Life Expectancy": {
        "County": {
            "County Health Rankings": {
                "geojson":'county_usfacts.geojson'
            }
        },
        "State": {
            "County Health Rankings": {
                "geojson":'state_1p3a.geojson'
            }
        }
    },
    "Percent Essential Workers": {
        "County": {
            "ACS": {
                "geojson":'county_usfacts.geojson'
            }
        },
        // "State": {
        //     "ACS": {
        //         "geojson":'state_1p3a.geojson'
        //     }
        // }
    },
    "HEADER:mobility":{},
    "Percent Home on Workdays": {
        "County": {
            "Safegraph": {
                "geojson":'county_usfacts.geojson'
            }
        }
    },
    "Percent Part Time on Workdays": {
        "County": {
            "Safegraph": {
                "geojson":'safegraph.geojson'
            }
        }
    },
    "Percent Full Time on Workdays": {
        "County": {
            "Safegraph": {
                "geojson":'safegraph.geojson'
            }
        }
    }
}


export const datasetTree = {
    'County': {
      '1point3acres':'county_1p3a.geojson',
      'New York Times':'county_nyt.geojson',
      'USA Facts':'county_usfacts.geojson',
      'CDC':'cdc.geojson',
      'Yu Group at Berkeley':'county_usfacts.geojson',
      'County Health Rankings':'county_usfacts.geojson',
      'ACS':'county_usfacts.geojson',   
      'Safegraph':'county_usfacts.geojson'
    }, 
    'State': {
      '1point3acres':'state_1p3a.geojson',
      'New York Times':'state_nyt.geojson',
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
    'safegraph.geojson': {
      name: 'Safegraph',
      geography: 'County'
    }
  }
