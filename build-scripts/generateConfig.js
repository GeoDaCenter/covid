const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Papa = require('papaparse');

const baseUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVLk2BtmeEL6LF6vlDJBvgL_JVpvddfMCYjQPwgVtlzTanUlscDNBsRKiJBb3Vn7jumMJ_BEBkc4vi/pub?output=csv'
const basePath = path.join(__dirname, '../src/config');
const generateVariables = async () => {
    const csvString = await axios.get(baseUrl + '&gid=0').then(res => res.data);
    const data = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
    }).data.filter(f => f.deprecated != 1)
    
    fs.writeFileSync(path.join(basePath, 'variables.js'), `
    // this is a generated file, do not edit directly. See Google sheets to update variable config
    const variables = ${JSON.stringify(data)}; 
    export default variables;
    `)
    return data
}

const generateTables = async () => {
    const csvString = await axios.get(baseUrl + '&gid=197339675').then(res => res.data);
    const data = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
    }).data.filter(f => f.deprecated != 1)
    fs.writeFileSync(path.join(basePath, 'tables.js'), `
    // this is a generated file, do not edit directly. See Google sheets to update variable config
    const tables = ${JSON.stringify(data)}; 
    export default tables;
    `)
    return data
}

const generateDatasets = async () => {
    const csvString = await axios.get(baseUrl + '&gid=1300671439').then(res => res.data);
    const data = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
    }).data.filter(f => f.deprecated != 1)

    const parsedData = data.map(d => ({
        ...d,
        tables: d.tables ? d.tables.split(',').map(info => ({ [info.split(':')[0]]: info.split(':')[1] })).reduce((prev, curr) => ({...prev, ...curr})) : {}
    }))

    fs.writeFileSync(path.join(basePath, 'datasets.js'), `
    // this is a generated file, do not edit directly. See Google sheets to update variable config
    const datasets = ${JSON.stringify(parsedData)};
    export default datasets;
    `)
    return parsedData
}


const generateDefaults = async () => {
    const csvString = await axios.get(baseUrl + '&gid=1965167264').then(res => res.data);
    const data = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
    }).data.filter(f => f.deprecated != 1)

    let fileString =  `// this is a generated file, do not edit directly. See Google sheets to update variable config \n`
    data.forEach(d => {
        if (d.variable === 'tooltipTables') {
            fileString += `export const ${d.variable} = ${JSON.stringify(d.value.split('|'))} \n`

        } else {
            fileString += `export const ${d.variable} = ${JSON.stringify(d.value)} \n`
        }
    })

    fs.writeFileSync(path.join(basePath, 'defaults.js'), fileString)
    return data
}

const generateLegacyDatasets = async () => {
    const tables = await generateTables();
    const datasets = await generateDatasets();
    let returnObj = {};
    datasets.forEach(d => {
        let returnTables = {};
        try {
            console.log(Object.entries(d.tables))
            returnTables = Object.entries(d.tables).map(entry=>({[entry[0]]: tables.find(t => t.Id === entry[1])})).reduce((prev, curr) => ({...prev, ...curr}))
        } catch {}
        
        returnObj[d.file] = {
            ...d,
            geosjon: d.file,
            tables: returnTables
        }
    })
    fs.writeFileSync(path.join(basePath, 'legacyDatasets.js'),  `// this is a generated file, do not edit directly. See Google sheets to update variable config \n export default ${JSON.stringify(returnObj)}`)
}

console.log('Generating variables, tables, datasets, and defaults from CMS.')
const variables = generateVariables();
const tables = generateTables();
const datasets = generateDatasets();
const defaults = generateDefaults();
console.log('Config generation complete.')
// const legacyDatasets = generateLegacyDatasets();

const getDateLists = () => {
    const stripLeadingZero = (str) => (str[0] !== '0' ? str : str.slice(1));
    const isoToUsDate = (date) =>
      stripLeadingZero(date.slice(5, 7)) +
      '/' +
      stripLeadingZero(date.slice(8, 10)) +
      '/' +
      date.slice(2, 4);
    // eslint-disable-next-line no-extend-native
    Date.prototype.addDays = function (days) {
      var date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };
  
    let todayDate = new Date();
    let initialDate = new Date('01/21/2020');
    let dateList = [];
    let isoDateList = [];
    let usDateList = [];
  
    while (initialDate < todayDate) {
      dateList.push(initialDate);
      let isoDate = initialDate.toISOString().slice(0, 10);
      isoDateList.push(isoDate);
      usDateList.push(isoToUsDate(isoDate));
      initialDate = initialDate.addDays(1);
    }
  
    return { isoDateList, usDateList };
};

const filesToParse = [
    'covid_confirmed_usafacts',
    'covid_confirmed_usafacts_h',
    'covid_confirmed_nyt',
    'covid_confirmed_cdc',
    'covid_confirmed_1p3a',
    'covid_deaths_usafacts',
    'covid_deaths_usafacts_h',
    'covid_deaths_nyt',
    'covid_deaths_cdc',
    'covid_deaths_1p3a',
    'covid_tcap_cdc',
    'covid_ccpt_cdc',
    'covid_testing_cdc',
    'covid_wk_pos_cdc',
    'mobility_fulltime_workdays_safegraph',
    'mobility_home_workdays_safegraph',
    'mobility_parttime_workdays_safegraph',
    'vaccination_fully_vaccinated_cdc_h',
    'vaccination_fully_vaccinated_cdc',
    'vaccination_one_or_more_doses_cdc_h',
    'vaccination_one_or_more_doses_cdc'
]

function parseFiles(filesToParse) {
    console.log('Generating column parsing.')
    const { isoDateList, usDateList } = getDateLists();
    const dateRanges = {};
    filesToParse.forEach(file => {
        try {
            const fileData = fs.readFileSync(path.join(__dirname,`../public/csv/${file}.csv`), 'utf-8');
            const fields = Papa.parse(fileData, { header: true }).meta.fields
            dateRanges[file] = isoDateList.map(date => fields.includes(date) ? 1 : 0)
        } catch (error) {
            console.log(error)
        }
    })
    fs.writeFileSync(path.join(basePath, 'dataDateRanges.js'), `
    // this is a generated file, do not edit directly. See data-scripts/build-scripts/parseColumns.js
    export default ${JSON.stringify(dateRanges)}
    `)
    console.log('Parsing complete.')
};

parseFiles(filesToParse);