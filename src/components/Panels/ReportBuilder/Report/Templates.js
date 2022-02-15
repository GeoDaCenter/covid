export const templates = {
  "My County's Stats": [
    [
      {
        type: "text",
        w: 2,
        h: 1,
        x:0,
        y:0,
        content: {
          preset: "7day",
        },
      },
      {
        type: "map",
        w: 2,
        h: 4,
        x:2,
        y:0,
        variable: "Confirmed Count per 100K Population"
      },
      {
        type: "textReport",
        w: 2,
        h: 3,
        x:0,
        y:1
      },
      {
        type: "lineChart",
        w: 2,
        h: 3,        
        x:0, 
        y:4,
        table: "cases"
      },
      {
        type: "lineChart",
        w: 2,
        h: 3,
        x:2,
        y:4,
        table: "deaths"
      },
      {
        type: "table",
        topic: "COVID",
        w: 2,
        h: 3,
        x:0,
        y:7,
        metrics: ["Cases", "Deaths", "Vaccination", "Testing"],
      },
      {
        type: "table",
        topic: "SDOH",
        metrics: [
          "Uninsured Percent",
          "Over 65 Years Percent",
          "Life Expectancy",
          "Percent Essential Workers",
          "Adult Obesity",
          "Preventable Hospital Stays",
          "Severe Housing Problems",
        ],
        w: 2,
        h: 3,
        x:2,
        y:7,
      },
    ],
  ],
  "A National Snapshot": [
    [
      {
        type: "text",
        w: 4,
        h: 1,
        content: "National Overview"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Confirmed Count per 100K Population",
        scale: "national"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Death Count per 100K Population",
        scale: "national"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Percent Fully Vaccinated",
        scale: "national"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "7 Day Testing Positivity Rate Percent",
        scale: "national"
      },
      {
        type: "table",
        topic: "COVID-NATIONAL",
        w: 4,
        h: 4,
        metrics: ["Cases", "Deaths", "Vaccination", "Testing"],
        includedColumns: ["variable","nationalSummary", "q50", "q25", "q75", "min", "max"],
        geogToInclude: 'national'
      },
    ],
    [
      {
        type: "text",
        w: 4,
        h: 1,
        content: "National Trends and Historic Data"
      },
      {
        type: "lineChart",
        w: 2,
        h: 5,
        table: "cases"
      },
      {
        type: "lineChart",
        w: 2,
        h: 5,
        table: "deaths"
      },
      {
        type: "lineChart",
        w: 2,
        h: 5,
        table: "vaccines_fully_vaccinated"
      },
      {
        type: "lineChart",
        w: 2,
        h: 5,
        table: "testing_wk_pos"
      },
    ],
    [
      {
        type: "text",
        w: 4,
        h: 1,
        content: "Hotspots"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Confirmed Count per 100K Population",
        scale: "national",
        mapType: "lisa"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Death Count per 100K Population",
        scale: "national",
        mapType: "lisa"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Percent Fully Vaccinated",
        scale: "national",
        mapType: "hinge15_breaks"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "7 Day Testing Positivity Rate Percent",
        scale: "national",
        mapType: "lisa"
      }
    ],    
  ],
  "My Region's Snapshot": [
    [
      {
        type: "text",
        w: 4,
        h: .5,
        content: "Regional Snapshot"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Confirmed Count per 100K Population",
        scale: "region"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Death Count per 100K Population",
        scale: "region"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Percent Fully Vaccinated",
        scale: "region"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "7 Day Testing Positivity Rate Percent",
        scale: "region"
      },
      {
        type: "table",
        topic: "COVID-REGIONAL",
        w: 4,
        h: 5,
        metrics: ["Cases", "Deaths", "Vaccination", "Testing"],
        includedColumns: ["variable","geoidData","stateQ50","q50","regionQ50","regionSummary","regionMax","regionMin"],
        geogToInclude: "secondOrderNeighbors"
        
      },
    ],
    [
      {
        type: "text",
        w: 4,
        h: 1,
        content: "Regional Trends and Historic Data"
      },
      {
        type: "lineChart",
        w: 2,
        h: 6,
        table: "cases",
        linesToShow: "secondOrderNeighbors",
        populationNormalized: true
      },
      {
        type: "lineChart",
        w: 2,
        h: 6,
        table: "deaths",
        linesToShow: "secondOrderNeighbors",
        populationNormalized: true
      },
      {
        type: "lineChart",
        w: 2,
        h: 6,
        table: "vaccines_fully_vaccinated",
        linesToShow: "secondOrderNeighbors",
        populationNormalized: true
      },
      {
        type: "lineChart",
        w: 2,
        h: 6,
        table: "testing_wk_pos",
        linesToShow: "secondOrderNeighbors",
        populationNormalized: true
      },
    ],
    [
      {
        type: "text",
        w: 4,
        h: 1,
        content: "Hotspots"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Confirmed Count per 100K Population",
        scale: "region",
        mapType: "lisa"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Death Count per 100K Population",
        scale: "region",
        mapType: "lisa"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Percent Fully Vaccinated",
        scale: "region",
        mapType: "hinge15_breaks"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "7 Day Testing Positivity Rate Percent",
        scale: "region",
        mapType: "lisa"
      }
    ],
  ],
  "My Neighboring County's Stats": [
    [
      {
        type: "text",
        w: 4,
        h: .5,
        content: "Neighboring Counties Snapshot"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Confirmed Count per 100K Population",
        scale: "neighbors"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Death Count per 100K Population",
        scale: "neighbors"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Percent Fully Vaccinated",
        scale: "neighbors"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "7 Day Testing Positivity Rate Percent",
        scale: "neighbors"
      },
      {
        type: "table",
        topic: "COVID-REGIONAL",
        w: 4,
        h: 5,
        metrics: ["Cases", "Deaths", "Vaccination", "Testing"],
        includedColumns: ["variable","geoidData","stateQ50","q50","regionQ50","regionSummary","regionMax","regionMin"],
        geogToInclude: "neighbors"
        
      },
    ],
    [
      {
        type: "text",
        w: 4,
        h: 1,
        content: "Neighbor Trends and Historic Data"
      },
      {
        type: "lineChart",
        w: 2,
        h: 6,
        table: "cases",
        linesToShow: "neighbors",
        populationNormalized: true
      },
      {
        type: "lineChart",
        w: 2,
        h: 6,
        table: "deaths",
        linesToShow: "neighbors",
        populationNormalized: true
      },
      {
        type: "lineChart",
        w: 2,
        h: 6,
        table: "vaccines_fully_vaccinated",
        linesToShow: "neighbors",
        populationNormalized: true
      },
      {
        type: "lineChart",
        w: 2,
        h: 6,
        table: "testing_wk_pos",
        linesToShow: "neighbors",
        populationNormalized: true
      },
    ],
    [
      {
        type: "text",
        w: 4,
        h: 1,
        content: "Hotspots"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Confirmed Count per 100K Population",
        scale: "neighbors",
        mapType: "lisa"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Death Count per 100K Population",
        scale: "neighbors",
        mapType: "lisa"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "Percent Fully Vaccinated",
        scale: "neighbors",
        mapType: "hinge15_breaks"
      },
      {
        type: "map",
        w: 2,
        h: 5,
        variable: "7 Day Testing Positivity Rate Percent",
        scale: "neighbors",
        mapType: "lisa"
      }
    ],
  ],
  "Something Else (Blank Report)": [[]],
};
