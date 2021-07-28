const {BigQuery} = require('@google-cloud/bigquery');
const fs = require('fs')
const dayjs = require('dayjs')

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

async function getColumns(bigquery){
    const queryResult = await query(
        'SELECT DISTINCT column_name,table_name FROM `covid-atlas.wide_format`.INFORMATION_SCHEMA.COLUMNS',
        bigquery
    )
    let availableColumns={}
    for (let i=0; i<queryResult[0].length;i++){
        if (queryResult[0][i]['table_name'] in availableColumns) {
            availableColumns[queryResult[0][i]['table_name']].push(queryResult[0][i]['column_name'])
        } else {
            availableColumns[queryResult[0][i]['table_name']] = [queryResult[0][i]['column_name']]
        }
    }
    return {
        availableColumns,
        lastUpdated: Date.now()
    }
}

async function checkCachedColumns(bigquery){
    try {
        const raw = fs.readFileSync('./columns.json', 'utf8')
        const columns = JSON.parse(raw)
        if ((Date.now() - columns.lastUpdated) < 8.64e7) {
            return columns.availableColumns
        } else {
            throw 'Old data'
        }
    } catch (err) {
        const columns = await getColumns(bigquery); 
        console.log('got new columns')
        let raw = JSON.stringify(columns);
        fs.writeFileSync('./columns.json', raw);
        return columns.availableColumns
    }
}
const pad = (x) => `${x}`.length === 2 ? x : '0'+ x

const constructTimeQuery = (
    from, 
    to, 
    dataset,
    columns
    ) => {
        const t0 = dayjs(from);
        const t1 = dayjs(to);
        const range = (t1 - t0)/8.64e7;
        let queryString = 'SELECT fips_code as fips, ARRAY ('
        let dateRange = []
        for (let i=0; i<range;i++){
            const currDate = t0.add(i, 'day')
            const datestring = `_${currDate['$y']}_${pad(currDate['$m']+1)}_${pad(currDate['$D'])}`
            if (columns[dataset].includes(datestring)) {
                queryString += `SELECT IFNULL(${datestring},-999) UNION ALL `
                dateRange.push(currDate.toISOString())
            }
        }
        if (!dateRange.length) return 'ERROR: No Date Range Available'
        queryString = queryString.slice(0,-10) + ') as data FROM `covid-atlas.wide_format.' + dataset + '`'
        return {
            queryString,
            dateRange
        }   
    }

exports.handler = async (event) => {
    try {
        const {
            dataset,
            from,
            to
        } = event.queryStringParameters;
        
        const bigquery = new BigQuery(options);
        const columns = await checkCachedColumns(bigquery);
        const {
            queryString,
            dateRange
        } = constructTimeQuery(
            from,
            to,
            dataset,
            columns
        )
        const result = await query(queryString, bigquery)
        
        return { 
            statusCode: 200, 
            body: JSON.stringify({ result, dateRange }) 
        };
    } catch (error) {
        console.log(error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed fetching data' }),
        };
    }
};

// http://localhost:59632/q?from=2021-01-01&to=2021-02-01&dataset=covid_confirmed_cdc