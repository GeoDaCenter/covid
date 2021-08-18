const cors_proxy = require('cors-anywhere');
const fetch = require('node-fetch');
const createHttpTerminator = require('http-terminator');

const handleResponse = async (response, type) => {
  if (type === "json") {
    return await response.json()
  }

  if (type === "csv" || type === "text" || type === "document") {
    return await response.text()
  }
  
  if (type === "buffer" || type === "pbf"){
    return await response.arrayBuffer()
  }

  if (type ==="blob"){
    return await response.blob()
  }

  return null
}

exports.handler = async (event) => {
  try {
    if (!event.queryStringParameters.url) return { statusCode: 500, body: JSON.stringify({ error: 'No URL Supplied' })}
    if (!event.queryStringParameters.type) return { statusCode: 500, body: JSON.stringify({ error: 'No Data Type Supplied' })}

    const port = 8080;
    const cors_api_url = `http://localhost:${port}/${event.queryStringParameters.url}`;
    
    const server = cors_proxy.createServer({
        originWhitelist: [], // Allow all origins
        requireHeader: [],
        removeHeaders: ['cookie', 'cookie2']
    })
    server.listen(port, '0.0.0.0', function() {});

    const httpTerminator = createHttpTerminator({
      server,
    });
    
    const response = await fetch(cors_api_url, {
      method: 'GET'
    }).then(r => {
      httpTerminator.terminate()
      return r
    }).then( r => r.json());

    return { statusCode: 200, body: JSON.stringify({ data: response }) };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching data' }),
    };
  }
};