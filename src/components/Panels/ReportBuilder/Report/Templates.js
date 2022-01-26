export const templates = {
  "My County's Stats": [
    [
      {
        type: "text",
        width: 2,
        height: 1,
        content: {
          preset: "7day",
        },
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Confirmed Count per 100K Population"
      },
      {
        type: "textReport",
        width: 2,
        height: 4,
      },
      {
        type: "lineChart",
        width: 2,
        height: 5,
        table: "cases"
      },
      {
        type: "lineChart",
        width: 2,
        height: 5,
        table: "deaths"
      },
      {
        type: "table",
        topic: "COVID",
        width: 2,
        height: 5,
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
        width: 2,
        height: 5,
      },
    ],
  ],
  "A National Snapshot": [
    [
      {
        type: "text",
        width: 4,
        height: 1,
        content: "National Overview"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Confirmed Count per 100K Population",
        scale: "national"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Death Count per 100K Population",
        scale: "national"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Percent Fully Vaccinated",
        scale: "national"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "7 Day Testing Positivity Rate Percent",
        scale: "national"
      },
      {
        type: "table",
        topic: "COVID-NATIONAL",
        width: 4,
        height: 4,
        metrics: ["Cases", "Deaths", "Vaccination", "Testing"],
        includedColumns: ["variable","nationalSummary", "q50", "q25", "q75", "min", "max"],
      },
    ],
    [
      {
        type: "text",
        width: 4,
        height: 1,
        content: "National Trends and Historic Data"
      },
      {
        type: "lineChart",
        width: 2,
        height: 5,
        table: "cases"
      },
      {
        type: "lineChart",
        width: 2,
        height: 5,
        table: "deaths"
      },
      {
        type: "lineChart",
        width: 2,
        height: 5,
        table: "vaccines_fully_vaccinated"
      },
      {
        type: "lineChart",
        width: 2,
        height: 5,
        table: "testing_wk_pos"
      },
    ],
    [
      {
        type: "text",
        width: 4,
        height: 1,
        content: "Hotspots"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Confirmed Count per 100K Population",
        scale: "national",
        mapType: "lisa"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Death Count per 100K Population",
        scale: "national",
        mapType: "lisa"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Percent Fully Vaccinated",
        scale: "national",
        mapType: "hinge15_breaks"
      },
      {
        type: "map",
        width: 2,
        height: 5,
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
        width: 4,
        height: 1,
        content: "Regional Snapshot"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Confirmed Count per 100K Population",
        scale: "region"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Death Count per 100K Population",
        scale: "region"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Percent Fully Vaccinated",
        scale: "region"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "7 Day Testing Positivity Rate Percent",
        scale: "region"
      },
      {
        type: "table",
        topic: "COVID-REGIONAL",
        width: 4,
        height: 4,
        metrics: ["Cases", "Deaths", "Vaccination", "Testing"],
        includedColumns: ["variable","geoidData","stateQ50","q50","regionalSummary","regionalHighest","regionalLowest"],
      },
    ],
    [
      {
        type: "text",
        width: 4,
        height: 1,
        content: "National Trends and Historic Data"
      },
      {
        type: "lineChart",
        width: 2,
        height: 5,
        table: "cases"
      },
      {
        type: "lineChart",
        width: 2,
        height: 5,
        table: "deaths"
      },
      {
        type: "lineChart",
        width: 2,
        height: 5,
        table: "vaccines_fully_vaccinated"
      },
      {
        type: "lineChart",
        width: 2,
        height: 5,
        table: "testing_wk_pos"
      },
    ],
    [
      {
        type: "text",
        width: 4,
        height: 1,
        content: "Hotspots"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Confirmed Count per 100K Population",
        scale: "region",
        mapType: "lisa"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Death Count per 100K Population",
        scale: "region",
        mapType: "lisa"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "Percent Fully Vaccinated",
        scale: "region",
        mapType: "hinge15_breaks"
      },
      {
        type: "map",
        width: 2,
        height: 5,
        variable: "7 Day Testing Positivity Rate Percent",
        scale: "region",
        mapType: "lisa"
      }
    ],
  ],
  "My Neighboring County's Stats": [
    [
      {
        type: "textReport",
        width: 2,
        height: 2,
      },
    ],
  ],
  "Something Else (Blank Report)": [[]],
};
