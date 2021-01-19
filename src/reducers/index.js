import { INITIAL_STATE } from '../constants/defaults';

var reducer = (state = INITIAL_STATE, action) => {
    switch(action.type) {
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
            let lisaObj = {
                ...state.storedLisaData,
            }
            lisaObj[action.payload.name] = action.payload.data
            return {
                ...state,
                storedLisaData: lisaObj
            };
        case 'SET_STORED_CARTOGRAM_DATA':
            let cartoObj = {
                ...state.storedCartogramData,
            }
            cartoObj[action.payload.name] = action.payload.data
            return {
                ...state,
                storedCartogramData: cartoObj
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
        case 'SET_NOTIFICATION':
            return {
                ...state,
                notification: action.payload.info
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
        default:
            return state;
    }
}

export default reducer;