const util = require('util')
const zlib = require('zlib')
const gzip = util.promisify(zlib.gzip)

async function gzipResponse(responseEncoded) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip'
    },
    body: (await gzip(responseEncoded)).toString('base64'),
    isBase64Encoded: true,
  }
}

module.exports = gzipResponse