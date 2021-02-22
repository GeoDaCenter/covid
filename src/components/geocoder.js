// general imports, state
import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import throttle from 'lodash/throttle';
import styled from 'styled-components';
import { colors } from '../config';

const Container = styled.div`
    flex:auto;
    width:100%;
    .MuiFormControl-root {
        margin:0;
    }
    .MuiAutocomplete-inputRoot {
        background:white;
        height:36px;
        border-radius:0px;
        padding:0 35px;
    }
    .MuiAutocomplete-inputRoot[class*="MuiInput-root"] .MuiAutocomplete-input:first-child {
        padding:0;
    }
    .MuiInput-underline:hover:not(.Mui-disabled):before {
        border-bottom:2px solid ${colors.yellow};
    }
    .MuiInput-underline:after {
        border-bottom:2px solid ${colors.strongOrange};

    }
    .MuiFormControl-root .MuiInputBase-adornedEnd:before {
        display: block;
        content: ' ';
        background-image: url("${process.env.PUBLIC_URL}/assets/img/search.svg");
        background-size: 20px 20px;
        height: 20px;
        width: 20px;
        transform:translate(8px, -9px);
        border-bottom:none !important;
    }

`

const StyledOption = styled.span`
    span {
        display:block;
        font-size:12px;
        &:first-child {
            font-size:16px;
            font-weight:bold;
        }

    }
`

const Geocoder = ( props ) => {

    const [searchState, setSearchState] = useState({
        results: [],
        value: '',
    })

    const loadResults = (results) => {
        setSearchState(prev => ({
            ...prev,
            results
        }))
    }

    const clearInput = () => {
        setSearchState({
            results: [],
            value: '',
        })
    }
    
    const buildAddress = (text) => `https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=${props.API_KEY}&country=US&autocomplete=true&types=region%2Cdistrict%2Cpostcode%2Clocality%2Cplace%2Caddress`

    const getMapboxResults = async (text, callback) => fetch(buildAddress(text)).then(r => r.json()).then(r => callback(r.features))

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

    const formatPlaceContext = (contextArray) => {
        let returnString = ``
        for (let i=0; i<contextArray.length; i++) {
            if (
                contextArray[i].id.includes('region')
                ||
                contextArray[i].id.includes('country')
                ||
                contextArray[i].id.includes('place')
                ||
                contextArray[i].id.includes('neighborhood')
            ) {
                returnString += `${contextArray[i].text}, `
            }
        }
        return returnString.slice(0,-2)
    }

    return (
        <Container>
            <Autocomplete
                id="geocoder search"
                freeSolo
                disableClearable
                filterOptions={(x) => x}
                autoComplete
                clearOnEscape
                inputValue={searchState.value}
                options={searchState.results}
                getOptionLabel={option => option.place_name}
                onChange={(source, selectedOption) => {
                    clearInput();
                    props.onChange(selectedOption);
                }}
                renderOption={(option, idx) => (
                <React.Fragment>
                    <StyledOption id={idx}>
                        <span>{option.place_name.split(',')[0]}</span>
                        <span>{formatPlaceContext(option.context)}</span>
                    </StyledOption>
                </React.Fragment>
                )}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    margin="normal"
                    placeholder={props.placeholder}
                    InputProps={{ ...params.InputProps, type: 'search' }}
                    onChange={(e) => {               
                        setSearchState(prev => ({
                            ...prev,
                            value: e.target.value,
                        }));
                        handleSearch(e)}
                    }
                    />
                )}
                style={props.style}
            />
        </Container>
    )
}

export default Geocoder