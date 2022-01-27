const INITIAL_STATE ={
  anchorEl: null,
  isPlaying: false,
  mapLoaded: false,
  notification: {
    info: null,
    location: "",
  },
  panelState: {
    variables: true,
    info: false,
    tutorial: false,
    lineChart: true,
    context: false,
    contextPos: { x: null, y: null },
    dataLoader: false,
    scatterChart: false,
    reportBuilder: false
  },
  tooltipInfo: {
    x: 0,
    y: 0,
    data: null,
  },
  shouldUpdate: true,
  isLoading: true,
  mapScreenshotData: {},
  shouldPanMap: false,
  colorFilter: false,
  variableMenuWidth: 0
}
export default INITIAL_STATE;