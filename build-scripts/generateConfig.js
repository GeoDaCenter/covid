const fs = require('fs');
const axios = require('axios');
const Papa = require('papaparse');

const baseUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVLk2BtmeEL6LF6vlDJBvgL_JVpvddfMCYjQPwgVtlzTanUlscDNBsRKiJBb3Vn7jumMJ_BEBkc4vi/pub?output=csv'

const generateVariables = async () => {
    const csvString = await axios.get(baseUrl + '&gid=0').then(res => res.data);
    const data = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
    }).data
    
    fs.writeFileSync('./src/config/variables.js', `
    // this is a generated file, do not edit directly. See Google sheets to update variable config
    export default ${JSON.stringify(data)}
    `)
    return data
}

const generateTables = async () => {
    const csvString = await axios.get(baseUrl + '&gid=197339675').then(res => res.data);
    const data = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
    }).data
    fs.writeFileSync('./src/config/tables.js', `
    // this is a generated file, do not edit directly. See Google sheets to update variable config
    export default ${JSON.stringify(data)}
    `)
    return data
}

const generateDatasets = async () => {
    const csvString = await axios.get(baseUrl + '&gid=1300671439').then(res => res.data);
    const data = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
    }).data

    const parsedData = data.map(d => ({
        ...d,
        tables: d.tables ? d.tables.split(',').map(info => ({ [info.split(':')[0]]: info.split(':')[1] })).reduce((prev, curr) => ({...prev, ...curr})) : {}
    }))

    fs.writeFileSync('./src/config/datasets.js', `
    // this is a generated file, do not edit directly. See Google sheets to update variable config
    export default ${JSON.stringify(parsedData)}
    `)
    return parsedData
}


const generateDefaults = async () => {
    const csvString = await axios.get(baseUrl + '&gid=1965167264').then(res => res.data);
    const data = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
    }).data

    let fileString =  `// this is a generated file, do not edit directly. See Google sheets to update variable config \n`
    data.forEach(d => {
        if (d.variable === 'tooltipTables') {
            fileString += `export const ${d.variable} = ${JSON.stringify(d.value.split('|'))} \n`

        } else {
            fileString += `export const ${d.variable} = ${JSON.stringify(d.value)} \n`
        }
    })

    fs.writeFileSync('./src/config/defaults.js', fileString)
    return data
}

const variables = generateVariables();
const tables = generateTables();
const dataests = generateDatasets();
const defaults = generateDefaults();