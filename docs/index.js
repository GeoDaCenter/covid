const {DeckGL, GeoJsonLayer} = deck;

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

class GeodaProxy {
    // file_target is evt.target
    constructor() {
        this.geojson_maps = {};
    }
  
    ReadGeojsonMap(map_uid, file_target) {
        //evt.target.result is an ArrayBuffer. In js, 
        const uint8_t_arr = new Uint8Array(file_target.result);
        //First we need to allocate the wasm memory. 
        const uint8_t_ptr = window.Module._malloc(uint8_t_arr.length);
        //Now that we have a block of memory we can copy the file data into that block
        window.Module.HEAPU8.set(uint8_t_arr, uint8_t_ptr);
        // pass the address of the wasm memory we just allocated to our function
        window.Module.new_geojsonmap(map_uid, uint8_t_ptr, uint8_t_arr.length);
        //Lastly, according to the docs, we should call ._free here.
        window.Module._free(uint8_t_ptr);
        // store the map and map type
        let map_type = Module.get_map_type(map_uid);
        this.geojson_maps[map_uid] = map_type;
    return map_uid;
    }
 
    Has(map_uid) {
        return map_uid in this.geojson_maps;
    }

    GetNumObs(map_uid) {
      let n = Module.get_num_obs(map_uid);
      return n;
    }
  
    GetMapType(map_uid) {
      return this.geojson_maps[map_uid];
    }
  
    GetNumericCol(map_uid, col_name) {
      // return VectorDouble
      return Module.get_numeric_col(map_uid, col_name)
    }
  
    CreateRookWeights(map_uid, order, include_lower_order, precision) {
      let w_uid = Module.rook_weights(map_uid, order, include_lower_order, precision);
      return w_uid;
    }

    CreateQueenWeights(map_uid, order, include_lower_order, precision) {
      let w_uid = Module.queen_weights(map_uid, order, include_lower_order, precision);
      return w_uid;
    }

    GetMinDistThreshold(map_uid, is_arc, is_mile) {
      let val = Module.min_distance_threshold(map_uid, is_arc, is_mile);
      return val;
    }

    CreateKnnWeights(map_uid, k, power, is_inverse, is_arc, is_mile) {
      let w = Module.knn_weights(map_uid, k, power, is_inverse, is_arc, is_mile);
      return w;
    }

    CreateDistWeights(map_uid, dist_thres, power, is_inverse, is_arc, is_mile) {
      let w = Module.dist_weights(map_uid, dist_thres, power, is_inverse, is_arc, is_mile);
      return w;
    }

    CreateKernelWeights(map_uid, k, kernel, adaptive_bandwidth, use_kernel_diagonals, is_arc, is_mile) {
      let w = Module.kernel_weights(map_uid, k, kernel, adaptive_bandwidth, use_kernel_diagonals, is_arc, is_mile);
      return w;
    }

    CreateKernelBandwidthWeights(map_uid, dist_thres, kernel, use_kernel_diagonals, is_arc, is_mile) {
      let w = Module.kernel_bandwidth_weights(map_uid, dist_thres, kernel, use_kernel_diagonals, is_arc, is_mile);
      return w;
    }

    local_moran(map_uid, weight_uid, col_name) {
      return Module.local_moran(map_uid, weight_uid, col_name);
    }

    local_g(map_uid, weight_uid, col_name) {
      return Module.local_g(map_uid, weight_uid, col_name);
    }

    local_gstar(map_uid, weight_uid, col_name) {
      return Module.local_gstar(map_uid, weight_uid, col_name);
    }

    local_geary(map_uid, weight_uid, col_name) {
      return Module.local_geary(map_uid, weight_uid, col_name);
    }

    local_joincount(map_uid, weight_uid, col_name) {
      return Module.local_joincount(map_uid, weight_uid, col_name);
    }

    parseVecVecInt(vvi) {
      let result = []; 
      for (let i=0; i<vvi.size(); ++i) {
        let sub = [];
        let vi = vvi.get(i);
        for (let j=0; j<vi.size(); ++j) {
          sub.push( vi.get(j) );
        }
        result.push(sub);
      }
      return result;
    }

    parseVecDouble(vd) {
      let result = []
      for (let i=0; i<vd.size(); ++i) {
        result.push( vd.get(i));
      }
      return result;
    }

    toVecString(input) {
      let vs = new Module.VectorString();
      for (let i=0; i<input.length; ++i) {
        vs.push_back(input[i]);
      }
      return vs;
    }

    redcap(map_uid, weight_uid, k, sel_fields, bound_var, min_bound, method) {
      let col_names = this.toVecString(sel_fields);
      let clusters_vec = Module.redcap(map_uid, weight_uid, k, col_names, bound_var, min_bound, method);
      let clusters = this.parseVecVecInt(clusters_vec);
      return clusters;
    }

    maxp(map_uid, weight_uid, k, sel_fields, bound_var, min_bound, method, tabu_length, cool_rate, n_iter) {
      let col_names = this.toVecString(sel_fields);
      let clusters_vec = Module.maxp(map_uid, weight_uid, col_names, bound_var, min_bound, tabu_length, cool_rate, method, k, n_iter);
      let clusters = this.parseVecVecInt(clusters_vec);
      return clusters;
    }

    custom_breaks(map_uid, break_name, k, sel_field, values) {
      let breaks_vec = Module.custom_breaks(map_uid, k, sel_field, break_name);
      let breaks = this.parseVecDouble(breaks_vec);
      var orig_breaks = breaks;

      let bins = [];
      let id_array = [];
      for (let i=0; i<breaks.length; ++i) {
        id_array.push([]);
        bins.push("" + breaks[i]);
      }
      id_array.push([]);
      bins.push(">" + breaks[breaks.length-1]);

      breaks.unshift(Number.NEGATIVE_INFINITY);
      breaks.push(Number.POSITIVE_INFINITY);

      for (let i=0; i<values.length; ++i) {
        let v = values[i];
        for (let j=0; j<breaks.length -1; ++j) {
          let min_val = breaks[j];
          let max_val = breaks[j+1];
          if ( v >= min_val && v < max_val) {
            id_array[j].push(i);
            break;
          }
        }
      }

      for (let i =0; i<bins.length; ++i) {
        //bins[i] += " (" + id_array[i].length + ')';
      }

      return {
        'k' : k,
        'bins' : bins,
        'breaks' : orig_breaks,
        'id_array' : id_array,
        'col_name' : sel_field
      }
    }
}

const state_map = "states_update.geojson";
const county_map = "counties_update.geojson";
var map_variable = "confirmed_count";
var choropleth_btn = document.getElementById("btn-nb");
var lisa_btn = document.getElementById("btn-lisa");
var gda_proxy;
var state_w = null;
var county_w = null;
var jsondata;
var feats;
var state = { hoveredObject: null, features:null};
var dates;
var select_date;

// functions
var colorScale;
var getFillColor;

const deckgl = new DeckGL({
    mapboxApiAccessToken: 'pk.eyJ1IjoibGl4dW45MTAiLCJhIjoiY2locXMxcWFqMDAwenQ0bTFhaTZmbnRwaiJ9.VRNeNnyb96Eo-CorkJmIqg',
    mapStyle: 'mapbox://styles/mapbox/dark-v9',
    latitude: 41.850033,
    longitude: -110.6500523,
    zoom: 3,
    maxZoom: 16,
    pitch: 0,
    layers: []
});

function loadGeoDa(url, evt) {
  if (gda_proxy.Has(url)) {
      evt();
  } else {
    fetch(url)
    .then((response) => {
        return response.arrayBuffer();
        })
    .then((ab) => {
        gda_proxy.ReadGeojsonMap(url, {result: ab});
        evt();
    });
  }
}

function loadMap(url, title) {
        d3.json(url, function(data) {

            jsondata = data;

            feats = initFeatureSelected(data);

            dates = getDatesFromGeojson(jsondata);

            select_date = dates[dates.length-1];

            state.features = feats;

            const layers = [
            new GeoJsonLayer({
                data: feats,
                opacity: 0.5,
                stroked: true,
                filled: true,
                extruded: true,
                wireframe: true,
                fp64: true,
                lineWidthMinPixels:10,

                //getElevation: f => Math.sqrt(f.properties.confirmed_count) * 10,
                getFillColor: getFillColor,
                getLineColor: getLineColor,
                updateTriggers: {
                    getLineColor: [
                    state.hoveredObject ? state.hoveredObject.properties.id : null
                    ]
                },
                //autoHighlight: true,
                //highlightColor: [0,0,0, 0.2],
                pickable: true,
                onHover: updateTooltip,
                onClick: updateTrendLine
            })
            ];

            deckgl.setProps({layers});        

            addTrendLine(data, title);
            
            createTimeSlider(data);
        });
}

// source: http://stackoverflow.com/a/11058858
function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 1 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function getLineColor(f) 
{
    return f.properties.selected ? [255,0,0] : [255, 255, 255];
}

function buttonClicked(evt) {
    console.log(evt);
}

function initFeatureSelected(features) {
    for (let i = 0; i < features.features.length; i++) {
        features.features[i].properties.selected = false;
        // Track each feature individually with a unique ID.
        features.features[i].properties.id = i;
    }
    return features;
}
function setFeatureSelected(features, selfeat) {
    let selectedID = selfeat.properties.id;
    for (let i = 0; i < features.features.length; i++) {
      let currentID = features.features[i].properties.id;
  
      if (selectedID === currentID) {
        features.features[i].properties.selected = true;
      } else {
        // Make sure to update the others to be false, so that way only one is ever selected
        features.features[i].properties.selected = false;
      }
    }
    return features;
}

function OnCountyClick(evt) {
    function init_county(evt) {
        var vals = gda_proxy.GetNumericCol(county_map, map_variable); 
        var nb = gda_proxy.custom_breaks(county_map, "natural_breaks", 8, map_variable, gda_proxy.parseVecDouble(vals)); 
        colorScale = function(x) {
            if (x==0)  return COLOR_SCALE[0];
            for (var i=1; i<nb.breaks.length; ++i) {
                if (x < nb.breaks[i]) 
                    return COLOR_SCALE[i];
            }
        };
        getFillColor = function(f) {
            return colorScale(f.properties.confirmed_count);
        }
        UpdateLegend();
        UpdateLegendLabels(nb.bins);
        document.getElementById("btn-county").classList.add("checked");
        document.getElementById("btn-state").classList.remove("checked");
        choropleth_btn.classList.add("checked");
        lisa_btn.classList.remove("checked");
        loadMap(county_map, "all");
    }
    loadGeoDa(county_map, init_county);
}

function OnStateClick(evt) {
    function init_state() {
        var vals = gda_proxy.GetNumericCol(state_map, map_variable); 
        var nb = gda_proxy.custom_breaks(state_map, "natural_breaks", 8, map_variable, gda_proxy.parseVecDouble(vals)); 
        colorScale = function(x) {
            if (x==0)  return COLOR_SCALE[0];
            for (var i=1; i<nb.breaks.length; ++i) {
                if (x < nb.breaks[i]) 
                    return COLOR_SCALE[i];
            }
        };
        getFillColor = function(f) {
            return colorScale(f.properties.confirmed_count);
        };
        UpdateLegend();
        UpdateLegendLabels(nb.bins);
        document.getElementById("btn-state").classList.add("checked");
        document.getElementById("btn-county").classList.remove("checked");
        choropleth_btn.classList.add("checked");
        lisa_btn.classList.remove("checked");
        loadMap(state_map, "all");
    }
    loadGeoDa(state_map, init_state);
}

function UpdateLegend()
{
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
    const div = document.getElementById('legend-labels');
    var cont = '<div style="width: 7.69231%;text-align:center">0</div>';
    for (var i=0; i<breaks.length; ++i) {
        cont += '<div style="width: 7.69231%;text-align:center">' +breaks[i]+ '</div>';
    }
    div.innerHTML = cont;
}

function UpdateLisaLegend(colors) {
    const div = document.getElementById('legend');
    var cont = '';
    for (var i=0; i<colors.size(); ++i) {
        cont += '<div class="legend" style="background: '+colors.get(i)+'; width: 20%;"></div>';
    }
    div.innerHTML = cont;
}

function UpdateLisaLabels(labels) {
    const div = document.getElementById('legend-labels');
    var cont = '<div style="width: 20%;text-align:center">Not Sig</div>';
    for (var i=1; i<5; ++i) {
        cont += '<div style="width: 20%;text-align:center">' +labels.get(i)+ '</div>';
    }
    div.innerHTML = cont;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return  [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
  }

function OnChoroplethClick(evt) {
    var is_state = document.getElementById("btn-state").classList.contains("checked");
    if (is_state) {
        OnStateClick();
    } else {
        OnCountyClick();
    }
}

function OnLISAClick(evt) {
    var map_uuid, w_uuid;
    var is_state = document.getElementById("btn-state").classList.contains("checked");
    if (is_state) {
        map_uuid = state_map;
        if (state_w == null) {
            state_w = gda_proxy.CreateQueenWeights(state_map, 1, 0, 0);
        }
        w_uuid = state_w.get_uid();
    } else {
        map_uuid = county_map;
        if (county_w == null) {
            county_w = gda_proxy.CreateQueenWeights(county_map, 1, 0, 0);
        }
        w_uuid = county_w.get_uid();
    }
    var sel_var = map_variable;
    var lisa = gda_proxy.local_moran(map_uuid, w_uuid, sel_var);
    var color_vec = lisa.colors();
    var labels = lisa.labels();
    var clusters = lisa.clusters();

    getFillColor = function(f) {
        var c = clusters.get(f.properties.id);
        return hexToRgb(color_vec.get(c));
    }

    UpdateLisaLegend(color_vec);
    UpdateLisaLabels(labels);

    if (is_state) {
        loadMap(state_map, "all");
    } else {
        loadMap(county_map, "all");
    }
    evt.classList.add("checked");
    document.getElementById("btn-nb").classList.remove("checked");
}

var Module = { onRuntimeInitialized: function() {
    gda_proxy = new GeodaProxy();
    OnStateClick(document.getElementById("btn-state"));
}};

function updateTooltip({x, y, object}) {
    const tooltip = document.getElementById('tooltip');

    if (object) {
        object.properties.selected = true;
        feats = setFeatureSelected(feats, object);
        state.hoveredObject = object;
        state.features = feats;

        var fat = 0;
        if (object.properties.confirmed_count > 0) {
            fat = object.properties.death_count / object.properties.confirmed_count * 100;
        }

        tooltip.style.top = `${y}px`;
        tooltip.style.left = `${x}px`;
        tooltip.innerHTML = `
<div><b>${object.properties.NAME}:</b><br/><br/></div>
<div><b>${map_variable}:</b>${object.properties[map_variable]}</div>
<div><b>Death:</b>${object.properties.death_count}</div>
<div><b>Fatality rate: </b>${fat.toFixed(2)}%</div>
`;
    } else {
        state.hoveredObject = null;
        tooltip.innerHTML = '';
    }
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

function getConfirmedCountByDateState(data, state) {
    var features = data['features'];
    var dates = getDatesFromGeojson(data);
    var counts = 0;
    for (var j =0; j<features.length; ++j) {
        if (features[j]["properties"]["STUSPS"] == state) {
            for (var i=0; i<dates.length; ++i) {
                var d = dates[i];
                if (d <= select_date) {
                    counts += features[j]["properties"][d];
                }
            }   
            break;
        }
    }
    return counts;
}

function getConfirmedCountByDate(data, all) {    
    var features = data['features'];
    var dates = getDatesFromGeojson(data);
    var counts = [];
    for (var i=0; i<dates.length; ++i) {
        var sum = 0;
        var d = dates[i];
        if (all || d <= select_date) {
            for (var j =0; j<features.length; ++j) {
                sum += features[j]["properties"][d];
            }
        }   
        counts.push(sum);
    }
    return counts;
}

function getAccumConfirmedCountByDate(data, all) {    
    var counts = getConfirmedCountByDate(data, all);
    for (var i=1; i<counts.length; ++i) {
        counts[i] = counts[i-1] + counts[i];
    }
    return counts;
}


// following code are for LINE CHART
function addTrendLine(data, title) {
    
    var height = 140;
    var width = 290;
    var margin = {top: 10, right:20, bottom: 50, left: 50};

    d3.select("#linechart svg").remove();

    var svg = d3.select("#linechart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g").attr("class", "y axis");
    svg.append("g").attr("class", "x axis");
        
    var xScale = d3.scaleBand().range([margin.left, width], .1);
    var yScale = d3.scaleLinear().range([height, 10]);
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    // extract the x labels for the axis and scale domain
    var xLabels = getDatesFromGeojson(data); 
    xScale.domain(xLabels);
    
    var yValues = getAccumConfirmedCountByDate(data, false);
    yScale.domain([0, Math.max.apply(null, yValues)]);

    var tmpData = [];
    for (var i=0; i<xLabels.length; ++i) {
        tmpData.push({"date":xLabels[i], "confirmedcases":yValues[i]});
    }
    var line = d3.line()
        .x(function(d) { return xScale(d['date']); })
        .y(function(d) { return yScale(d['confirmedcases']); });

    svg.append("path")
        .datum(tmpData)
        .attr("class","line")
        .attr("d", line);    

    svg.append("g")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis.tickValues(xLabels.filter(function(d, i) { 
            if (i % 2 == 0)
                return d;
            })).tickFormat(function(e){
                return e.substring(5);
            }))
        .selectAll("text")
        .style("text-anchor","end")
        .attr("transform", function(d) {
            return "rotate(-45)";
        });

    svg.append("g")
        .attr("transform", "translate(" + (margin.left) + ",0)")
        .attr("class", "yaxis")
        .call(yAxis.tickFormat(function(e){if(Math.floor(e) != e) return; return e;}));


    // chart title
    svg.append("text")
        .attr("class","linetitle")
        .attr("x", (width + (margin.left + margin.right) )/ 2)
        .attr("y", 0 + margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "sans-serif")
        .text(title);
}

// ** Update data section (Called from the onclick)
function updateTrendLine({x,y,object}) 
{
    var height = 140;
    var width = 290;
    var margin = {top: 10, right:20, bottom: 50, left: 50};
    var xLabels, yValues, title;

    if (object) {
        xLabels = [];
        yValues = [];
        for (var col in object.properties) {
            if (col.startsWith("2020")) {
                xLabels.push(col);
                yValues.push(object.properties[col]);
            }
        }
        for (var i=1; i<yValues.length; ++i) {
            yValues[i] = yValues[i-1] + yValues[i];
        }
        title = object.properties["NAME"];
    } else {
        xLabels = getDatesFromGeojson(jsondata); 
        yValues = getAccumConfirmedCountByDate(jsondata, false);
        title = "all";
    }
    // Get the data again
    var tmpData = [];
    for (var i=0; i<xLabels.length; ++i) {
        tmpData.push({"date":xLabels[i], "confirmedcases":yValues[i]});
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
        .x(function(d) { return xScale(d['date']); })
        .y(function(d) { return yScale(d['confirmedcases']); });

    var xAxis = d3.axisBottom()
        .scale(xScale);
        
    var yAxis = d3.axisLeft()
        .scale(yScale);

    // Make the changes
    svg.select(".line")   // change the line
        .duration(750)
        .attr("d", line(tmpData));
    svg.select(".yaxis") // change the y axis
        .duration(750)
        .call(yAxis);
    
    svg.select(".linetitle")
        .text(title);
}

function createTimeSlider(geojson)
{
    if(document.getElementById("slider-svg").innerHTML.length > 0) 
        return;

    var width = 500,
        height = 180,
        padding = 26;

    var svg = d3.select("#slider-svg")
        .append("svg")
        .attr("width", width + padding*2)
        .attr("height", height);

    var xScale = d3.scaleBand()
        .range([padding, width], .1);
        
    var yScale = d3.scaleLinear()
        .range([height -padding, padding]);

    var xLabels = getDatesFromGeojson(geojson); 
    xScale.domain(xLabels);
   
    d3.select("#slider").node().max = xLabels.length;
    d3.select("#slider").node().value = xLabels.length;
    
    var yValues = getAccumConfirmedCountByDate(geojson, true);
    yScale.domain([0, Math.max.apply(null, yValues)]);

    var tmpData = [];
    for (var i=0; i<xLabels.length; ++i) {
        tmpData.push({"date":xLabels[i], "confirmedcases":yValues[i]});
    }

    var tooltip = d3.select("#slider-tooltip").style("opacity", 0);

    var bars = svg.selectAll(".bars")
        .data(tmpData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.date))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.confirmedcases))
        .attr("height", d => height - padding - yScale(d.confirmedcases))
        .text("1")
        .attr("fill", (d => xLabels[d3.select("#slider").node().value-1] == d.date ? "red" : "white"));
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisRight(yScale);

    //var gX = svg.append("g")
    //    .attr("transform", "translate(0," + (height - padding) + ")")
    //    .call(xAxis);

    var gY = svg.append("g")
        .attr("class", "axis--y")
        .attr("transform", "translate(" + (width) + ",0)")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "translate(" + (width/2) + "," + 0 + ")")
        .attr("dy", "1em")
        .attr("class", "slider_text")
        .attr("text-anchor", "end")
        .style("fill", "white")
        .html(select_date);

    d3.select("#slider").on("input", function() {
        var currentValue = this.value;
        select_date = dates[currentValue-1];
        console.log(select_date);
        var xLabels = getDatesFromGeojson(geojson); 
        xScale.domain(xLabels);

        var yValues = getAccumConfirmedCountByDate(geojson, true);
        yScale.domain([0, Math.max.apply(null, yValues)]);

        bars.attr("y", d => yScale(d.confirmedcases))
            .attr("height", d => height - padding - yScale(d.confirmedcases))
            .attr("fill", (d => xLabels[currentValue-1] == d.date ? "red" : "white"));

        d3.select(".slider_text")
            .html(select_date);
            
        //gY.call(yAxis);
        var is_state = document.getElementById("btn-state").classList.contains("checked");
        if (is_state) {
            //OnStateClick();
        } else {
            //OnCountyClick();
        }
    })
}
