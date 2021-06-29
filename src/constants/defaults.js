import { 
  variablePresets,
  dataPresets, 
  defaultTables,
  defaultData
} from '../config/index';

// read in URL params
let paramsDict = {}; 
for (const [key, value] of new URLSearchParams(window.location.search) ) { paramsDict[key] = value; }
const currVariable = paramsDict.hasOwnProperty('var') 
  ? {
      ...variablePresets[paramsDict.var.replace(/_/g, " ")],
      [paramsDict.hasOwnProperty('date') && 'nIndex']: +paramsDict.date,
      [paramsDict.hasOwnProperty('range') && 'nRange']: paramsDict.range === 'null' ? null : +paramsDict.range,
    }
  : {}

export const INITIAL_STATE = {
  // Default data state
  currentData: paramsDict.hasOwnProperty('src') ? `${paramsDict.src}.geojson` : defaultData,
  currentMethod: paramsDict.hasOwnProperty('mthd') ? paramsDict.mthd : 'natural_breaks',
  dataPresets,
  defaultTables,
  variablePresets,
  // Large data storage
  lazyFetched:false,
  storedGeojson: {},
  storedData: {},
  storedLisaData: {},
  storedCartogramData: {},
  storedMobilityData: {},
  dotDensityData: [],
  centroids: {},
  // data and map params 
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
    scale3D: 500_000,
    colorScale: 'YlGn8',
    fixedScale: null,
    dataNote: 'Texas reports only state-level vaccination rates to the CDC.',
    zAxisParams: null,
    fixedScale: null,
    storedRange: null,
    ...currVariable
  },
  storedRange: null,
  mapParams: {
    mapType: paramsDict.hasOwnProperty('mthd') ? paramsDict.mthd : 'natural_breaks',
    bins: {
      bins: [],
      breaks: []
    },
    binMode: paramsDict.hasOwnProperty('dBin') && paramsDict.dBin ? 'dynamic' : '',
    fixedScale: null,
    nBins: paramsDict.hasOwnProperty('mthd') && paramsDict.mthd.includes === 'hinge15_breaks' 
      ? 6
      : paramsDict.hasOwnProperty('mthd') && paramsDict.mthd.includes === 'lisa'
      ? 4
      : 8,
    vizType: paramsDict.hasOwnProperty('viz') ? paramsDict.viz : '2D',
    activeGeoid: '',
    overlay:  paramsDict.hasOwnProperty('ovr') ? paramsDict.ovr : '',
    resource: paramsDict.hasOwnProperty('res') ? paramsDict.res : '',
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
  // current data
  chartData: [{}],
  currentTable: {
    numerator: '',
    denominator: ''
  },
  currentZVariable: null,
  dates: {},
  mapData : {
    data: [],
    params: []
  },
  sidebarData: {},
  // selection info
  selectionKeys: [],
  selectionNames: [],
  // UI tags
  anchorEl: null,
  isPlaying:false,
  mapLoaded: false,
  notification: {
    info: null,
    location: ''
  },
  panelState: {
    variables:true,
    info:true,
    tutorial:false,
    lineChart:true,
    context: false,
    contextPos: {x:null,y:null},
    dataLoader:true
  },
  urlParams: {},
  tooltipContent: {
    x:0,
    y:0,
    data: null
  },
  shouldUpdate:true,
  isLoading: true
};