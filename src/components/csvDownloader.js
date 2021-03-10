import React, { useState } from 'react';
import styled from 'styled-components';
import { FormControl, FormGroup, FormControlLabel, Checkbox, Grid} from '@material-ui/core';
import { colors } from '../config';
import { Gutter } from '../styled_components';
import * as JSZip from 'jszip'

const CsvDownloaderContainer = styled.div`
    padding:20px;
    border:1px solid ${colors.darkgray};
    background:${colors.lightblue}11;
    span {
        font-family: 'Lato', Arial, sans-serif;
    }
    .inset {
        margin: 0 0 20px 20px;
    }
    a {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 1.75px;
        line-height:3;
        text-align: center;
        text-transform:uppercase;
        background-color: ${colors.blue};
        color: ${colors.white};
        padding: 0 20px;
        border-radius: .3rem;
        text-decoration:none;
        border:none;
        margin:0 auto;
        display:block;
        cursor:pointer;
        box-shadow:0px 0px 4px rgba(0,0,0,0);
        transition:250ms all;
        &:hover {
            box-shadow:2px 2px 4px rgba(0,0,0,0.35);
        }
    }
    *.MuiIconButton-colorSecondary.Mui-checked {
        color:${colors.blue};
    }
    &.passive {
        background:${colors.gray} url('${process.env.PUBLIC_URL}/assets/img/preloader.gif') ;
        background-repeat:no-repeat;
        background-position:center center;
        opacity:0.5;
        pointer-events:none;
        button, *.MuiIconButton-colorSecondary.Mui-checked {
            opacity:0.2;
        }
    }
`

const checkboxSets = [
    {
        label: 'Cases Data',
        name: 'cases',
        subset: [
            // {
            //     label: 'County - 1point3acres',
            //     name: 'covid_confirmed_1p3a'
            // },
            {
                label: 'County - CDC',
                name: 'covid_confirmed_cdc'
            },
            {
                label: 'County - New York Times',
                name: 'covid_confirmed_nyt'
            },
            {
                label: 'County - USA Facts',
                name: 'covid_confirmed_usafacts'
            },
            // {
            //     label: 'State - 1point3acres',
            //     name: 'covid_confirmed_1p3a_state'
            // },
            {
                label: 'State - New York Times',
                name: 'covid_confirmed_nyt_state'
            },
            {
                label: 'State - USA Facts',
                name: 'covid_confirmed_usafacts_state'
        }]
    },
    {
        label: 'Deaths Data',
        name: 'deaths',
        subset: [
            // {
            //     label: 'County - 1point3acres',
            //     name: 'covid_deaths_1p3a'
            // },
            {
                label: 'County - CDC',
                name: 'covid_deaths_cdc'
            },
            {
                label: 'County - NYT',
                name: 'covid_deaths_nyt'
            },
            {
                label: 'County - USA Facts',
                name: 'covid_deaths_usafacts'
            },
            // {
            //     label: 'State - 1point3acres',
            //     name: 'covid_deaths_1p3a_state'
            // },
            {
                label: 'State - New York Times',
                name: 'covid_deaths_nyt_state'
            },
            {
                label: 'State - USA Facts',
                name: 'covid_deaths_usafacts_state'
        }]
    },
    {
        label: 'Vaccination Data',
        name: 'vaccination',
        subset: [
            {
                label: 'State - First Doses Administered - CDC',
                name: 'vaccine_admin1_cdc'
            },
            {
                label: 'State - Second Doses Administered - CDC',
                name: 'vaccine_admin2_cdc'
            },
            {
                label: 'State - Doses Distributed but not Administered - CDC',
                name: 'vaccine_dist_cdc'
            }]
    },
    {
        label: 'Testing Data',
        name: 'testing',
        subset: [
            {
                label: 'County - Testing Counts - CDC',
                name: 'covid_testing_cdc'
            },
            {
                label: 'County - Testing Capacity Per 100k - CDC',
                name: 'covid_tcap_cdc'
            },
            {
                label: 'County - Testing Positivity - CDC',
                name: 'covid_wk_pos_cdc'
            },
            {
                label: 'County - Confirmed Cases per Testing - CDC',
                name: 'covid_ccpt_cdc'
            },
            {
                label: 'State - Testing Counts - HHS',
                name: 'covid_testing_cdc_state'
            },
            {
                label: 'State - Testing Capacity Per 100k - HHS',
                name: 'covid_tcap_cdc_state'
            },
            {
                label: 'State - Testing Positivity - HHS',
                name: 'covid_wk_pos_cdc_state'
            },
            {
                label: 'State - Confirmed Cases per Testing - HHS',
                name: 'covid_ccpt_cdc_state'
        }]
    },
    {
        label: 'Hospital and Clinics Locations',
        name: 'hospitals_clinics',
        subset: [
            {
                label: 'Federally Qualified Health Clinics - HRSA',
                name: 'context_fqhc_clinics_hrsa'
            },
            {
                label: 'Hospital Locations - CovidCareMap',
                name: 'context_hospitals_covidcaremap'
            }]
    },
    {
        label: 'Essential Workers',
        name: 'essential_workers_parent',
        subset: [
            {
                label: 'Essential Workers - ACS',
                name: 'context_essential_workers_acs'
            }]
    },
    // {
    //     label: 'Health Context',
    //     name: 'health_context',
    //     subset: [
    //         {
    //             label: 'County - Health Context - County Health Rankings',
    //             name: 'chr_health_context'
    //         },
    //         {
    //             label: 'County - Health Factors - County Health Rankings',
    //             name: 'chr_health_factors'
    //         },
    //         {
    //             label: 'County - Life Expectancy - County Health Rankings',
    //             name: 'chr_life'
    //         },
    //         {
    //             label: 'State - Health Context - County Health Rankings',
    //             name: 'chr_health_context_state'
    //         },
    //         {
    //             label: 'State - Health Factors - County Health Rankings',
    //             name: 'chr_health_factors_state'
    //         },
    //         {
    //             label: 'State - Life Expectancy - County Health Rankings',
    //             name: 'chr_life_state'
    //         }]
    // },

]   

const readme = `# readme

    This archive contains folders for data CSVs (data) and detailed documentation (docs). The US Covid Atlas is an open source project licensed under GPL 3. 

    The data sources included are licensed for open source, non-commercial projects, ***but may have restrictions for commercial uses.*** 

    Please consult the data sources listed in the data documentation before using this data in commercial publications.
`


const CsvDownloader = () => {
    const [checkboxes, setCheckboxes] = useState({
        cases:false,        
            covid_confirmed_1p3a: false,
            covid_confirmed_1p3a_state: false,
            covid_confirmed_cdc: false,
            covid_confirmed_cdc_state: false,
            covid_confirmed_nyt: false,
            covid_confirmed_nyt_state: false,
            covid_confirmed_usafacts: false,
            covid_confirmed_usafacts_state: false,
        deaths:false,
            covid_deaths_1p3a: false,
            covid_deaths_1p3a_state: false,
            covid_deaths_cdc: false,
            covid_deaths_cdc_state: false,
            covid_deaths_nyt: false,
            covid_deaths_nyt_state: false,
            covid_deaths_usafacts: false,
            covid_deaths_usafacts_state: false,
        berkeley_predictions: false,
        health_context: false,
            chr_health_context: false,
            chr_health_context_state: false,
            chr_health_factors: false,
            chr_health_factors_state: false,
            chr_life: false,
            chr_life_state: false,
        testing:false,
            covid_tcap_cdc: false,
            covid_tcap_cdc_state: false,
            covid_testing_cdc: false,
            covid_testing_cdc_state: false,
            covid_wk_pos_cdc: false,
            covid_wk_pos_cdc_state: false,
            covid_ccpt_cdc: false,
            covid_ccpt_cdc_state: false,
        vaccination:false,
            vaccine_admin1_cdc: false,
            vaccine_admin2_cdc: false,
            vaccine_dist_cdc: false,
        hospitals_clinics:false,
            context_fqhc_clinics_hrsa: false,
            context_hospitals_covidcaremap: false,
        essential_workers_parent:false,
            context_essential_workers_acs: false,
      });

    const [isDownloading, setIsDownloading] = useState(false)
    const handleChange = (event) => {
        setCheckboxes(prev => ({ ...prev, [event.target.name]: event.target.checked }));
    };
    const handleSetChange = (index) => {
        setCheckboxes(prev => {
            const onOrOff = prev[checkboxSets[index].name] ? false : true;

            let newSet = {
                ...prev,
                [checkboxSets[index].name]: onOrOff
            }
            for (let i=0;i<checkboxSets[index].subset.length;i++){
                newSet[checkboxSets[index].subset[i].name] = onOrOff
            }
            return newSet
        });
    }
    
    async function GetFiles(fileList){
        setIsDownloading(true)
        // init zip and folders
        // get links from github
        const dataLinks = await fetch('https://api.github.com/repos/geodacenter/covid/contents/public/csv')
            .then(r=>r.json())
            .then(items => 
                items.filter(d => fileList[d.name.split('.csv')[0]])
                    .map(d => ({'name':d.name, 'url': d.download_url}))
                    .filter(x => x !== undefined)
            )
        const docsLinks = await fetch('https://api.github.com/repos/geodacenter/covid/contents/data-docs').then(r=>r.json()).then(items => items.map(d => ({'name':d.name, 'url': d.download_url})))
        
        // declare promises
        const dataPromises = await dataLinks.map(link => fetch(link.url).then(r=>r.blob()))
        const docsPromises = await docsLinks.map(link => fetch(link.url).then(r=>r.blob()))
        
        // fetch data and docs
        const data = await Promise.all(dataPromises).then(values => values.map((v,i) => ({'name':`${dataLinks[i].name.slice(0,-4)}-${new Date().toISOString().slice(0,10)}.csv`, 'data':v})))
        const docs = await Promise.all(docsPromises).then(values => values.map((v,i) => ({'name':docsLinks[i].name, 'data':v})))
        const license = await fetch('https://raw.githubusercontent.com/GeoDaCenter/covid/master/LICENSE').then(r => r.blob())
        
        var zip = new JSZip();
        zip.file('LICENSE.txt', license)
        zip.file('readme.md', readme)
        var dataFolder = zip.folder("data");
        var docsFolder = zip.folder("docs");
        data.forEach(d => dataFolder.file(d.name, d.data))
        docs.forEach(d => docsFolder.file(d.name, d.data))
        import('file-saver').then(fileSaver  => {
            zip.generateAsync({type:"blob"}).then(function(content) {
                // see FileSaver.js
                fileSaver.saveAs(content, `us_covid_atlas_data_${new Date().toISOString().slice(0,10)}.zip`);
            });
        })
        setIsDownloading(false)
    }

    return (
        <CsvDownloaderContainer className={isDownloading ? 'passive' : ''}>
            <h2>Bulk Data Download</h2>
            <Gutter h={20}/>
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <p>This menu allows you to download bulk CSVs of the data available on the Atlas. Select your datasets of interest with the checkboxes below and
                        then click download data to receive a ZIP archive with your CSV files and data documentation. Please note that the full dataset is currently
                        over 70MB, and may be slow to load.     
                    </p>
                </Grid>
                <Grid item xs={12} md={4}>
                    <a onClick={() => GetFiles(checkboxes)} ping="https://theuscovidatlas.org/trackdownloads.html">Download Data</a>
                </Grid>
            </Grid>
            <Gutter h={20}/>
            <Grid container spacing={5}>
            {checkboxSets.map((checkboxSet, i) => 
                    <Grid item xs={12} md={4}>
                        <FormControl component="fieldset">
                            <FormControlLabel
                                control={<Checkbox checked={checkboxes[checkboxSet.name]} onChange={() => handleSetChange(i)} name={checkboxSet.name} />}
                                label={checkboxSet.label}
                            />
                        </FormControl>
                        <br/>
                        <FormControl component="fieldset" className="inset">
                            <FormGroup>
                            {checkboxSet.subset.map(checkboxItem => 
                                <FormControlLabel
                                    control={<Checkbox checked={checkboxes[checkboxItem.name]} onChange={handleChange} name={checkboxItem.name} />}
                                    label={checkboxItem.label}
                                />
                            )}
                            </FormGroup>
                        </FormControl>
                </Grid>
            )}
            </Grid>
        </CsvDownloaderContainer>
    )
}

export default CsvDownloader