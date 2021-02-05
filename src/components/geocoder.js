// general imports, state
import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import throttle from 'lodash/throttle';

const Geocoder = ( props ) => {

    const [searchState, setSearchState] = useState({
        isLoading: false,
        results: [],
    })

    const loadResults = (results) => {
        setSearchState(prev => ({
            ...prev,
            results
        }))
    }
    const getMapboxResults = async (text, callback) => fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=${props.API_KEY}&country=US`).then(r => r.json()).then(r => callback(r.features))

    const queryMapbox = React.useMemo(
        () =>
          throttle((text, callback) => {
                getMapboxResults(text, callback)
          }, 200),
        [],
      );
      
    //   
    const handleSearch = async (e) => {
        if (e.target.value.length > 3) {
            queryMapbox(e.target.value, (r) => loadResults(r))

        }
    }

    return (
        <div>
            <Autocomplete
            freeSolo
            id="geocoder search"
            disableClearable
            options={searchState.results.map((option) => option.text)}
            renderInput={(params) => (
                <TextField
                {...params}
                margin="normal"
                placeholder="Search by Location"
                InputProps={{ ...params.InputProps, type: 'search' }}
                onChange={handleSearch}
                />
            )}
            />
        </div>
    )
}

export default Geocoder