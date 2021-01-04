let config = {};

config.TOOLTIP = {
  Choropleth: 'A thematic map used to represent data through various shading patterns on predetermined geographic areas (counties, state).', 
  NaturalBreaksFixed: 'A nonlinear algorithm used to group observations such that the within-group homogeneity is maximized for the latest date, bins fixed over time',
  NaturalBreaks: 'A nonlinear algorithm used to group observations such that the within-group homogeneity is maximized for every day, bins change over time',
  BoxMap: 'Mapping counterpart of the idea behind a box plot',
  LocalClustering: 'A map showing statisically significant spatial cluster and outlier locations, color coded by type.',
  LocalMoran: 'Local Moran used to identify local clusters and outliers',
  NotSig:	'Area was not statistically signficant as a spatial cluster core or outlier using given parameters.',
  HighHigh: 'Hot Spot Cluster: area with high values, neighbored by areas with high values',
  LowLow: 'Cold Spot Cluster: area with low values, neighbored by areas with low values',
  HighLow: 'Hot Outlier: area with high values, neighbored by areas with low values',
  LowHigh: 'Low-High	Cold Outlier: area with low values, neighbored by areas with high values',
  PovChldPrc: 'Percentage of children under age 18 living in poverty',
  IncRt: 'Ratio of household income at the 80th percentile to income at the 20th percentile',
  MedianHouseholdIncome: 'The income where half of households in a county earn more and half of households earn less',
  FdInsPrc: 'Percentage of population who lack adequate access to food',
  UnEmplyPrc: 'Percentage of population age 16 and older unemployed but seeking work',
  UnInPrc: 'Percentage of people under age 65 without insurance',
  PrmPhysRt: 'Ratio of population to primary care physicians',
  PrevHospRt: 'Rate of hospital stays for ambulatory-care sensitive conditions per 100,000 Medicare enrollees',
  RsiSgrBlckRt: 'Index of dissimilarity where higher values indicate greater residential segregation between Black and White county residents',
  SvrHsngPrbRt: 'Percentage of households with at least 1 of 4 housing problems: overcrowding, high housing costs, lack of kitchen facilities, or lack of plumbing facilities',
  Over65YearsPrc: 'Percentage of people ages 65 and older',
  AdObPrc: 'Percentage of the adult population (age 20 and older) that reports a body mass index (BMI) greater than or equal to 30 kg/m2',
  AdDibPrc: 'Percentage of adults aged 20 and above with diagnosed diabetes',
  SmkPrc: 'Percentage of adults who are current smokers',
  ExcDrkPrc: 'Percentage of adults reporting binge or heavy drinking',
  DrOverdMrtRt: 'Number of drug poisoning deaths per 100,000 population',
  LfExpRt: 'Average number of years a person can expect to live',
  SlfHlthPrc: 'Percentage of adults reporting fair or poor health',
  SeverityIndex: 'Indicates the severity of the local covid-19 outbreak, based on cumulative and predicted deaths',
  PredictedDeaths: 'Predicted number of deaths for a county',
  PredictedDeathsInterval: 'Margin of error for predicted death counts for a county ',
  healthfactor:'Health factors represent those things we can modify to improve community conditions and the length and quality of life for residents',
  healthcontext: 'Community Health Context reflects the existing health behaviors and demographics of individuals in the community that are influenced by the opportunities to live long and well',
  healthlife:'Length and Quality of Life reflects the physical and mental well-being of residents within a community through measures representing how long and how well residents live',
  Hypersegregated: 'American metropolitan areas where black residents experience hypersegregation, see <a href="https://www.princeton.edu/news/2015/05/18/hypersegregated-cities-face-tough-road-change" target="_blank" rel="noopener noreferrer">here</a>',
  BlackBelt: 'Southern US counties that were at least 40% Black or African American in the 2000 Census, see <a href="https://en.wikipedia.org/wiki/Black_Belt_in_the_American_South" target="_blank" rel="noopener noreferrer">here</a>',
  TestingCapacity: 'New screening (e.g., antigen) and diagnostic (e.g., PCR) testing per capita rates by date. The suggested threshold is >150 daily tests per 100k people.',
  USCongress: 'Find your representative <a href="https://www.govtrack.us/" target="_blank" rel="noopener noreferrer">here</a>',
};

config.VARIABLES = [
  'Confirmed Count',
  'Confirmed Count per 100K Population',
  'Confirmed Count per Licensed Bed',
  'Death Count',
  'Death Count per 100K Population',
  'Death Count/Confirmed Count',
  'Daily New Confirmed Count',
  'Daily New Confirmed Count per 100K Pop',
  '7-Day Average Daily New Confirmed Count',
  '7-Day Average Daily New Confirmed Count per 100K Pop',
  'Daily New Death Count',
  'Daily New Death Count per 100K Pop',
  'Forecasting (5-Day Severity Index)',
  '7 Day Testing Positivity Rate %',
  '7 Day Testing Capacity',
  '7 Day Confirmed Cases per Testing %',
  'Uninsured % (Community Health Factor)',
  'Over 65 Years % (Community Health Context)',
  'Life expectancy (Length and Quality of Life)'
];

config.VALID = {}

config.VALID['state_usafacts.geojson'] = [
  'Confirmed Count',
  'Confirmed Count per 100K Population',
  'Confirmed Count per Licensed Bed',
  'Death Count',
  'Death Count per 100K Population',
  'Death Count/Confirmed Count',
  'Daily New Confirmed Count',
  'Daily New Confirmed Count per 100K Pop',
  '7-Day Average Daily New Confirmed Count',
  '7-Day Average Daily New Confirmed Count per 100K Pop',
  'Daily New Death Count',
  'Daily New Death Count per 100K Pop',
  'Forecasting (5-Day Severity Index)',
  '7 Day Testing Positivity Rate %',
  '7 Day Testing Capacity',
  '7 Day Confirmed Cases per Testing %',
];

config.VALID['state_1p3a.geojson'] = [
  'Confirmed Count',
  'Confirmed Count per 100K Population',
  'Confirmed Count per Licensed Bed',
  'Death Count',
  'Death Count per 100K Population',
  'Death Count/Confirmed Count',
  'Daily New Confirmed Count',
  'Daily New Confirmed Count per 100K Pop',
  '7-Day Average Daily New Confirmed Count',
  '7-Day Average Daily New Confirmed Count per 100K Pop',
  'Daily New Death Count',
  'Daily New Death Count per 100K Pop',
  'Forecasting (5-Day Severity Index)',
  '7 Day Testing Positivity Rate %',
  '7 Day Testing Capacity',
  '7 Day Confirmed Cases per Testing %',
];

config.VALID['county_1p3a.geojson'] = [
  'Confirmed Count',
  'Confirmed Count per 100K Population',
  'Confirmed Count per Licensed Bed',
  'Death Count',
  'Death Count per 100K Population',
  'Death Count/Confirmed Count',
  'Daily New Confirmed Count',
  'Daily New Confirmed Count per 100K Pop',
  '7-Day Average Daily New Confirmed Count',
  '7-Day Average Daily New Confirmed Count per 100K Pop',
  'Daily New Death Count',
  'Daily New Death Count per 100K Pop',
  'Forecasting (5-Day Severity Index)',
  'Uninsured % (Community Health Factor)',
  'Over 65 Years % (Community Health Context)',
  'Life expectancy (Length and Quality of Life)'
];

config.VALID['county_usfacts.geojson'] = [
  'Confirmed Count',
  'Confirmed Count per 100K Population',
  'Confirmed Count per Licensed Bed',
  'Death Count',
  'Death Count per 100K Population',
  'Death Count/Confirmed Count',
  'Daily New Confirmed Count',
  'Daily New Confirmed Count per 100K Pop',
  '7-Day Average Daily New Confirmed Count',
  '7-Day Average Daily New Confirmed Count per 100K Pop',
  'Daily New Death Count',
  'Daily New Death Count per 100K Pop',
  'Forecasting (5-Day Severity Index)',
  'Uninsured % (Community Health Factor)',
  'Over 65 Years % (Community Health Context)',
  'Life expectancy (Length and Quality of Life)'
];

config.DEFAULT = {}

config.DEFAULT['state_usafacts.geojson'] = '7-Day Average Daily New Confirmed Count per 100K Pop';
config.DEFAULT['county_1p3a.geojson'] = '7-Day Average Daily New Confirmed Count per 100K Pop';
config.DEFAULT['county_usfacts.geojson'] = '7-Day Average Daily New Confirmed Count per 100K Pop';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg';

const COLOR_SCALE = {
  'natural_breaks':[
    [240,240,240],
    // positive
    [255,255,204],
    [255,237,160],
    [254,217,118],
    [254,178,76],
    [253,141,60],
    [252,78,42],
    [227,26,28],
    [177,0,38],
    // [255, 255, 204],
    // [255, 237, 160],
    // [254, 217, 118],
    // [254, 178, 76],
    // [253, 141, 60],
    // [252, 78, 42],
    // [227, 26, 28],
    // [189, 0, 38],
    // [128, 0, 38],
  ],
  'natural_breaks_hlthfactor':[
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
  'natural_breaks_hlthcontextlife':[
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
  'hinge15_breaks' :  [
    [1, 102, 94],
    [90, 180, 172],
    [199, 234, 229],
    [246, 232, 195],
    [216, 179, 101],
    [140, 81, 10],
  ],
  'hinge30_breaks' :  [
    [69, 117, 180],
    [145, 191, 219],
    [220, 238, 243],
    [250, 227, 212],
    [233, 160, 124],
    [215, 48, 39],
  ],
  'forecasting' : [
    [240, 240, 240],
    [254,232,200],
    [253,187,132],
    [227,74,51],
  ],
  'testing_fixed_bins' : [
    [240,240,240],
    [13,8,135],
    [92,1,166],
    [156,23,158],
    [203,70,121],
    [237,121,83],
    [253,180,47],
    [240,249,33],
  ],
  'testing_cap_fixed_bins':[
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
};

const testing_breaks = {
  bins: ['No Data','<3%','5%','10%','15%','20%','>25%'],
  breaks:[0,3,5,10,15,20,25,Infinity]
}

const testing_cap_breaks = {
  bins: ['No Data','<50','100','150','200','250','300','350','>400'],
  breaks:[0,50,100,150,200,250,300,350,400,Infinity]
}

var lisa_labels = ["Not significant", "High-High", "Low-Low", "Low-High", "High-Low", "Undefined", "Isolated"];
var lisa_colors = ["#ffffff", "#FF0000", "#0000FF", "#a7adf9", "#f4ada8", "#464646", "#999999"];

const dataset_index = ['county_usfacts.geojson', 'county_1p3a.geojson', 'state_usafacts.geojson']

config.LEGEND_TEXT = {
  'Confirmed Count':'Confirmed Count',
  'Confirmed Count per 100K Population':'Confirmed Count per 100K Population',
  'Confirmed Count per Licensed Bed':'Confirmed Count per Licensed Bed',
  'Death Count':'Death Count',
  'Death Count per 100K Population':'Death Count per 100K Population',
  'Death Count/Confirmed Count':'Death Count/Confirmed Count',
  'Daily New Confirmed Count':'Daily New Confirmed Count',
  'Daily New Confirmed Count per 100K Pop':'Daily New Confirmed Count per 100K Pop',
  '7-Day Average Daily New Confirmed Count':'7-Day Average Daily New Confirmed Count',
  '7-Day Average Daily New Confirmed Count per 100K Pop':'7-Day Average Daily New Confirmed Count per 100K Pop',
  'Daily New Death Count':'Daily New Death Count',
  'Daily New Death Count per 100K Pop':'Daily New Death Count per 100K Pop',
  'Forecasting (5-Day Severity Index)':'Forecasting (5-Day Severity Index)',
  '7 Day Testing Positivity Rate %':'7 Day Testing Positivity Rate %',
  '7 Day Testing Capacity':`7 Day Testing Capacity Per 100k Population
    <div class="top info-tooltip" id="info-TestingCapacity">
      <i class="fa fa-info-circle" aria-hidden="true"></i>
        <span class="tooltip-text">New screening (e.g., antigen) and diagnostic (e.g., PCR) testing per capita rates by date. The suggested threshold is &gt;150 daily tests per 100k people.</span>
    </div>`,
  '7 Day Confirmed Cases per Testing %':'7 Day Confirmed Cases per Testing %',
  'Uninsured % (Community Health Factor)':'Uninsured % (Community Health Factor)',
  'Over 65 Years % (Community Health Context)':'Over 65 Years % (Community Health Context)',
  'Life expectancy (Length and Quality of Life)':'Life expectancy (Length and Quality of Life)'
}