/*
/*
 * DEPENDENCIES
*/

const {
  Deck,
  GeoJsonLayer,
  TextLayer,
  ScatterplotLayer,
  TileLayer,
  MapboxLayer,
  //FillStyleExtension
} = deck;

/* 
 * URL PARAMS
*/ 

var params_dict = {}; 
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
for (const [key, value] of urlParams ) { params_dict[key] = value; }
if (params_dict['cartogram']) document.getElementById('cartogram-ckb').checked = true;

function getURLParams(){
  let current_overlay = Object.keys(shouldShowOverlays).filter(t => shouldShowOverlays[t]);
  let overlay = current_overlay.length > 0 ? `&ovr=${current_overlay[0]}` : '';
  let current_resource = Object.keys(shouldShowResources).filter(t => shouldShowResources[t]);
  let resource = current_resource.length > 0 ? `&res=${current_resource[0]}` : '';
  let variable = (selectedVariable == "7-Day Average Daily New Confirmed Count"||selectedVariable==null) ? '' : `&var=${config.VALID[selectedDataset].indexOf(selectedVariable)}`;
  let method = (selectedMethod == "natural_breaks") ? '' : `&mthd=${selectedMethod}`;
  let source = (selectedDataset == "county_usfacts.geojson") ? '' : `&src=${dataset_index.indexOf(selectedDataset)}`;
  let date =  `&dt=${selectedDate}`;
  let center = mapbox.getCenter();
  let coords = `?lat=${Math.round(center.lat*1000)/1000}&lon=${Math.round(center.lng*1000)/1000}&z=${Math.round(mapbox.getZoom()*10)/10}`;
  let cartogram = isCartogram() ? `&cartogram=true` : '';

  return `${coords}${overlay}${resource}${variable}${method}${source}${date}${cartogram}&v=1`
}

const datasource_names = {
  'county_1p3a.geojson':'By County (1Point3Acres.com)',
  'state_1p3a.geojson':'By State (1Point3Acres.com)',
  'state_usafacts.geojson':'By State (UsaFacts.com)',
}

/*
 * UTILITIES
*/
function isInt(n) {
  return Number(n) === n && n % 1 === 0;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

function getDatesFromGeojson(data) {
  var xLabels = [];
  for (var col in data["features"][0]["properties"]) {
    if (col.startsWith("2020")) {
      xLabels.push(col);
    }
  }
  return xLabels;
}

/* 
 * TUTORIAL SETUP AND LISTENERS
*/
function setupTutorial(){
  let tutorialDiv = document.getElementById("panel-container")
  tutorialDiv.style.width = `${tutorialDiv.children.length*100}%` 

  let dotsContainer = document.getElementById("dots-container")
  let html = ''
  for (let i = 0; i < tutorialDiv.children.length; i++) {
    if (i == 0) {
      html += `<div class="dot-container active" id="dot-${i}" onclick="tutorialScroll(${i})"><svg viewBox="0 0 100 100" class="dot"><circle cx="50" cy="50" r="40" /></svg></div>`
    } else {
      html += `<div class="dot-container" id="dot-${i}" onclick="tutorialScroll(${i})"><svg viewBox="0 0 100 100" class="dot"><circle cx="50" cy="50" r="40" /></svg></div>`
    }
    
  }
  dotsContainer.innerHTML = html;
  showTutorial(true)
  document.getElementById("left-arrow").addEventListener("click", () => tutorialScroll('left'));
  document.getElementById("right-arrow").addEventListener("click", () => tutorialScroll('right'));
  document.getElementById("close-tutorial").addEventListener("click", () => showTutorial(false));
  document.getElementById("reset-tutorial").addEventListener("click", () => showTutorial(true));
  document.getElementById("close-notification").addEventListener("click", () => showNotification(false));
}

function tutorialScroll(val){
  let tutorialDiv = document.getElementById("panel-container")
  let currPosition = parseInt(tutorialDiv.style.left.slice(0,-1))

  let dots = document.getElementsByClassName("dot-container")
  for (let i=0; i<dots.length; i++){
    dots[i].className = "dot-container"
  }
  if (typeof(val) == "number") {
    tutorialDiv.style.left = `-${val*100}%`;
    dots[val].className = "dot-container active";
  } else if (val == 'left') {
    let leftVal = (currPosition + 100) > 0 ? (tutorialDiv.children.length-1)*-100 : (currPosition + 100);
    tutorialDiv.style.left = `${leftVal}%`
    dots[leftVal/-100].className = "dot-container active";
  } else {
    let leftVal = (currPosition - 100) < (tutorialDiv.children.length-1)*-100 ? 0 : (currPosition - 100);
    tutorialDiv.style.left = `${leftVal}%`
    dots[leftVal/-100].className = "dot-container active";
  }
}

function highlightElement(element, divType) {
  if (divType == "id") {
    let elem = document.getElementById(element);
    let currClass = `${elem.className}`

    elem.className = `${currClass} tutorial-highlight`

    setTimeout(function() {
      elem.className = currClass;
    },2000);
  } else {
    let elem = document.getElementsByClassName(element)[0];
    let currClass = `${elem.className}`

    elem.className = `${currClass} tutorial-highlight`

    let clearClass = setTimeout(function() {
      elem.className = currClass;
    },2000);

  }
}

function showTutorial(show){
  document.getElementById('tutorial').style.display = show ? 'initial' : 'none'
}

function showNotification(show){
  document.getElementById('alert-container').style.display = show ? 'initial' : 'none'
}

function GeolocateAndCloseNotification(){
  document.querySelector('.mapboxgl-ctrl-geolocate').click();
  showNotification(false)
}

setupTutorial()

/*
 * GLOBALS
*/
// layers
var layer_dict = {};

// data
var usafactsCases;
var usafactsDeaths;
var usafactsData;
var usaFactsStateData;
var usafactsStateCases;
var usafactsStateDeaths;
var usafactsStateCases;
var usafactsStateDeaths;
var usafactsStateData;
var usafactsStateTesting;
var usafactsStateTestingPos;
var usafactsStateTestingTcap;
var usafactsStateTestingCcpt;

var onep3aCases;
var onep3aDeaths;
var onep3aData;
var onep3aStateCases;
var onep3aStateDeaths;
var onep3aStateData;
var onep3aStateTesting;
var onep3aStateTestingPos;
var onep3aStateTestingTcap;
var onep3aStateTestingCcpt;

var populationData = {};
var bedsData = {};
var cartogramData;
var dates = {};
var caseData = {};
var deathsData = {};
var fatalityData = {};
var testingData = {};
var testingCriteriaData = {};
var testingPosData = {};
var testingTcapData = {};
var testingCcptData = {};
var lisaData = {
  'county_usfacts.geojson': {},
  'county_1p3a.geojson': {}
};

// this is an object indexed by county fips.
var chrhlthcontextData = {};
var chrhlthfactorData = {};
var chrhlthlifeData = {};
// county-level death predictions from the berkeley yu group
var berkeleyCountyData = {};

// ui elements
var choropleth_btn = document.getElementById("btn-nb");
var lisa_btn = document.getElementById("btn-lisa");
var data_btn = document.getElementById("select-data");
var source_btn = document.getElementById("select-source");
var initial_load = true;
var hasPromptedZoom = false;

// geoda
var gda_proxy;
var gda_weights = {};
// TODO what is this?
var jsondata = {};
var centroids = {};

// this tracks the map viewport and is used for a hack so that deck doesn't 
// always zoom to the initial lat/lng. set initial values here.
var mapPosition = {
  latitude: params_dict.lat ? params_dict.lat : -105.6500523,
  longitude: params_dict.lon ? params_dict.lon : 35.850033,
  zoom: params_dict.z ? params_dict.z : 3.5,
};

// misc
var colorScale;

var getFillColor = function() {
  return [255, 255, 255, 200];
};
var getLineColor = function() {
  return [220, 220, 220];
};


/*
 * STATE
*/

// the selected data source (e.g. county_usfacts.geojson)
// these look like dataset file name constants, but they are actually default
// values for state variables. for example, selectedDataset can change when switching
// between 1p3a counties and usafacts counties.
var selectedDataset = params_dict['src'] !== undefined ? dataset_index[parseInt(params_dict['src'])] : 'county_1p3a.geojson';
var selectedId = null;
var selectedDate = null;
var latestDate = null;
var use_fixed_bins = true; 
var selectedVariable = params_dict['var'] !== undefined ? config.VALID[selectedDataset][params_dict['var']] : config.DEFAULT[selectedDataset];
var selectedMethod = params_dict['mthd'] !== undefined ? decodeURI(params_dict['mthd']) !== 'lisa' ? decodeURI(params_dict['mthd']) : 'natural_breaks' : 'natural_breaks' // set cloropleth as default mode
var shouldShowLabels = false;
var cartogramDeselected = false;
var shouldShowOverlays = {
  'Reservations': false,
  'HypersegregatedCities': false,
  'BlackBelt': false,
  'USCongress': false,
}

var shouldShowResources = {
  'Clinics': false,
  'Hospitals': false,
  'ClinicsHospitals': false
}
if (params_dict['res'] !== undefined) shouldShowResources[params_dict['res']] = true;
if (params_dict['ovr'] !== undefined) shouldShowOverlays[params_dict['ovr']] = true;
if (params_dict['var'] != undefined) {
  data_btn.innerText = config.VALID[selectedDataset][params_dict['var']]
} else {
  data_btn.innerText = config.DEFAULT[selectedDataset]
}
if (params_dict['src']) source_btn.innerText = datasource_names[dataset_index[parseInt(params_dict['src'])]]

var stateMap =  'state_1p3a.geojson';//'state_usafacts.geojson';

function isState() {
  return source_btn.innerText.indexOf('State') >= 0;
}

function isLisa() {
  return selectedMethod == "lisa";
}

function isCartogram() {
//  return false;
return document.getElementById('cartogram-ckb').checked;
}

function getCurrentWuuid() {
  if (!(selectedDataset in gda_weights)) {
    var w = gda_proxy.CreateQueenWeights(selectedDataset, 1, 0, 0);
    gda_weights[selectedDataset] = w;
  }
  return {
    'map_uuid': selectedDataset,
    'w_uuid': gda_weights[selectedDataset].get_uid()
  };
}

function updateSelectedDataset(url, callback = () => {}) {
  // update selected dataset
  if (url.endsWith('county_usfacts.geojson')) {
    selectedDataset = 'county_usfacts.geojson';
  } else {
    if (url.endsWith('county_1p3a.geojson')) {
      selectedDataset = 'county_1p3a.geojson';
    } else {
      selectedDataset = 'state_1p3a.geojson'; //'state_usafacts.geojson';
    }
  }
  updateDates();
  callback();
}


/*
 * DATA LOADING
*/

// fetch county health rankings health factors
async function fetchChrHlthFactorData() {
  const rows = await GetParseCSV('../csv/chr_health_factors.csv');

  // index rows by "fips" (unique id)
  const rowsIndexed = rows.reduce((acc, row) => {
    acc[parseInt(row.FIPS)] = row;
    return acc;
  }, {});
  return rowsIndexed;
}

// fetch county health rankings health context indicators
async function fetchChrHlthContextData() {
  const rows = await GetParseCSV('../csv/chr_health_context.csv');

  // index rows by "fips" (unique id)
  const rowsIndexed = rows.reduce((acc, row) => {
    acc[parseInt(row.FIPS)] = row;
    return acc;
  }, {});
  return rowsIndexed;
}

// fetch county health rankings length and quality of life
async function fetchChrHlthLifeData() {
  const rows = await GetParseCSV('../csv/chr_life.csv');

  // index rows by "fips" (unique id)
  const rowsIndexed = rows.reduce((acc, row) => {
    acc[parseInt(row.FIPS)] = row;
    return acc;
  }, {});
  return rowsIndexed;
}

// fetch berkeley group death predictions and 5-day county severity index
async function fetchBerkeleyCountyData() {
  const rows = await GetParseCSV('../csv/berkeley_predictions.csv');

  // get dates too loop over for building `predictions` objects
  // TODO this assumes at least one row
  const fields = Object.keys(rows[0]);
  const dates = fields
    .map((field) => {
      const dateMatch = field.match(/deaths_(\d{4}_\d{2}_\d{2})/);

      if (!dateMatch || !dateMatch[1]) {
        return;
      }

      return dateMatch[1];
    })
    .filter((field) => !!field);

  // filter out rows that don't have a fips (this is a proxy for excluding the 
  // ~2k empty rows that appear to be an excel artifact)
  // TODO should this go into the data script?
  const rowsFiltered = rows.filter(row => row.fips);

  // index by fips and put predictions in nested object
  const rowsIndexed = rowsFiltered.reduce((acc, row) => {
    const { 
      fips,
      severity_index: severityIndex,
    } = row;
    const fipsInt = parseInt(fips);

    const predictions = dates.reduce((acc, date) => {
      const deaths = parseFloat(row[`deaths_${date}`]);
      const intervalsRaw = row[`deaths_intervals_${date}`];

      // parse intervals
      const intervals = intervalsRaw
        .replace('(', '')
        .replace(')', '')
        .split(', ')
        .reduce((acc, val, i) => {
          const label = {
            0: 'min',
            1: 'max',
          }[i];

          acc[label] = parseFloat(val);

          return acc;
        }, {});

      acc[date] = {
        deaths,
        intervals,
      };

      return acc;
    }, {});

    acc[fipsInt] = {
      severityIndex,
      predictions,
    };
    return acc;
  }, {});

  return rowsIndexed;
}

async function GetParseCSV(url){
  const tempData = await fetch(url).then(function(response) {
    return response.ok ? response.text() : Promise.reject(response.status);
    }).then(function(text) {
      return d3.csvParse(text, d3.autoType);
  });
  return tempData;
}

// this is effectively the entry point for data loading, since usafacts is the
// dataset selected by default. note that it has side effects unrelated to data
// fetching, namely updating selectedDataset.
async function loadUsafactsData(url, callback) {
  // load usfacts geojson data
  const responseForJson = await fetch(url);
  const responseForArrayBuffer = responseForJson.clone();
  
  // read as geojson for map
  const json = await responseForJson.json();
  const featuresWithIds = assignIdsToFeatures(json);

  usafactsData = featuresWithIds;
  // load cases and deaths in parallel. also load "supplemental" data (e.g. chr)
  // note that because these are being destructured to pre-defined globals,
  // this has the side effect of loading data into state.
  [
    usafactsCases,
    usafactsDeaths,
    chrhlthfactorData,
    chrhlthcontextData,
    chrhlthlifeData,
    berkeleyCountyData,
  ] = await Promise.all([
    GetParseCSV('../csv/covid_confirmed_usafacts.csv'),
    GetParseCSV('../csv/covid_deaths_usafacts.csv'),
    fetchChrHlthFactorData(),
    fetchChrHlthContextData(),
    fetchChrHlthLifeData(),
    fetchBerkeleyCountyData(),
  ]);

  // update state
  // TODO isn't there a function that does this?
  updateSelectedDataset(selectedDataset);

  // merge usfacts csv data
  parseUsaFactsData(featuresWithIds, usafactsCases, usafactsDeaths); //usafactsTesting, usafactsTestingPos, usafactsTestingTcap, usafactsTestingCcpt
  jsondata[selectedDataset] = featuresWithIds;

  // read as bytearray for GeoDaWASM
  const arrayBuffer = await responseForArrayBuffer.arrayBuffer();

  gda_proxy.ReadGeojsonMap(url, {
    result: arrayBuffer,
  });

  // get centroids for cartogram
  centroids[selectedDataset] = gda_proxy.GetCentroids(url);

  callback();
}
async function load1p3aCountyData(url, callback) {
  // load 1p3a geojson data
  const responseForJson = await fetch(url);
  const responseForArrayBuffer = responseForJson.clone();
  
  // read as geojson for map
  const json = await responseForJson.json();
  const featuresWithIds = assignIdsToFeatures(json);
  onep3aData = featuresWithIds;

  // load cases and deaths in parallel. also load "supplemental" data (e.g. chr)
  // note that because these are being destructured to pre-defined globals,
  // this has the side effect of loading data into state.
  if (chrhlthfactorData.length > 0) {
    [
      onep3aCases,
      onep3aDeaths,
      chrhlthfactorData,
      chrhlthcontextData,
      chrhlthlifeData,
      berkeleyCountyData,
    ] = await Promise.all([
      GetParseCSV('../csv/covid_confirmed_1p3a.csv'),
      GetParseCSV('../csv/covid_deaths_1p3a.csv'),
      chrhlthfactorData,
      chrhlthcontextData,
      chrhlthlifeData,
      berkeleyCountyData,
    ]);
  } else {
    [
      onep3aCases,
      onep3aDeaths,
      chrhlthfactorData,
      chrhlthcontextData,
      chrhlthlifeData,
      berkeleyCountyData,
    ] = await Promise.all([
      GetParseCSV('../csv/covid_confirmed_1p3a.csv'),
      GetParseCSV('../csv/covid_deaths_1p3a.csv'),
      fetchChrHlthFactorData(),
      fetchChrHlthContextData(),
      fetchChrHlthLifeData(),
      fetchBerkeleyCountyData(),
    ]);
  }

  // update state
  // TODO isn't there a function that does this?
  updateSelectedDataset(selectedDataset);

  // merge usfacts csv data
  parse1P3ACountyData(featuresWithIds, onep3aCases, onep3aDeaths); //usafactsTesting, usafactsTestingPos, usafactsTestingTcap, usafactsTestingCcpt
  jsondata[selectedDataset] = featuresWithIds;

  // read as bytearray for GeoDaWASM
  const arrayBuffer = await responseForArrayBuffer.arrayBuffer();

  gda_proxy.ReadGeojsonMap(url, {
    result: arrayBuffer,
  });

  // get centroids for cartogram
  centroids[selectedDataset] = gda_proxy.GetCentroids(url);

  callback();
}

async function load1p3aStateData(url, callback) {
  // load 1p3a geojson data
  const responseForJson = await fetch(url);
  const responseForArrayBuffer = responseForJson.clone();
  
  // read as geojson for map
  const json = await responseForJson.json();
  const featuresWithIds = assignIdsToFeatures(json);
  onep3aStateData = featuresWithIds;

  // load cases and deaths in parallel. also load "supplemental" data (e.g. chr)
  // note that because these are being destructured to pre-defined globals,
  // this has the side effect of loading data into state.
  if (chrhlthfactorData.length > 0) {
    [
      onep3aStateCases,
      onep3aStateDeaths,
      onep3aStateTesting,
      onep3aStateTestingPos,
      onep3aStateTestingTcap,
      onep3aStateTestingCcpt,
      chrhlthfactorData,
      chrhlthcontextData,
      chrhlthlifeData,
      berkeleyCountyData,
    ] = await Promise.all([
      GetParseCSV('../csv/covid_confirmed_1p3a_state.csv'),
      GetParseCSV('../csv/covid_deaths_1p3a_state.csv'),
      GetParseCSV('../csv/covid_testing_1p3a_state.csv'),
      GetParseCSV('../csv/covid_wk_pos_1p3a_state.csv'),
      GetParseCSV('../csv/covid_tcap_1p3a_state.csv'),
      GetParseCSV('../csv/covid_ccpt_1p3a_state.csv'),
      chrhlthfactorData,
      chrhlthcontextData,
      chrhlthlifeData,
      berkeleyCountyData,
    ]);
  } else {
    [
      onep3aStateCases,
      onep3aStateDeaths,
      onep3aStateTesting,
      onep3aStateTestingPos,
      onep3aStateTestingTcap,
      onep3aStateTestingCcpt,
      chrhlthfactorData,
      chrhlthcontextData,
      chrhlthlifeData,
      berkeleyCountyData,
    ] = await Promise.all([
      GetParseCSV('../csv/covid_confirmed_1p3a_state.csv'),
      GetParseCSV('../csv/covid_deaths_1p3a_state.csv'),
      GetParseCSV('../csv/covid_testing_1p3a_state.csv'),
      GetParseCSV('../csv/covid_wk_pos_1p3a_state.csv'),
      GetParseCSV('../csv/covid_tcap_1p3a_state.csv'),
      GetParseCSV('../csv/covid_ccpt_1p3a_state.csv'),
      fetchChrHlthFactorData(),
      fetchChrHlthContextData(),
      fetchChrHlthLifeData(),
      fetchBerkeleyCountyData(),
    ]);
  }

  // update state
  // TODO isn't there a function that does this?
  updateSelectedDataset(selectedDataset);

  // merge usfacts csv data
  parse1P3AStateData(featuresWithIds, onep3aStateCases, onep3aStateDeaths, onep3aStateTesting, onep3aStateTestingPos, onep3aStateTestingTcap, onep3aStateTestingCcpt); //usafactsTesting, usafactsTestingPos, usafactsTestingTcap, usafactsTestingCcpt
  jsondata[selectedDataset] = featuresWithIds;

  // read as bytearray for GeoDaWASM
  const arrayBuffer = await responseForArrayBuffer.arrayBuffer();

  gda_proxy.ReadGeojsonMap(url, {
    result: arrayBuffer,
  });

  // get centroids for cartogram
  centroids[selectedDataset] = gda_proxy.GetCentroids(url);

  callback();
}

async function loadUSAFactsStateData(url, callback) {
  // load 1p3a geojson data
  const responseForJson = await fetch(url);
  const responseForArrayBuffer = responseForJson.clone();
  
  // read as geojson for map
  const json = await responseForJson.json();
  const featuresWithIds = assignIdsToFeatures(json);
  usaFactsStateData = featuresWithIds;

  // load cases and deaths in parallel. also load "supplemental" data (e.g. chr)
  // note that because these are being destructured to pre-defined globals,
  // this has the side effect of loading data into state.
  if (chrhlthfactorData.length > 0) {
    [
      usafactsStateCases,
      usafactsStateDeaths,
      usafactsStateTesting,
      usafactsStateTestingPos,
      usafactsStateTestingTcap,
      usafactsStateTestingCcpt,
      chrhlthfactorData,
      chrhlthcontextData,
      chrhlthlifeData,
      berkeleyCountyData,
    ] = await Promise.all([
      GetParseCSV('../csv/covid_confirmed_usafacts_state.csv'),
      GetParseCSV('../csv/covid_deaths_usafacts_state.csv'),
      GetParseCSV('../csv/covid_testing_usafacts_state.csv'),
      GetParseCSV('../csv/covid_wk_pos_usafacts_state.csv'),
      GetParseCSV('../csv/covid_tcap_usafacts_state.csv'),
      GetParseCSV('../csv/covid_ccpt_usafacts_state.csv'),
      chrhlthfactorData,
      chrhlthcontextData,
      chrhlthlifeData,
      berkeleyCountyData,
    ]);
  } else {
    [
      usafactsStateCases,
      usafactsStateDeaths,
      usafactsStateTesting,
      usafactsStateTestingPos,
      usafactsStateTestingTcap,
      usafactsStateTestingCcpt,
      chrhlthfactorData,
      chrhlthcontextData,
      chrhlthlifeData,
      berkeleyCountyData,
    ] = await Promise.all([
      GetParseCSV('../csv/covid_confirmed_usafacts_state.csv'),
      GetParseCSV('../csv/covid_deaths_usafacts_state.csv'),
      GetParseCSV('../csv/covid_testing_usafacts_state.csv'),
      GetParseCSV('../csv/covid_wk_pos_usafacts_state.csv'),
      GetParseCSV('../csv/covid_tcap_usafacts_state.csv'),
      GetParseCSV('../csv/covid_ccpt_usafacts_state.csv'),
      fetchChrHlthFactorData(),
      fetchChrHlthContextData(),
      fetchChrHlthLifeData(),
      fetchBerkeleyCountyData(),
    ]);
  }

  // update state
  // TODO isn't there a function that does this?
  updateSelectedDataset(selectedDataset);
  
  // merge usfacts csv data
  parseUsafactsStateData(featuresWithIds, usafactsStateCases,usafactsStateDeaths,usafactsStateTesting,usafactsStateTestingPos,usafactsStateTestingTcap,usafactsStateTestingCcpt); //usafactsTesting, usafactsTestingPos, usafactsTestingTcap, usafactsTestingCcpt
  jsondata[selectedDataset] = featuresWithIds;

  // read as bytearray for GeoDaWASM
  const arrayBuffer = await responseForArrayBuffer.arrayBuffer();

  gda_proxy.ReadGeojsonMap(url, {
    result: arrayBuffer,
  });

  // get centroids for cartogram
  centroids[selectedDataset] = gda_proxy.GetCentroids(url);

  callback();
}


// this takes a url and loads the data source (if it hasn't been already)
// note: the url is generally just the file name, since these are local to the
// project
function loadData(url, callback) {
  // check if the data has already been loaded (it goes into the geoda proxy)
  if (gda_proxy.Has(url)) {
    updateSelectedDataset(url, callback);
  // otherwise, we need to fetch the data  
  } else if (url.endsWith('county_usfacts.geojson')) {
    loadUsafactsData(url, callback);
  } else if (url.endsWith('county_1p3a.geojson')) {
    load1p3aCountyData(url, callback);
  } else if (url.endsWith('state_1p3a.geojson')) {
    load1p3aStateData(url, callback);
  } else {
    loadUSAFactsStateData(url,callback);
  }
}

function getDatesFromUsafacts(cases) {
  var xLabels = [];
  let n = cases.length;
  for (let col in cases[0]) {
    if (col.endsWith('20')||col.endsWith('21')) {
      xLabels.push(col);
    }
  }
  return xLabels;
}

function getDatesFrom1p3a(cases) {
  var xLabels = [];
  let n = cases.length;
  for (let col in cases[0]) {
    if (col.startsWith('20')||col.startsWith('21')) {
      xLabels.push(col);
    }
  }
  return xLabels;
}

function parseUsaFactsData(data, confirm_data, death_data) { // testing, testingpos, testingtcap, testingccpt
  
  let json = selectedDataset;
  
  if (!(json in caseData)) caseData[json] = {};
  if (!(json in deathsData)) deathsData[json] = {};
  if (!(json in fatalityData)) fatalityData[json] = {};
  if (!(json in populationData)) populationData[json] = {};
  if (!(json in bedsData)) bedsData[json] = {};

  dates[selectedDataset] = getDatesFromUsafacts(confirm_data);
  if (params_dict['dt'] !== undefined && initial_load) {
    selectedDate == decodeURI(params_dict['dt']);
    latestDate = dates[selectedDataset][dates[selectedDataset].length - 1];
  } else if (selectedDate == null || selectedDate.indexOf('-') >= 0) {
    selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];
    latestDate = selectedDate;
  }

  let conf_dict = {};
  let death_dict = {};

  for (let i = 0; i < confirm_data.length; ++i) {
    conf_dict[confirm_data[i].countyFIPS] = confirm_data[i];
    death_dict[death_data[i].countyFIPS] = death_data[i];
  }
  for (let i = 0; i < data.features.length; i++) {
    let pop = data.features[i].properties.population;
    let geoid = parseInt(data.features[i].properties.GEOID);
    let beds = data.features[i].properties.beds;
    let criteria = data.features[i].properties.criteria;
    
    populationData[json][i] = pop;
    bedsData[json][i] = beds;
    // confirmed count
    let j =  dates[selectedDataset].length
    if (!(geoid in conf_dict)) {
      console.log("UsaFacts does not have:", data.features[i].properties);
      while (j>0) {
        j--;
        let d = dates[selectedDataset][j];
        caseData[json][d][i] = 0;
        deathsData[json][d][i] = 0;
        fatalityData[json][d][i] = 0;
      }
      continue;
    } else {
      while (j>0) {
        j--;
        let d = dates[selectedDataset][j];
        if (!(d in caseData[json])) {
          caseData[json][d] = {};
          deathsData[json][d] = {};
          fatalityData[json][d] = {};
        }

        caseData[json][d][i] = conf_dict[geoid][d] == '' ? 0 : conf_dict[geoid][d];
        deathsData[json][d][i] = death_dict[geoid][d] == '' ? 0 : death_dict[geoid][d];
        fatalityData[json][d][i] = 0;

        if (caseData[json][d][i] > 0) fatalityData[json][d][i] = deathsData[json][d][i] / caseData[json][d][i];

      }
    }
  }
}

function parse1P3ACountyData(data, confirm_data, death_data) { // testing, testingpos, testingtcap, testingccpt
  let json = selectedDataset;
  
  if (!(json in caseData)) caseData[json] = {};
  if (!(json in deathsData)) deathsData[json] = {};
  if (!(json in fatalityData)) fatalityData[json] = {};
  if (!(json in populationData)) populationData[json] = {};
  if (!(json in bedsData)) bedsData[json] = {};

  dates[selectedDataset] = getDatesFrom1p3a(confirm_data);
  if (params_dict['dt'] !== undefined && initial_load) {
    selectedDate == decodeURI(params_dict['dt']);
    latestDate = dates[selectedDataset][dates[selectedDataset].length - 1];
  } else if (selectedDate == null || selectedDate.indexOf('-') >= 0) {
    selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];
    latestDate = selectedDate;
  }

  let conf_dict = {};
  let death_dict = {};

  for (let i = 0; i < confirm_data.length; ++i) {
    conf_dict[confirm_data[i].GEOID] = confirm_data[i];
    death_dict[death_data[i].GEOID] = death_data[i];
  }

  for (let i = 0; i < data.features.length; i++) {
    let pop = data.features[i].properties.population;
    let geoid = parseInt(data.features[i].properties.GEOID);
    let beds = data.features[i].properties.beds;

    populationData[json][i] = pop;
    bedsData[json][i] = beds;

    let j = 0;
    if (!(geoid in conf_dict)) {
      console.log("1P3A Counties does not have:", data.features[i].properties);
      while (j < dates[selectedDataset].length) {
        let d = dates[selectedDataset][j];
        caseData[json][d][i] = 0;
        deathsData[json][d][i] = 0;
        fatalityData[json][d][i] = 0;
        j++;
      }
      continue;
    } else {
      while (j < dates[selectedDataset].length) {
        let d = dates[selectedDataset][j];
        if (!(d in caseData[json])) {
          caseData[json][d] = {};
          deathsData[json][d] = {};
          fatalityData[json][d] = {};
        }
        // after the first iteration
        if (j > 0) {
          // get last date by index
          var d1 = dates[selectedDataset][j - 1];
          // case data with accumulation
          caseData[json][d][i] = caseData[json][d1][i] + (conf_dict[geoid][d] == '' ? 0 : conf_dict[geoid][d]);
          // death data with accumulation
          deathsData[json][d][i] = deathsData[json][d1][i] + (death_dict[geoid][d] == '' ? 0 : death_dict[geoid][d]);
          // fatality data
          fatalityData[json][d][i] = 0;
        } else {
          // first date case data
          caseData[json][d][i] = conf_dict[geoid][d] == '' ? 0 : conf_dict[geoid][d];
          // first date death data
          deathsData[json][d][i] = death_dict[geoid][d] == '' ? 0 : death_dict[geoid][d];
          fatalityData[json][d][i] = 0;
        }
        // if non-zero fatality, calculate fatality
        if (caseData[json][d][i] > 0) fatalityData[json][d][i] = deathsData[json][d][i] / caseData[json][d][i];
        j++;
      }
    }
  }
}

function parseUsafactsStateData(data, confirm_data, death_data, testing, testingpos, testingtcap, testingccpt) {
  let json = selectedDataset;
  
  if (!(json in caseData)) caseData[json] = {};
  if (!(json in deathsData)) deathsData[json] = {};
  if (!(json in fatalityData)) fatalityData[json] = {};
  if (!(json in populationData)) populationData[json] = {};
  if (!(json in bedsData)) bedsData[json] = {};
  if (!(json in testingData)) testingData[json] = {};
  if (!(json in testingCriteriaData)) testingCriteriaData[json] = {};
  if (!(json in testingTcapData)) testingTcapData[json] = {};
  if (!(json in testingCcptData)) testingCcptData[json] = {};
  if (!(json in testingPosData)) testingPosData[json] = {};

  dates[selectedDataset] = getDatesFromUsafacts(confirm_data);
  if (params_dict['dt'] !== undefined && initial_load) {
    selectedDate == decodeURI(params_dict['dt']);
    latestDate = dates[selectedDataset][dates[selectedDataset].length - 1];
  } else if (selectedDate == null || selectedDate.indexOf('-') >= 0) {
    selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];
    latestDate = selectedDate;
  }

  let conf_dict = {};
  let death_dict = {};
  let testing_dict = {};
  let testingtcap_dict = {};
  let testingccpt_dict = {};
  let testingpos_dict = {};

  for (let i = 0; i < confirm_data.length; ++i) {
    conf_dict[confirm_data[i].stateFIPS] = confirm_data[i];
    death_dict[death_data[i].stateFIPS] = death_data[i];
    testing_dict[testing[i].stateFIPS] = testing[i];
    testingtcap_dict[testingtcap[i].stateFIPS] = testingtcap[i];
    testingccpt_dict[testingccpt[i].stateFIPS] = testingccpt[i];
    testingpos_dict[testingpos[i].stateFIPS] = testingpos[i];
  }

  for (let i = 0; i < data.features.length; i++) {
    let pop = data.features[i].properties.population;
    let geoid = parseInt(data.features[i].properties.GEOID);
    let beds = data.features[i].properties.beds;
    let criteria = data.features[i].properties.criteria;
    
    populationData[json][i] = pop;
    bedsData[json][i] = beds;
    testingCriteriaData[json][i] = criteria;

    let j = 0;
    if (!(geoid in conf_dict)) {
      console.log("UsaFacts states does not have:", data.features[i].properties);
      while (j < dates[selectedDataset].length) {
        let d = dates[selectedDataset][j];
        caseData[json][d][i] = 0;
        deathsData[json][d][i] = 0;
        fatalityData[json][d][i] = 0;
        testingData[json][d][i] = 0;
        testingTcapData[json][d][i] = 0;
        testingCcptData[json][d][i] = 0;
        testingPosData[json][d][i] = 0;
        j++;
      }
      continue;
    } else {
      while (j < dates[selectedDataset].length) {
        let d = dates[selectedDataset][j];
        if (!(d in caseData[json])) {
          caseData[json][d] = {};
          deathsData[json][d] = {};
          fatalityData[json][d] = {};
          testingData[json][d] = {};
          testingTcapData[json][d] = {};
          testingCcptData[json][d] = {};
          testingPosData[json][d] = {};
        }
        // first date case data
        caseData[json][d][i] = conf_dict[geoid][d] == '' ? 0 : conf_dict[geoid][d];
        // first date death data
        deathsData[json][d][i] = death_dict[geoid][d] == '' ? 0 : death_dict[geoid][d];
        fatalityData[json][d][i] = 0;

        // if non-zero fatality, calculate fatality
        if (caseData[json][d][i] > 0) fatalityData[json][d][i] = deathsData[json][d][i] / caseData[json][d][i];
        // testing data
        testingData[json][d][i] = testing_dict[geoid][d] == '' ? -1 : testing_dict[geoid][d];
        testingTcapData[json][d][i] = testingtcap_dict[geoid][d] == '' ? -1 : testingtcap_dict[geoid][d];
        testingCcptData[json][d][i] = testingccpt_dict[geoid][d] == '' ? -1 : testingccpt_dict[geoid][d];
        testingPosData[json][d][i] = testingpos_dict[geoid][d] == '' ? -1 : testingpos_dict[geoid][d];
        j++;
      }
    }
  }
}

function parse1P3AStateData(data, confirm_data, death_data, testing, testingpos, testingtcap, testingccpt) {
  let json = selectedDataset;
  
  if (!(json in caseData)) caseData[json] = {};
  if (!(json in deathsData)) deathsData[json] = {};
  if (!(json in fatalityData)) fatalityData[json] = {};
  if (!(json in populationData)) populationData[json] = {};
  if (!(json in bedsData)) bedsData[json] = {};
  if (!(json in testingData)) testingData[json] = {};
  if (!(json in testingCriteriaData)) testingCriteriaData[json] = {};
  if (!(json in testingTcapData)) testingTcapData[json] = {};
  if (!(json in testingCcptData)) testingCcptData[json] = {};
  if (!(json in testingPosData)) testingPosData[json] = {};

  dates[selectedDataset] = getDatesFrom1p3a(confirm_data);
  if (params_dict['dt'] !== undefined && initial_load) {
    selectedDate == decodeURI(params_dict['dt']);
    latestDate = dates[selectedDataset][dates[selectedDataset].length - 1];
  } else if (selectedDate == null || selectedDate.indexOf('-') >= 0) {
    selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];
    latestDate = selectedDate;
  }

  let conf_dict = {};
  let death_dict = {};
  let testing_dict = {};
  let testingtcap_dict = {};
  let testingccpt_dict = {};
  let testingpos_dict = {};

  for (let i = 0; i < confirm_data.length; ++i) {
    conf_dict[confirm_data[i].GEOID] = confirm_data[i];
    death_dict[death_data[i].GEOID] = death_data[i];
    testing_dict[testing[i].GEOID] = testing[i];
    testingtcap_dict[testingtcap[i].GEOID] = testingtcap[i];
    testingccpt_dict[testingccpt[i].GEOID] = testingccpt[i];
    testingpos_dict[testingpos[i].GEOID] = testingpos[i];
  }
  
  for (let i = 0; i < data.features.length; i++) {
    let pop = data.features[i].properties.population;
    let geoid = parseInt(data.features[i].properties.GEOID);
    let beds = data.features[i].properties.beds;
    let criteria = data.features[i].properties.criteria;
    
    populationData[json][i] = pop;
    bedsData[json][i] = beds;
    testingCriteriaData[json][i] = criteria;

    let j = 0;
    if (!(geoid in conf_dict)) {
      console.log("1P3A Counties does not have:", data.features[i].properties);
      while (j < dates[selectedDataset].length) {
        let d = dates[selectedDataset][j];
        caseData[json][d][i] = 0;
        deathsData[json][d][i] = 0;
        fatalityData[json][d][i] = 0;
        testingData[json][d][i] = 0;
        testingTcapData[json][d][i] = 0;
        testingCcptData[json][d][i] = 0;
        testingPosData[json][d][i] = 0;
        j++;
      }
      continue;
    } else {
      while (j < dates[selectedDataset].length) {
        let d = dates[selectedDataset][j];
        if (!(d in caseData[json])) {
          caseData[json][d] = {};
          deathsData[json][d] = {};
          fatalityData[json][d] = {};
          testingData[json][d] = {};
          testingTcapData[json][d] = {};
          testingCcptData[json][d] = {};
          testingPosData[json][d] = {};
        }
        // after the first iteration
        if (j > 0) {
          // get last date by index
          var d1 = dates[selectedDataset][j - 1];
          // case data with accumulation
          caseData[json][d][i] = caseData[json][d1][i] + (conf_dict[geoid][d] == '' ? 0 : conf_dict[geoid][d]);
          // death data with accumulation
          deathsData[json][d][i] = deathsData[json][d1][i] + (death_dict[geoid][d] == '' ? 0 : death_dict[geoid][d]);
          // fatality data
          fatalityData[json][d][i] = 0;
        } else {
          // first date case data
          caseData[json][d][i] = conf_dict[geoid][d] == '' ? 0 : conf_dict[geoid][d];
          // first date death data
          deathsData[json][d][i] = death_dict[geoid][d] == '' ? 0 : death_dict[geoid][d];
          fatalityData[json][d][i] = 0;
        }
        // if non-zero fatality, calculate fatality
        if (caseData[json][d][i] > 0) fatalityData[json][d][i] = deathsData[json][d][i] / caseData[json][d][i];
        // testing data
        testingData[json][d][i] = testing_dict[geoid][d] == '' ? -1 : testing_dict[geoid][d];
        testingTcapData[json][d][i] = testingtcap_dict[geoid][d] == '' ? -1 : testingtcap_dict[geoid][d];
        testingCcptData[json][d][i] = testingccpt_dict[geoid][d] == '' ? -1 : testingccpt_dict[geoid][d];
        testingPosData[json][d][i] = testingpos_dict[geoid][d] == '' ? -1 : testingpos_dict[geoid][d];
        j++;
      }
    }
  }
}

function updateDates() {
  // since 1P3A has different date format than usafacts
  if (selectedDataset == 'county_usfacts.geojson') {
    // todo: the following line should be updated to current date
    dates[selectedDataset] = getDatesFromUsafacts(usafactsCases);
    if (selectedDate == null || selectedDate.indexOf('-') >= 0) {
      selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];
      latestDate = selectedDate;
    }
  } else if (selectedDataset == 'county_1p3a.geojson') {
    // todo: the following line should be updated to current date
    dates[selectedDataset] = getDatesFrom1p3a(onep3aCases);
    if (selectedDate == null || selectedDate.indexOf('/') >= 0) {
      selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];
      latestDate = selectedDate;
    }
  } else if (selectedDataset == 'state_1p3a.geojson') {
    // todo: the following line should be updated to current date
    dates[selectedDataset] = getDatesFrom1p3a(onep3aCases);
    if (selectedDate == null || selectedDate.indexOf('/') >= 0) {
      selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];
      latestDate = selectedDate;
    }
  } else {
    // todo: the following line should be updated to current date
    dates[selectedDataset] = getDatesFromUsafacts(usafactsStateCases);
    if (selectedDate == null || selectedDate.indexOf('-') >= 0) {
      selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];
      latestDate = selectedDate;
    }
  }

  if (params_dict['dt'] != undefined && initial_load) {
    selectedDate = decodeURI(params_dict['dt'])
  }

}

/*
 * NEW DATA PARSERS
*/

function mergeData(featureCollection, featureCollectionJoinCol, joinData, joinDataNames, joinDataCol) { // testing, testingpos, testingtcap, testingccpt
  // declare parent dictionaries
  let features = {}
  let dataDicts = {}

  // declare and prep feature collection object
  let i = featureCollection.features.length;
  let colNumCheck = parseInt(featureCollection.features[0].properties[featureCollectionJoinCol])
  if (Number.isInteger(colNumCheck)) {
    while (i>0) {
      i--;
      features[parseInt(featureCollection.features[i].properties[featureCollectionJoinCol])] = featureCollection.features[i];
    }
  } else {
    while (i>0) {
      i--;
      features[featureCollection.features[i].properties[featureCollectionJoinCol]] = featureCollection.features[i];
    }
  }

  // declare data objects
  for (let n=0; n < joinDataNames.length; n++) {
    dataDicts[`${joinDataNames[n]}`] = {}
  }

  // loop through data and add to dictionaries
  i = joinData[0].length;
  while (i>0) {
    i--;
    for (let n=0; n<joinData.length; n++) {
      dataDicts[joinDataNames[n]][joinData[n][i][joinDataCol]] = {[`${joinDataNames[n]}`]: joinData[n][i]}
    }
  }

  // use lodash to merge data
  let merged = _.merge(features, dataDicts[joinDataNames[0]])
  for (let n=1; n < joinDataNames.length; n++){
    merged = _.merge(merged, dataDicts[joinDataNames[n]])
  }

  return merged;
}

function GetDailyData(data, dataset, date) {
   
  let tempKeys = Object.keys(data);
  let i = tempKeys.length;
  let tempArr = [];
  
  while (i--){
    try {
      tempArr.unshift(data[tempKeys[i]][dataset][date])  
    } catch {
      //
    }
  }

  return tempArr
}
/*
 * UI / EVENT HANDLERS
*/

function ToggleDarkMode(evt)
{
  const isDark = document.querySelector('.fa-toggle-on') ? true : false;
  if (isDark) {
    evt.classList.remove("fa-toggle-on");
    evt.classList.add("fa-toggle-off");
    mapbox.setStyle('mapbox://styles/lixun910/ckg8gz59r5kz119pe0yfx0lwb?fresh=true');
  } else {
    evt.classList.remove("fa-toggle-off");
    evt.classList.add("fa-toggle-on");
    mapbox.setStyle('mapbox://styles/lixun910/ckg8gz59r5kz119pe0yfx0lwb?fresh=true');
  }
  setTimeout(function() {
    // create/re-create maps
    const data = jsondata[selectedDataset];
    createMap(data);
  },500);
}

// this is the callback for when a county dataset is selected. it is also the
// rendering function that gets called on load.
function OnCountyClick(target) {
  updateTooltips();
  loadData(selectedDataset, initCounty);
}


function initCounty() {
  var vals;
  var nb;

  if (use_fixed_bins) {
    vals = GetDataValues(latestDate);
  } else {
    vals = GetDataValues();
  }
  
  var num_cat = 6;
  if (selectedMethod == "natural_breaks" || selectedMethod == "natural_breaks_hlthfactor" || selectedMethod == "natural_breaks_hlthcontextlife") num_cat = 8;
  nb = gda_proxy.custom_breaks(selectedDataset, "natural_breaks", num_cat, null, vals);
  var legend_bins;

  if (selectedMethod == "forecasting") {
    // hard coded color scheme for forecasting
    legend_bins = [0, 1, 2, 3];
    // update legend title
    // document.getElementById('legend_title').innerText = "Severity Index";

    colorScale = function (x) {
      return COLOR_SCALE[selectedMethod][vals[x]]; 
    };
  } else {
    // apply natural_breaks or box_plot
    var num_cat = 6;
    if (selectedMethod == "natural_breaks" || selectedMethod == "natural_breaks_hlthfactor" || selectedMethod == "natural_breaks_hlthcontextlife") { 
      num_cat = 8; // hard coded to 8 categories
    }
    if (selectedMethod == "natural_breaks_hlthfactor" || selectedMethod == "natural_breaks_hlthcontextlife"){
      nb = gda_proxy.custom_breaks(selectedDataset, "natural_breaks", num_cat, null, vals);
    } else if (selectedMethod == "testing_fixed_bins") {
      nb = testing_breaks;
    } else if (selectedMethod == "testing_cap_fixed_bins") {
      nb = testing_cap_breaks;
    } else {
      nb = gda_proxy.custom_breaks(selectedDataset, selectedMethod, num_cat, null, vals);
    }
    legend_bins = nb.bins;

    colorScale = function (v) {
      const x = GetFeatureValue(v)

      if (selectedMethod == "natural_breaks" || selectedMethod == "natural_breaks_hlthfactor" || selectedMethod == "natural_breaks_hlthcontextlife") {
        if (x == 0) return COLOR_SCALE[selectedMethod][0];
        for (var i = 1; i < nb.breaks.length; ++i) {
          if (x < nb.breaks[i])
            return COLOR_SCALE[selectedMethod][i];
        }
      } else {
        let bin_check = 0;
        for (var i = 1; i < nb.breaks.length-1; ++i) {
          bin_check += nb.breaks[i];
        }
        if (bin_check == 0) { 
          // special case when too many zeros
          return  [200,200,200];
        }
        
        for (var i = 1; i < nb.breaks.length; ++i) {
          if (x <= nb.breaks[i])
            return COLOR_SCALE[selectedMethod][i-1];
        }
      }
    };
  }
  
  getFillColor = function (f) {
    //if (v == 0) return [255, 255, 255, 200];
    return colorScale(f.properties.id);
  };
  getLineColor = function (f) {
    //return f.properties.id == selectedId ? [255, 0, 0] : [200, 200, 200];
    return  [200, 200, 200];
  };
  getLineWidth = function (f) {
    return  1;
  };
  UpdateLegend();
  UpdateLegendLabels(legend_bins);
  UpdateLegendTitle();

  if (isCartogram()) {
    cartogramData = gda_proxy.cartogram(selectedDataset, vals);
  }
  loadMap(selectedDataset);
}

function OnStateClick() {
  loadData(stateMap, init_state);
}

function init_state() {
  var vals;
  var nb;

  if (use_fixed_bins) {
    vals = GetDataValues(latestDate);
  } else {
    vals = GetDataValues();
  }
  
  var num_cat = 6;
  if (selectedMethod == "natural_breaks") num_cat = 8;
  nb = gda_proxy.custom_breaks(stateMap, "natural_breaks", num_cat, null, vals);
  if (selectedMethod == "testing_fixed_bins") {
    nb = testing_breaks 
  } else if (selectedMethod == "testing_cap_fixed_bins") {
    nb = testing_cap_breaks 
  } 
  
  colorScale = function (x) {
    if (selectedMethod == "natural_breaks") {
      if (x == 0) return COLOR_SCALE[selectedMethod][0];
      for (var i = 1; i < nb.breaks.length; ++i) {
        if (x < nb.breaks[i])
          return COLOR_SCALE[selectedMethod][i];
      }
    } else if (selectedMethod.includes("testing")){
      if (x === -1 || x === -100) return [240,240,240];
      for (var i = 1; i < nb.breaks.length; ++i) {
        if (x <= nb.breaks[i])
          return COLOR_SCALE[selectedMethod][i];
      }
    } else {
      for (var i = 1; i < nb.breaks.length; ++i) {
        if (x <= nb.breaks[i])
          return COLOR_SCALE[selectedMethod][i];
      }
    }
  };

  getFillColor = function (f) {
    let v = GetFeatureValue(f.properties.id);
    if (v == 0 && (selectedMethod != "testing_fixed_bins" || selectedMethod != "testing_cap_fixed_bins")) {
      return [240, 240, 240];
    } else {
      return colorScale(v);
    }
  };
  getLineColor = function (f) {
    //return f.properties.id == selectedId ? [255, 0, 0] : [255, 255, 255, 50];
    return [255, 255, 255, 50];
  };
  UpdateLegend();
  UpdateLegendLabels(nb.bins);
  UpdateLegendTitle();

  choropleth_btn.classList.add("checked");
  lisa_btn.classList.remove("checked");

  if (isCartogram()) {
    cartogramData = gda_proxy.cartogram(stateMap, vals);
  }

  loadMap(stateMap);
}

function AlertUser(error){
  let datasets = {
    'county_usfacts.geojson': 'USA Facts County Level Data',
    'county_1p3a.geojson': '1Point3Acres County Level Data',
    'state_usafacts.geojson': 'USAFacts State Level Data'
  }

  
  let alert_msg = document.getElementById("alert-msg")
  document.getElementById("alert-container").style.display = "block"

  if (error == "BadCombo") {
    alert_msg.innerHTML = `${datasets[selectedDataset]} do not have ${selectedVariable}.<br/><br/>The Atlas will revert to its default variable.`
  } else if (error == "TooFar") {
    alert_msg.innerHTML = `Zoom in to find hospitals and health clinics nearby. <br><br>Click <a href="#" onClick="GeolocateAndCloseNotification()">here</a> to find your location.`
    
  }
  
  setTimeout(function(){
    document.getElementById("alert-container").style.display = "none"
  },10000)

}

function OnSourceClick(evt) {
  source_btn.innerText = evt.innerText;
  if (evt.innerText.indexOf('County (UsaFacts.com)') >= 0) {
    selectedDataset = 'county_usfacts.geojson';
  } else if (evt.innerText.indexOf('County (1Point3Acres.com)') >= 0) {
    selectedDataset = 'county_1p3a.geojson';
  } else if (evt.innerText.indexOf('State (1Point3Acres.com)') >= 0) {
    selectedDataset = 'state_1p3a.geojson';
  } else {
    selectedDataset = 'state_usafacts.geojson';
  }
  
  // check if current variable is unavailable in new data set
  if (!config.VALID[selectedDataset].includes(selectedVariable)) {
    AlertUser("BadCombo");
    selectedVariable = config.DEFAULT[selectedDataset];
    data_btn.innerText = config.DEFAULT[selectedDataset];
    UpdateMethod();
    UpdateSlider();
  }

  UpdateMap();
  updateVariables(evt);
}

function updateVariables(evt){
  if (evt.innerText.indexOf('State') >= 0){
    document.getElementById("btn-uninprc").style.display = "none";
    document.getElementById("btn-over65yearsprc").style.display = "none";
    document.getElementById("btn-lfexprt").style.display = "none";
    document.getElementById("btn-7day-pos").style.display = "block";
    document.getElementById("btn-7day-cap").style.display = "block";
    document.getElementById("btn-7day-conf").style.display = "block";  
  } else {
    document.getElementById("btn-uninprc").style.display = "block";
    document.getElementById("btn-over65yearsprc").style.display = "block";
    document.getElementById("btn-lfexprt").style.display = "block";
    document.getElementById("btn-7day-pos").style.display = "none";
    document.getElementById("btn-7day-cap").style.display = "none";
    document.getElementById("btn-7day-conf").style.display = "none"; 
  }
}

function OnDataClick(evt) {
  data_btn.innerText = evt.innerText; // update the button label
  selectedVariable = evt.innerText;

  UpdateMethod();
  UpdateSlider();
  UpdateMap();
}

function OnCartogramClick(el) {
  cartogramDeselected = !el.checked;

  if (isState()) {
    OnStateClick();
  } else {
    OnCountyClick();
  }

  if (!el.checked) {
    mapbox.jumpTo({
      center: [-105.6500523, 35.850033],
      zoom: [3.5]
    });
  } else {
    if (isState()) {
      mapbox.jumpTo({
        center: [-8.854194, 3.726726],
        zoom: [6.6]
      });
    } else {
      mapbox.jumpTo({
        center: [-30.190367, 10.510908],
        zoom: [5.6]
      });
    }
  }
}

function OnShowLabels(el) {
  // labels in cartogram
  shouldShowLabels = el.checked;
  UpdateMap();
}

function UpdateMap() {
  if (isLisa()) {
    if (!(selectedDataset in jsondata)) {
      // data was not loaded yet, load the data first
      selectedMethod = "natural_breaks";
      if (isState()) OnStateClick();
      else OnCountyClick();
    } else {
      OnLISAClick(document.getElementById('btn-lisa'));
    }
  } else {
    if (isState()) {
      OnStateClick();
    } else {
      OnCountyClick();
    }
  }
}

function UpdateMethod(){
    // Set selectedMethod for "map type"
    if (selectedVariable == "Uninsured % (Community Health Factor)") {
      // hard coded selectedMethod
      selectedMethod = "natural_breaks_hlthfactor";
    } else if (selectedVariable == "Over 65 Years % (Community Health Context)" || selectedVariable == "Life expectancy (Length and Quality of Life)") {
      // hard coded selectedMethod
      selectedMethod = "natural_breaks_hlthcontextlife";
    } else if (selectedVariable == "Forecasting (5-Day Severity Index)") {
      // hard coded selectedMethod
      selectedMethod = "forecasting";
    } else if (selectedMethod == "forecasting") {
      // reset to natural breaks if switching to other variable
      selectedMethod = "natural_breaks";
      // document.getElementById('legend_title').innerText = "Natural Breaks";
    } else if (selectedVariable == "7 Day Testing Positivity Rate %") {
      selectedMethod = "testing_fixed_bins";
      // document.getElementById("legend_title").innerHTML = "Testing % Positive (Fixed Bins)"
    } else if (selectedVariable == "7 Day Testing Capacity") {
     selectedMethod = "testing_cap_fixed_bins";
    //  document.getElementById("legend_title").innerHTML = `
    //   Testing Capacity per 100k Population (Fixed Bins)             
    //     <div class="top info-tooltip" id="info-TestingCapacity">
    //       <i class="fa fa-info-circle"  aria-hidden="true"></i>
    //         <span class="tooltip-text">${config.TOOLTIP.TestingCapacity}</span>
    //     </div>`
    } else if (selectedVariable == "7 Day Confirmed Cases per Testing %") {
      selectedMethod = "testing_fixed_bins";
      // document.getElementById("legend_title").innerHTML = "Testing % Positive (Fixed Bins)"
    } else {
      selectedMethod = "natural_breaks";
      // others will keep using current selectedMethod
    }
}

function UpdateSlider(){
  // hide time slider if needed
  if (selectedVariable == "Uninsured % (Community Health Factor)" ||
      selectedVariable == "Over 65 Years % (Community Health Context)" ||
      selectedVariable == "Life expectancy (Length and Quality of Life)" ||
      selectedVariable == "Forecasting (5-Day Severity Index)") {
    // hide slider bar
    document.getElementById("sliderdiv").style.display = 'none';
  } else {
    // reset to natural breaks if switching to other variable
    document.getElementById("sliderdiv").style.display = 'block';
  }
}

function leftPanelCollapse() {
  const icon = document.querySelector('#left-collapse i');
  const button = document.getElementById('left-collapse');
  const panel = document.querySelector('.options-panel');
  const isCollapsed = document.querySelector('.left-panel--collapsed') ? true : false;
    
  if(isCollapsed) {
    icon.classList.remove('fa-chevron-right');
    icon.classList.add('fa-chevron-left');
    panel.classList.remove('left-panel--collapsed');
    button.classList.remove('left-panel--collapsed');
  } else {
    icon.classList.remove('fa-chevron-left');
    icon.classList.add('fa-chevron-right');
    panel.classList.add('left-panel--collapsed');
    button.classList.add('left-panel--collapsed')
  }

}

function rightPanelCollapse() {
  const icon = document.querySelector('#right-collapse i');
  const button = document.getElementById ('right-collapse');
  const panel = document.querySelector('.data-panel');
  const isCollapsed = document.querySelector('.right-panel--collapsed') ? true : false; 

  if(isCollapsed) {
    icon.classList.remove('fa-chevron-left');
    icon.classList.add('fa-chevron-right');
    panel.classList.remove('right-panel--collapsed');
    button.classList.remove('right-panel--collapsed');
    document.querySelector('.mapboxgl-ctrl-bottom-right').className += " inset"
    document.querySelector('#tutorial').className += " inset"
    document.querySelector('#additional-buttons').className += " inset"
  } else {
    icon.classList.remove('fa-chevron-right');
    icon.classList.add('fa-chevron-left');
    panel.classList.add('right-panel--collapsed');
    button.classList.add('right-panel--collapsed');
    document.querySelector('.mapboxgl-ctrl-bottom-right').className = 'mapboxgl-ctrl-bottom-right'
    document.querySelector('#tutorial').className -= " inset"
    document.querySelector('#additional-buttons').className -= " inset"
  }
}

function OnShowTime(el) {
  let disp = el.checked ? 'block' : 'none';
  document.getElementById('time-container').parentElement.style.display = disp;
}
  
const handlePos = (val) => {
  let formatted = val;
  if (val >= 0) {
    return Math.round(val*1000)/10 + "%";
  }
  if (!val || val === '' || val < 0) return 'N/A';
}

const handleTcap = (val) => {
  let formatted = val;
  if (val >= 0) {
    return Math.round(val*100)/100;
  }
  if (!val || val === '' || val < 0) return 'N/A';
}

function getTooltipHtml(id, values, state_map) {
  const handle = val => val >= 0 ? val : 'N/A'; // dont show negative values


  let text = state_map ? `
    <h3>${values.entityName}</h3><hr>
    <div>Cases: ${handle(values.cases).toLocaleString()}</div>
    <div>Deaths: ${handle(values.deaths).toLocaleString()}</div>
    <div>New Cases: ${handle(values.newCases).toLocaleString()}</div>
    <div>New Deaths: ${handle(values.newDeaths).toLocaleString()}</div>  
    <div>Total Testing: ${handle(values.testing).toLocaleString()}</div>
    <div>7 Day Positivity Rate: ${handlePos(values.testingPos).toLocaleString()}</div>
    <div>7 Day Testing Capacity: ${handleTcap(values.testingTcap)}</div>
    <div>7 Day Confirmed Cases per Testing: ${handlePos(values.testingCcpt)}</div>
    <div>Testing Criterion: ${values.criteria}</div>
  ` : ` 
    <h3>${values.entityName}</h3><hr>
    <div>Cases: ${handle(values.cases).toLocaleString()}</div>
    <div>Deaths: ${handle(values.deaths).toLocaleString()}</div>
    <div>New Cases ${handle(values.newCases).toLocaleString()}</div>
    <div>New Deaths: ${handle(values.newDeaths).toLocaleString()}</div>
  `

  // if (isLisa()) {
  //   let field = data_btn.innerText;
  //   let c = lisaData[selectedDataset][selectedDate][field].clusters[id];
  //   text += '<br/><div><b>' + lisa_labels[c] + '</b></div>';
  //   text += '<div><b>p-value:</b>' + lisaData[selectedDataset][selectedDate][field].pvalues[id] + '</div>';
  //   text += '<div>Queen weights and 999 permutations</div>';
  // }

  return text;
}

function getHospitalHtml(info){
  return ` 
    <h3>${info.Name}</h3>
    <div><i>${info['Hospital Type']}</i>
    <div>Address: ${info.Address}</div>
    ${info.Address_2 ? '<div>'+info.Address_2+'</div>' : ''}
    <div>${info.City}, ${info.State}</div>
    <div>${info.Zipcode}</div> 
  `
}
function getClinicHtml(info){
  return `
    <h3>${info.name}</h3>
    <div>${info.address}</div>
    <div>${info.city}, ${info.county}</div>
    <div>${info.st_abbr}</div> 
    <div>${info.phone}</div>
    <br/>
    <div><b>${info.testing_status ? 'This location offers COVID-19 testing.' : 'This location does not offer COVID-19 testing.'}</b></div>
  `
}

// this is the callback for when you hover over a feature on the map
function updateTooltip(e) {
  var { x, y, object, layer } = e;
  if (x == undefined) {
    x = e.point.x
    y = e.point.y
    object = e.features[0].properties
    layer = e.features[0].layer.id
  }

  const tooltip = document.getElementById('tooltip');
  var text;

  // if they aren't hovered over an object, empty the tooltip (this effectively
  // hides it)
  if (!object) {
    tooltip.innerHTML = '';
    return;
  }

  if ((layer == "hospitals" || layer == "clinics_live") && (shouldShowResources.Clinics||shouldShowResources.Hospitals||shouldShowResources.ClinicsHospitals)) {
    text = layer == "hospitals" ? getHospitalHtml(object) : getClinicHtml(object)
    // set html
    tooltip.innerHTML = text;

    // position tooltip over mouse location
    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;

  } else if (!(shouldShowResources.Clinics||shouldShowResources.Hospitals||shouldShowResources.ClinicsHospitals)) {
    // get the entity id
    // TODO rename this to entityId to be consistent with entityName
    const id = object.properties.id;
    
    // get the state/county name
    let entityName = '';
    if ('NAME' in object.properties) {
      entityName = object.properties.NAME;
    } else {
      entityName = jsondata[selectedDataset].features[id].properties.NAME;
    }

    // cases
    let cases = caseData[selectedDataset][selectedDate][id];
    
    // deaths
    let deaths = deathsData[selectedDataset][selectedDate][id];
    
    // new cases
    let newCases = 0;
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx > 0) {
      let prev_date = dates[selectedDataset][dt_idx - 1];
      var cur_vals = caseData[selectedDataset][selectedDate];
      var pre_vals = caseData[selectedDataset][prev_date];
      newCases = cur_vals[id] - pre_vals[id];
    }

    // new deaths
    let newDeaths = 0;
    if (dt_idx > 0) {
      let prev_date = dates[selectedDataset][dt_idx - 1];
      var cur_vals = deathsData[selectedDataset][selectedDate];
      var pre_vals = deathsData[selectedDataset][prev_date];
      newDeaths = cur_vals[id] - pre_vals[id];
    }
    
    // // testing
    let state_map = selectedDataset.includes("state");

    let testing = state_map ? testingData[selectedDataset][selectedDate][id] : null;
    let testingPos = state_map ? testingPosData[selectedDataset][selectedDate][id] : null;
    let testingTcap = state_map ? testingTcapData[selectedDataset][selectedDate][id] : null;
    let testingCcpt = state_map ? testingCcptData[selectedDataset][selectedDate][id] : null;
    let criteria = state_map ? testingCriteriaData[selectedDataset][id] : null;

    // render html
    const values = {
      entityName,
      cases,
      deaths,
      newCases,
      newDeaths,
      testing,
      testingPos,
      testingTcap,
      testingCcpt,
      criteria,
    };

    text = getTooltipHtml(id, values, state_map);
    
    // set html
    tooltip.innerHTML = text;

    // position tooltip over mouse location
    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
  }
  

}

function clearTooltip() {
  if (shouldShowResources.Clinics||shouldShowResources.Hospitals||shouldShowResources.ClinicsHospitals) {
    const tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = '';
  }
  return;
}

function handleMapHover(e) {
  updateTooltip(e);
}

function highlightSelected(feat) {
  if (feat) {
    // highlight the selected polygon
    let lyr = {
      id: 'hllayer',
      type: GeoJsonLayer,
      data: {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': "MultiPolygon",
          'coordinates': feat.geometry.coordinates
        }
      },
      getLineColor: [0, 0, 0],
      lineWidthScale: 20,
      lineWidthMinPixels: 4,
      getLineWidth: 10,
      stroked: true,
      filled: false,
      extruded: false,
      pickable:false,
    };
    const firstLabelLayerId = mapbox.getStyle().layers.find(layer => layer.type === 'symbol').id;
    if (!mapbox.getLayer("hllayer")) {
      var hl_layer = new MapboxLayer(lyr);
      layer_dict[lyr.id] = hl_layer;
      mapbox.addLayer(hl_layer, firstLabelLayerId);
    }
    mapbox.setLayoutProperty(lyr.id, 'visibility', 'visible');
    layer_dict[lyr.id].setProps(lyr);
  }  
  mapbox.moveLayer("hllayer", "uscongress");  
}

window.addEventListener('storage', () => {
  // When local storage changes, dump the list to
  // the console.
  const hl_id =  window.localStorage.getItem('HL_IDS');
  if (isFinite(hl_id)) {
    selectedId = hl_id;
    const feat = jsondata[selectedDataset]["features"][hl_id];
    highlightSelected(feat);
  }
});

function handleMapClick(e) {
  updateTrendLine(e);
  updateDataPanel(e);
  // update map to highlight any selected
  if (e.object) {
    highlightSelected(e.object); 
    // sync between windows
    window.localStorage.setItem("HL_IDS", JSON.stringify(e.object.properties.id));
  }
}

// builds HTML for health factor in data panel
function healthFactorHtml(geoId) {
  let html = '';
  const labels = { 
    PovChldPrc: 'Children in poverty %',
    IncRt: 'Income inequality',
    MedianHouseholdIncome: 'Median household income',
    FdInsPrc: 'Food insecurity %',
    UnEmplyPrc: 'Unemployment %',
    UnInPrc: 'Uninsured %',
    PrmPhysRt: 'Primary care physicians',
    PrevHospRt: 'Preventable hospital stays',
    RsiSgrBlckRt: 'Residential segregation-black/white',
    SvrHsngPrbRt: 'Severe housing problems %'
  };

  const handle = (val) => {
    let formatted = val;
    if (`${formatted}`.includes(':')){
      return Math.round(formatted.substring(0,formatted.length-2)/10)*10 + ":1";
    }
    if (!val || val === '') return 'N/A';
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return 'N/A';
    if (parsed % 1 !== 0) {
      formatted = parsed.toFixed(1);
    } else {
      formatted = parseInt(parsed);
    }
    return numberWithCommas(formatted);
  }

  const ordered = ['PovChldPrc', 'IncRt', 'MedianHouseholdIncome', 'FdInsPrc', 'UnEmplyPrc', 'UnInPrc', 'PrmPhysRt', 'PrevHospRt', 'RsiSgrBlckRt', 'SvrHsngPrbRt'];
  html += `<div>
    <h3>Community Health Factors
      <div class="info-tooltip" id="info-healthfactor">
        <i class="fa fa-info-circle"  aria-hidden="true"></i>
        <span class="right tooltip-text"></span>
      </div>
    </h3>
    <div style="font-size: 80%; position: relative; top: -10px"><b>Source:</b> <a href="https://www.countyhealthrankings.org/">County Health Rankings</a></div>`
  const rowHtml = (key) => `<div><b>${labels[key]}</b> <div class="info-tooltip" id="info-${key}"> <i class="fa fa-info-circle" aria-hidden="true"></i><span class="tooltip-text"></span></div>: ${handle(chrhlthfactorData[geoId][key])} </div>`;
  ordered.forEach(key => html += rowHtml(key));
  html += `</div>`
  return html;
}

// builds HTML for health context tab in data panel
function healthContextHtml(geoId) {
  let html = '';
  const labels = { 
    Over65YearsPrc: '% 65 and older',
    AdObPrc: 'Adult obesity %',
    AdDibPrc: 'Diabetes prevalence %',
    SmkPrc: 'Adult smoking %',
    ExcDrkPrc: 'Excessive drinking %',
    DrOverdMrtRt: 'Drug overdose deaths'
  };

  const handle = (val) => {
    let formatted = val;
    if (!val || val == '') return 'N/A';
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return 'N/A';
    formatted = parsed;
    if (parsed % 1 !== 0) {
    formatted = parsed.toFixed(1);
    } else {
    formatted = parseInt(parsed);
    }
    return numberWithCommas(formatted);
  }

  const ordered = ['Over65YearsPrc', 'AdObPrc', 'AdDibPrc', 'SmkPrc', 'ExcDrkPrc', 'DrOverdMrtRt'];
  html += `<div>
  <h3>Community Health Context 
    <div class="info-tooltip" id="info-healthcontext">
      <i class="fa fa-info-circle"  aria-hidden="true"></i>
      <span class="right tooltip-text"></span>
    </div>
  </h3>
    <div style="font-size: 80%; position: relative; top: -10px"><b>Source:</b> <a href="https://www.countyhealthrankings.org/">County Health Rankings</a></div>`
  const rowHtml = (key) => `<div><b>${labels[key]}</b> <div class="info-tooltip" id="info-${key}"> <i class="fa fa-info-circle" aria-hidden="true"></i><span class="tooltip-text"></span></div>: ${handle(chrhlthcontextData[geoId][key])} </div>`;
  ordered.forEach(key => html += rowHtml(key));
  html += `</div>`
  return html;
}

// builds HTML for health Life tab in data panel
function healthLifeHtml(geoId) {
  let html = '';
  const labels = { 
    LfExpRt: 'Life expectancy',
    SlfHlthPrc: 'Self-rated health %'
  };
  const handle = (val) => {
    let formatted = val;
    if (!val || val === '') return 'N/A';
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return 'N/A'
    if (parsed % 1 !== 0) {
      formatted = parsed.toFixed(1);
    } else {
      formatted = parseInt(parsed);
    }
    return numberWithCommas(formatted);
  }

  const ordered = ['LfExpRt', 'SlfHlthPrc'];
  html += `<div>
  <h3>Length and Quality of Life
    <div class="info-tooltip" id="info-healthlife">
      <i class="fa fa-info-circle"  aria-hidden="true"></i>
      <span class="right tooltip-text"></span>
    </div>
  </h3>
    <div style="font-size: 80%; position: relative; top: -10px"><b>Source:</b> <a href="https://www.countyhealthrankings.org/">County Health Rankings</a></div>`
  const rowHtml = (key) => `<div><b>${labels[key]}</b> <div class="info-tooltip" id="info-${key}"> <i class="fa fa-info-circle" aria-hidden="true"></i><span class="tooltip-text"></span></div>: ${handle(chrhlthlifeData[geoId][key])} </div>`;
  ordered.forEach(key => html += rowHtml(key));
  html += `</div>`
  return html;
}


function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// builds HTML for covid forecasting/predictions tab in data panel
function covidForecastingHtml(geoId) {
  
  const countySeverityIndex = berkeleyCountyData[geoId].severityIndex;
  const countySeverityLevel = {
    1: 'low',
    2: 'medium',
    3: 'high',
  }[countySeverityIndex];
  const { predictions } = berkeleyCountyData[geoId];

  let parser = d3.timeParse("%Y_%m_%d");
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  let predictionsHtml = '';
  for (pd in predictions) {
    const date = parser(pd);
    const month = months[date.getMonth()];
    const day = date.getDate();
    const deaths = predictions[pd].deaths;
    predictionsHtml += `<div><b>Predicted Deaths by ${month} ${day}</b>
    <div class="info-tooltip" id="info-PredictedDeaths"><i class="fa fa-info-circle"></i><span class="tooltip-text"></span></div>
    : ${deaths}</div>`
  }
  // form rest of html
  const html = `
    <div>
      <h3>Forecasting</h3>
        <div style="font-size: 80%; position: relative; top: -10px;"><b>Source:</b> <a href="https://github.com/Yu-Group/covid19-severity-prediction">Yu Group at Berkeley</a></div>
        <b>5-Day Severity Index</b> <div class="info-tooltip" id="info-SeverityIndex"><i class="fa fa-info-circle"></i>
        <span class="tooltip-text"></span>
        </div><span style="text-transform: uppercase" class="county-severity-index--${countySeverityLevel}">: ${countySeverityLevel}
      </span>
        ${predictionsHtml}
      </div>
    </div>
  `;

  return html;
}

function updateDataPanel(e) {
  showTutorial(false);
  
  let geoId;

  let html = '';
  const geoIdElem = document.querySelector('#geoid');

  const id = e.object.properties.id;
  selectedId = id;

  if (e.object) geoId = parseInt(e.object.properties.GEOID);
  if (!geoId) {
    if (e.object) {
      geoId = jsondata[selectedDataset].features[id].properties.GEOID;
    } else {
      geoId = geoIdElem.value;
    }
  }

  let stateAbbr = e.object.properties.state_abbr;
  if (!stateAbbr) {
    stateAbbr = jsondata[selectedDataset].features[id].properties.state_abbr;
  }
  
  const panelElem = document.querySelector('.data-panel');
  const headerElem = document.querySelector('#data-panel__header')
  const bodyElem = document.querySelector('#data-panel__body');
  const collapseBtnElem = document.querySelector('#right-collapse');

  // get population
  const population = populationData[selectedDataset][id];
  const populationDataExists = (population && population > 0);

  // get beds
  const beds = bedsData[selectedDataset][id];
  const bedsDataExists = (beds && beds > 0);

  // cases
  let cases = caseData[selectedDataset][selectedDate][id];
  let casesPer100k = populationDataExists ? (cases / population * 100000) : 0;
  
  // deaths
  let deaths = deathsData[selectedDataset][selectedDate][id];
  let deathsPer100k = populationDataExists ? (deaths / population * 100000) : 0;
  let fatalityRate = fatalityData[selectedDataset][selectedDate][id];
  
  // new cases
  let newCases = 0;
  let dt_idx = dates[selectedDataset].indexOf(selectedDate);
  if (dt_idx > 0) {
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = caseData[selectedDataset][selectedDate];
    var pre_vals = caseData[selectedDataset][prev_date];
    newCases = cur_vals[id] - pre_vals[id];
  }
  let newCasesPer100k = populationDataExists ? (newCases / population * 100000) : 0;

  // new deaths
  let newDeaths = 0;
  if (dt_idx > 0) {
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = deathsData[selectedDataset][selectedDate];
    var pre_vals = deathsData[selectedDataset][prev_date];
    newDeaths = cur_vals[id] - pre_vals[id];
  }
  let newDeathsPer100k = populationDataExists ? (newDeaths / population * 100000) : 0;

  // cases per bed
  let casesPerBed = bedsDataExists ? (cases / beds) : 0;

  // testing
  let state_map = selectedDataset.includes("state");
  
  let temp_geoId = (state_map) ? geoId * 1000 : geoId;

  let testing = state_map ? testingData[selectedDataset][selectedDate][id] : null;
  let testingPos = state_map ? testingPosData[selectedDataset][selectedDate][id] : null;
  let testingTcap = state_map ? testingTcapData[selectedDataset][selectedDate][id] : null;
  let testingCcpt = state_map ? testingCcptData[selectedDataset][selectedDate][id] : null;
  let criteria = state_map ? testingCriteriaData[selectedDataset][id] : null;

  // handle decimals
  casesPer100k = casesPer100k === 0 ? 0 : parseFloat(casesPer100k).toFixed(1);
  deathsPer100k = deathsPer100k === 0 ? 0 : parseFloat(deathsPer100k).toFixed(1);
  casesPerBed = casesPerBed === 0 ? 0 : parseFloat(casesPerBed).toFixed(1);
  fatalityRate = fatalityRate === 0 ? 0 : parseFloat(fatalityRate).toFixed(1);
  newCasesPer100k = newCasesPer100k === 0 ? 0 : parseFloat(newCasesPer100k).toFixed(1);
  newDeathsPer100k = newDeathsPer100k === 0 ? 0 : parseFloat(newDeathsPer100k).toFixed(1);

  if (state_map) {
    html += 
    `
    <div><b>Population:</b> ${numberWithCommas(population)}</div>
    <br>
    <div><b>Total Cases:</b> ${numberWithCommas(cases)}</div>
    <div><b>Total Deaths:</b> ${numberWithCommas(deaths)}</div>
    <div><b>Cases per 100k Population:</b> ${casesPer100k}</div>
    <div><b>Deaths per 100k Population:</b> ${deathsPer100k}</div>
    <div><b>New Cases per 100k Population:</b> ${newCasesPer100k}</div>
    <div><b>New Deaths per 100k Population</b> ${newDeathsPer100k}</div>
    <div><b>Licensed Hospital Beds:</b> ${numberWithCommas(beds)}</div>
    <div><b>Cases per Bed:</b> ${casesPerBed}</div>
    <div><b>Total Testing:</b> ${testing.toLocaleString('en-US')}</div>
    <div><b>7 Day Testing Capacity:</b> ${handleTcap(testingTcap)}</div>
    <div><b>7 Day Confirmed Case per Testing:</b> ${Math.round(testingCcpt*10000)/100}%</div>
    <div><b>Testing Criteria:</b> ${criteria}</div>
    `
    
    headerElem.innerHTML = `${chrhlthcontextData[temp_geoId].State}`;
    headerElem.innerHTML = `${chrhlthfactorData[temp_geoId].State}`;
    headerElem.innerHTML = `${chrhlthlifeData[temp_geoId].State}`;
    
  } else {
    html += 
    `
    <div><b>Population:</b> ${numberWithCommas(population)}</div>
    <br>
    <div><b>Total Cases:</b> ${numberWithCommas(cases)}</div>
    <div><b>Total Deaths:</b> ${numberWithCommas(deaths)}</div>
    <div><b>Cases per 100k Population:</b> ${casesPer100k}</div>
    <div><b>Deaths per 100k Population:</b> ${deathsPer100k}</div>
    <div><b>New Cases per 100k Population:</b> ${newCasesPer100k}</div>
    <div><b>New Deaths per 100k Population</b> ${newDeathsPer100k}</div>
    <div><b>Licensed Hospital Beds:</b> ${numberWithCommas(beds)}</div>
    <div><b>Cases per Bed:</b> ${casesPerBed}</div>
    `
      
    headerElem.innerHTML = `${chrhlthcontextData[temp_geoId].County} County, ${stateAbbr}`;
    headerElem.innerHTML = `${chrhlthfactorData[temp_geoId].County} County, ${stateAbbr}`;
    headerElem.innerHTML = `${chrhlthlifeData[temp_geoId].County} County, ${stateAbbr}`;
  }

  // removed fatality rate:  <div><b>Fatality Rate:</b> ${fatalityRate}%</div>

  if (chrhlthfactorData[temp_geoId]) html += healthFactorHtml(temp_geoId);
  if (chrhlthcontextData[temp_geoId]) html += healthContextHtml(temp_geoId);
  if (chrhlthlifeData[temp_geoId]) html += healthLifeHtml(temp_geoId);
  if (berkeleyCountyData[temp_geoId]) html += covidForecastingHtml(temp_geoId);

  geoIdElem.value = geoId; // store geoid in hidden input so we can load data on select change
  bodyElem.innerHTML = html;
  collapseBtnElem.classList.remove('hide');
  panelElem.removeAttribute('hidden');
  
  if (document.querySelector('.right-panel--collapsed') ? false : true) {
    document.querySelector('.mapboxgl-ctrl-bottom-right').className += " inset"
    document.querySelector('#additional-buttons').className += " inset"
    document.querySelector('#tutorial').className += " inset"
  }

  updateTooltips();
}
/*
 * APPLICATION
*/

// set up deck/mapbox

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const mapbox = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/lixun910/ckg8gz59r5kz119pe0yfx0lwb?fresh=true',
  center: params_dict.lon ? [params_dict.lon, params_dict.lat] : [ -105.6500523, 35.850033],
  zoom: params_dict.z ? params_dict.z : 3.5
});


function createGeocoderData() {
  var result = {
    'features' : []
  };

  var features = jsondata['county_usfacts.geojson'].features;
  for (var i=0; i < features.length; ++i) {
    var row_id = features[i].properties.id;
    var county_name = features[i].properties.NAME;
    var state_name =  features[i].properties.state_name;
    var state_abbr = features[i].properties.state_abbr; 
    var coords = centroids['county_usfacts.geojson'][row_id];

    result.features.push({
      'type': 'Feature',
      'properties': {
        'title': county_name + ' County, ' + state_name + ', ' + state_abbr,
        'description': county_name + 'County, ' + state_name + ', ' + state_abbr,
      },
      'geometry': {
        'coordinates': coords,
        'type': 'Point'
      }
    });
  }
  return result;
}

function forwardGeocoder(query) {
  var customData = createGeocoderData();
  var matchingFeatures = [];
  for (var i = 0; i < customData.features.length; i++) {
    var feature = customData.features[i];
    // handle queries with different capitalization than the source data by calling toLowerCase()
    if (
      feature.properties.title
      .toLowerCase()
      .search(query.toLowerCase()) !== -1
    ) {
      // using carmen geojson format: https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
      feature['place_name'] = feature.properties.title;
      feature['center'] = feature.geometry.coordinates;
      matchingFeatures.push(feature);
    }
  }
  return matchingFeatures;
}


mapbox.on('load', function(){
  initial_load = false;
  mapbox.addSource('clinic_data', {
    type: 'geojson',
    data: './health_centers_clean.geojson'
  });

  mapbox.addLayer(
    {
      'id': 'clinics_live',
      'source': 'clinic_data',
      'type': 'symbol',
      "layout": {
          "text-field": "•",
          "text-padding": 0,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
          "text-font": [
              "Open Sans ExtraBold",
              "Arial Unicode MS Regular"
          ],
          "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4,
              12,
              22,
              96
          ],
          "visibility": `${shouldShowResources.ClinicsHospitals || shouldShowResources.Clinics ? 'visible' : 'none'}`
      },
      "paint": {
          "text-color": "hsl(92, 70%, 35%)",
          "text-halo-color": "hsla(0, 0%, 100%, 0.72)",
          "text-halo-width": 1,
          "text-halo-blur": 1
      }
    },
  "hospitals"
  );

  mapbox.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      localGeocoder: forwardGeocoder,
      zoom: 9.0,
      placeholder: 'Enter e.g., Cook County, IL',
      mapboxgl: mapboxgl
    })
  );
  
  mapbox.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
  
  const geoLocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: false
    });
  
  mapbox.addControl(geoLocate, 'bottom-right');
  
  geoLocate.on('geolocate', function(e) {
    mapbox.flyTo({
     center:[e.coords.longitude, e.coords.latitude], 
     zoom:10 //set zoom 
   });
  });
  
  mapbox.on('mouseenter', 'hospitals', function(e) {
    handleMapHover(e)
  })
  mapbox.on('mousemove', 'hospitals', function(e) {
    handleMapHover(e)
  })
  
  mapbox.on('mouseleave', 'hospitals', function () {
    clearTooltip()
  });
  
  mapbox.on('mouseenter', 'clinics_live', function(e) {
    handleMapHover(e)
  })
  mapbox.on('mousemove', 'clinics_live', function(e) {
    handleMapHover(e)
  })
  
  mapbox.on('mouseleave', 'clinics_live', function () {
    clearTooltip()
  });
  
  mapbox.on('move', function () {
    clearTooltip()
  });
})

function getCartogramLayer(data)
{
  return {
      id: 'catogram_layer',
      type: ScatterplotLayer,
      data: cartogramData,
      getPosition: d => d.position,
      getFillColor: getFillColor,
      getLineColor: getLineColor,
      getRadius: d => d.radius * 10,
      onHover: handleMapHover,
      onClick: handleMapClick,
      pickable: true,
      updateTriggers: {
        getFillColor: [
          selectedDate, selectedVariable, selectedMethod
        ]
      },
  };
}

function getCartoLabelLayer(data)
{
    var labels = [];
    if (selectedDataset.startsWith("state")) {
      for (let i = 0; i < data.features.length; ++i) {
        labels.push({
          id: i,
          position: cartogramData[i].position,
          text: data.features[i].properties.NAME
        });
      }
    }

    return {
      id: 'carto_label_layer',
      type: TextLayer,
      data: labels,
      pickable: true,
      getPosition: d => d.position,
      getText: d => d.text,
      getSize: 12,
      fontFamily: 'Gill Sans Extrabold, sans-serif',
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
      getColor: [20, 20, 20]
    };
}

function getStateLayer(data)
{
  return {
      id: 'state_layer',
      type: GeoJsonLayer,
      data: './states.geojson',
      opacity: 0.5,
      stroked: true,
      filled: false,
      lineWidthScale: 1,
      lineWidthMinPixels: 1.5,
      getLineColor: [220, 220, 220],
      pickable: false
  };
}

function getCountyLayer(data)
{
    return {
      id: 'county_layer',
      type: GeoJsonLayer,
      data: data,
      opacity: 0.6,
      // stroked counties if no overlay is active
      stroked: false,
      filled: true,
      lineWidthScale: 1,
      lineWidthMinPixels: 1,
      // getElevation: getElevation,
      getFillColor: getFillColor,
      // getLineColor: getLineColor,
      // getLineWidth: getLineWidth,
      updateTriggers: {
        getFillColor: [
          selectedDate, selectedVariable, selectedMethod
        ]
      },
      pickable: true,
      onHover: info => handleMapHover(info),
      onClick: handleMapClick,

      // getFillPattern: f => GetFeatureValue(f.properties.id) == 0 ? 'lines' : null,
      // fillPatternAtlas: './spriteSheet.png',
      // fillPatternMapping: './spriteInfo.json',
      // getFillPatternScale: 500,
      // getFillPatternOffset: [0, 0],
      // extensions: [new FillStyleExtension({pattern: true})]
    };
}

function createMap(data) {
  try {
    // if no date has been selected, default to most recent
    if (!selectedDate) {
      selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];
    }

    // this is where the deck layers are accumulated before adding to the canvas
    var layers = [];

    if (isCartogram()) {
      // hide mapbox
      for (var lyr of mapbox.getStyle().layers) mapbox.setLayoutProperty (lyr.id, 'visibility','none');
      layers.push(getCartogramLayer(data));
      layers.push(getCartoLabelLayer(data));

    } else {
      // show mapbox
      for (var lyr of mapbox.getStyle().layers) {
        mapbox.setLayoutProperty(lyr.id, 'visibility','visible');
        if (lyr.id.includes("label")&&!lyr.id.includes("road")){
          mapbox.moveLayer(lyr.id)
        }
      }
      layers.push(getCountyLayer(data));
    }

    SetupLayers(layers);
  } catch {
    console.log('Mapbox did not load in time.')
    setTimeout(function(){
      createMap(data)
    }, 250)
  }
  
}

function SetupLayers(layers) 
{
  // hide all avaiable layers, only 'layers' will be visible
  for (lyrname in layer_dict) {
    if (mapbox.getLayer(lyrname)) {
      mapbox.setLayoutProperty(lyrname, 'visibility', 'none');
    }
  }
  // toggle native america layer
  if (shouldShowOverlays.Reservations) {
    mapbox.setLayoutProperty("nativeamericanreservations-highlight", 'visibility', 'visible');
  } else {
    mapbox.setLayoutProperty("nativeamericanreservations-highlight", 'visibility', 'none');
  }

  // toggle agg layer
  if (shouldShowOverlays.HypersegregatedCities) {
    mapbox.setLayoutProperty("hypersegregated-highlight", 'visibility', 'visible');
  } else {
    mapbox.setLayoutProperty("hypersegregated-highlight", 'visibility', 'none');
  }

  // toggle blackbelt layer
  if (shouldShowOverlays.BlackBelt) {
    mapbox.setLayoutProperty("blackbelt-highlight", 'visibility', 'visible');
  } else {
    mapbox.setLayoutProperty("blackbelt-highlight", 'visibility', 'none');
  }

  // toggle uscongress layer
  if (shouldShowOverlays.USCongress) {
    mapbox.setLayoutProperty("uscongress", 'visibility', 'visible');
    mapbox.setLayoutProperty("uscongress-label", 'visibility', 'visible');
  } else {
    mapbox.setLayoutProperty("uscongress", 'visibility', 'none');
    mapbox.setLayoutProperty("uscongress-label", 'visibility', 'none');
  }

  if (mapbox.getLayer("clinics_live") != undefined) {
    // toggle clinics layer
    if (shouldShowResources.ClinicsHospitals) {
      mapbox.setLayoutProperty("hospitals", 'visibility', 'visible');
      mapbox.setLayoutProperty("clinics_live", 'visibility', 'visible');
    } else if (shouldShowResources.Hospitals) {
      mapbox.setLayoutProperty("hospitals", 'visibility', 'visible');
      mapbox.setLayoutProperty("clinics_live", 'visibility', 'none');
    } else if (shouldShowResources.Clinics) {
      mapbox.setLayoutProperty("hospitals", 'visibility', 'none');
      mapbox.setLayoutProperty("clinics_live", 'visibility', 'visible');
    } else {
      mapbox.setLayoutProperty("hospitals", 'visibility', 'none');
      mapbox.setLayoutProperty("clinics_live", 'visibility', 'none');
    }
  } else {
    if (shouldShowResources.ClinicsHospitals||shouldShowResources.Hospitals) {
      mapbox.setLayoutProperty("hospitals", 'visibility', 'visible');
    } else {
      mapbox.setLayoutProperty("hospitals", 'visibility', 'none');
    }
  }

  const firstLabelLayerId = mapbox.getStyle().layers.find(layer => layer.type === 'symbol').id;
  // add to mapbox
  for (var lyr of layers) {
    if (!mapbox.getLayer(lyr.id)) {
      var mb_layer = new MapboxLayer(lyr);
      layer_dict[lyr.id] = mb_layer;
      mapbox.addLayer(mb_layer, firstLabelLayerId);
    }
    mapbox.setLayoutProperty(lyr.id, 'visibility', 'visible');
  }

  // update the layer
  for (var lyr of layers) {
    layer_dict[lyr.id].setProps(lyr);
  }

  // move state boundary to top base layers, below overlay
  mapbox.moveLayer("admin-1-boundary", "road-label-simple");
  
  mapbox.getLayer('county_layer') == undefined ? mapbox.moveLayer("state_layer", "uscongress") : mapbox.moveLayer("county_layer", "uscongress");
}


function loadMap() {
  const data = jsondata[selectedDataset];
  // create/re-create mas
  createMap(data);
  // create/update line charts
  if (document.getElementById('linechart').innerHTML == "" ||
    d3.select("#slider").node().max != dates[selectedDataset].length) {
    addTrendLine(data, "");
  } else {
    updateTrendLine({
      x: 0,
      y: 0,
      object: null
    });
  }
  // create/update time slider
  createTimeSlider(data);
}

function getElevation(f) {
  return f.properties.id == selectedId ? 90000 : 1;
}

// TODO move to utils or data loading section
function assignIdsToFeatures(features) {
  for (let i = 0; i < features.features.length; i++) {
    // Track each feature individually with a unique ID.
    features.features[i].properties.id = i;
  }
  return features;
}

// TODO move to state section
function GetFeatureValue(id) {
  let json = selectedDataset;
  let txt = data_btn.innerText;

  if (txt == "Confirmed Count") {
    return caseData[json][selectedDate][id];
  } else if (txt == "Confirmed Count per 100K Population") {
    if (populationData[json][id] == undefined || populationData[json][id] == 0) return 0;
    return (caseData[json][selectedDate][id] / populationData[json][id] * 100000).toFixed(3);
  } else if (txt == "Confirmed Count per Licensed Bed") {
    if (bedsData[json][id] == undefined || bedsData[json][id] == 0) return 0;
    return (caseData[json][selectedDate][id] / bedsData[json][id]).toFixed(3);
  } else if (txt == "Death Count") {
    return deathsData[json][selectedDate][id];
  } else if (txt == "Death Count per 100K Population") {
    if (populationData[json][id] == undefined || populationData[json][id] == 0) return 0;
    return (deathsData[json][selectedDate][id] / populationData[json][id] * 100000).toFixed(3);
  } else if (txt == "Death Count/Confirmed Count") {
    return fatalityData[json][selectedDate][id];
  } else if (txt == "7-Day Average Daily New Confirmed Count per 100K Pop"){
    //if (selectedDataset == 'county_usfacts.geojson') {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx < 7) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 7];
    var cur_vals = caseData[json][selectedDate];
    var pre_vals = caseData[json][prev_date];
    return ((cur_vals[id] - pre_vals[id])/7/ populationData[json][id] * 100000).toFixed(3);
    //} else {
    //  return 0;
    //}
  } else if (txt == "7-Day Average Daily New Confirmed Count"){
    //if (selectedDataset == 'county_usfacts.geojson') {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx < 7) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 7];
    var cur_vals = caseData[json][selectedDate];
    var pre_vals = caseData[json][prev_date];
    return ((cur_vals[id] - pre_vals[id])/7).toFixed(3);
    //} else {
    //  return 0;
    //}
  } else if (txt == "Daily New Confirmed Count") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = caseData[json][selectedDate];
    var pre_vals = caseData[json][prev_date];
    return cur_vals[id] - pre_vals[id];
  } else if (txt == "Daily New Confirmed Count per 100K Pop") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = caseData[json][selectedDate];
    var pre_vals = caseData[json][prev_date];
    return ((cur_vals[id] - pre_vals[id]) / populationData[json][id] * 100000).toFixed(3);

  } else if (txt == "Daily New Death Count") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = deathsData[json][selectedDate];
    var pre_vals = deathsData[json][prev_date];
    return cur_vals[id] - pre_vals[id];
  } else if (txt == "Daily New Death Count per 100K Pop") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = deathsData[json][selectedDate];
    var pre_vals = deathsData[json][prev_date];
    return ((cur_vals[id] - pre_vals[id]) / populationData[json][id] * 100000).toFixed(3);
  } else if (txt == "7 Day Testing Positivity Rate %") {
    if (testingPosData[json][selectedDate][id] == '' || testingPosData[json][selectedDate][id] == 0) return 0;
    return Math.round(testingPosData[json][selectedDate][id]*1000)/10;
  } else if (txt == "7 Day Testing Capacity") {
    if (testingTcapData[json][selectedDate][id] == '' || testingTcapData[json][selectedDate][id] == 0) return 0;
    return Math.round(testingTcapData[json][selectedDate][id]*100)/100;
  } else if (txt == "7 Day Confirmed Cases per Testing %") {
    if (testingCcptData[json][selectedDate][id] == '' || testingCcptData[json][selectedDate][id] == 0) return 0;
    return Math.round(testingCcptData[json][selectedDate][id]*1000)/10;
  } else if (txt == "Uninsured % (Community Health Factor)") {
    let feat = jsondata[json]["features"][id];
    let geoid = parseInt(feat.properties.GEOID);
    let item = chrhlthfactorData[geoid];
    if (item) {
      if (isFinite(item["UnInPrc"])) {
        return item["UnInPrc"];
      }
    }
  } else if (txt == "Over 65 Years % (Community Health Context)") {
    let feat = jsondata[json]["features"][id];
    let geoid = parseInt(feat.properties.GEOID);
    let item = chrhlthcontextData[geoid];
    if (item) {
      if (isFinite(item["Over65YearsPrc"])) {
        return item["Over65YearsPrc"];
      }
    }
  } else if (txt == "Life expectancy (Length and Quality of Life)") {
    let feat = jsondata[json]["features"][id];
    let geoid = parseInt(feat.properties.GEOID);
    let item = chrhlthlifeData[geoid];
    if (item) {
      if (isFinite(item["LfExpRt"])) {
        return item["LfExpRt"];
      }
    }  
  }
  return 0;
}

function GetDataValues(inputDate) {
  // check for URL parameters date
  if (params_dict['dt'] != undefined && initial_load) {
    inputDate = params_dict['dt']
  } else if (inputDate == undefined || inputDate == null) {
    inputDate = selectedDate;
  }
  
  let json = selectedDataset;
  let txt = data_btn.innerText;
  if (txt == "Confirmed Count") {
    return Object.values(caseData[json][inputDate]);
  } else if (txt == "Confirmed Count per 100K Population") {
    var vals = [];
    for (var id in caseData[json][inputDate]) {
      if (populationData[json][id] == undefined || populationData[json][id] == 0)
        vals.push(0);
      else
        vals.push(caseData[json][inputDate][id] / populationData[json][id] * 100000);
    }
    return vals;

  } else if (txt == "Confirmed Count per Licensed Bed") {
    var vals = [];
    for (var id in caseData[json][inputDate]) {
      if (bedsData[json][id] == undefined || bedsData[json][id] == 0)
        vals.push(0);
      else
        vals.push(caseData[json][inputDate][id] / bedsData[json][id]);
    }
    return vals;

  } else if (txt == "Death Count") {
    return Object.values(deathsData[json][inputDate]);
  } else if (txt == "Death Count per 100K Population") {
    var vals = [];
    for (var id in deathsData[json][inputDate]) {
      if (populationData[json][id] == undefined || populationData[json][id] == 0)
        vals.push(0);
      else
        vals.push(deathsData[json][inputDate][id] / populationData[json][id] * 100000);
    }
    return vals;
  } else if (txt == "Death Count/Confirmed Count") {
    return Object.values(fatalityData[json][inputDate]);
  } else if (txt == "Daily New Confirmed Count") {
    let dt_idx = dates[selectedDataset].indexOf(inputDate);
    if (dt_idx == 0) { 
      let nn = caseData[json][inputDate].length;
      let rtn = []
      for (let i =0; i < nn; ++i) rtn.push(0);
      return rtn;
    }
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = caseData[json][inputDate];
    var pre_vals = caseData[json][prev_date];
    var rt_vals = [];
    for (let i in cur_vals) {
      rt_vals.push(cur_vals[i] - pre_vals[i]);
    }
    return rt_vals;

  } else if (txt == "Daily New Confirmed Count per 100K Pop") {
    let dt_idx = dates[selectedDataset].indexOf(inputDate);
    if (dt_idx == 0) { 
      let nn = caseData[json][inputDate].length;
      let rtn = []
      for (let i =0; i < nn; ++i) rtn.push(0);
      return rtn;
    }
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = caseData[json][inputDate];
    var pre_vals = caseData[json][prev_date];
    var rt_vals = [];
    for (let i in cur_vals) {
      let check_val = (cur_vals[i] - pre_vals[i]) / populationData[json][i] * 100000;
      if (isNaN(check_val) || check_val == undefined) check_val = 0;
      rt_vals.push(check_val);
    }
    return rt_vals;
  
  } else if (txt == "7-Day Average Daily New Confirmed Count per 100K Pop") {
    let dt_idx = dates[selectedDataset].indexOf(inputDate);
    if (dt_idx < 7) { 
      let nn = caseData[json][inputDate].length;
      let rtn = []
      for (let i =0; i < nn; ++i) rtn.push(0);
      return rtn;
    }
    let prev_date = dates[selectedDataset][dt_idx - 7];
    var cur_vals = caseData[json][inputDate];
    var pre_vals = caseData[json][prev_date];
    var rt_vals = [];
    for (let i in cur_vals) {
      let check_val = (cur_vals[i] - pre_vals[i]) / 7/populationData[json][i] * 100000;
      if (isNaN(check_val) || check_val == undefined) check_val = 0;
      rt_vals.push(check_val);
    }
    return rt_vals;

  } else if (txt == "7-Day Average Daily New Confirmed Count") {
    let dt_idx = dates[selectedDataset].indexOf(inputDate);
    if (dt_idx < 7) { 
      let nn = caseData[json][inputDate].length;
      let rtn = []
      for (let i =0; i < nn; ++i) rtn.push(0);
      return rtn;
    }
    let prev_date = dates[selectedDataset][dt_idx - 7];
    var cur_vals = caseData[json][inputDate];
    var pre_vals = caseData[json][prev_date];
    var rt_vals = [];
    for (let i in cur_vals) {
      let check_val = (cur_vals[i] - pre_vals[i]) /7;
      if (isNaN(check_val) || check_val == undefined) check_val = 0;
      rt_vals.push(check_val);
    }
    return rt_vals;

  } else if (txt == "Daily New Death Count") {
    let dt_idx = dates[selectedDataset].indexOf(inputDate);
    if (dt_idx == 0) { 
      let nn = caseData[json][inputDate].length;
      let rtn = []
      for (let i =0; i < nn; ++i) rtn.push(0);
      return rtn;
    }
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = deathsData[json][inputDate];
    var pre_vals = deathsData[json][prev_date];
    var rt_vals = [];
    for (let i in cur_vals) {
      let check_val = cur_vals[i] - pre_vals[i];
      if (isNaN(check_val) || check_val == undefined) check_val = 0;
      rt_vals.push(check_val);
    }
    return rt_vals;

  } else if (txt == "Daily New Death Count per 100K Pop") {
    let dt_idx = dates[selectedDataset].indexOf(inputDate);
    if (dt_idx == 0) { 
      let nn = caseData[json][inputDate].length;
      let rtn = []
      for (let i =0; i < nn; ++i) rtn.push(0);
      return rtn;
    }
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = deathsData[json][inputDate];
    var pre_vals = deathsData[json][prev_date];
    var rt_vals = [];
    for (let i in cur_vals) {
      let check_val = (cur_vals[i] - pre_vals[i]) / populationData[json][i] * 100000;
      if (isNaN(check_val) || check_val == undefined) check_val = 0;
      rt_vals.push(check_val);
    }
    return rt_vals;
   } else if (txt == "Forecasting (5-Day Severity Index)") {
    // berkeleyCountyData
    var rt_vals = [];
    const feats = jsondata[json]["features"];
    for (let i=0; i<feats.length; ++i) {
      const geoid = parseInt(feats[i]["properties"].GEOID);
      let check_val = berkeleyCountyData[geoid];
      let no_value = true;
      if (check_val != undefined) {
        let v = check_val["severityIndex"];
        if (v == "1" || v == "2" || v == "3") {
          rt_vals.push(parseInt(v));
          no_value = false;
        } 
      } 
      if (no_value) {
        rt_vals.push(0);
      }
    }
    return rt_vals;
  } else if (txt == "7 Day Testing Positivity Rate %") {
    var vals = [];
    for (var id in caseData[json][inputDate]) {
      if (testingPosData[json][inputDate][id] == '' || testingPosData[json][inputDate][id] == 0)
        vals.push(0);
      else
        vals.push(Math.round(testingPosData[json][inputDate][id]*1000)/10);
    }
    return vals;
  } else if (txt == "7 Day Testing Capacity") {
    var vals = [];
    for (var id in caseData[json][inputDate]) {
      if (testingTcapData[json][inputDate][id] == '' || testingTcapData[json][inputDate][id] == 0)
        vals.push(0);
      else
        vals.push(Math.round(testingTcapData[json][inputDate][id]*100)/100);
    }
    return vals;
  } else if (txt == "7 Day Confirmed Cases per Testing %") {
    var vals = [];
    for (var id in caseData[json][inputDate]) {
      if (testingCcptData[json][inputDate][id] == '' || testingCcptData[json][inputDate][id] == 0)
        vals.push(0);
      else
        vals.push(Math.round(testingCcptData[json][inputDate][id]*1000)/10);
    }
    return vals;
  } else if (txt == "Uninsured % (Community Health Factor)") {
    var rt_vals = [];
    const feats = jsondata[json]["features"];
    for (let i=0; i<feats.length; ++i) {
      const geoid = parseInt(feats[i]["properties"].GEOID);
      let check_val = chrhlthfactorData[geoid];
      let no_value = true;
      if (check_val != undefined) {
        let v = parseFloat(check_val["UnInPrc"]);
        if (isFinite(v)) {
          rt_vals.push(v);
          no_value = false;
        } 
      } 
      if (no_value) {
        rt_vals.push(0);
      }
    }
    return rt_vals;
  } else if (txt == "Over 65 Years % (Community Health Context)") {
    var rt_vals = [];
    const feats = jsondata[json]["features"];
    for (let i=0; i<feats.length; ++i) {
      const geoid = parseInt(feats[i]["properties"].GEOID);
      let check_val = chrhlthcontextData[geoid];
      let no_value = true;
      if (check_val != undefined) {
        let v = parseFloat(check_val["Over65YearsPrc"]);
        if (isFinite(v)) {
          rt_vals.push(v);
          no_value = false;
        } 
      } 
      if (no_value) {
        rt_vals.push(0);
      }
    }
    return rt_vals;
  } else if (txt == "Life expectancy (Length and Quality of Life)") {
    var rt_vals = [];
    const feats = jsondata[json]["features"];
    for (let i=0; i<feats.length; ++i) {
      const geoid = parseInt(feats[i]["properties"].GEOID);
      let check_val = chrhlthlifeData[geoid];
      let no_value = true;
      if (check_val != undefined) {
        let v = parseFloat(check_val["LfExpRt"]);
        if (isFinite(v)) {
          rt_vals.push(v);
          no_value = false;
        } 
      } 
      if (no_value) {
        rt_vals.push(0);
      }
    }
    return rt_vals;
  }
}

function UpdateLegend() {
  const div = document.getElementById('legend');

  if (selectedMethod == "natural_breaks") {
    div.className = "ZeroFirstBin"
  } else if (selectedMethod == "natural_breaks_hlthfactor" || selectedMethod == "natural_breaks_hlthcontextlife") {
    div.className = "HideFirstBin"
  } else {
    div.className = ''
  }

  var content = "";
  for (var i=0; i<COLOR_SCALE[selectedMethod].length; ++i) {
    content += "<div class=\"legend\" style=\"background: rgb(";
    content += COLOR_SCALE[selectedMethod][i][0] + ",";
    content += COLOR_SCALE[selectedMethod][i][1] + ",";
    content += COLOR_SCALE[selectedMethod][i][2];
    content += ");\"></div>";
  }
  div.innerHTML = content;

}

function UpdateLegendLabels(breaks) {
  let field = data_btn.innerText;
  const div = document.getElementById('legend-labels');
  var cont = '';

  if (`>${breaks.slice(-2,)[0]}` == breaks.slice(-2,)[1]) {
    breaks = breaks.slice(0,-1)
  }
  
  if (selectedMethod == "natural_breaks" || selectedMethod == "natural_breaks_hlthfactor" || selectedMethod == "natural_breaks_hlthcontextlife") {
    if (selectedMethod == "natural_breaks") cont += '<div style="text-align:left">0</div>';
    for (var i = 0; i < breaks.length; ++i) {
      let val = breaks[i];
      if (field == "Death Count/Confirmed Count") {
        cont += `<div style="text-align:center"> ${i==0?'<':i==breaks.length-1?'>':''}${val} </div>`;
      } else {
        if (val[0] == '>') {
          val = val.substring(1, val.length);
          if (val.indexOf('.') >= 0) {
            // format float number
            val = parseFloat(val);
            val = val.toFixed(2);
          } else {
            val = parseInt(val);
          }
          if (val > 1000 && val < 10000) {
            val = d3.format(".0f")(val)
          } else if (val > 10000) {
            val = d3.format(".2s")(val)
          }
          cont += `<div style="text-align:center"> ${i==0?'<':i==breaks.length-1?'>':''}${val} </div>`;
        } else {
          if (val.indexOf('.') >= 0) {
            // format float number
            val = parseFloat(val);
            val = val.toFixed(2);
          } else {
            val = parseInt(val);
          } 
          if (val > 1000 && val < 10000) {
            val = d3.format(".0f")(val)
          } else if (val > 10000) {
            val = d3.format(".2s")(val)
          }
          cont += `<div style="text-align:center"> ${i==0?'<':i==breaks.length-1?'>':''}${val} </div>`;
        }
      }
    }
    
    div.style.padding = `0 5%`
  } else if (selectedMethod.startsWith("hinge")) {
    // box plot
    cont += '<div style="text-align:center">Lower Outlier</div>';
    cont += '<div style="text-align:center">< 25%</div>';
    cont += '<div style="text-align:center">25-50%</div>';
    cont += '<div style="text-align:center">50-75%</div>';
    cont += '<div style="text-align:center">>75%</div>';
    cont += '<div style="text-align:center">Upper Outlier</div>';
    div.style.padding = `0`;
  } else if (selectedMethod == "forecasting") {
    // forecasting 
    cont += '<div style="text-align:center">N/A</div>';
    cont += '<div style="text-align:center">Low</div>';
    cont += '<div style="text-align:center">Medium</div>';
    cont += '<div style="text-align:center">High</div>';
    div.style.padding = `0`;
  } 
  else if (selectedMethod == "testing_fixed_bins" || selectedMethod == "testing_cap_fixed_bins") {
    for (var i = 0; i < breaks.length; ++i) {
      if (i == 0) {
        cont += '<div style="text-align:center; transform: translateX(-45%);">' + breaks[i] + '</div>'
      } else {
        cont += '<div style="text-align:center;">' + breaks[i] + '</div>'
      }
    }
    div.style.padding = `0 5%`
  }
  div.innerHTML = cont;

}

function UpdateLegendTitle(){
  let div = document.getElementById('legend_title');
  let bins;

  if (selectedMethod.includes("natural_breaks")) {
    bins = '(Natural Breaks)'
  } else if (selectedMethod.includes("fixed")) {
    bins = '(Fixed Bins)'
  } else if (selectedMethod == "lisa") {
    bins = '(Local Moran)'
  } else if (selectedMethod == "forecasting") {
    bins = ''
  } else if (selectedMethod.includes("hinge")) {
    bins = '(Box Map)'
  }

  div.innerHTML = `${selectedVariable == null ? config.LEGEND_TEXT[config.DEFAULT[selectedDataset]] : config.LEGEND_TEXT[selectedVariable]} ${bins}` 
}

function UpdateLisaLegend(colors) {
  const div = document.getElementById('legend');
  div.className = ''
  var cont = '<div class="legend" style="background: #eee;"></div>';
  for (var i = 1; i < colors.length - 2; ++i) {
    cont += '<div class="legend" style="background: ' + colors[i] + ';"></div>';
  }
  div.innerHTML = cont;
}

function UpdateLisaLabels(labels) {
  const div = document.getElementById('legend-labels');
  div.style.padding = `0`;
  var cont = `<div style="width: 20%;text-align:center">Not Sig <div class="top info-tooltip" id="info-NotSig" ><i class="fa fa-info-circle" aria-hidden="true"></i><span class="tooltip-text">${config.TOOLTIP['NotSig']}</span></div> </div>`;
  for (var i = 1; i < 5; ++i) {
    const classLabel = labels[i].replace('-', '');
    cont += `<div style="width: 20%;text-align:center"> ${labels[i]} <div class="top info-tooltip" id="info-${classLabel}"><i class="fa fa-info-circle" aria-hidden="true"></i><span class="tooltip-text">${config.TOOLTIP[classLabel]}</span></div></div>`;
  }
  div.innerHTML = cont;
}

// Updates info boxes/tooltips with help text
function updateTooltips() {
  const tooltips = document.querySelectorAll(".info-tooltip");
  tooltips.forEach(t => {
    const name = t.id.replace('info-', '');
    const text = config.TOOLTIP[name];
    const textElem = t.querySelector('.tooltip-text');
    textElem.innerHTML = text;
  });
}

function OnChoroplethClick(evt, map_type, fixed_bins) {
  use_fixed_bins = fixed_bins;
  // update legend title
  // document.getElementById('legend_title').innerText = evt.innerHTML.split('<')[0].trim();
  if (selectedVariable == "Uninsured % (Community Health Factor)" && map_type == "natural_breaks") {
    // hard coded selectedMethod for health related variables
    selectedMethod = "natural_breaks_hlthfactor";
  } else if ((selectedVariable == "Over 65 Years % (Community Health Context)" || selectedVariable == "Life expectancy (Length and Quality of Life)") && map_type == "natural_breaks") {
    selectedMethod = "natural_breaks_hlthcontextlife";
  } else {
    selectedMethod = map_type;
  }
  if (isState()) {
    OnStateClick();
  } else {
    OnCountyClick();
  }
}

function UpdateOverlays(evt) {
  shouldShowOverlays = {
    'Reservations': false,
    'HypersegregatedCities': false,
    'BlackBelt': false,
    'USCongress': false,
  }

  UpdateMap();
  if (evt != null) {
    shouldShowOverlays[`${(evt.id).split('-')[1]}`] = true;
    UpdateMap();
  } 
}

function UpdateResources(evt) {
  shouldShowResources = {
    'Clinics': false,
    'Hospitals': false,
    'ClinicsHospitals': false
  }

  if (evt != null) {
    let resource = (evt.id).split('-')[1];
    shouldShowResources[resource] = true;

    if ((resource == 'Clinics' || resource == 'Hospitals' || resource == 'ClinicsHospitals') && (!hasPromptedZoom) && (mapbox.getZoom() < 7)){
      AlertUser("TooFar");
      hasPromptedZoom = true;
    }
  } 
  
  UpdateMap();
}

function OnLISAClick(evt) {
  selectedMethod = "lisa";

  // update legend title
  // document.getElementById('legend_title').innerText = evt.innerHTML.split('<')[0].trim();

  var w = getCurrentWuuid();
  var data = GetDataValues();
  let field = data_btn.innerText;
  var color_vec = lisa_colors;
  var labels = lisa_labels;
  var clusters;
  var sig;

  if (!(selectedDataset in lisaData)) lisaData[selectedDataset] = {};

  if (selectedDate in lisaData[selectedDataset] && field in lisaData[selectedDataset][selectedDate]) {
    clusters = lisaData[selectedDataset][selectedDate][field].clusters;
    sig = lisaData[selectedDataset][selectedDate][field].sig;

  } else {
    let all_zeros = true;
    for (let i=0; i<data.length; ++i) { 
      if (data[i] != 0)
        all_zeros = false;
    }
    if (all_zeros) {
      clusters = [];
      sig = [];
      for (let i=0; i<data.length; ++i) { 
        clusters.push(0);
        sig.push(0);
      }
    } else {
      var lisa = gda_proxy.local_moran1(w.map_uuid, w.w_uuid, data);
      clusters = gda_proxy.parseVecDouble(lisa.clusters());
      sig = gda_proxy.parseVecDouble(lisa.significances());
    }
    if (!(selectedDate in lisaData[selectedDataset])) lisaData[selectedDataset][selectedDate] = {}
    if (!(field in lisaData[selectedDataset][selectedDate])) lisaData[selectedDataset][selectedDate][field] = {}
    lisaData[selectedDataset][selectedDate][field]['clusters'] = clusters;
    lisaData[selectedDataset][selectedDate][field]['pvalues'] = sig;
  } 
  
  color_vec[0] = '#ffffff';

  getFillColor = function(f) {
    var c = clusters[f.properties.id];
    if (c == 0 || c == undefined) return [255, 255, 255, 200];
    return hexToRgb(color_vec[c]);
  };

  getLineColor = function(f) {
    //return f.properties.id == selectedId ? [255, 0, 0] : [255, 255, 255, 50];
    return  [255, 255, 255, 50];
  };

  UpdateLisaLegend(color_vec);
  UpdateLisaLabels(labels);
  UpdateLegendTitle();

  evt.classList.add("checked");
  document.getElementById("btn-nb").classList.remove("checked");

  if (isState()) {
    loadMap(stateMap);
  } else {
    loadMap(selectedDataset);
  }
}

function loadScript(url) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  const head = document.querySelector('head');
  head.appendChild(script);
  return new Promise(resolve => {
    script.onload = resolve;
  });
}

function getConfirmedCountByDateState(data, state) {
  var features = data['features'];
  var dates = getDatesFromGeojson(data);
  var counts = 0;
  var sel_dt = Date.parse(selectedDate);
  for (var j = 0; j < features.length; ++j) {
    if (features[j]["properties"]["STUSPS"] == state) {
      for (var i = 0; i < dates.length; ++i) {
        var d = Date.parse(dates[i]);
        if (d <= sel_dt) {
          counts += features[j]["properties"][dates[i]];
        }
      }
      break;
    }
  }
  return counts;
}

function getConfirmedCountByDateCounty(county_id, all) {
  let json = selectedDataset;
  let n_count = Object.keys(caseData[json][selectedDate]).length;
  var counts = [];
  let d = dates[selectedDataset][0];
  let sum = 0;
  let sel_dt = Date.parse(selectedDate);

  if (all || Date.parse(d) <= sel_dt) {
    sum = caseData[json][d][county_id];
  }
  counts.push(sum);
  for (let i = 1; i < dates[selectedDataset].length; ++i) {
    let sum = 0;
    let d0 = dates[selectedDataset][i - 1];
    let d1 = dates[selectedDataset][i];
    if (all || Date.parse(d1) <= sel_dt) {
      sum = (caseData[json][d1][county_id] - caseData[json][d0][county_id]);
    }
    if (sum < 0) {
      console.log("USAFacts data issue at ", jsondata[json].features[county_id].properties.NAME);
      sum = 0;
    }
    counts.push(sum);
  }
  return counts;
}

function getSmoonthConfirmedCountByDateCounty(county_id, all) {
  let json = selectedDataset;
  let n_count = Object.keys(caseData[json][selectedDate]).length;
  var counts = [];
  let d = dates[selectedDataset][0];
  let sum = 0;
  let sel_dt = Date.parse(selectedDate);

  if (all || Date.parse(d) <= sel_dt) {
    sum = caseData[json][d][county_id];
  }
  counts.push(sum);
  for (let i = 1; i < 7; ++i) {
    counts.push(0);
  }
  for (let i = 7; i < dates[selectedDataset].length; ++i) {
    let sum = 0;
    let d0 = dates[selectedDataset][i - 7];
    let d1 = dates[selectedDataset][i];
    if (all || Date.parse(d1) <= sel_dt) {
      sum = (caseData[json][d1][county_id] - caseData[json][d0][county_id])/7;
    }
    if (sum < 0) {
      console.log("USAFacts data issue at ", jsondata[json].features[county_id].properties.NAME);
      sum = 0;
    }
    counts.push(sum);
  }
  return counts;
}

function getConfirmedCountByDate(data, all) {
  let json = selectedDataset;
  if (params_dict['dt'] != undefined && initial_load) {
    selectedDate = params_dict['dt'];
  } else if (!(selectedDate in caseData[json])) {
    selectedDate = dates[json][dates[json].length - 1];
  }
  let n_count = Object.keys(caseData[json][selectedDate]).length;
  var counts = [];
  let d = dates[selectedDataset][0];
  // get total count for 1st day
  let sum = 0;
  let sel_dt = Date.parse(selectedDate);
  for (let j = 0; j < n_count; ++j) {
    if (all || Date.parse(d) <= sel_dt) {
      sum = caseData[json][d][j];
    }
  }
  counts.push(sum);
  for (let i = 1; i < dates[selectedDataset].length; ++i) {
    let pre_sum = 0;
    let cur_sum = 0;
    let d0 = dates[selectedDataset][i - 1];
    let d1 = dates[selectedDataset][i];
    if (all || Date.parse(d1) <= sel_dt) {
      for (let j = 0; j < n_count; ++j) {
        pre_sum += caseData[json][d0][j];
        cur_sum += caseData[json][d1][j];
      }
    }
    counts.push(cur_sum - pre_sum < 0 ? 0 : cur_sum - pre_sum);
  }
  return counts;
}

function getSmoothConfirmedCountByDate(data, all) {
  let json = selectedDataset;
  if (!(selectedDate in caseData[json])) {
    selectedDate = dates[json][dates[json].length - 1];
  }
  let n_count = Object.keys(caseData[json][selectedDate]).length;
  var counts = [];
  let d = dates[selectedDataset][0];
  // get total count for 1st day
  let sum = 0;
  let sel_dt = Date.parse(selectedDate);
  for (let j = 0; j < n_count; ++j) {
    if (all || Date.parse(d) <= sel_dt) {
      sum = caseData[json][d][j];
    }
  }
  counts.push(sum);
  for (let i = 1; i < 7; ++i) {
    counts.push(0);
  }
  for (let i = 7; i < dates[selectedDataset].length; ++i) {
    let pre_sum = 0;
    let cur_sum = 0;
    let d0 = dates[selectedDataset][i - 7];
    let d1 = dates[selectedDataset][i];
    if (all || Date.parse(d1) <= sel_dt) {
      for (let j = 0; j < n_count; ++j) {
        pre_sum += caseData[json][d0][j];
        cur_sum += caseData[json][d1][j];
      }
    }
    counts.push(cur_sum - pre_sum < 0 ? 0 : (cur_sum - pre_sum)/7);
  }
  return counts;
}

function getAccumConfirmedCountByDate(data, all) {
  var counts = getConfirmedCountByDate(data, all);
  for (var i = 1; i < counts.length; ++i) {
    counts[i] = counts[i - 1] + counts[i];
  }
  return counts;
}

function getSmoothAccumConfirmedCountByDate(data, all) {
  var counts = getSmoothConfirmedCountByDate(data, all);
  for (var i = 1; i < counts.length; ++i) {
    counts[i] = counts[i - 1] + counts[i];
  }
  return counts;
}

// following code are for LINE CHART
function addTrendLine(data, title) {
  var height = 140;
  var width = 290;
  var margin = {
    top: 10,
    right: 20,
    bottom: 50,
    left: 50
  };

  d3.select("#linechart svg").remove();

  var svg = d3.select("#linechart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(0," + margin.top + ")");
    
  svg.append("g").attr("class", "y axis");
  svg.append("g").attr("class", "x axis");

  var xScale = d3.scaleBand().range([margin.left, width], .1);
  var yScale = d3.scaleLinear().range([height, 10]);
  var xAxis = d3.axisBottom().scale(xScale);
  var yAxis = d3.axisLeft().scale(yScale);

  // extract the x labels for the axis and scale domain
  var xLabels = dates[selectedDataset];
  xScale.domain(xLabels);

  var yValues = getConfirmedCountByDate(data, false);
  yScale.domain([0, Math.max.apply(null, yValues)]);

  var smoothyValues = getSmoothConfirmedCountByDate(data, false);

  var tmpData = [];
  for (var i = 0; i < xLabels.length; ++i) {
    tmpData.push({
      "date": xLabels[i],
      "confirmedcases": yValues[i],
      "smoothconfirmedcases": smoothyValues[i]
    });
  }
  var line = d3.line()
    .x(function(d) {
      return xScale(d['date']);
    })
    .y(function(d) {
      return yScale(d['confirmedcases']);
    });
    
  var smoothline = d3.line()
    .x(function(d) {
      return xScale(d['date']);
    })
    .y(function(d) {
      return yScale(d['smoothconfirmedcases']);
    });

  svg.append("path")
    .datum(tmpData)
    .attr("class", "line")
    .attr("d", line)
    .attr("stroke", "red")
    .attr("stroke-width", 1);

  svg.append("path")
    .datum(tmpData)
    .attr("class", "smoothline")
    .attr("d", smoothline)
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1);
  
  var xstride = Math.floor(xLabels.length/10)
  svg.append("g")
    .attr("transform", "translate(0," + (height) + ")")
    .call(xAxis.tickValues(xLabels.filter(function(d, i) {
      if (i % xstride == 0)
        return d;
    })).tickFormat(function(e) {
      let d = new Date(e);
      let mo = new Intl.DateTimeFormat('en', {
        month: '2-digit'
      }).format(d)
      let da = new Intl.DateTimeFormat('en', {
        day: '2-digit'
      }).format(d)
      return mo + '-' + da;
    }))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("class", "xaxis")
    .attr("transform", function(d) {
      return "rotate(-45)";
    });

  svg.append("g")
    .attr("transform", "translate(" + (margin.left) + ",0)")
    .attr("class", "yaxis")
    .call(yAxis.tickFormat(function(e, i) {
      if (i % 2 == 1 || Math.floor(e) != e)
        return;
      return d3.format(",")(e);
    }));


  // chart title
  svg.append("text")
    .attr("class", "linetitle")
    .attr("x", (width + (margin.left + margin.right)) / 2)
    .attr("y", 0 + margin.top)
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-family", "sans-serif")
    .text(title);
}

// ** Update data section (Called from the onclick)
function updateTrendLine({
  x,
  y,
  object
}) {
  var height = 140;
  var width = 290;
  var margin = {
    top: 10,
    right: 20,
    bottom: 50,
    left: 50
  };
  var xLabels, yValues, smoothyValues, title;
  let json = selectedDataset;

  xLabels = dates[selectedDataset];
  if (object) {
    yValues = getConfirmedCountByDateCounty(object.properties.id, false);
    smoothyValues = getSmoonthConfirmedCountByDateCounty(object.properties.id, false);
  } else {
    yValues = getConfirmedCountByDate(jsondata[json], false);
    smoothyValues = getSmoothConfirmedCountByDate(jsondata[json], false);
  }
  title = object ? object.properties["NAME"] : "U.S.";

  // Get the data again
  var tmpData = [];
  for (var i = 0; i < xLabels.length; ++i) {
    tmpData.push({
      "date": xLabels[i],
      "confirmedcases": yValues[i],
      "smoothconfirmedcases": smoothyValues[i]
    });
  }

  var xScale = d3.scaleBand()
    .range([margin.left, width], .1);

  var yScale = d3.scaleLinear()
    .range([height, 10]);

  // Scale the range of the data again 
  xScale.domain(xLabels);
  yScale.domain([0, Math.max.apply(null, yValues)]);

  // Select the section we want to apply our changes to
  var svg = d3.select("#linechart svg").transition();

  var line = d3.line()
    .x(function(d) {
      return xScale(d['date']);
    })
    .y(function(d) {
      return yScale(d['confirmedcases']);
    });
  
  var smoothline = d3.line()
    .x(function(d) {
      return xScale(d['date']);
    })
    .y(function(d) {
      return yScale(d['smoothconfirmedcases']);
    });

  var xAxis = d3.axisBottom()
    .scale(xScale);

  var yAxis = d3.axisLeft()
    .scale(yScale);

  // Make the changes
  svg.select(".line") // change the line
    .duration(750)
    .attr("d", line(tmpData));
  svg.select(".smoothline") // change the line
    .duration(750)
    .attr("d", smoothline(tmpData));
  svg.select(".yaxis") // change the y axis
    .duration(750)
    .call(yAxis);
  svg.select(".xaxis") // change the x axis
    .duration(750)
    .call(xAxis);

  svg.select(".linetitle")
    .text(title);
}

// HAX: For time slider to handle different date format with 1P3A datasets. 
function hyphenToSlashDate(date) {
  // Split yyyy-mm-dd at hyphen
  const parts = date.split('-');
  const month = parts[1];
  const day = parts[2];
  const year = parts[0];
  // Return mm/dd/yyyy
  return `${month}/${day}/${year}`;
}

function createTimeSlider(geojson) {
  if (document.getElementById("slider-svg").innerHTML.length > 0) {
    if (d3.select("#slider").node().max != dates[selectedDataset].length) {
      d3.select("#slider-svg").select("svg").remove();
    } else {
      return;
    }
  }

  var width = 280,
    height = 180,
    padding = 28;

  var svg = d3.select("#slider-svg")
    .append("svg")
    .attr("width", width + padding * 2)
    .attr("height", height);

  var xScale = d3.scaleBand()
    .range([padding, width], .1);

  var yScale = d3.scaleLinear()
    .range([height - padding, padding]);

  var xLabels = dates[selectedDataset];
  xScale.domain(xLabels);

  d3.select("#slider").node().max = xLabels.length;
  d3.select("#slider").node().value = xLabels.length;

  var yValues = getAccumConfirmedCountByDate(geojson, true);
  yScale.domain([0, Math.max.apply(null, yValues)]);

  var smoothyValues = getSmoothAccumConfirmedCountByDate(geojson, true);

  var tmpData = [];
  for (var i = 0; i < xLabels.length; ++i) {
    tmpData.push({
      "date": xLabels[i],
      "confirmedcases": yValues[i],
      "smoothconfirmedcases": smoothyValues[i]
    });
  }

  var bars = svg.selectAll(".bars")
    .data(tmpData)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.date))
    .attr("width", xScale.bandwidth() > 1 ? xScale.bandwidth() - 1 : xScale.bandwidth()) // xScale.bandwidth() -1
    .attr("y", d => yScale(d.confirmedcases))
    .attr("height", d => height - padding - yScale(d.confirmedcases))
    .text("1")
    .attr("fill", (d => xLabels[d3.select("#slider").node().value - 1] == d.date ? "red" : "gray"));
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisRight(yScale);

  //var gX = svg.append("g")
  //    .attr("transform", "translate(0," + (height - padding) + ")")
  //    .call(xAxis);

  var gY = svg.append("g")
    .attr("class", "axis--y")
    .attr("transform", "translate(" + (width) + ",0)")
    .call(yAxis.tickFormat(function(e, i) {
      if (i % 2 == 1)
        return;
      return d3.format(",")(e);
    }));

  svg.append("text")
    .attr("transform", "translate(" + (width / 2) + "," + 0 + ")")
    .attr("dy", "1em")
    .attr("class", "slider_text")
    .attr("text-anchor", "end")
    .style("fill", "gray")
    .html(selectedDate);

    const slider = document.getElementById('slider');
    const sliderBubble = document.getElementById('bubble');
    const sliderMin = document.getElementById('slider-min');
    const sliderMax = document.getElementById('slider-max');
    
    let sliderSelectedDate = selectedDate;

    // HAX: convert 1p3a dates to same format as usafacts 
    if (selectedDataset === 'county_1p3a.geojson' || selectedDataset === 'state_1p3a.geojson') {
      sliderSelectedDate = hyphenToSlashDate(sliderSelectedDate);
    }

    sliderMin.innerHTML = dates[selectedDataset][0];
    sliderMax.innerHTML = dates[selectedDataset][slider.max - 1];
    if (params_dict['dt'] != undefined && initial_load) slider.value = parseInt(slider.max) - Math.round((new Date(latestDate) - new Date(selectedDate))/86400000)
    const months =  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const rawDate = new Date(sliderSelectedDate);
    const printableDate = `${months[rawDate.getMonth()]} ${rawDate.getDate()}, ${rawDate.getFullYear()}`
    sliderBubble.innerText = printableDate;
    sliderBubble.classList.remove("hidden");

  d3.select("#slider").on("input", function() {
    onSliderChange(this.value);
  });
}

function onSliderChange(val) {
  var width = 280,
    height = 180,
    padding = 28;

  const months =  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var geojson = jsondata[selectedDataset];

  var xScale = d3.scaleBand()
    .range([padding, width], .1);
  var yScale = d3.scaleLinear()
    .range([height - padding, padding]);

  var currentValue = parseInt(val);
  selectedDate = dates[selectedDataset][currentValue - 1];
  sliderSelectedDate = selectedDate;
  
  document.getElementById('time-container').innerText = selectedDate;
  var xLabels = dates[selectedDataset];
  xScale.domain(xLabels);

  const slider = document.getElementById('slider');
  const sliderBubble = document.getElementById('bubble');
  const sliderMin = document.getElementById('slider-min');
  const sliderMax = document.getElementById('slider-max');

  // HAX: convert 1p3a dates to same format as usafacts 
  if (selectedDataset === 'county_1p3a.geojson' || selectedDataset === 'state_1p3a.geojson') {
    sliderSelectedDate = hyphenToSlashDate(selectedDate);
  }

  const rawDate = new Date(sliderSelectedDate);
  const printableDate = `${months[rawDate.getMonth()]} ${rawDate.getDate()}, ${rawDate.getFullYear()}`
  sliderMin.innerHTML = dates[selectedDataset][0];
  sliderMax.innerHTML = dates[selectedDataset][slider.max - 1];

  sliderBubble.innerText = printableDate;
  sliderBubble.classList.remove("hidden");

  // reposition slider bubble

  var yValues = getAccumConfirmedCountByDate(geojson, true);
  yScale.domain([0, Math.max.apply(null, yValues)]);
  var smoothyValues = getSmoothAccumConfirmedCountByDate(geojson, true);


  d3.select(".slider_text")
    .html(selectedDate);

  //gY.call(yAxis);
  if (isLisa()) {
    OnLISAClick(document.getElementById('btn-lisa'));
  } else {
    if (isState()) {
      OnStateClick();
    } else {
      OnCountyClick();
    }
  }
}

var play_timer;

d3.select("#play-button").on("click", function(d,i){
  if (document.getElementById("play-button").src.endsWith("play-icon.png")){
    document.getElementById("play-button").src = 'img/pause-icon.png';
    play_timer = setTimeout(moveslider,500);
  } else {
    document.getElementById("play-button").src = 'img/play-icon.png';
    clearTimeout(play_timer);
  }  
});

function moveslider() {
  var x = parseInt(document.getElementById("slider").value); 
  if (x == parseInt(document.getElementById("slider").max)){
    x = parseInt(document.getElementById("slider").min);
  } 
    document.getElementById("slider").value = x + 1;
    onSliderChange(x+1);
    play_timer=setTimeout(moveslider,500)
};

function ShareMap() {
  var copyText = document.getElementById("share-url");
  copyText.value = `${window.location.href.split('map.html')[0]}map.html${getURLParams()}`;
  copyText.style.display = 'block'
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
  copyText.style.display = 'none';

  let share_container = document.getElementById("share-container");
  share_container.className = 'active';

  setTimeout(function(){ share_container.className = ''; }, 5000);
}

/*
 * ENTRY POINT
*/
var Module = {
  onRuntimeInitialized: function () {
    gda_proxy = new GeodaProxy();

    if ((params_dict['src'] == undefined) && (params_dict['mthd'] == undefined)) {
      OnCountyClick();
    } else if ((params_dict['src'] != undefined) && (params_dict['mthd'] == undefined)) {
      if (dataset_index[parseInt(params_dict['src'])].includes("state")) {
        OnStateClick();
      } else {
        OnCountyClick();
      }
    } else if ((params_dict['src'] == undefined) && (params_dict['mthd'] != undefined)) {
      if (params_dict['mthd'] == 'lisa') {
        OnCountyClick();
        try {
          setTimeout(function(){
            OnLISAClick(document.getElementById('btn-lisa'));
          }, 1000)
        } catch {
          setTimeout(function(){
            OnLISAClick(document.getElementById('btn-lisa'));
          }, 5000)
        }
      } else {
        OnCountyClick();
      }
    } else if ((params_dict['src'] != undefined) && (params_dict['mthd'] != undefined)) {

      if (dataset_index[parseInt(params_dict['src'])].includes("state")) {
        OnStateClick();
      } else {
        OnCountyClick();
      }

      if (params_dict['mthd'] == 'lisa') {
        OnCountyClick();
        try {
          setTimeout(function(){
            OnLISAClick(document.getElementById('btn-lisa'));
          }, 1000)
        } catch {
          setTimeout(function(){
            OnLISAClick(document.getElementById('btn-lisa'));
          }, 5000)
        }
      }
    }
  }
};