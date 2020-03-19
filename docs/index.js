const {DeckGL, GeoJsonLayer} = deck;

const COLOR_SCALE = [
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

var jsondata;
var colorScale;
var feats;

var state = { hoveredObject: null, features:null};

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

function loadMap(url, title) {
    d3.json(url, function(data) {

        jsondata = data;

        feats = initFeatureSelected(data);

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
            getFillColor: f => colorScale(f.properties.confirmed_count),
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
    colorScale = function(x) {
        if (x < 10) {
            return COLOR_SCALE[0] ;
        } else if (x < 30) {
            return COLOR_SCALE[1];
        } else if (x < 50) {
            return COLOR_SCALE[2];
        } else if (x < 80) {
            return COLOR_SCALE[3];
        } else if (x < 100) {
            return COLOR_SCALE[4];
        } else if (x < 200) {
            return COLOR_SCALE[5];
        } else if (x < 400) {
            return COLOR_SCALE[6];
        } else if (x < 800) {
            return COLOR_SCALE[7];
        } else { // x > 800
            return COLOR_SCALE[8];
        }
    }
    evt.classList.add("checked");
    document.getElementById("btn-state").classList.remove("checked");
    loadMap("https://mapcovid19.github.io/data/counties.geojson", "new cases: all");
}

function OnStateClick(evt) {
    colorScale = function(x) {
        if (x < 10) {
            return COLOR_SCALE[0] ;
        } else if (x < 30) {
            return COLOR_SCALE[1];
        } else if (x < 50) {
            return COLOR_SCALE[2];
        } else if (x < 80) {
            return COLOR_SCALE[3];
        } else if (x < 100) {
            return COLOR_SCALE[4];
        } else if (x < 200) {
            return COLOR_SCALE[5];
        } else if (x < 400) {
            return COLOR_SCALE[6];
        } else if (x < 800) {
            return COLOR_SCALE[7];
        } else { // x > 800
            return COLOR_SCALE[8];
        }
    }
    evt.classList.add("checked");
    document.getElementById("btn-county").classList.remove("checked");
    loadMap("https://mapcovid19.github.io/data/states.geojson", "new cases: all");
}

OnStateClick(document.getElementById("btn-state"));

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
<div><b>Confirmed cases:</b>${object.properties.confirmed_count}</div>
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

function getConfirmedCountByDate(data) {    
    var features = data['features'];
    var dates = getDatesFromGeojson(data);
    var counts = [];
    for (var i=0; i<dates.length; ++i) {
        var sum = 0;
        var d = dates[i];
        for (var j =0; j<features.length; ++j) {
            sum += features[j]["properties"][d];
        }
        counts.push(sum);
    }
    return counts;
}



// following code are for LINE CHART
var height = 140;
var width = 290;
var margin = {top: 10, right:20, bottom: 50, left: 30};

function addTrendLine(data, title) {
    
    d3.select("#linechart svg").remove();

    var svg = d3.select("#linechart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g")
        .attr("class", "y axis");
        
    svg.append("g")
        .attr("class", "x axis");
        
    var xScale = d3.scaleBand()
        .range([margin.left, width], .1);
        
    var yScale = d3.scaleLinear()
        .range([height, 10]);
    
    var xAxis = d3.axisBottom()
        .scale(xScale);
        
    var yAxis = d3.axisLeft()
        .scale(yScale);

    // extract the x labels for the axis and scale domain
    var xLabels = getDatesFromGeojson(data); 
    xScale.domain(xLabels);
    
    var yValues = getConfirmedCountByDate(data);
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
            })))
        .selectAll("text")
        .style("text-anchor","end")
        .attr("transform", function(d) {
            return "rotate(-45)";
        });

    svg.append("g")
        .attr("transform", "translate(" + (margin.left) + ",0)")
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
function updateTrendLine({x,y,object}) {
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
        title = "new cases: " + object.properties["NAME"];
    } else {
        xLabels = getDatesFromGeojson(jsondata); 
        yValues = getConfirmedCountByDate(jsondata);
        title = "new cases: all";
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
    var svg = d3.select("#linechart").transition();

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
    svg.select(".y.axis") // change the y axis
        .duration(750)
        .call(yAxis);
    
    svg.select(".linetitle")
        .text(title);
}

function createTimeSlider(geojson)
{

    var width = 500,
        height = 180,
        padding = 16;

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
    

    var yValues = getConfirmedCountByDate(geojson);
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
        .attr("fill", (d => xLabels[d3.select("#slider").node().value-1] == d.date ? "red" : "white"))
        .on("mouseover", function(d) {
            d3.select(this).style("fill", "red")
            tooltip.text(d.date)
            .style("opacity", 0.8)
                    .style("left", (d3.event.pageX)+0 + "px") 
                    .style("top", (d3.event.pageY)-0 + "px");
        })
        .on("mouseout", function(d) {
            tooltip.style("opacity", 0);
            d3.select(this).style("fill", "white");

        });

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisRight(yScale);

    //var gX = svg.append("g")
    //    .attr("transform", "translate(0," + (height - padding) + ")")
    //    .call(xAxis);

    var gY = svg.append("g")
        .attr("class", "axis--y")
        .attr("transform", "translate(" + (width) + ",0)")
        .call(yAxis);

    d3.select("#slider").on("input", function() {
        var currentValue = this.value;
        
        var xLabels = getDatesFromGeojson(geojson); 
        xScale.domain(xLabels);

        var yValues = getConfirmedCountByDate(geojson);
        yScale.domain([0, Math.max.apply(null, yValues)]);

        bars.attr("y", d => yScale(d.confirmedcases))
            .attr("height", d => height - padding - yScale(d.confirmedcases))
            .attr("fill", (d => xLabels[currentValue-1] == d.date ? "red" : "white"));
        //gY.call(yAxis);
    })
}
