import { INITIAL_STATE } from '../constants/defaults';
import { mapFn, dataFn, getVarId, getCSV, getCartogramCenter, getDataForCharts, getURLParams } from '../utils';
import { colorScales, fixedScales, dataPresets, defaultTables, dataPresetsRedux, variablePresets, colors } from '../config';



const getSimpleColor = (value, bins, colorScale, mapType, numerator, storedLisaData, storedGeojson, currentData, GEOID) => mapFn(value, bins, colorScale, mapType, numerator);
const getLisaColor = (value, bins, colorScale, mapType, numerator, storedLisaData, storedGeojson, currentData, GEOID) => colorScale[storedLisaData[storedGeojson[currentData]['geoidOrder'][GEOID]]]||[240,240,240]
const getColorFunction = (mapType) => mapType === 'lisa' ? getLisaColor : getSimpleColor
const getHeight = (val, dataParams) => val*(dataParams.scale3D/((dataParams.nType === "time-series" && dataParams.nRange === null) ? (dataParams.nIndex)/10 : 1))

var reducer = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case 'INITIAL_LOAD': {
            const dataParams = {
                ...state.dataParams,
                ...action.payload.data.variableParams,
            }
            const mapParams = {
                ...state.mapParams,
                ...action.payload.data.mapParams
            }
            const storedData = {
                ...state.storedData,
                ...action.payload.data.storedData,
            }

            const storedGeojson = {
                ...state.storedGeojson,
                ...action.payload.data.storedGeojson,
            }

            return {
                ...state,
                currentData: action.payload.data.currentData,
                storedGeojson,
                storedData,
                dataParams,
                mapParams
            }
        }
        case 'ADD_TABLES': {
            const storedData = {
                ...state.storedData,
                ...action.payload.data
            }
            return {
                ...state,
                storedData
            }
        }
        case 'UPDATE_MAP': {
            // const {data, varID} = parameters; //dataName, dataType, params, colorScale
            if (!state.mapParams.bins.hasOwnProperty("bins") || (state.mapParams.mapType !== 'lisa' && !state.mapParams.bins.breaks)) {
                return state
            };
    
            let returnArray = [];
            let returnObj = {};
            let i = 0;

            const getTable = (i, predicate) => 
                state.dataParams[predicate] === 'properties' 
                    ?
                state.storedGeojson[state.currentData].data.features[i].properties 
                    : 
                state.storedData[dataPresetsRedux[state.currentData].tables[state.dataParams[predicate]].file][0][state.storedGeojson[state.currentData].data.features[i].properties.GEOID]
                    ||
                state.storedData[defaultTables[dataPresetsRedux[state.currentData].geography][state.dataParams[predicate]].file][0][state.storedGeojson[state.currentData].data.features[i].properties.GEOID];

            const getColor = getColorFunction(state.mapParams.mapType)

            switch(state.mapParams.vizType) {
                // case 'cartogram':{
                //     if (storedGeojson[currentData] === undefined) break;
                //     while (i < data.length) {
                //         const tempGeoid = storedGeojson[currentData]['indexOrder'][data[i].properties?.id]
                //         const tempColor = GetSimpleFillColor(data[i].value, tempGeoid, bins.breaks, mapType);
                //         returnArray.push({
                //             GEOID: tempGeoid,
                //             position: data[i].position,
                //             color: tempColor,
                //             radius: data[i].radius
                //         })
                //         i++;
                //     }
                //     break
                // }
                default: {
                    let t0 = performance.now()
                    for (let i=0; i<state.storedGeojson[state.currentData].data.features.length; i++){
                        for (let n=0; n<state.storedGeojson[state.currentData].data.features[i].geometry.coordinates.length; n++){
                            const tempVal = dataFn(getTable(i, 'numerator'), getTable(i, 'denominator'), state.dataParams)
                            
                            const tempColor = getColor(
                                tempVal, 
                                state.mapParams.bins.breaks, 
                                state.mapParams.colorScale, 
                                state.mapParams.mapType, 
                                state.dataParams.numerator, 
                                state.storedLisaData, 
                                state.storedGeojson, 
                                state.currentData, 
                                state.storedGeojson[state.currentData].data.features[i].properties.GEOID
                            );

                            const tempHeight = getHeight(tempVal, state.dataParams);

                            if (tempColor === null) {
                                continue;
                            }

                            returnArray.push({
                                GEOID: state.storedGeojson[state.currentData].data.features[i].properties.GEOID,
                                geom: state.storedGeojson[state.currentData].data.features[i].geometry.coordinates[n],
                                color: tempColor,
                                height: tempHeight
                            })
                            returnObj[state.storedGeojson[state.currentData].data.features[i].properties.GEOID] = tempColor
                        }
                    }

                    console.log(t0 - performance.now())
                }

                return {
                    ...state,
                    mapData: {
                        params: getVarId(state.currentData, state.dataParams),
                        data: returnArray, 
                        dots: returnObj
                    }
                }
            }
        }
        case 'DATA_LOAD':
            // main new data loading reducer
            // I: Destructure payload (load) object
            let { storeData, currentData, columnNames, dateIndices,
                storeGeojson, chartData, mapParams, 
                variableParams} = action.payload.load;

            // II: Create copies of existing state objects.
            // This is necessary to avoid mutating the state
            let [
                    dataObj, colDataObj, dateIndexObj, geoDataObj, 
                    mapParamsDataObj, variableParamsDataObj, panelsDataObj
                ] = [
                    {
                    ...state.storedData
                }, {
                    ...state.cols
                }, {
                    ...state.dateIndices
                }, {
                    ...state.storedGeojson,
                }, {
                    ...state.mapParams,
                    ...mapParams
                }, {
                    ...state.dataParams,
                    ...variableParams
                }, {
                    ...state.panelState,
                    info: false
                }];

                dataObj[storeData.name] = storeData.data;
                colDataObj[columnNames.name] = columnNames.data;
                dateIndexObj[dateIndices.name] = dateIndices.data;
                geoDataObj[storeGeojson.name] = storeGeojson.data;
            return {
                ...state,
                storedData: dataObj,
                cols: colDataObj,
                dateIndices: dateIndexObj,
                storedGeojson: geoDataObj,
                mapParams: mapParamsDataObj,
                dataParams: variableParamsDataObj,
                currentData,
                selectionKeys: [],
                selectionIndex: [],
                chartData,
                sidebarData: {},
                panelState: panelsDataObj

            };
        case 'DATA_LOAD_EXISTING':
            
            let [ variableParamsExDataObj, panelsExDataObj ] 
                = [
                    {
                    ...state.dataParams,
                    ...action.payload.load.variableParams
                }, {
                    ...state.panelState,
                    info: false
                }];

            return {
                ...state,
                dataParams: variableParamsExDataObj,
                chartData: action.payload.load.chartData,
                sidebarData: {},
                selectionKeys: [],
                selectionIndex: [],
                panelState: panelsExDataObj

            };
        case 'SET_NEW_BINS':
            let [ binsVariableParams, binsMapParams] 
                = [{
                    ...state.dataParams,
                    ...action.payload.load.variableParams
                },{
                    ...state.mapParams,
                    ...action.payload.load.mapParams
                }]
            return {
                ...state,
                dataParams: binsVariableParams,
                mapParams: binsMapParams
            }
        case 'SET_GEOID': 
            return {
                ...state,
                currentGeoid: action.payload.geoid
            };
        case 'SET_STORED_DATA':
            let obj = {
                ...state.storedData,
            }
            obj[action.payload.name] = action.payload.data
            return {
                ...state,
                storedData: obj
            };
        case 'SET_STORED_GEOJSON':
            let geojsonObj = {
                ...state.storedGeojson,
            }
            geojsonObj[action.payload.name] = action.payload.data
            return {
                ...state,
                storedGeojson: geojsonObj
            };
        case 'SET_STORED_LISA_DATA':
            // let lisaObj = {
            //     ...state.storedLisaData,
            // }
            // lisaObj[action.payload.name] = action.payload.data
            return {
                ...state,
                storedLisaData: action.payload.data
            };
        case 'SET_STORED_CARTOGRAM_DATA':
            // let cartoObj = {
            //     ...state.storedCartogramData,
            // }
            // cartoObj[action.payload.name] = action.payload.data
            return {
                ...state,
                storedCartogramData: action.payload.data
            };
        case 'SET_STORED_MOBILITY_DATA':
            return {
                ...state,
                storedMobilityData: action.payload.data
            }
        case 'SET_CENTROIDS':
            let centroidsObj = {
                ...state.centroids,
            }
            centroidsObj[action.payload.name] = action.payload.data
            return {
                ...state,
                centroids: centroidsObj
            };
        case 'SET_CURRENT_DATA':
            return {
                ...state,
                currentData: action.payload.data
            }
        case 'SET_GEODA_PROXY':
            return {
                ...state,
                geodaProxy: action.payload.proxy
            }
        case 'SET_DATES':
            return {
                ...state,
                dates: action.payload.data
            }
        case 'SET_DATA_FUNCTION':
            return {
                ...state,
                currentDataFn: action.payload.fn
            }
        case 'SET_COLUMN_NAMES':
            let colObj = {
                ...state.cols
            }
            colObj[action.payload.name] = action.payload.data
            return {
                ...state,
                cols: colObj
            }
        case 'SET_CURR_DATE':
            return {
                ...state,
                currDate: action.payload.date
            }
        case 'SET_DATE_INDEX':
            return {
                ...state,
                currDateIndex: action.payload.index
            }
        case 'SET_START_DATE_INDEX':
            return {
                ...state,
                startDateIndex: action.payload.index
            }
        case 'SET_BINS':
            let binsObj = {};
            binsObj['bins'] =  action.payload.bins;
            binsObj['breaks'] =  action.payload.breaks;
            return {
                ...state,
                bins: binsObj
            }
        case 'SET_3D':
            return {
                ...state,
                use3D: !state.use3D
            }
        case 'SET_DATA_SIDEBAR':
            return {
                ...state,
                sidebarData: action.payload.data
            }
        case 'INCREMENT_DATE':
            let dateObj = {
                ...state.dataParams
            }
            let currIndices = state.dateIndices[state.currentData][state.dataParams.numerator]
            let nextIndex = currIndices[currIndices.indexOf(state.dataParams.nIndex)+action.payload.index]

            if (nextIndex === undefined) {
                dateObj.nIndex = currIndices[0]
                dateObj.dIndex = currIndices[0]
                return {
                    ...state,
                    dataParams:dateObj
                }
            } else {
                dateObj.nIndex = nextIndex;
                dateObj.dIndex = nextIndex;
                return {
                    ...state,
                    dataParams:dateObj
                }
            }
        case 'SET_START_PLAYING': {
            let dateObj = {
                ...state.dataParams
            }
            let currIndices = state.dateIndices[state.currentData][state.dataParams.numerator]
            let nextIndex = currIndices[currIndices.indexOf(state.dataParams.nIndex)+action.payload.index]

            if (nextIndex === undefined) {
                dateObj.nIndex = currIndices[0]
                dateObj.dIndex = currIndices[0]
                return {
                    ...state,
                    dataParams:dateObj
                }
            } else {
                dateObj.nIndex = nextIndex;
                dateObj.dIndex = nextIndex;
                return {
                    ...state,
                    isPlaying:true,
                    dataParams:dateObj
                }
            }
        }
        case 'SET_STOP_PLAYING': {
            return {
                ...state,
                isPlaying:false,
            }
        }
        case 'SET_VARIABLE_PARAMS':
            let paramObj = {
                ...state.dataParams,
                ...action.payload.params
            }

            if (state.dataParams.zAxisParams !== null) {
                paramObj.zAxisParams.nIndex = paramObj.nIndex;
                paramObj.zAxisParams.dIndex = paramObj.dIndex;
            }

            if (paramObj.nType === 'time-series' && paramObj.nIndex === null) {
                paramObj.nIndex = state.storedIndex;
                paramObj.nRange = state.storedRange;
            }
            if (paramObj.dType === 'time-series' && paramObj.dIndex === null) {
                paramObj.dIndex = state.storedIndex;
                paramObj.dRange = state.storedRange;
            }
            if (paramObj.nType === 'characteristic' && state.dataParams.nType === 'time-series') {
                return {
                    ...state,
                    storedIndex: state.dataParams.nIndex,
                    storedRange: state.dataParams.nRange,
                    dataParams: paramObj,
                }
            } else {
                return {
                    ...state,
                    dataParams: paramObj 
                }
            }
        case 'SET_VARIABLE_PARAMS_AND_DATASET':
            const { params, dataset, dataMapParams } = action.payload.params;

            let dataAndParamsObj = {
                ...state.dataParams,
                ...params
            };

            let dataAndMapParamsObj = {
                ...state.mapParams,
                ...dataMapParams
            }
            
            return {
                ...state,
                dataParams: dataAndParamsObj,
                mapParams: dataAndMapParamsObj,
                selectionKeys: [],
                selectionIndex: [],
                currentData: dataset
            };
        case 'SET_Z_VARIABLE_PARAMS':
            let paramObjZ = {
                ...state.dataParams,
                zAxisParams: action.payload.params
            }
            
            return {
                ...state,
                currentZVariable: action.payload.variable,
                dataParams: paramObjZ 
            }

        case 'SET_MAP_PARAMS':
            let mapParamObj = {
                ...state.mapParams,
                ...action.payload.params
            }

            let zAxisReset = {
                ...state.dataParams
            }
            let zAxisVariableReset = state.currentZVariable

            if (action.payload.params.vizType !== '3D') {
                zAxisReset.zAxisParams = null
                zAxisVariableReset = null
            }

            return {
                ...state,
                mapParams: mapParamObj,
                dataParams: zAxisReset,
                currentZVariable: zAxisVariableReset
            }
        case 'SET_PANELS':
            let panelsObj = {
                ...state.panelState,
                ...action.payload.params
            }
            return {
                ...state,
                panelState: panelsObj 
            }
        case 'SET_VARIABLE_NAME':
            return {
                ...state,
                currentVariable: action.payload.name
            }
        case 'SET_SELECTION_DATA':
            return {
                ...state,
                chartData: action.payload.data.values,
                selectionKeys: [action.payload.data.name],
                selectionIndex: [action.payload.data.index]
            }
        case 'APPEND_SELECTION_DATA':
            let appendedChartData = state.chartData;
            let countCol = action.payload.data.name + ' Daily Count'
            let sumCol = action.payload.data.name + ' Total Cases'

            for (let i=0; i<appendedChartData.length;i++) {
                appendedChartData[i][countCol] = action.payload.data.values[i][countCol]
                appendedChartData[i][sumCol] = action.payload.data.values[i][sumCol]
            }

            let appendedSelectionNames = [action.payload.data.name, ...state.selectionKeys];
            let appendedSelectionIndex = [action.payload.data.index, ...state.selectionIndex];

            return {
                ...state,
                chartData: appendedChartData,
                selectionKeys: appendedSelectionNames,
                selectionIndex: appendedSelectionIndex,
            }
        case 'REMOVE_SELECTION_DATA':
            let removedSelectionNames = [...state.selectionKeys]
            let tempRemoveIndex = removedSelectionNames.indexOf(action.payload.data.name)
            removedSelectionNames.splice(tempRemoveIndex, 1)

            let removedSelectionIndex = [...state.selectionIndex]
            tempRemoveIndex = removedSelectionIndex.indexOf(action.payload.data.index)
            removedSelectionIndex.splice(tempRemoveIndex, 1)


            return {
                ...state,
                selectionKeys: removedSelectionNames,
                selectionIndex: removedSelectionIndex,
            }
        case 'SET_ANCHOR_EL':
            return {
                ...state,
                anchorEl: action.payload.anchorEl
            }
        case 'SET_MAP_LOADED':
            return {
                ...state,
                mapLoaded: action.payload.loaded
            }
        case 'LAZY_LOAD_DATA':
            let toCache = [...new Set(Object.values(action.payload.dataPresets).map(dataset => dataset.tables).flat())]

            toCache.forEach(dataset => {
                fetch(`${process.env.PUBLIC_URL}/csv/${dataset}.csv`)
            })

            return {
                ...state,
                lazyFetched: true
            }
        case 'SET_NOTIFICATION':
            return {
                ...state,
                notification: {
                    info: action.payload.info,
                    location: action.payload.location
                }
            }
        case 'SET_URL_PARAMS':
            const { urlParams, presets } = action.payload;

            let preset = urlParams.var ? presets[urlParams.var.replace(/_/g, ' ')] : {};

            let urlMapParamsObj = {
                ...state.mapParams,
                binMode: urlParams.dbin ? 'dynamic' : '',
                mapType: urlParams.mthd || state.mapParams.mapType,
                overlay: urlParams.ovr ||  state.mapParams.overlay,
                resource: urlParams.res || state.mapParams.resource,
                vizType: urlParams.viz || state.mapParams.vizType
            };

            let urlDataParamsObj = {
                ...state.dataParams,
                ...preset,
                nIndex: urlParams.date || state.dataParams.nIndex,
                nRange: urlParams.hasOwnProperty('range') ? urlParams.range === 'null' ? null : urlParams.range : state.dataParams.nRange,
                nProperty: urlParams.prop || state.dataParams.nProperty
            };
            
            let urlCoordObj = {
                lat: urlParams.lat || '',
                lon: urlParams.lon || '',
                z: urlParams.z || ''
            }

            let urlParamsSource = urlParams.src ? 
                `${urlParams.src}.geojson` : 
                state.currentData 

            return {
                ...state,
                currentData: urlParamsSource,
                urlParams: urlCoordObj,
                mapParams: urlMapParamsObj,
                dataParams: urlDataParamsObj
            }
        case "OPEN_CONTEXT_MENU":
            let contextPanelsObj = {
                ...state.panelState,
                context: true,
                contextPos: {
                    x: action.payload.params.x,
                    y: action.payload.params.y
                }
            }
            return {
                ...state,
                panelState: contextPanelsObj
            }
        case 'SET_TOOLTIP_CONTENT':
            return {
                ...state,
                tooltipContent: {
                    x: action.payload.x,
                    y: action.payload.y,
                    data: action.payload.data,
                }
            } 
        case 'SET_DOT_DENSITY':
            return {
                ...state,
                dotDensityData: action.payload.data
            }
        case 'CHANGE_DOT_DENSITY_MODE':
            let changeDotDensityObj = {
                ...state.mapParams
            }

            changeDotDensityObj.dotDensityParams.colorCOVID = !changeDotDensityObj.dotDensityParams.colorCOVID;

            return {
                ...state,
                mapParams:changeDotDensityObj
            }
        case 'TOGGLE_DOT_DENSITY_RACE':
            let toggleAcsObj = {
                ...state.mapParams
            }

            toggleAcsObj.dotDensityParams.raceCodes[action.payload.index] = !toggleAcsObj.dotDensityParams.raceCodes[action.payload.index];

            return {
                ...state,
                mapParams:toggleAcsObj
            }
        case 'SET_DOT_DENSITY_BACKGROUND_OPACITY':
            let backgroundOpacityState = {
                ...state.mapParams
            }
            backgroundOpacityState.dotDensityParams.backgroundTransparency = action.payload.opacity
            
            return {
                ...state,
                mapParams:backgroundOpacityState
            }
            
        default:
            return state;
    }
}

export default reducer;