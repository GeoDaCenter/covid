export const INITIAL_STATE = {
  storedGeojson: {},
  storedData: {},
  storedLisaData: {},
  storedCartogramData: {},
  storedMobilityData: {},
  lazyFetched:false,
  currentData: 'cdc_h.geojson',
  currentTable: {
    numerator: '',
    denominator: ''
  },
  dotDensityData: [],
  chartData: [{}],
  selectionKeys: [],
  selectionNames: [],
  centroids: {},
  dates: {},
  isPlaying:false,
  currentZVariable: null,
  currentMethod: 'natural_breaks',
  currentOverlay: '',
  currentResource: '',
  mapData : {
    data: [],
    params: []
  },
  dataParams: {
    variableName:"Percent Fully Vaccinated",
    numerator: 'vaccines_fully_vaccinated',
    nType: 'time-series',
    nProperty: null,
    nRange: null,
    denominator: 'properties',
    dType: 'characteristic',
    dProperty: 'population',
    dRange:null,
    dIndex:null,
    scale:100,
    scale3D: 1000,
    colorScale: 'YlGn8',
    fixedScale: null,
    dataNote: 'Data prior to 2/28/21 include any doses administered in the state and may include residents of other states.',
    zAxisParams: null,
    fixedScale: null,
    storedRange: null
  },
  mapParams: {
    mapType: 'natural_breaks',
    bins: {
      bins: [],
      breaks: []
    },
    binMode: '',
    fixedScale: null,
    nBins: 8,
    vizType: '2D',
    activeGeoid: '',
    overlay: '',
    resource: '',
    colorScale: [
      [240,240,240],
      [255,255,229],
      [247,252,185],
      [217,240,163],
      [173,221,142],
      [120,198,121],
      [65,171,93],
      [35,132,67],
      [0,90,50],
    ],
    dotDensityParams: {
      raceCodes: {
        1: true,
        2: true,
        3: true,
        4: true,
        5: false,
        6: false,
        7: false,
        8: true
      },
      colorCOVID: false,
      backgroundTransparency: 0.01      
    }
  },
  chartParams: {
    table: 'cases',
    populationNormalized: false
  },
  panelState: {
    variables:true,
    info:true,
    tutorial:false,
    lineChart:true,
    context: false,
    contextPos: {x:null,y:null}
  },
  storedRange: null,
  sidebarData: {},
  anchorEl: null,
  mapLoaded: false,
  notification: {
    info: null,
    location: ''
  },
  urlParams: {},
  tooltipContent: {
    x:0,
    y:0,
    data: null
  }
};