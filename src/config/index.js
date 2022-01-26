// mapbox API token
export const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg';

export const defaultData = 'county_usfacts.geojson';

export const tooltipTables = [
  'cases',
  'deaths',
  'testing_wk_pos',
  'testing_tcap',
  'vaccines_fully_vaccinated',
  'vaccines_one_dose',
];

export const tooltipInfo = {
  Choropleth: (
    <p>
      A thematic map used to represent data through various shading patterns on
      predetermined geographic areas (counties, state).
    </p>
  ),
  NaturalBreaksFixed: (
    <p>
      A nonlinear algorithm used to group observations such that the
      within-group homogeneity is maximized for the latest date, bins fixed over
      time
    </p>
  ),
  NaturalBreaks: (
    <p>
      A nonlinear algorithm used to group observations such that the
      within-group homogeneity is maximized for every day, bins change over time
    </p>
  ),
  BoxMap: <p>Mapping counterpart of the idea behind a box plot</p>,
  Hotspot: (
    <p>
      A map showing statisically significant spatial cluster and outlier
      locations, color coded by type.
    </p>
  ),
  LocalMoran: <p>Local Moran used to identify local clusters and outliers</p>,
  NotSig: (
    <p>
      Area was not statistically signficant as a spatial cluster core or outlier
      using given parameters.
    </p>
  ),
  HighHigh: (
    <p>
      Hot Spot Cluster: area with high values, neighbored by areas with high
      values
    </p>
  ),
  LowLow: (
    <p>
      Cold Spot Cluster: area with low values, neighbored by areas with low
      values
    </p>
  ),
  HighLow: (
    <p>
      Hot Outlier: area with high values, neighbored by areas with low values
    </p>
  ),
  LowHigh: (
    <p>
      Low-High Cold Outlier: area with low values, neighbored by areas with high
      values
    </p>
  ),
  PovChldPrc: <p>Percentage of children under age 18 living in poverty</p>,
  IncRt: (
    <p>
      Ratio of household income at the 80th percentile to income at the 20th
      percentile
    </p>
  ),
  MedianHouseholdIncome: (
    <p>
      The income where half of households in a county earn more and half of
      households earn less
    </p>
  ),
  FdInsPrc: <p>Percentage of population who lack adequate access to food</p>,
  UnEmplyPrc: (
    <p>Percentage of population age 16 and older unemployed but seeking work</p>
  ),
  UnInPrc: <p>Percentage of people under age 65 without insurance</p>,
  PrmPhysRt: <p>Ratio of population to primary care physicians</p>,
  PrevHospRt: (
    <p>
      Rate of hospital stays for ambulatory-care sensitive conditions per
      100,000 Medicare enrollees
    </p>
  ),
  RsiSgrBlckRt: (
    <p>
      Index of dissimilarity where higher values indicate greater residential
      segregation between Black and White county residents
    </p>
  ),
  SvrHsngPrbRt: (
    <p>
      Percentage of households with at least 1 of 4 housing problems:
      overcrowding, high housing costs, lack of kitchen facilities, or lack of
      plumbing facilities
    </p>
  ),
  Over65YearsPrc: <p>Percentage of people ages 65 and older</p>,
  AdObPrc: (
    <p>
      Percentage of the adult population (age 20 and older) that reports a body
      mass index (BMI) greater than or equal to 30 kg/m2
    </p>
  ),
  AdDibPrc: (
    <p>Percentage of adults aged 20 and above with diagnosed diabetes</p>
  ),
  SmkPrc: <p>Percentage of adults who are current smokers</p>,
  ExcDrkPrc: <p>Percentage of adults reporting binge or heavy drinking</p>,
  DrOverdMrtRt: <p>Number of drug poisoning deaths per 100,000 population</p>,
  LfExpRt: <p>Average number of years a person can expect to live</p>,
  SlfHlthPrc: <p>Percentage of adults reporting fair or poor health</p>,
  // SeverityIndex: <p>Indicates the severity of the local covid-19 outbreak, based on cumulative and predicted deaths</p>,
  PredictedDeaths: <p>Predicted number of deaths for a county</p>,
  PredictedDeathsInterval: (
    <p>Margin of error for predicted death counts for a county </p>
  ),
  healthfactor: (
    <p>
      Health factors represent those things we can modify to improve community
      conditions and the length and quality of life for residents
    </p>
  ),
  healthcontext: (
    <p>
      Community Health Context reflects the existing health behaviors and
      demographics of individuals in the community that are influenced by the
      opportunities to live long and well
    </p>
  ),
  healthlife: (
    <p>
      Length and Quality of Life reflects the physical and mental well-being of
      residents within a community through measures representing how long and
      how well residents live
    </p>
  ),
  Hypersegregated: (
    <p>
      American metropolitan areas where black residents experience
      hypersegregation, see{' '}
      <a
        href="https://www.princeton.edu/news/2015/05/18/hypersegregated-cities-face-tough-road-change"
        target="_blank"
        rel="noopener noreferrer"
      >
        here
      </a>
    </p>
  ),
  BlackBelt: (
    <p>
      Southern US counties that were at least 30% Black or African American in
      the 2000 Census, see{' '}
      <a
        href="https://en.wikipedia.org/wiki/Black_Belt_in_the_American_South"
        target="_blank"
        rel="noopener noreferrer"
      >
        here
      </a>
    </p>
  ),
  TestingCapacity: (
    <p>
      New screening (e.g., antigen) and diagnostic (e.g., PCR) testing per
      capita rates by date. The suggested threshold is {'>'}150 daily tests per
      100k people.
    </p>
  ),
  USCongress: (
    <p>
      Find your representative{' '}
      <a
        href="https://www.govtrack.us/"
        target="_blank"
        rel="noopener noreferrer"
      >
        here
      </a>
    </p>
  ),
  BinModes: (
    <p>
      Fixed bins represent data relative to the most recent date and show a
      consistent color scale.
      <br /> Dynamic bins change over time and generate new color scales based
      on the selected date.
    </p>
  ),
  Clinics: (
    <p>
      FQHC or{' '}
      <a
        href="https://www.hrsa.gov/opa/eligibility-and-registration/health-centers/fqhc/index.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        Federal Qualified Health Centers
      </a>{' '}
      are community based health providers receiving funds and certification
      from{' '}
      <a href="https://www.hrsa.gov/" target="_blank" rel="noopener noreferrer">
        HRSA
      </a>
      .
    </p>
  ),
  Hospitals: (
    <p>
      Hospital location data from{' '}
      <a
        href="https://github.com/covidcaremap/covid19-healthsystemcapacity"
        target="_blank"
        rel="noopener noreferrer"
      >
        CovidCareMap.
      </a>
    </p>
  ),
  ClinicsAndHospitals: (
    <p>
      Hospital location data from{' '}
      <a
        href="https://github.com/covidcaremap/covid19-healthsystemcapacity"
        target="_blank"
        rel="noopener noreferrer"
      >
        CovidCareMap
      </a>{' '}
      and HRSA data on{' '}
      <a
        href="https://www.hrsa.gov/opa/eligibility-and-registration/health-centers/fqhc/index.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        Federal Qualified Health Centers.
      </a>
    </p>
  ),
  essentialWorkers: (
    <p>
      Percent of adult workers in essential industries based on ACS occupation
      categories (eg. Food service, Fire and Safety, Construction).
    </p>
  ),
  vaccinationSites: (
    <p>
      The White House is supporting large vaccine centers to conduct high-volume
      vaccinations, and HRSA is partnering with Federally Qualified Health
      Clinics (FQHCs) to reach disproportionately impacted or hard to reach
      communities.
    </p>
  ),
  vaccineCenter: <p>High-volume federally-supported vaccination site.</p>,
  vaccineClinic: (
    <p>
      Vaccine clinic to assist disproportionately impact or hard to reach
      communities.
    </p>
  ),
  vaccineClinicInvited: (
    <p>
      Invited, but not yet active vaccine clinic to assist disproportionately
      impact or hard to reach communities.
    </p>
  ),
};


export const variableTree = {
  'HEADER:cases': {},
  'Confirmed Count': {
    County: ['USA Facts', '1Point3Acres', 'New York Times'], //"CDC",
    State: ['USA Facts', '1Point3Acres', 'New York Times'],
  },
  'Confirmed Count per 100K Population': {
    County: ['USA Facts', '1Point3Acres', 'New York Times'], //"CDC",
    State: ['USA Facts', '1Point3Acres', 'New York Times'],
  },
  'Confirmed Count per Licensed Bed': {
    County: ['USA Facts', '1Point3Acres', 'New York Times'], //"CDC",
    State: ['USA Facts', '1Point3Acres', 'New York Times'],
  },
  'HEADER:deaths': {},
  'Death Count': {
    County: ['USA Facts', '1Point3Acres', 'New York Times'], //"CDC",
    State: ['USA Facts', '1Point3Acres', 'New York Times'],
  },
  'Death Count per 100K Population': {
    County: ['USA Facts', '1Point3Acres', 'New York Times'], //"CDC",
    State: ['USA Facts', '1Point3Acres', 'New York Times'],
  },
  'Death Count / Confirmed Count': {
    County: ['USA Facts', '1Point3Acres', 'New York Times'], //"CDC",
    State: ['USA Facts', '1Point3Acres', 'New York Times'],
  },
  'HEADER:testing': {},
  '7 Day Testing Positivity Rate Percent': {
    County: ['CDC'],
    State: ['CDC'],
  },
  '7 Day Tests Performed per 100K Population': {
    County: ['CDC'],
    State: ['CDC'],
  },
  'HEADER:vaccination': {},
  'Percent Fully Vaccinated': {
    // 'County (Hybrid)': ['CDC'],
    County: ['CDC'],
    State: ['CDC'],
  },
  'Percent Received At Least One Dose': {
    // 'County (Hybrid)': ['CDC'],
    County: ['CDC'],
    State: ['CDC'],
  },
  'Doses to be Administered per 100 People': {
    State: ['CDC'],
  },
  // "HEADER:forecasting":{},
  // "Forecasting (5-Day Severity Index)":{
  //     "County": ["Yu Group at Berkeley"]
  // },
  'HEADER:community health information': {},
  'Uninsured Percent': {
    County: ['County Health Rankings'],
    State: ['County Health Rankings'],
  },
  'Over 65 Years Percent': {
    County: ['County Health Rankings'],
    State: ['County Health Rankings'],
  },
  'Life Expectancy': {
    County: ['County Health Rankings'],
    State: ['County Health Rankings'],
  },
  'Percent Essential Workers': {
    County: ['ACS'],
  },
  'HEADER:mobility': {},
  'Percent Home on Workdays': {
    County: ['Safegraph'],
  },
  'Percent Part Time on Workdays': {
    County: ['Safegraph'],
  },
  'Percent Full Time on Workdays': {
    County: ['Safegraph'],
  },
};

// export const datasetTree = {
//   'County (Hybrid)': {
//     CDC: 'cdc_h.geojson',
//   },
//   County: {
//     '1Point3Acres': 'county_1p3a.geojson',
//     'New York Times': 'county_nyt.geojson',
//     'USA Facts': 'county_usfacts.geojson',
//     CDC: 'cdc.geojson',
//     //   'Yu Group at Berkeley':'cdc.geojson',
//     'County Health Rankings': 'cdc.geojson',
//     ACS: 'cdc.geojson',
//     Safegraph: 'cdc.geojson',
//   },
//   State: {
//     '1Point3Acres': 'state_1p3a.geojson',
//     'New York Times': 'state_nyt.geojson',
//     'USA Facts': 'state_usafacts.geojson',
//     CDC: 'state_1p3a.geojson',
//     'County Health Rankings': 'state_1p3a.geojson',
//   },
// };

export const urlParamsTree = {
  'county_usfacts.geojson': {
    name: 'USA Facts',
    geography: 'County',
  },
  'county_1p3a.geojson': {
    name: '1Point3Acres',
    geography: 'County',
  },
  'county_nyt.geojson': {
    name: 'New York Times',
    geography: 'County',
  },
  'state_1p3a.geojson': {
    name: '1Point3Acres',
    geography: 'State',
  },
  'state_usafacts.geojson': {
    name: 'USA Facts',
    geography: 'State',
  },
  'state_nyt.geojson': {
    name: 'New York Times',
    geography: 'State',
  },
  'global_jhu.geojson': {
    name: 'John Hopkins University',
    geography: 'Global',
  },
  'cdc.geojson': {
    name: 'CDC',
    geography: 'County',
  },
  // 'cdc_h.geojson': {
  //   name: 'CDC',
  //   geography: 'County (Hybrid)',
  // },
  'safegraph.geojson': {
    name: 'Safegraph',
    geography: 'County',
  },
};