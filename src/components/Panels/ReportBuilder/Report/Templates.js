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
        height: 4,
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
        type: "textReport",
        width: 2,
        height: 2,
      },
    ],
  ],
  "My Region's Snapshot": [
    [
      {
        type: "textReport",
        width: 2,
        height: 2,
      },
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
