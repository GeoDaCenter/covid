const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

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
    'vaccination_one_or_more_doses_cdc',
    'vaccination_to_be_distributed_cdc_state'
]

function parseFiles(filesToParse) {
    const { isoDateList, usDateList } = getDateLists();
    const dateRanges = {};
    filesToParse.forEach(file => {
        try {
            const fileData = fs.readFileSync(path.join(__dirname, `../public/csv/${file}.csv`), 'utf-8');
            const fields = Papa.parse(fileData, { header: true }).meta.fields
            dateRanges[file] = isoDateList.map(date => fields.includes(date) ? 1 : 0)
        } catch (error) {
            console.log(error)
        }
    })
    fs.writeFileSync(path.join(__dirname, '../src/config/dataDateRanges.js'), `
    // this is a generated file, do not edit directly. See data-scripts/build-scripts/parseColumns.js
    const ranges = ${JSON.stringify(dateRanges)};
    export default ranges;
    `)
};

parseFiles(filesToParse);