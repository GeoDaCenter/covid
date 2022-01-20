importScripts("./comlink.js", "./jsgeoda.js");

// thanks @ https://stackoverflow.com/questions/31054910/get-functions-methods-of-a-class/31055217
function getAllFuncs(toCheck) {
  var props = [];
  var obj = toCheck;
  do {
    props = props.concat(Object.getOwnPropertyNames(obj));
  } while ((obj = Object.getPrototypeOf(obj)) && obj != Object.prototype);

  return props.sort().filter(function (e, i, arr) {
    if (e != arr[i + 1] && typeof toCheck[e] == "function") return true;
  });
}

/**
 * @class
 * @classdesc geodaWorkerProxy is the equivalent of entry point to getting a geoda proxy in through comlink.
 * Call the worker, then {@link New}() to get access to geoda functions.
 */
class GeodaWorkerProxy {
  constructor() {
    this.geoda = null;
    this.loadedDatasets = {};
  }

  /**
   * Initialize the worker with jsgeoda.
   * Populated all jsgeoda functions in the worker for exposure through Comlink.
   * @returns {Boolean} True, after loaded.
   */
  async New() {
    if (this.geoda !== null) return true;
    var jsgeoda = await exports.New();
    this.geoda = jsgeoda;
    var allFunctions = getAllFuncs(this.geoda);
    for (const key of allFunctions) {
      this[key] = (...args) => this.handleFunction(key, args);
    }
    return true;
  }
  /**
   * Pass through of readGeoJson.
   * @param {String} url The url of the geojson file to be fetched.
   * @returns {String} A unique id of the geoda object.
   * @returns {GeoJson} Fetched geodata
   */
   async loadGeoJSON(url, geoIdColumn) {
    if (this.geoda === null) await this.New();
    if (this.loadedDatasets[url]) {
      return [this.loadedDatasets[url], {}];
    }
    var response = await fetch(url);
    var responseClone = await response.clone();
    var geojsonData = await response.json();
    var ab = await responseClone.arrayBuffer();
    
    if (
      !(isNaN(+geojsonData.features[0].properties[geoIdColumn])) 
      && "number" !== typeof geojsonData.features[0].properties[geoIdColumn])
    {   
      for (var i=0; i<geojsonData.features.length; i++) {
        geojsonData.features[i].properties[geoIdColumn] = +geojsonData.features[i].properties[geoIdColumn]
      }
    }
    for (var i=0; i<10; i++){
      try {
        var id = this.readGeoJSON(ab);
        this.loadedDatasets[url] = id;
        return [id, geojsonData];
      } catch {}
    }
    return [null, geojsonData]
  }

  /**
   * Worker functions are slightly obfuscated, so this lists out availble Prototype functions.
   * @returns {Array} List of available functions.
   */
  async listFunctions() {
    if (this.geoda === null) await this.New();
    return getAllFuncs(this);
  }

  handleFunction(fn, args) {
    if (["New", "loadGeoJSON", "listFunctions"].includes(fn)) {
      return this[fn](...args);
    } else {
      return this.geoda[fn](...args);
    }
  }
}

// Instantiate the worker proxy
const geodaWorker = new GeodaWorkerProxy();

// Expose it to Comlink
Comlink.expose(geodaWorker);