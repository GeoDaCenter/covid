// These actions are part of the verbose boilerplate of redux
// As part of the Flux architecture, these connect the dispatch from a component to the reducers

// set active GEOID 
// currently not used
export const setGeoid = (geoid) => {
    return {
        type: 'SET_GEOID',
        payload: {
            geoid
        }
    }
}

export const dataLoad = ( load ) => {
    return {
        type: 'DATA_LOAD',
        payload: {
            load
        }
    }
}

export const dataLoadExisting = ( load ) => {
    return {
        type: 'DATA_LOAD_EXISTING',
        payload: {
            load
        }
    }
}

export const setNewBins = ( load ) => {
    return {
        type: 'SET_NEW_BINS',
        payload: {
            load
        }
    }
}

// main store for map and tabular data
export const storeData = (data, name) => {
    return {
        type: 'SET_STORED_DATA',
        payload: {
            data,
            name
        }   
    }
}

// store GEOJSON and pseudo-hash table
export const storeGeojson = (data, name) => {
    return {
        type: 'SET_STORED_GEOJSON',
        payload: {
            data,
            name
        }   
    }
}

export const storeMobilityData = (data) => {
    return {
        type: 'SET_STORED_MOBILITY_DATA',
        payload: {
            data
        }
    }
}

// store lisa values with specific variable combination
export const storeLisaValues = (data, name) => {
    return {
        type: 'SET_STORED_LISA_DATA',
        payload: {
            data,
            name
        }   
    }
}

// store cartogra data, just like lisa
export const storeCartogramData = (data, name) => {
    return {
        type: 'SET_STORED_CARTOGRAM_DATA',
        payload: {
            data,
            name
        }   
    }
}

// sets the name of the current data set, usually a geojson
export const setCurrentData = (data) => {
    return {
        type: 'SET_CURRENT_DATA',
        payload: {
            data
        }
    }
}

// not used -- this stored the Geoda Proxy, but was a bad idea
export const setGeodaProxy = (proxy) => {
    return {
        type: 'SET_GEODA_PROXY',
        payload: {
            proxy
        }
    }
}

// stores parsed centroid data 
export const setCentroids = (data, name) => {
    return {
        type: 'SET_CENTROIDS',
        payload: {
            data,
            name
        }
    }
}

// stores valid dates in current data set
export const setDates = (data) => {
    return {
        type: 'SET_DATES',
        payload: {
            data
        }
    }
}

// not used -- stores the current data parsing function in the store
export const setDataFunction = (fn) => {
    return {
        type: 'SET_DATA_FUNCTION',
        payload: {
            fn
        }
    }
}

// stores a pseudo-hash table or lookup table
// the data attached to the geojson is stored in arrays / list,
// so a lookup table is needed to find the key-value pairs
export const setColumnNames = (data, name) => {
    return {
        type: 'SET_COLUMN_NAMES',
        payload: {
            data,
            name
        }
    }

}

// sets the current date as text
// export const setDate = (date) => {
//     return {
//         type: 'SET_CURR_DATE',
//         payload: {
//             date
//         }
//     }
// }

// sets the index of the date within the current dataset(s)
export const setDateIndex = (index) => {
    return {
        type: 'SET_DATE_INDEX',
        payload: {
            index
        }
    }
}

// the first valid date in the main data columns (cases, deaths, etc.)
export const setStartDateIndex = (index) => {
    return {
        type: 'SET_START_DATE_INDEX',
        payload: {
            index
        }
    }
}

// stores the current bins (bin names / descriptions)
// and breaks (numerical breaks)
export const setBins = (bins, breaks) => {
    return {
        type: 'SET_BINS',
        payload: {
            bins,
            breaks
        }
    }
}

// not used -- set map to 3d
export const set3D = () => {
    return {
        type: 'SET_3D'
    }
}

// loads data for the data/info sidebar
export const setDataSidebar = ( data ) => {
    return {
        type: 'SET_DATA_SIDEBAR',
        payload: {
            data
        }
    }
}

// increments the date by 1, for use with the animation
export const incrementDate = ( index ) => {
    return {
        type: 'INCREMENT_DATE',
        payload: {
            index
        }
    }
}

// sets the variables parameters (index and range, numerator, denominator, etc.)
export const setVariableParams = ( params ) => {
    return {
        type: 'SET_VARIABLE_PARAMS',
        payload: {
            params
        }
    }
}

export const setParametersAndData = ( params ) => {
    return {
        type: 'SET_VARIABLE_PARAMS_AND_DATASET',
        payload: {
            params
        }
    }
    
}

// change the Z axis variable for bi-variate 3D views
export const variableChangeZ = ( variable, params ) => {
    return {
        type: 'SET_Z_VARIABLE_PARAMS',
        payload: {
            variable,
            params
        }
    }
}

// sets the map parameters (color mode, viz type, etc.)
export const setMapParams = ( params ) => {
    return {
        type: 'SET_MAP_PARAMS',
        payload: {
            params
        }
    }
}

// loads in chart data from current data
export const setSelectionData = ( data ) => {
    return {
        type: 'SET_SELECTION_DATA',
        payload: {
            data
        }
    }
}

// adds to current chart data from current data
export const appendSelectionData = ( data ) => {
    return {
        type: 'APPEND_SELECTION_DATA',
        payload: {
            data
        }
    }
}

// removes from current chart data from current data
export const removeSelectionData = ( data ) => {
    return {
        type: 'REMOVE_SELECTION_DATA',
        payload: {
            data
        }
    }
}

// sets current text-based variable name (eg. Death Count)
export const setVariableName = ( name ) => {
    return {
        type: 'SET_VARIABLE_NAME',
        payload: {
            name
        }
    }
}

// sets the anchor element for the inforational tooltip
export const setAnchorEl = ( anchorEl ) => {
    return {
        type: 'SET_ANCHOR_EL',
        payload: {
            anchorEl
        }
    }
}

// sets the left, right, and dock panel states
export const setPanelState = ( params ) => {
    return {
        type: 'SET_PANELS',
        payload: {
            params
        }
    }
}

export const setMapLoaded = ( loaded ) => {
    return {
        type: 'SET_MAP_LOADED',
        payload: {
            loaded
        }
    }
}

export const setNotification = ( info ) => {
    return {
        type: 'SET_NOTIFICATION',
        payload: {
            info
        }
    }
}

export const setUrlParams = ( urlParams, presets ) => {
    return {
        type: 'SET_URL_PARAMS',
        payload: {
            urlParams,
            presets
        }
    }
}