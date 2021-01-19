// this component was the start of making a flexible data exploration tool
// the idea was that the numerator and denominator columns could be selected on the fly
// and new data could be incorporated
// long term, this is important, but for now it remains WIP

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setVariableParams } from '../actions';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
}));

const VariablePanel = (props) => {

    const classes = useStyles();

    const dispatch = useDispatch();  
    const [hidePanel, setHidePanel] = useState(false)
    
    const ignoreTables = ['type', 'geometry']
    const ignoreColumns = ['FIPS', 'State', 'County', 'GEOID']

    const PlainEnglishNames = {
        chr_health_factors: "Community Health Factors",
        chr_life: "Community Health Life Data",
        chr_health_context: "Community Health Context",
        predictions: "UC Berkeley Predictions",
        deaths: "Death Data",
        cases: "Case Data",
        properties: "County Information"
    }

    let menuItems = [];

    if (props.tables && props.columns) {
        props.tables.forEach(table => {
            if (ignoreTables.includes(table)) return;
            menuItems.push(<ListSubheader value={table} key={table}>{PlainEnglishNames[table]}</ListSubheader>)
            if (props.columns[table]){
                if (Date.parse(props.columns[table].slice(-1,)[0])) {
                    menuItems.push(<MenuItem value={`${table}-${table}-cols`} key={`${table}-cols`}>{table}</MenuItem>)
                } else {
                    props.columns[table].forEach(column => {
                        if (!ignoreColumns.includes(column)) menuItems.push(<MenuItem value={`${table}-${column}-characteristic`} key={column}>{column}</MenuItem>)
                    })             
                }
            } else if (table === "properties") {
                menuItems.push(<MenuItem value={`${table}-population-characteristic`} key={'population'}>Population</MenuItem>)
                menuItems.push(<MenuItem value={`${table}-beds-characteristic`} key={'beds'}>Beds</MenuItem>)
            } 
            
        })
    }

    const handleNumeratorChange = (event) => {
        let tableName = event.target.value.split('-')[0];
        let columnName = event.target.value.split('-')[1];
        let tableType = event.target.value.split('-')[2];
        
        if (tableType==="characteristic") {
            dispatch(setVariableParams({
                numerator: tableName,
                nProperty: columnName,
                nRange: null,
            }))
        } else {
            dispatch(setVariableParams({
                numerator: tableName,
                nProperty: null,
                nRange: 7,
            }))
        }
    };

    const handleDenominatorChange = (event) => {
        let tableName = event.target.value.split('-')[0];
        let columnName = event.target.value.split('-')[1];
        let tableType = event.target.value.split('-')[2];
        if (event.target.value === '') {
            dispatch(setVariableParams({
                denominator: 'properties',
                dProperty: null,
                dRange: null,
            }))
        }
        if (tableType==="characteristic") {
            dispatch(setVariableParams({
                denominator: tableName,
                dProperty: columnName,
                dRange: null,
            }))
        } else {
            dispatch(setVariableParams({
                denominator: tableName,
                dProperty: null,
                dRange: 7,
            }))
        }
    };

    return (
      <div id="variable-panel" style={{transform: (hidePanel ? 'translateX(-100%)' : '')}}>
        <p>Variable</p>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="numerator-select">Numerator</InputLabel>
          <Select 
            defaultValue="" 
            id="numerator-select"
            onChange={handleNumeratorChange}
        >
            {/* <MenuItem value="">
              <em>None</em>
            </MenuItem> */}
            {
                props.columns && menuItems
            }
          </Select>
        </FormControl>
        <hr/>
        
        <p>Normalization</p>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="denominator-select">Denominator</InputLabel>
          <Select 
            defaultValue="" 
            id="denominator-selector"
            onChange={handleDenominatorChange}
            >
                
            {/* <MenuItem value="">
              <em>None</em>
            </MenuItem> */}
            <MenuItem value="">None</MenuItem>
            {
                props.columns && menuItems
            }
          </Select>
        </FormControl>
        <button onClick={() => setHidePanel(prev => { return !prev })} id="showHideLeftPanel">show/hide</button>
      </div>
    );
}

export default VariablePanel;