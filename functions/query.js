const {BigQuery} = require('@google-cloud/bigquery');
const columns = require('./meta/columns.json');

const options = {
  credentials: {
      "type": "service_account",
      "project_id": process.env.project_id,
      "private_key_id": process.env.SK_ID,
      "private_key": process.env.SK.replace(/\\n/gm, '\n'),
      "client_email": process.env.CLIENT_EMAIL,
      "client_id": process.env.CLIENT_ID,
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": process.env.client_x509_cert_url
  },
  projectId: process.env.project_id,
};

async function query(query, bigquery) {
  const options = {
    query,
    location: 'US',
  };
  const [job] = await bigquery.createQueryJob(options);
  return await job.getQueryResults();
};

const colToDate = (col) => col.replace(/_/g, '-').slice(1,)
const dateToCol = (date) => `_${date.replace(/-/g, '_')}`
const getColList = (columns, days, endIndex=0) => columns.slice(endIndex-days, endIndex ? endIndex : columns.length).map(col => col[0] === '_' ? col.slice(1,).replace(/_/g, '-') : col)

const findClosestDate = (columns, date) => {
    if (!date) return date
    const colDateFormat = dateToCol(date)
    if (columns.includes(colDateFormat)){
        return colDateFormat
    }
    const dateCols = columns.map(col => new Date(colToDate(col))).filter(date => date > 0)
    const closestDate = dateCols.reduce((a, b) => {return Math.abs(a - date) < Math.abs(b - date) ? a : b});
    return dateToCol(closestDate.toISOString().slice(0,10))
}

const constructQuery = (datasets, days=30, startDate=false) => {
    let queryStrings = []
    datasets.forEach(dataset => {
        const currColumns = columns[dataset];
        
        let endDate;

        try {
            endDate = findClosestDate(columns[dataset],startDate)
        } catch {
            console.log(dataset)
        }
        const endIndex = currColumns.indexOf(endDate) === -1
            ? 0
            : currColumns.indexOf(endDate)

        const dateRange = getColList(currColumns, days, endIndex)
        const colRange = dateRange.map(date => dateToCol(date))

        queryStrings.push({
            query: `SELECT fips_code as id, ARRAY(SELECT IFNULL(${colRange.join(',-999) UNION ALL SELECT IFNULL( ')},-999)) as vals from covid-atlas.${dataset}`,
            dataset,
            dateRange
        })
    })

    return {
        queryStrings,
    }   
}

const zip = (result, dateRange, indvData=false) => {
    let returnCollection = []
    
    const vals = Object.values(result[0][0])

    const indvVals = indvData 
        ? indvData[0].map(t => Object.values(t).slice(1,))
        : null
        
    const indvKeys = indvData  
        ? indvData[0].map(t => t['fips_code'])
        : null

    const indvFunc = indvData 
        ? (indvVals, indvKeys, i) => {
            for (let n=0; n<indvKeys.length;n++){
                returnCollection[i][indvKeys[n] + 'v'] = indvVals[n][i] 
                returnCollection[i][indvKeys[n] + 'a'] = i < 7 ? Math.round((indvVals[n][i] - vals[0]) / i * 10)/10 : Math.round((indvVals[n][i] - indvVals[n][i-7]) / 7 * 10)/10
            }
        }
        : () => {}

    for (let i=0; i<dateRange.length; i++){
        // Push result to collection
        // d - Date in ISO Format
        // v - Cumulative Value
        // a - 7-day rolling average
        returnCollection.push({
            d: dateRange[i],
            v: vals[i],
            a: i < 7 ? Math.round((vals[i] - vals[0]) / i * 10)/10 : Math.round((vals[i] - vals[i-7]) / 7 * 10)/10
        })
        indvFunc(indvVals, indvKeys, i)
    }
    return returnCollection
}

const constructTimeQuery = (dataset,geoid=false,allSeries=false) => {
    let queryString = 'SELECT ' 
    let dateRange = []
    const currColumns = columns[dataset]
    if (allSeries) {
        queryString += 'fips_code, '
        for (let i=0; i<currColumns.length;i++){
            const parsedDate = currColumns[i].slice(1).replace(/_/g, '-')
            if (!isNaN(Date.parse(parsedDate))) {
                queryString += `${currColumns[i]}, `
                dateRange.push(parsedDate)
            }
        }
    } else {
        for (let i=0; i<currColumns.length;i++){
            const parsedDate = currColumns[i].slice(1).replace(/_/g, '-')
            if (!isNaN(Date.parse(parsedDate))) {
                queryString += `SUM(${currColumns[i]}), `
                dateRange.push(parsedDate)
            }
        }
    }

    queryString = queryString.slice(0,-2) + ' from `covid-atlas.' + dataset + '`'
    if (geoid && geoid.length === 1) queryString += ' where fips_code = ' + geoid
    if (geoid && geoid.length > 1) queryString += ' where fips_code IN (' + geoid + ')'

    return {
        queryString,
        dateRange
    }   
}



exports.handler = async (event) => {
    try {
        const {
            datasets,
            days, 
            geoid,
            type,
            startDate
        } = event.queryStringParameters;
        const bigquery = new BigQuery(options);
        if (type === undefined) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Specify a query type such as snapshot or timeseries.' }),
            };
        }
        if (type === 'snapshot') {
            const datasetsArray = JSON.parse(datasets)
            const {
                queryStrings
            } = constructQuery(
                datasetsArray,
                days||30,
                startDate||false
            )
            const results = await Promise.all(queryStrings.map(entry => query(entry.query, bigquery)))
            const parsed = results.map((result, idx) => {return {
                rows: result[0],
                dataset: queryStrings[idx].dataset,
                dateRange: queryStrings[idx].dateRange,
            }})
            return { 
                statusCode: 200, 
                body: JSON.stringify({ data: parsed })
            };

        }

        if (type === "timeseries") {
            const idArray = geoid ? geoid : false;
            const {
                queryString,
                dateRange
            } = constructTimeQuery(
                datasets,
                idArray
            )
            if (idArray && idArray.length > 1) {
                const indQuery = constructTimeQuery(
                    datasets,
                    idArray,
                    true
                )
                
                const [resultSum, resultIndividual] = await Promise.all([query(queryString, bigquery), query(indQuery.queryString, bigquery)])
                const data = zip(resultSum, dateRange, resultIndividual)
                return { 
                    statusCode: 200, 
                    body: JSON.stringify({ data }) 
                };
            } else {
                const result = await query(queryString, bigquery)
                const data = zip(result, dateRange)
                return { 
                    statusCode: 200, 
                    body: JSON.stringify({ data })
                };
            }
        }
    } catch (error) {
        console.log(error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed fetching data' }),
        };
    }
};