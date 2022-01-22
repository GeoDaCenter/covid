export const templates = {
    "My County's Stats": [
      [
        {
          type: 'text',
          width: 4,
          height: 1,
          content: ({name}) => <h2>7-Day Average Report: {name}</h2>
        },
        {
          type: "textReport",
          width: 2,
          height: 3,
        },
        {
          type: "lineChart",
          width: 2,
          height: 3,
        },
        {
          type: 'table',
          topic: 'COVID',
          width: 2,
          height: 3,
        },
        {
          type: 'table',
          topic: 'SDOH',
          width: 2,
          height: 3,
        }
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