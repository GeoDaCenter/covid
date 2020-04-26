/*
/*
 * DEPENDENCIES
*/

const {
  DeckGL,
  GeoJsonLayer,
  TextLayer,
  ScatterplotLayer
} = deck;


/*
 * CONFIG
*/

const COLOR_SCALE = [
  [240, 240, 240],
  // positive
  [255, 255, 204],
  [255, 237, 160],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [189, 0, 38],
  [128, 0, 38]
];

var lisa_labels = ["Not significant", "High-High", "Low-Low", "High-Low", "Low-High", "Undefined", "Isolated"];
var lisa_colors = ["#ffffff", "#FF0000", "#0000FF", "#a7adf9", "#f4ada8", "#464646", "#999999"];


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

function saveText(text, filename) {
  var a = document.createElement('a');
  a.setAttribute("id", filename);
  a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  a.setAttribute('download', filename);
  a.click()
}


/*
 * GLOBALS
*/

// data
var usafactsCases;
var usaFactsDeaths;
var usfacts_jsondata;
var onep3a_jsondata;
var population_data = {};
var beds_data = {};
var cartogram_data;
var dates = {};
var confirmed_count_data = {};
var death_count_data = {};
var fatality_data = {};
var lisa_data = {};

// dataset name constants
var state_map = "states_update.geojson";
var county_map = "county_usfacts.geojson";
var map_variable = "confirmed_count";

// ui elements
var choropleth_btn = document.getElementById("btn-nb");
var lisa_btn = document.getElementById("btn-lisa");
var data_btn = document.getElementById("select-data");
var source_btn = document.getElementById("select-source");

// geoda
var gda_proxy;
var gda_weights = {};
var jsondata = {};
var centroids = {};

// misc
var current_view = null;
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
var selectedDataset = null;
var selectedId = null;
var selectedDate = null;
var selectedVariable = null;
var selectedMethod = null;
var shouldShowLabels = false;
// TODO this doesn't seem to get used
var selectedStateId = -1;

function isState() {
  return source_btn.innerText.indexOf('State') >= 0;
}

function isLisa() {
  return document.getElementById("btn-lisa").classList.contains("checked");
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

/*
 * DATA LOADING
*/

function loadGeoDa(url, loadmap_evt) {
  if (gda_proxy.Has(url)) {
    if (url.endsWith('county_usfacts.geojson')) {
      selectedDataset = 'county_usfacts.geojson';
    } else {
      if (url.endsWith('counties_update.geojson')) {
        selectedDataset = 'counties_update.geojson';
      } else {
        selectedDataset = 'states_update.geojson';
      }
    }
    updateDates();
    loadmap_evt();

  } else if (url.endsWith('county_usfacts.geojson')) {
    // load usfacts geojson data
    fetch(url)
      .then((response) => {
        return response.blob();
      })
      .then((bb) => {
        // read as bytearray for GeoDaWASM
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
          var ab = event.target.result;
          gda_proxy.ReadGeojsonMap(url, {
            result: ab
          });

          let sel_map = url.indexOf('state') >= 0 ? 'state' : 'county';
          selectedDataset = 'county_usfacts.geojson'; // only  has county from UsaFacts

          // read as geojson for map
          var jsonReader = new FileReader();
          jsonReader.onload = function (event) {
            let data = JSON.parse(event.target.result);
            data = initFeatureSelected(data);
            usfacts_jsondata = data;
            // load usfacts csv data
            let csv_conf_url = "covid_confirmed_usafacts.csv";
            let csv_death_url = "covid_deaths_usafacts.csv";
            d3.csv(csv_conf_url, function (confirm_data) {
              d3.csv(csv_death_url, function (death_data) {
                selectedDataset = 'county_usfacts.geojson';
                usafactsCases = confirm_data;
                usaFactsDeaths = death_data;
                // merge usfacts csv data
                parseUsaFactsData(data, confirm_data, death_data);
                jsondata[selectedDataset] = data;
                loadmap_evt();
              });
            });
          };
          jsonReader.readAsText(bb);
          // get centroids for Cartogram
          centroids[selectedDataset] = gda_proxy.GetCentroids(url);
        };
        fileReader.readAsArrayBuffer(bb);
      });
  } else {
    // load 1P3A data 
    //zip.workerScriptsPath = "./js/";
    zip.workerScripts = {
      deflater: ['./js/z-worker.js', './js/pako/pako_deflate.min.js', './js/pako/codecs.js'],
      inflater: ['./js/z-worker.js', './js/pako/pako_inflate.min.js', './js/pako/codecs.js']
    };
    fetch(url + ".zip")
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        // use a BlobReader to read the zip from a Blob object
        zip.createReader(new zip.BlobReader(blob), function (reader) {
          // get all entries from the zip
          reader.getEntries(function (entries) {
            if (entries.length) {
              // uncompress first entry content as blob
              entries[0].getData(new zip.BlobWriter(), function (bb) {
                // read as bytearray for GeoDaWASM
                var fileReader = new FileReader();
                fileReader.onload = function (event) {
                  var ab = event.target.result;
                  gda_proxy.ReadGeojsonMap(url, {
                    result: ab
                  });

                  let sel_map = url.startsWith('state') ? 'state' : 'county';
                  selectedDataset = sel_map == 'state' ? 'states_update.geojson' : 'counties_update.geojson';
                  // read as json
                  var jsonReader = new FileReader();
                  jsonReader.onload = function (event) {
                    let data = JSON.parse(event.target.result);
                    data = initFeatureSelected(data);
                    onep3a_jsondata = data;
                    parse1P3AData(data);
                    jsondata[selectedDataset] = data;
                    loadmap_evt();
                  };
                  jsonReader.readAsText(bb);
                  centroids[selectedDataset] = gda_proxy.GetCentroids(url);
                };
                fileReader.readAsArrayBuffer(bb);
                // close the zip reader
                reader.close(function () { // onclose callback
                });
              }, function (current, total) { // onprogress callback
              });
            }
          });
        }, function (error) { // onerror callback
          console.log("zip wrong");
        });
      });
  } // end else
}

function getDatesFromUsaFacts(confirm_data) {
  var xLabels = [];
  let n = confirm_data.length;
  for (let col in confirm_data[0]) {
    if (col.endsWith("20")) {
      xLabels.push(col);
    }
  }
  return xLabels;
}

function parseUsaFactsData(data, confirm_data, death_data) {
  let json = selectedDataset;
  if (!(json in confirmed_count_data)) confirmed_count_data[json] = {};
  if (!(json in death_count_data)) death_count_data[json] = {};
  if (!(json in fatality_data)) fatality_data[json] = {};
  if (!(json in population_data)) population_data[json] = {};
  if (!(json in beds_data)) beds_data[json] = {};

  dates[selectedDataset] = getDatesFromUsaFacts(confirm_data);
  if (selectedDate == null || selectedDate.indexOf('-') >= 0)
    selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];

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
    if (!(geoid in conf_dict)) {
      console.log("UsaFacts does not have:", data.features[i].properties);
      for (let j = 0; j < dates[selectedDataset].length; ++j) {
        let d = dates[selectedDataset][j];
        confirmed_count_data[json][d][i] = 0;
        death_count_data[json][d][i] = 0;
        fatality_data[json][d][i] = 0;
      }
      continue;
    }
    population_data[json][i] = pop;
    beds_data[json][i] = beds;

    // confirmed count
    for (let j = 0; j < dates[selectedDataset].length; ++j) {
      let d = dates[selectedDataset][j];
      if (!(d in confirmed_count_data[json])) {
        confirmed_count_data[json][d] = {};
      }
      confirmed_count_data[json][d][i] = conf_dict[geoid][d] == '' ? 0 : parseInt(conf_dict[geoid][d]);
    }
    // death count
    for (var j = 0; j < dates[selectedDataset].length; ++j) {
      var d = dates[selectedDataset][j];
      if (!(d in death_count_data[json])) {
        death_count_data[json][d] = {};
      }
      death_count_data[json][d][i] = death_dict[geoid][d] == '' ? 0 : parseInt(death_dict[geoid][d]);
    }
    // fatality
    for (var j = 0; j < dates[selectedDataset].length; ++j) {
      var d = dates[selectedDataset][j];
      if (!(d in fatality_data[json])) {
        fatality_data[json][d] = {};
      }
      fatality_data[json][d][i] = 0;
      if (confirmed_count_data[json][d][i] > 0) {
        fatality_data[json][d][i] = death_count_data[json][d][i] / confirmed_count_data[json][d][i];
      }
    }
  }
}

function parse1P3AData(data) {
  let json = selectedDataset;
  if (!(json in confirmed_count_data)) confirmed_count_data[json] = {};
  if (!(json in death_count_data)) death_count_data[json] = {};
  if (!(json in fatality_data)) fatality_data[json] = {};
  if (!(json in population_data)) population_data[json] = {};
  if (!(json in beds_data)) beds_data[json] = {};

  dates[selectedDataset] = getDatesFromGeojson(data);
  if (selectedDate == null || selectedDate.indexOf('/'))
    selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];

  for (let i = 0; i < data.features.length; i++) {
    let conf = data.features[i].properties.confirmed_count;
    let death = data.features[i].properties.death_count;
    let pop = data.features[i].properties.population;
    let id = data.features[i].properties.id;
    let beds = data.features[i].properties.beds;

    population_data[json][id] = pop;
    beds_data[json][id] = beds;

    // confirmed count
    for (var j = 0; j < dates[selectedDataset].length; ++j) {
      var d = dates[selectedDataset][j];
      if (!(d in confirmed_count_data[json])) {
        confirmed_count_data[json][d] = {};
      }
      confirmed_count_data[json][d][id] = data.features[i]["properties"][d];
    }
    // death count
    for (var j = 0; j < dates[selectedDataset].length; ++j) {
      var d = dates[selectedDataset][j];
      if (!(d in death_count_data[json])) {
        death_count_data[json][d] = {};
      }
      death_count_data[json][d][id] = data.features[i]["properties"]['d' + d];
    }
    // accum
    for (var j = 1; j < dates[selectedDataset].length; ++j) {
      var d1 = dates[selectedDataset][j - 1];
      var d2 = dates[selectedDataset][j];
      confirmed_count_data[json][d2][id] += confirmed_count_data[json][d1][id];
      death_count_data[json][d2][id] += death_count_data[json][d1][id];
    }
    // fatality
    for (var j = 0; j < dates[selectedDataset].length; ++j) {
      var d = dates[selectedDataset][j];
      if (!(d in fatality_data[json])) {
        fatality_data[json][d] = {};
      }
      fatality_data[json][d][id] = 0;
      if (confirmed_count_data[json][d][id] > 0) {
        fatality_data[json][d][id] = death_count_data[json][d][id] / confirmed_count_data[json][d][id];
      }
    }
  }
}

function updateDates() {
  // since 1P3A has different date format than usafacts
  if (selectedDataset == 'county_usfacts.geojson') {
    // todo: the following line should be updated to current date
    dates[selectedDataset] = getDatesFromUsaFacts(usafactsCases);
    if (selectedDate == null || selectedDate.indexOf('-') >= 0)
      selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];
  } else {
    dates[selectedDataset] = getDatesFromGeojson(onep3a_jsondata);
    // todo: the following line should be updated to current date
    if (selectedDate == null || selectedDate.indexOf('/') >= 0)
      selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];
  }
}


/*
 * UI / EVENT HANDLERS
*/

// this is the callback for when a county dataset is selected. it is also the
// rendering function that gets called on load.
function OnCountyClick(target) {
  if (target != undefined) {
    if (target.innerText.indexOf('UsaFacts') >= 0) {
      county_map = "county_usfacts.geojson";
    } else {
      county_map = "counties_update.geojson";
    }
  }
  loadGeoDa(county_map, init_county);
}

function init_county() {
  var vals;
  var nb;
  selectedMethod = "choropleth";
  vals = GetDataValues();
  nb = gda_proxy.custom_breaks(county_map, "natural_breaks", 8, null, vals);
  colorScale = function (x) {
    if (x == 0) return COLOR_SCALE[0];
    for (var i = 1; i < nb.breaks.length; ++i) {
      if (x < nb.breaks[i])
        return COLOR_SCALE[i];
    }
  };
  getFillColor = function (f) {
    let v = GetFeatureValue(f.properties.id);
    if (v == 0) return [255, 255, 255, 200];
    return colorScale(v);
  };
  getLineColor = function (f) {
    return f.properties.id == selectedId ? [255, 0, 0] : [200, 200, 200];
  };
  UpdateLegend();
  UpdateLegendLabels(nb.bins);
  choropleth_btn.classList.add("checked");
  lisa_btn.classList.remove("checked");

  if (isCartogram()) {
    cartogram_data = gda_proxy.cartogram(county_map, vals);
  }
  loadMap(county_map);
}

function OnStateClick() {
  loadGeoDa(state_map, init_state);
}

function init_state() {
  var vals;
  var nb;
  selectedMethod = "choropleth";
  vals = GetDataValues();
  nb = gda_proxy.custom_breaks(state_map, "natural_breaks", 8, null, vals);
  colorScale = function (x) {
    if (x == 0) return COLOR_SCALE[0];
    for (var i = 1; i < nb.breaks.length; ++i) {
      if (x < nb.breaks[i])
        return COLOR_SCALE[i];
    }
  };
  getFillColor = function (f) {
    let v = GetFeatureValue(f.properties.id);
    if (v == 0) return [255, 255, 255];
    return colorScale(v);
  };
  getLineColor = function (f) {
    return f.properties.id == selectedId ? [255, 0, 0] : [255, 255, 255, 50];
  };
  UpdateLegend();
  UpdateLegendLabels(nb.bins);
  choropleth_btn.classList.add("checked");
  lisa_btn.classList.remove("checked");

  if (isCartogram()) {
    cartogram_data = gda_proxy.cartogram(state_map, vals);
  }

  loadMap(state_map);
}

function OnSourceClick(evt) {
  source_btn.innerText = evt.innerText;
  if (evt.innerText.indexOf('UsaFacts') >= 0) {
    selectedDataset = 'county_usfacts.geojson';
  } else if (evt.innerText.indexOf('County (1Point3Arces.com)') >= 0) {
    selectedDataset = 'counties_update.geojson';
  } else {
    selectedDataset = 'states_update.geojson';
  }

  if (isState()) {
    OnStateClick();
  } else {
    OnCountyClick(evt);
  }

  // force back to choropleth
  selectedMethod = "choropleth";
  //updateDates();
  //if (isLisa()) {
  //    OnLISAClick(document.getElementById('btn-lisa'));
  //} else {
  // }
}

function OnDataClick(evt) {
  data_btn.innerText = evt.innerText;
  selectedVariable = evt.innerText;

  if (isLisa()) {
    OnLISAClick(document.getElementById('btn-lisa'));
  } else {
    selectedMethod = "choropleth";
    if (isState()) {
      OnStateClick();
    } else {
      OnCountyClick();
    }
  }
}

function OnCartogramClick() {
  selectedMethod = "choropleth";
  if (isState()) {
    OnStateClick();
  } else {
    OnCountyClick();
  }
}

function OnShowLabels(el) {
  shouldShowLabels = el.checked;
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

function collapse(el) {
  if (document.getElementById("toolbox").classList.contains("collapse")) {
    document.getElementById('toolbox').classList.remove("collapse");
    el.src = "img/collapse.png";
  } else {
    document.getElementById('toolbox').classList.add("collapse");
    el.src = "img/expand.png";
  }
}

function OnShowTime(el) {
  let disp = el.checked ? 'block' : 'none';
  document.getElementById('time-container').parentElement.style.display = disp;
}

function OnSave() {
  d3.json("lisa_dates.json", function (ds) {
    // only new lisa results will be saved
    let save_dates = [];
    let start_pos = dates[selectedDataset].indexOf(ds[ds.length - 1]) + 1;
    for (let i = start_pos; i < dates[selectedDataset].length; ++i) {
      let d = dates[selectedDataset][i];
      if (d in lisa_data[selectedDataset]) {
        console.log('lisa' + d + '.json');
        save_dates.push(d);
        setTimeout(function () {
          saveText(JSON.stringify(lisa_data[selectedDataset][d]), "lisa" + d + ".json");
        }, 100 * (i - ds.length));
      }
    }
    // update dates
    saveText(JSON.stringify(save_dates), "lisa_dates.json");
  });
}


/*
 * APPLICATION
*/

// set up deck/mapbox
const deckgl = new DeckGL({
  mapboxApiAccessToken: 'pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg',
  mapStyle: 'mapbox://styles/mapbox/dark-v9',
  latitude: 32.850033,
  longitude: -86.6500523,
  zoom: 3.5,
  maxZoom: 18,
  pitch: 0,
  controller: true,
  onViewStateChange: (view) => {
    current_view = view.viewState;
  },
  layers: []
});

const mapbox = deckgl.getMapboxMap();

mapbox.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

mapbox.on('zoomend', () => {
  const currentZoom = mapbox.getZoom();
  let lat = current_view == null ? deckgl.viewState.latitude : current_view.latitude;
  let lon = current_view == null ? deckgl.viewState.longitude : current_view.longitude;
  deckgl.setProps({
    viewState: {
      zoom: currentZoom,
      latitude: lat,
      longitude: lon
    }
  });
});

function resetView(layers) {
  deckgl.setProps({
    layers: layers,
    viewState: {
      zoom: 3.5,
      latitude: 32.850033,
      longitude: -86.6500523,
      transitionInterpolator: new LinearInterpolator(['bearing']),
      transitionDuration: 500
    }
  });
}

function setCartogramView(layers) {
  if (isState()) {
    deckgl.setProps({
      layers: layers,
      viewState: {
        zoom: 6.6,
        latitude: 3.726726,
        longitude: -8.854194,
        transitionInterpolator: new LinearInterpolator(['bearing']),
        transitionDuration: 500
      }
    });
  } else {
    deckgl.setProps({
      layers: layers,
      viewState: {
        zoom: 5.6,
        latitude: 13.510908,
        longitude: -28.190367,
        transitionInterpolator: new LinearInterpolator(['bearing']),
        transitionDuration: 500
      }
    });
  }
}

function createMap(data) {
  if (selectedDate == null)
    selectedDate = dates[selectedDataset][dates[selectedDataset].length - 1];

  var labels = [];
  var cents = centroids[selectedDataset];
  console.log("centroids from :", selectedDataset);

  if (isLisa()) {
    for (let i = 0; i < data.features.length; ++i) {
      let json = selectedDataset;
      //if (json == "county") {
      let field = data_btn.innerText;
      let c = lisa_data[json][selectedDate][field].clusters[i];
      if (c == 1)
        labels.push({
          id: i,
          position: cents[i],
          text: data.features[i].properties.NAME
        });
      //}
    }
  }

  var layers = [];

  if (isCartogram()) {
    mapbox.getCanvas().hidden = true;
    if ('name' in data && data.name.startsWith("state")) {
      for (let i = 0; i < data.features.length; ++i) {
        labels.push({
          id: i,
          position: cartogram_data[i].position,
          text: data.features[i].properties.NAME
        });
      }
    }
    layers.push(
      new ScatterplotLayer({
        data: cartogram_data,
        getPosition: d => d.position,
        getFillColor: getFillColor,
        getLineColor: getLineColor,
        getRadius: d => d.radius * 10,
        onHover: updateTooltip,
        onClick: updateTrendLine,
        pickable: true,
        updateTriggers: {
          getLineColor: [
            selectedId
          ],
          getFillColor: [
            selectedDate, selectedVariable, selectedMethod
          ]
        },
      })
    );
    layers.push(
      new TextLayer({
        data: labels,
        pickable: true,
        getPosition: d => d.position,
        getText: d => d.text,
        getSize: 12,
        fontFamily: 'Gill Sans Extrabold, sans-serif',
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'bottom',
        getColor: [20, 20, 20]
      })
    );
    setCartogramView(layers);

  } else {
    mapbox.getCanvas().hidden = false;
    layers.push(
      new GeoJsonLayer({
        id: 'map-layer',
        data: data,
        opacity: 0.5,
        stroked: true,
        filled: true,
        //wireframe: true,
        //fp64: true,
        lineWidthScale: 1,
        lineWidthMinPixels: 1,
        getElevation: getElevation,
        getFillColor: getFillColor,
        getLineColor: getLineColor,

        updateTriggers: {
          getLineColor: [],
          getFillColor: [
            selectedDate, selectedVariable, selectedMethod
          ]
        },
        pickable: true,
        onHover: updateTooltip,
        onClick: updateTrendLine
      })
    );
    if (!('name' in data)) {
      layers.push(
        new GeoJsonLayer({
          data: './states.geojson',
          opacity: 0.5,
          stroked: true,
          filled: false,
          lineWidthScale: 1,
          lineWidthMinPixels: 1.5,
          getLineColor: [220, 220, 220],
          pickable: false
        })
      );
    }

    if (shouldShowLabels) {
      layers.push(
        new TextLayer({
          data: labels,
          pickable: true,
          getPosition: d => d.position,
          getText: d => d.text,
          getSize: 18,
          fontFamily: 'Gill Sans Extrabold, sans-serif',
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'bottom',
          getColor: [250, 250, 250],
          fontSettings: {
            buffer: 20,
            sdf: true,
            radius: 6
          }
        })
      );
    }
    resetView(layers);
  }

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

  createTimeSlider(data);
}

function loadMap() {
  createMap(jsondata[selectedDataset]);
}

function isCartogram() {
  return document.getElementById('cartogram-ckb').checked;
}

function getElevation(f) {
  return f.properties.id == selectedId ? 90000 : 1;
}

function buttonClicked(evt) {
  console.log(evt);
}

function initFeatureSelected(features) {
  for (let i = 0; i < features.features.length; i++) {
    // Track each feature individually with a unique ID.
    features.features[i].properties.id = i;
  }
  return features;
}

function GetFeatureValue(id) {
  let json = selectedDataset;
  let txt = data_btn.innerText;
  if (txt == "Confirmed Count") {
    return confirmed_count_data[json][selectedDate][id];
  } else if (txt == "Confirmed Count per 10K Population") {
    if (population_data[json][id] == undefined || population_data[json][id] == 0) return 0;
    return (confirmed_count_data[json][selectedDate][id] / population_data[json][id] * 10000).toFixed(3);
  } else if (txt == "Confirmed Count per Licensed Bed") {
    if (beds_data[json][id] == undefined || beds_data[json][id] == 0) return 0;
    return (confirmed_count_data[json][selectedDate][id] / beds_data[json][id]).toFixed(3);
  } else if (txt == "Death Count") {
    return death_count_data[json][selectedDate][id];
  } else if (txt == "Death Count per 10K Population") {
    if (population_data[json][id] == undefined || population_data[json][id] == 0) return 0;
    return (death_count_data[json][selectedDate][id] / population_data[json][id] * 10000).toFixed(3);
  } else if (txt == "Death Count/Confirmed Count") {
    return fatality_data[json][selectedDate][id];
  } else if (txt == "Daily New Confirmed Count") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = confirmed_count_data[json][selectedDate];
    var pre_vals = confirmed_count_data[json][prev_date];
    return cur_vals[id] - pre_vals[id];

  } else if (txt == "Daily New Confirmed Count per 10K Pop") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = confirmed_count_data[json][selectedDate];
    var pre_vals = confirmed_count_data[json][prev_date];
    return ((cur_vals[id] - pre_vals[id]) / population_data[json][id] * 10000).toFixed(3);

  } else if (txt == "Daily New Death Count") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = death_count_data[json][selectedDate];
    var pre_vals = death_count_data[json][prev_date];
    return cur_vals[id] - pre_vals[id];

  } else if (txt == "Daily New Death Count per 10K Pop") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = death_count_data[json][selectedDate];
    var pre_vals = death_count_data[json][prev_date];
    return ((cur_vals[id] - pre_vals[id]) / population_data[json][id] * 10000).toFixed(3);
  }
  return 0;
}

function GetDataValues() {
  let json = selectedDataset;
  let txt = data_btn.innerText;
  if (txt == "Confirmed Count") {
    return Object.values(confirmed_count_data[json][selectedDate]);
  } else if (txt == "Confirmed Count per 10K Population") {
    var vals = [];
    for (var id in confirmed_count_data[json][selectedDate]) {
      if (population_data[json][id] == undefined || population_data[json][id] == 0)
        vals.push(0);
      else
        vals.push(confirmed_count_data[json][selectedDate][id] / population_data[json][id] * 10000);
    }
    return vals;

  } else if (txt == "Confirmed Count per Licensed Bed") {
    var vals = [];
    for (var id in confirmed_count_data[json][selectedDate]) {
      if (beds_data[json][id] == undefined || beds_data[json][id] == 0)
        vals.push(0);
      else
        vals.push(confirmed_count_data[json][selectedDate][id] / beds_data[json][id]);
    }
    return vals;

  } else if (txt == "Death Count") {
    return Object.values(death_count_data[json][selectedDate]);
  } else if (txt == "Death Count per 10K Population") {
    var vals = [];
    for (var id in death_count_data[json][selectedDate]) {
      if (population_data[json][id] == undefined || population_data[json][id] == 0)
        vals.push(0);
      else
        vals.push(death_count_data[json][selectedDate][id] / population_data[json][id] * 10000);
    }
    return vals;
  } else if (txt == "Death Count/Confirmed Count") {
    return Object.values(fatality_data[json][selectedDate]);
  } else if (txt == "Daily New Confirmed Count") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = confirmed_count_data[json][selectedDate];
    var pre_vals = confirmed_count_data[json][prev_date];
    var rt_vals = [];
    for (let i in cur_vals) {
      rt_vals.push(cur_vals[i] - pre_vals[i]);
    }
    return rt_vals;

  } else if (txt == "Daily New Confirmed Count per 10K Pop") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = confirmed_count_data[json][selectedDate];
    var pre_vals = confirmed_count_data[json][prev_date];
    var rt_vals = [];
    for (let i in cur_vals) {
      rt_vals.push((cur_vals[i] - pre_vals[i]) / population_data[json][i] * 10000);
    }
    return rt_vals;

  } else if (txt == "Daily New Death Count") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = death_count_data[json][selectedDate];
    var pre_vals = death_count_data[json][prev_date];
    var rt_vals = [];
    for (let i in cur_vals) {
      rt_vals.push(cur_vals[i] - pre_vals[i]);
    }
    return rt_vals;

  } else if (txt == "Daily New Death Count per 10K Pop") {
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx == 0) return 0;
    let prev_date = dates[selectedDataset][dt_idx - 1];
    var cur_vals = death_count_data[json][selectedDate];
    var pre_vals = death_count_data[json][prev_date];
    var rt_vals = [];
    for (let i in cur_vals) {
      rt_vals.push((cur_vals[i] - pre_vals[i]) / population_data[json][i] * 10000);
    }
    return rt_vals;
  }
}

function UpdateLegend() {
  const div = document.getElementById('legend');
  div.innerHTML = `<div class="legend" style="background: rgb(240, 240, 240); width: 7.69231%;"></div>
    <div class="legend" style="background: rgb(255, 237, 160); width: 7.69231%;"></div>
    <div class="legend" style="background: rgb(254, 217, 118); width: 7.69231%;"></div>
    <div class="legend" style="background: rgb(254, 178, 76); width: 7.69231%;"></div>
    <div class="legend" style="background: rgb(253, 141, 60); width: 7.69231%;"></div>
    <div class="legend" style="background: rgb(252, 78, 42); width: 7.69231%;"></div>
    <div class="legend" style="background: rgb(227, 26, 28); width: 7.69231%;"></div>
    <div class="legend" style="background: rgb(189, 0, 38); width: 7.69231%;"></div>
    <div class="legend" style="background: rgb(128, 0, 38); width: 7.69231%;"></div>
`;
}

function UpdateLegendLabels(breaks) {
  let field = data_btn.innerText;
  const div = document.getElementById('legend-labels');
  var cont = '<div style="width: 7.69231%;text-align:center">0</div>';
  for (var i = 0; i < breaks.length; ++i) {
    let val = breaks[i];
    if (field == "Death Count/Confirmed Count") {
      cont += '<div style="width: 7.69231%;text-align:center">' + val + '</div>';
    } else {
      if (val[0] == '>') {
        val = val.substring(1, val.length);
        if (val.indexOf('.') >= 0) {
          // format float number
          val = parseFloat(val);
          val = val.toFixed(2);
        } else {
          val = parseInt(val);
          if (val > 10000) val = d3.format(".2s")(val);
        }
        cont += '<div style="width: 7.69231%;text-align:center">>' + val + '</div>';
      } else {
        if (val.indexOf('.') >= 0) {
          // format float number
          val = parseFloat(val);
          val = val.toFixed(2);
        } else {
          val = parseInt(val);
          if (val > 10000) val = d3.format(".2s")(val);
        }
        cont += '<div style="width: 7.69231%;text-align:center">' + val + '</div>';
      }
    }
  }
  div.innerHTML = cont;
}

function UpdateLisaLegend(colors) {
  const div = document.getElementById('legend');
  var cont = '<div class="legend" style="background: #eee; width: 20%;"></div>';
  for (var i = 1; i < colors.length; ++i) {
    cont += '<div class="legend" style="background: ' + colors[i] + '; width: 20%;"></div>';
  }
  div.innerHTML = cont;
}

function UpdateLisaLabels(labels) {
  const div = document.getElementById('legend-labels');
  var cont = '<div style="width: 20%;text-align:center">Not Sig</div>';
  for (var i = 1; i < 5; ++i) {
    cont += '<div style="width: 20%;text-align:center">' + labels[i] + '</div>';
  }
  div.innerHTML = cont;
}

function OnChoroplethClick(evt) {
  selectedMethod = "choropleth";
  if (isState()) {
    OnStateClick();
  } else {
    OnCountyClick();
  }
}

function OnLISAClick(evt) {
  selectedMethod = "lisa";

  var w = getCurrentWuuid();
  var data = GetDataValues();
  let field = data_btn.innerText;
  let json = selectedDataset;
  var color_vec = lisa_colors;
  var labels = lisa_labels;
  var clusters;
  var sig;

  if (!(json in lisa_data)) lisa_data[json] = {};

  if (selectedDate in lisa_data[json] && field in lisa_data[json][selectedDate]) {
    clusters = lisa_data[json][selectedDate][field].clusters;
    sig = lisa_data[json][selectedDate][field].sig;

  } else {
    var lisa = gda_proxy.local_moran1(w.map_uuid, w.w_uuid, data);
    clusters = gda_proxy.parseVecDouble(lisa.clusters());
    sig = gda_proxy.parseVecDouble(lisa.significances());
    if (!(selectedDate in lisa_data[json])) lisa_data[json][selectedDate] = {}
    if (!(field in lisa_data[json][selectedDate])) lisa_data[json][selectedDate][field] = {}
    lisa_data[json][selectedDate][field]['clusters'] = clusters;
    lisa_data[json][selectedDate][field]['pvalues'] = sig;
  }

  color_vec[0] = '#ffffff';

  getFillColor = function(f) {
    var c = clusters[f.properties.id];
    if (c == 0) return [255, 255, 255, 200];
    return hexToRgb(color_vec[c]);
  };

  getLineColor = function(f) {
    // TODO selectedStateId seems to always be -1?
    if (f.properties.STATEFP != selectedStateId) return [255, 255, 255, 0];
    return f.properties.id == selectedId ? [255, 0, 0] : [255, 255, 255, 50];
  };

  UpdateLisaLegend(color_vec);
  UpdateLisaLabels(labels);

  evt.classList.add("checked");
  document.getElementById("btn-nb").classList.remove("checked");

  if (isState()) {
    loadMap(state_map);
  } else {
    loadMap(county_map);
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

function updateTooltip({
  x,
  y,
  object
}) {
  const tooltip = document.getElementById('tooltip');

  if (object) {
    let id = object.properties.id;
    let json = selectedDataset;
    let txt = data_btn.innerText;

    //if (txt == "Confirmed Count") {
    let v1 = confirmed_count_data[json][selectedDate][id];
    //} else if (txt == "Confirmed Count per 10K Population") {
    let v2 = (population_data[json][id] == undefined || population_data[json][id] == 0) ? 0 : (confirmed_count_data[json][selectedDate][id] / population_data[json][id] * 10000);
    //} else if (txt == "Death Count") {
    let v3 = death_count_data[json][selectedDate][id];
    //} else if (txt == "Death Count per 10K Population") {
    let v4 = (population_data[json][id] == undefined || population_data[json][id] == 0) ? 0 : (death_count_data[json][selectedDate][id] / population_data[json][id] * 10000);
    //} else if (txt == "Fatality Rate") {
    let v5 = fatality_data[json][selectedDate][id];
    let v6 = population_data[json][id];

    let v7 = 0;
    let dt_idx = dates[selectedDataset].indexOf(selectedDate);
    if (dt_idx > 0) {
      let prev_date = dates[selectedDataset][dt_idx - 1];
      var cur_vals = confirmed_count_data[json][selectedDate];
      var pre_vals = confirmed_count_data[json][prev_date];
      v7 = cur_vals[id] - pre_vals[id];
    }
    let v8 = (population_data[json][id] == undefined || population_data[json][id] == 0) ? 0 : (v7 / population_data[json][id] * 10000);

    let v9 = 0;
    if (dt_idx > 0) {
      let prev_date = dates[selectedDataset][dt_idx - 1];
      var cur_vals = death_count_data[json][selectedDate];
      var pre_vals = death_count_data[json][prev_date];
      v9 = cur_vals[id] - pre_vals[id];
    }
    let v10 = (population_data[json][id] == undefined || population_data[json][id] == 0) ? 0 : (v9 / population_data[json][id] * 10000);
    let v11 = (beds_data[json][id] == undefined || beds_data[json][id] == 0) ? 0 : (confirmed_count_data[json][selectedDate][id] / beds_data[json][id]);
    let v12 = beds_data[json][id];

    let name = "";
    if ('NAME' in object.properties)
      name = object.properties.NAME;
    else
      name = jsondata[json].features[id].properties.NAME;

    if (!isInt(v2)) v2 = parseFloat(v2).toFixed(2);
    if (!isInt(v4)) v4 = parseFloat(v4).toFixed(2);

    let text = '<div><h3 style=display:inline>' + name + '</h3></div>';
    text += '<hr>';
    text += '<table>'
    text += '<tr><td><h5 style=display:inline>Confirmed Count:</h5></td><td><h5 style=display:inline>' + v1 + '</h5></td>';
    text += '<tr><td><h5 style=display:inline>Confirmed Count per 10K Population:</h5></td><td><h5 style=display:inline>' + v2 + '</h5></td>';
    text += '<tr><td><h5 style=display:inline># Licensed Hospital Beds:</h5></td><td><h5 style=display:inline>' + v12 + '</h5></td>';
    text += '<tr><td><h5 style=display:inline>Confirmed Count per Licensed Bed:</h5></td><td><h5 style=display:inline>' + v11.toFixed(2) + '</h5></td>';
    text += '<tr><td><h5 style=display:inline>Death Count:</h5></td><td><h5 style=display:inline>' + v3 + '</h5></td>';
    text += '<tr><td><h5 style=display:inline>Death Count per 10K Population:</h5></td><td><h5 style=display:inline>' + v4 + '</h5></td>';
    text += '<tr><td><h5 style=display:inline>Death Count/Confirmed Count:</h5></td><td><h5 style=display:inline>' + v5.toFixed(2) + '</h5></td>';
    text += '<tr><td><h5 style=display:inline>Daily New Confirmed Count:</h5></td><td><h5 style=display:inline>' + v7 + '</h5></td>';
    text += '<tr><td><h5 style=display:inline>Daily New Confirmed Count per 10K Pop:</h5></td><td><h5 style=display:inline>' + v8.toFixed(2) + '</h5></td>';
    text += '<tr><td><h5 style=display:inline>Daily New Death Count:</h5></td><td><h5 style=display:inline>' + v9 + '</h5></td>';
    text += '<tr><td><h5 style=display:inline>Daily New Confirmed Count per 10K Pop:</h5></td><td><h5 style=display:inline>' + v10.toFixed(2) + '</h5></td>';
    text += '</table>';
    text += '<hr>';
    text += '<table>'
    text += '<tr><td><h5 style=display:inline>Population:</h5></td><td><h5 style=display:inline>' + v6 + '</h5></td>';
    text += '</table>';

    if (isLisa()) {
      let json = selectedDataset;
      let field = data_btn.innerText;
      let c = lisa_data[json][selectedDate][field].clusters[id];
      text += '<br/><div><b>' + lisa_labels[c] + '</b></div>';
      text += '<div><b>p-value:</b>' + lisa_data[json][selectedDate][field].pvalues[id] + '</div>';
      text += '<div>Queen weights and 999 permutations</div>';
    }

    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
    tooltip.innerHTML = text;
  } else {
    tooltip.innerHTML = '';
  }
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
  let n_count = Object.keys(confirmed_count_data[json][selectedDate]).length;
  var counts = [];
  let d = dates[selectedDataset][0];
  let sum = 0;
  let sel_dt = Date.parse(selectedDate);

  if (all || Date.parse(d) <= sel_dt) {
    sum = confirmed_count_data[json][d][county_id];
  }
  counts.push(sum);
  for (let i = 1; i < dates[selectedDataset].length; ++i) {
    let sum = 0;
    let d0 = dates[selectedDataset][i - 1];
    let d1 = dates[selectedDataset][i];
    if (all || Date.parse(d1) <= sel_dt) {
      sum = (confirmed_count_data[json][d1][county_id] - confirmed_count_data[json][d0][county_id]);
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
  let n_count = Object.keys(confirmed_count_data[json][selectedDate]).length;
  var counts = [];
  let d = dates[selectedDataset][0];
  // get total count for 1st day
  let sum = 0;
  let sel_dt = Date.parse(selectedDate);
  for (let j = 0; j < n_count; ++j) {
    if (all || Date.parse(d) <= sel_dt) {
      sum = confirmed_count_data[json][d][j];
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
        pre_sum += confirmed_count_data[json][d0][j];
        cur_sum += confirmed_count_data[json][d1][j];
      }
    }
    counts.push(cur_sum - pre_sum < 0 ? 0 : cur_sum - pre_sum);
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

  var tmpData = [];
  for (var i = 0; i < xLabels.length; ++i) {
    tmpData.push({
      "date": xLabels[i],
      "confirmedcases": yValues[i]
    });
  }
  var line = d3.line()
    .x(function(d) {
      return xScale(d['date']);
    })
    .y(function(d) {
      return yScale(d['confirmedcases']);
    });

  svg.append("path")
    .datum(tmpData)
    .attr("class", "line")
    .attr("d", line);

  svg.append("g")
    .attr("transform", "translate(0," + (height) + ")")
    .call(xAxis.tickValues(xLabels.filter(function(d, i) {
      if (i % 4 == 0)
        return d;
    })).tickFormat(function(e) {
      let d = new Date(e);
      let mo = new Intl.DateTimeFormat('en', {
        month: '2-digit'
      }).format(d)
      let da = new Intl.DateTimeFormat('en', {
        day: '2-digit'
      }).format(d)
      return da + '-' + mo;
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
  var xLabels, yValues, title;
  let json = selectedDataset;

  xLabels = dates[selectedDataset];
  if (object) {
    yValues = getConfirmedCountByDateCounty(object.properties.id, false);
  } else {
    yValues = getConfirmedCountByDate(jsondata[json], false);
  }
  title = object ? object.properties["NAME"] : "all";

  // Get the data again
  var tmpData = [];
  for (var i = 0; i < xLabels.length; ++i) {
    tmpData.push({
      "date": xLabels[i],
      "confirmedcases": yValues[i]
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

  var xAxis = d3.axisBottom()
    .scale(xScale);

  var yAxis = d3.axisLeft()
    .scale(yScale);

  // Make the changes
  svg.select(".line") // change the line
    .duration(750)
    .attr("d", line(tmpData));
  svg.select(".yaxis") // change the y axis
    .duration(750)
    .call(yAxis);
  svg.select(".xaxis") // change the y axis
    .duration(750)
    .call(xAxis);

  svg.select(".linetitle")
    .text(title);
}

function createTimeSlider(geojson) {
  if (document.getElementById("slider-svg").innerHTML.length > 0) {
    if (d3.select("#slider").node().max != dates[selectedDataset].length) {
      d3.select("#slider-svg").select("svg").remove();
    } else {
      return;
    }
  }

  var width = 320,
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

  var tmpData = [];
  for (var i = 0; i < xLabels.length; ++i) {
    tmpData.push({
      "date": xLabels[i],
      "confirmedcases": yValues[i]
    });
  }

  var bars = svg.selectAll(".bars")
    .data(tmpData)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.date))
    .attr("width", xScale.bandwidth() - 1)
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

  d3.select("#slider").on("input", function() {
    var currentValue = parseInt(this.value);
    selectedDate = dates[selectedDataset][currentValue - 1];
    console.log(selectedDate);

    document.getElementById('time-container').innerText = selectedDate;
    var xLabels = dates[selectedDataset];
    xScale.domain(xLabels);

    var yValues = getAccumConfirmedCountByDate(geojson, true);
    yScale.domain([0, Math.max.apply(null, yValues)]);

    bars.attr("y", d => yScale(d.confirmedcases))
      .attr("height", d => height - padding - yScale(d.confirmedcases))
      .attr("fill", (d => xLabels[currentValue - 1] == d.date ? "red" : "gray"));

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
  })
}

d3.json("lisa_dates.json", function(ds) {
  // load lisa from cache
  if (!('county_usfacts.geojson' in lisa_data))
    lisa_data['county_usfacts.geojson'] = {};

  setTimeout(function() {
    for (let i = 0; i < ds.length; ++i) {
      let d = ds[i];
      let d_fn = d.replace(/\//g, '_');
      d3.json("lisa/lisa" + d_fn + '.json', function(data) {
        if (data != null) {
          lisa_data['county_usfacts.geojson'][d] = data;
        }
      });
    }
  }, 5000); // download cached files after 5 seconds;
})


/*
 * ENTRY POINT
*/
var Module = {
  onRuntimeInitialized: function () {
    gda_proxy = new GeodaProxy();
    OnCountyClick();
  }
};
