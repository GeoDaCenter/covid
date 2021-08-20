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

    if (geoid && geoid.length === 1) queryString += ' where fips_code = ' + geoid[0]
    if (geoid && geoid.length > 1) queryString += ' where fips_code IN (' + geoid.join(',') + ')'

    return {
        queryString,
        dateRange
    }   
}



exports.handler = async (event) => {
    try {
        const {
            dataset,
            geoid
        } = event.queryStringParameters;
        const bigquery = new BigQuery(options);

        const idArray = geoid ? JSON.parse(geoid) : false;
        const {
            queryString,
            dateRange
        } = constructTimeQuery(
            'public.' + dataset,
            idArray
        )
        if (idArray && idArray.length > 1) {
            
            const indQuery = constructTimeQuery(
                'public.' + dataset,
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
    } catch (error) {
        console.log(error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed fetching data' }),
        };
    }
};