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

// Load in new data to the store, including 
// the GeoJSON and indices, chart data, bins, etc.
// Used when switching to a new data source
export const dataLoad = ( load ) => {
    return {
        type: 'DATA_LOAD',
        payload: {
            load
        }
    }
}

// Load existing data, including the dataset to load,
// bins, chart data, etc.
// Used when switching back to an already loaded dataset
export const dataLoadExisting = ( load ) => {
    return {
        type: 'DATA_LOAD_EXISTING',
        payload: {
            load
        }
    }
}

// Update bins with new bin breaks
// Currently not used
export const setNewBins = ( load ) => {
    return {
        type: 'SET_NEW_BINS',
        payload: {
            load
        }
    }
}

// Depricated: Replaced with dataLoad
export const storeData = (data, name) => {
    return {
        type: 'SET_STORED_DATA',
        payload: {
            data,
            name
        }   
    }
}

// Store GEOJSON and pseudo-hash table
// This keeps the original index pairs and matches them when 
// performing LISA analysis, which returns data based on the 
// original GEOJSON index order
export const storeGeojson = (data, name) => {
    return {
        type: 'SET_STORED_GEOJSON',
        payload: {
            data,
            name
        }   
    }
}

// Stores the **VERY LARGE** mobility data for county to county flows
// Currently not used
export const storeMobilityData = (data) => {
    return {
        type: 'SET_STORED_MOBILITY_DATA',
        payload: {
            data
        }
    }
}

// store lisa values with specific variable combination
export const storeLisaValues = (data) => {
    return {
        type: 'SET_STORED_LISA_DATA',
        payload: {
            data
        }   
    }
}

// store cartogram data, just like lisa
export const storeCartogramData = (data) => {
    return {
        type: 'SET_STORED_CARTOGRAM_DATA',
        payload: {
            data
        }   
    }
}

// Sets the name of the current data set, usually a geojson
// Triggers data load event with useEffect in App()
export const setCurrentData = (data) => {
    return {
        type: 'SET_CURRENT_DATA',
        payload: {
            data
        }
    }
}

// Not used -- this stored the Geoda Proxy, but was a bad idea
// Storing the proxy in the state stops it from being serializable,
// so we currently store it in the local App() state, and nothing else
export const setGeodaProxy = (proxy) => {
    return {
        type: 'SET_GEODA_PROXY',
        payload: {
            proxy
        }
    }
}

// Stores parsed centroid data 
export const setCentroids = (data, name) => {
    return {
        type: 'SET_CENTROIDS',
        payload: {
            data,
            name
        }
    }
}

// Stores current dates
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

// DEPRICATED: the first valid date in the main data columns (cases, deaths, etc.)
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

// DEPRICATED: now located in map params
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

export const openContextMenu = ( params ) => {
    return {
        type: 'OPEN_CONTEXT_MENU',
        payload: {
            params
        }
    }
}

export const setTooltipContent = ( x, y, data ) => {
    return {
        type: 'SET_TOOLTIP_CONTENT',
        payload: {
            x,
            y,
            data
        }
    }

}