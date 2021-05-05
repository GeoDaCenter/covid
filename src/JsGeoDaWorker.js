// author: dhalpern@uchicago.edu, lixun910@gmail.com
// date: 3/5/2021 version 0.0.4b

class JsGeoDaWorker {
    constructor(){
        this.gdaProxy = null
        this.geojsonMaps = {}
        this.ready = false;
    }

    ////////////////////// INITIALIZE /////////////////////
    /**
     * Initiate the JsGeoDa WebAssembly proxy.
     * @returns {boolean} Returns true if successfully initiated JsGeoDa proxy.
     */
    async init(){
        this.gdaProxy = new Worker(`${process.env.PUBLIC_URL}/workers/worker.jsgeoda.js`);
        this.gdaProxy.postMessage({
            action:"Ready"
        });

        return new Promise((resolve, reject) => {
            try {
                this.gdaProxy.onmessage = (e) => {
                    const result = e?.data;
                    if (result) {
                        this.ready = true;
                    }
                    resolve(true)
                }
                this.gdaProxy.onerror = error => {
                  reject(error);
                };
            } catch(error) {
                reject(error)
            };
        });
    }
    
    /**
     * Generate a 4-Digit String ID for confirming asynchronous returns.
     */
    genId(){
        return Math.random().toString().slice(-4,)
    }
    /**
     * @param {String} url Link to fetch Geojson file
     * @returns {Promise} Resolves with GeoJson Data and adds geojson info to this.geojsonMaps
     */
    async LoadGeojson(url){
        let id = this.genId()
        this.gdaProxy.postMessage({
            action:"ReadGeojsonMap",
            params:{
                url,
                id
            }
        });

        return new Promise((resolve, reject) => {
            try {
                const listener = (e) => {
                    if (e.data.id === id) {
                        this.gdaProxy.removeEventListener('message', listener);
                        
                        for (const map in e.data.result.geojsonMaps) {
                            this.geojsonMaps[map] = {
                                type: e.data.result.geojsonMaps[map]
                            }
                        }
                        resolve({
                            data: e.data.result.data,
                            indices: e.data.result.indices
                        });
                    }
                }
                this.gdaProxy.addEventListener('message', listener);
            } catch(error) {
                reject(error)
            };
        });
    };

    ////////////////////// WEIGHTS /////////////////////
    
    /**
     * Functions to create spatial weights
     */
    CreateWeights = {
        /**
         * Create a Rook contiguity weights.
         * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
         * @param {Number} order An integet number for order of contiguity
         * @param {Boolean} include_lower_order Indicate if include lower order when creating weights
         * @param {Number} precision_threshold Used when the precision of the underlying shape file is insufficient to allow for an exact match of coordinates to determine which polygons are neighbors. 
         * @returns {Object} An instance of {@link GeoDaWeights}
         */
        Rook: async (map_uid, order, include_lower_order, precision) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action:"CreateRookWeights",
                params:{
                    map_uid, 
                    order, 
                    include_lower_order, 
                    precision,
                    id
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            this.geojsonMaps[map_uid]['Rook'] = e.data.result;
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        },
        /**
         * Create a contiguity weights.
         * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
         * @param {Number} order An integet number for order of contiguity
         * @param {Boolean} include_lower_order Indicate if include lower order when creating weights
         * @param {Number} precision_threshold Used when the precision of the underlying shape file is insufficient to allow for an exact match of coordinates to determine which polygons are neighbors. 
         * @returns {Object} An instance of {@link GeoDaWeights}
         */
        Queen: async (map_uid, order=1, include_lower_order=0, precision=0) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action:"CreateQueenWeights",
                params:{
                    map_uid, 
                    order, 
                    include_lower_order, 
                    precision,
                    id
                }
            });
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            this.geojsonMaps[map_uid]['Queen'] = e.data.result;
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        },
        /**
         * Create a K-Nearest Neighbors weights.
         * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
         * @param {Number} k A positive integer number for k-nearest neighbors
         * @param {Number} power  The power (or exponent) indicates how many times to use the number in a multiplication.
         * @param {Boolean} is_inverse A bool flag indicates whether or not to apply inverse on distance value.
         * @param {Boolean} is_arc  A bool flag indicates if compute arc distance (true) or Euclidean distance (false).
         * @param {Boolean} is_mile A bool flag indicates if the distance unit is mile (true) or km (false). 
         * @returns {Object} An instance of {@link GeoDaWeights}
         */
        Knn: async (map_uid, k, power, is_inverse, is_arc, is_mile) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action:"CreateKnnWeights",
                params:{
                    map_uid, 
                    k, 
                    power, 
                    is_inverse, 
                    is_arc, 
                    is_mile,
                    id
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            this.geojsonMaps[map_uid]['Knn'] = e.data.result;
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        },
        /**
         * Create a Distance-based weights.
         * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
         * @param {Number} dist_thres A positive numeric value of distance threshold used to find neighbors. For example, one can use the pygeoda.weights.min_threshold() to get a distance that guarantees that every observation has at least 1 neighbor.
         * @param {Number} power  The power (or exponent) indicates how many times to use the number in a multiplication.
         * @param {Boolean} is_inverse A bool flag indicates whether or not to apply inverse on distance value.
         * @param {Boolean} is_arc  A bool flag indicates if compute arc distance (true) or Euclidean distance (false).
         * @param {Boolean} is_mile A bool flag indicates if the distance unit is mile (true) or km (false). 
         * @returns {Object} An instance of {@link GeoDaWeights}
         */
        Dist: async (map_uid, dist_thres, power, is_inverse, is_arc, is_mile) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action:"CreateDistWeights",
                params:{
                    map_uid, 
                    dist_thres, 
                    power, 
                    is_inverse, 
                    is_arc, 
                    is_mile,
                    id
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            this.geojsonMaps[map_uid]['Dist'] = e.data.result;
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        },
        /**
         * Create a kernel weights with fixed bandwidth.
         * 
         * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
         * @param {Number} k A positive integer number for k-nearest neighbors
         * @param {String} kernel The name of the kernel function, which could be one of the following: * triangular * uniform * quadratic * epanechnikov * quartic * gaussian
         * @param {Boolean} adaptive_bandwidth A bool flag indicates whether to use adaptive bandwidth or the max distance of all observation to their k-nearest neighbors. 
         * @param {Boolean} use_kernel_diagonals A bool flag indicates whether or not the lower order neighbors should be included in the weights structure.
         * @param {Boolean} is_arc  A bool flag indicates if compute arc distance (true) or Euclidean distance (false).
         * @param {Boolean} is_mile A bool flag indicates if the distance unit is mile (true) or km (false). 
         * @returns {Object} An instance of {@link GeoDaWeights}
         */
        Kernel: async (map_uid, k, kernel, adaptive_bandwidth, use_kernel_diagonals, is_arc, is_mile) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action:"CreateKernellWeights",
                params:{
                    map_uid, 
                    k, 
                    kernel, 
                    adaptive_bandwidth, 
                    use_kernel_diagonals, 
                    is_arc, 
                    is_mile,
                    id
                }
            });
            
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            this.geojsonMaps[map_uid]['Kernel'] = e.data.result;
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        },
        KernelBandwidth: async (map_uid, dist_thres, kernel, use_kernel_diagonals, is_arc, is_mile) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action:"CreateKernelBandwidthWeights",
                params:{
                    map_uid, 
                    dist_thres, 
                    kernel, 
                    use_kernel_diagonals, 
                    is_arc, 
                    is_mile,
                    id
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            this.geojsonMaps[map_uid]['KernelBandwidth'] = e.data.result;
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        }        
    }

    ////////////////////// CLUSTERS /////////////////////

    Cluster = {
        /**
         * Apply local Moran statistics with 999 permutations, which can not be changed in v0.0.4
         * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
         * @param {String} weight_uid A unique string represents the created weights.
         * @param {Array} values The values that local moran statistics will be applied on.
         * @returns {Object} An instance of {@link LisaResult}
         */
        LocalMoran: async (map_uid, weight_uid, values) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action: "local_moran1",
                params:{
                    map_uid, 
                    weight_uid, 
                    values,
                    id
                }
            });
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        },
        // LocalMoran: async (map_uid, weight_uid, col_name) => {
        //     let id = this.genId()
        //     this.gdaProxy.postMessage({
        //         action:"local_moran",
        //         params:{
        //             map_uid, 
        //             weight_uid, 
        //             col_name
        //         }
        //     });
    
        //     this.gdaProxy.onmessage = (e) => {
        //         const result = e?.data;
        //         if (result) {
        //             return result.json_data
        //         }
        //     }
        // },
        /**
         * Apply local G statistics with 999 permutations, which can not be changed in v0.0.4
         * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
         * @param {String} weight_uid A unique string represents the created weights.
         * @param {Array} values The values that local statistics will be applied on.
         * @returns {Object} An instance of {@link LisaResult}
         */
        LocalG: async (map_uid, weight_uid, col_name) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action: "local_g",
                params:{
                    map_uid, 
                    weight_uid, 
                    col_name
                }
            });
    
            this.gdaProxy.onmessage = (e) => {
                const result = e?.data;
                if (result) {
                    return result.json_data
                }
            }
        },
        /**
         * Apply local G* statistics with 999 permutations, which can not be changed in v0.0.4
         * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
         * @param {String} weight_uid A unique string represents the created weights.
         * @param {Array} values The values that local statistics will be applied on.
         * @returns {Object} An instance of {@link LisaResult}
         */
        LocalGstar: async (map_uid, weight_uid, col_name) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action: "local_gstar",
                params:{
                    map_uid, 
                    weight_uid, 
                    col_name
                }
            });
    
            this.gdaProxy.onmessage = (e) => {
                const result = e?.data;
                if (result) {
                    return result.json_data
                }
            }
        },
        /**
         * Apply local Geary statistics with 999 permutations, which can not be changed in v0.0.4
         * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
         * @param {String} weight_uid A unique string represents the created weights.
         * @param {Array} values The values that local statistics will be applied on.
         * @returns {Object} An instance of {@link LisaResult}
         */
        LocalGeary: async (map_uid, weight_uid, col_name) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action: "local_geary",
                params:{
                    map_uid, 
                    weight_uid, 
                    col_name
                }
            });
    
            this.gdaProxy.onmessage = (e) => {
                const result = e?.data;
                if (result) {
                    return result.json_data
                }
            }
        },
        /**
         * Apply local Join Count statistics with 999 permutations, which can not be changed in v0.0.4
         * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
         * @param {String} weight_uid A unique string represents the created weights.
         * @param {Array} values The values that local statistics will be applied on.
         * @returns {Object} An instance of {@link LisaResult}
         */
        LocalJoinCount: async (map_uid, weight_uid, col_name) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action: "local_joincount",
                params:{
                    map_uid, 
                    weight_uid, 
                    col_name
                }
            });
    
            this.gdaProxy.onmessage = (e) => {
                const result = e?.data;
                if (result) {
                    return result.json_data
                }
            }
        },        
        REDCAP: async (map_uid, weight_uid, k, sel_fields, bound_var, min_bound, method) => {
            let id = this.genId()
            let col_names = this.toVecString(sel_fields);
            let clusters_vec = window.Module.redcap(map_uid, weight_uid, k, col_names, bound_var, min_bound, method);
            let clusters = this.parseVecVecInt(clusters_vec);
            return clusters;
        },  
        MaxP: async (map_uid, weight_uid, k, sel_fields, bound_var, min_bound, method, tabu_length, cool_rate, n_iter) => {
            let id = this.genId()
            let col_names = this.toVecString(sel_fields);
            let clusters_vec = window.Module.maxp(map_uid, weight_uid, col_names, bound_var, min_bound, tabu_length, cool_rate, method, k, n_iter);
            let clusters = this.parseVecVecInt(clusters_vec);
            return clusters;
        }
    }

    ////////////////////// BINS /////////////////////

    
    Bins = {     
        /**
         * Get breaks of boxplot (hinge=1.5) including the top, bottom, median, and two quartiles of the data
         * @param {Number} numberOfBins Number of breaks
         * @param {Array} values The values that the classify algorithm will be applied on.
         * @returns {Array} Returns an array of break point values.
         */
        Hinge15: async (numberOfBins, values) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action:"custom_breaks",
                params:{
                    algorithm: 'hinge15_breaks',
                    numberOfBins,
                    values,
                    id
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        }, 
        /**
         * Get breaks of boxplot (hinge=3.0) including the top, bottom, median, and two quartiles of the data
         * @param {Number} numberOfBins Number of breaks
         * @param {Array} values The values that the classify algorithm will be applied on.
         * @returns {Array} Returns an array of break point values.
         */
        Hinge30: async (numberOfBins, values) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action:"custom_breaks",
                params:{
                    algorithm: 'hinge30_breaks',
                    numberOfBins,
                    values,
                    id
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        }, 
        /**
         * Get natural breaks from the values.
         * @param {Number} numberOfBins Number of breaks
         * @param {Array} values The values that the classify algorithm will be applied on.
         * @returns {Array} Returns an array of break point values.
         */
        NaturalBreaks: async (numberOfBins, values) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action:"custom_breaks",
                params:{
                    algorithm: 'natural_breaks',
                    numberOfBins,
                    values,
                    id
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        },
        /**
         * Get quantile (equal count) breaks from the values.
         * @param {Number} numberOfBins Number of breaks
         * @param {Array} values The values that the classify algorithm will be applied on.
         * @returns {Array} Returns an array of break point values.
         */
        Quantile: async (numberOfBins, values) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action:"quantile_breaks",
                params:{
                    numberOfBins,
                    values,
                    id
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        },   
        /**
         * Get Standard deviation breaks from the values
         * @param {Number} numberOfBins Number of breaks
         * @param {Array} values The values that the classify algorithm will be applied on.
         * @returns {Array} Returns an array of break point values.
         */
        StandardDeviation: async (numberOfBins, values) => {
            let id = this.genId()
            this.gdaProxy.postMessage({
                action:"stddev_breaks",
                params:{
                    numberOfBins,
                    values,
                    id
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    const listener = (e) => {
                        if (e.data.id === id) {
                            this.gdaProxy.removeEventListener('message', listener);
                            resolve(e.data.result);
                        }
                    }
                    this.gdaProxy.addEventListener('message', listener);
                } catch(error) {
                    reject(error)
                };
            });
        },   
    }

    ////////////////////// GEOMETRY /////////////////////
    /**
     * Get the centroids of geojson map.
     * Same as GEOS.algorithm.Centroid: the centroid were computed as a weighted sum of the centroids of a decomposition of the area 
     * into (possibly overlapping) triangles. The algorithm has been extended to handle holes and multi-polygons
     * @example
     * // In node.js
     * const fs = require('fs');
     * const jsgeoda = require('jsgeoda');
     * const geoda = await jsgeoda.New();
     * 
     * let ab = fs.readFileSync("NAT.geojson").buffer;
     * let nat = geoda.ReadGeojsonMap("NAT", ab);
     * let cent = geoda.GetCentroids(nat);
     * 
     * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
     * @returns {Array} Returns an array of [x,y] coordinates (no projection applied) of the centroids.
     */
    async GetCentroids(map_uid){
        let id = this.genId();
        this.gdaProxy.postMessage({
            action:"GetCentroids",
            params:{
                map_uid,
                id
            }
        });

        return new Promise((resolve, reject) => {
            try {
                const listener = (e) => {
                    if (e.data.id === id) {
                        this.gdaProxy.removeEventListener('message', listener);
                        resolve(e.data.result);
                    }
                }
                this.gdaProxy.addEventListener('message', listener);
            } catch(error) {
                reject(error)
            };
        });
    }

    /**
     * Get neighbors (indices) of an observation.
     * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
     * @param {String} weight_uid A unique string represents the created weights.
     * @param {Number} idx An integer number represents the index of which observation to get its neighbors.
     */
    async GetNeighbors(map_uid, weight_uid, idx){
        let id = this.genId();
        this.gdaProxy.postMessage({
            action: "get_neighbors",
            params:{
                map_uid, 
                weight_uid, 
                idx,
                id
            }
        });

        return new Promise((resolve, reject) => {
            try {
                const listener = (e) => {
                    if (e.data.id === id) {
                        this.gdaProxy.removeEventListener('message', listener);
                        resolve(e.data.result);
                    }
                }
                this.gdaProxy.addEventListener('message', listener);
            } catch(error) {
                reject(error)
            };
        });
    }

    /**
     * Create cartogram using the values in the map. 
     * In cartograms, the size of a variable's value corresponds to the size of a shape. 
     * The location of the circles is aligned as closely as possible to the location of the associated area through a nonlinear optimization routine
     * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
     * @param {Array} values The values that the classify algorithm will be applied on.
     * @returns {Array} Returns an array of circles, which is defined as: 
     * {
     *    "properties": { "id" : 1},
     *    "position": [0.01, 0.01],
     *    "radius": 0.1
     * }
     */
    async cartogram(map_uid, values){
        let id = this.genId();
        this.gdaProxy.postMessage({
            action: "cartogram",
            params:{
                map_uid, 
                values,
                id
            }
        });

        return new Promise((resolve, reject) => {
            try {
                const listener = (e) => {
                    if (e.data.id === id) {
                        this.gdaProxy.removeEventListener('message', listener);
                        resolve(e.data.result);
                    }
                }
                this.gdaProxy.addEventListener('message', listener);
            } catch(error) {
                reject(error)
            };
        });
    }

    
    ////////////////////// HELPERS /////////////////////
    Has(map_uid){
        return map_uid in this.geojsonMaps; 
    }

    List(){
        return this.geojsonMaps;
    }

    /**
     * Get the number of observations or rows in the geojson map.
     * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
     * @returns {Number} Returns the number of observations or rows in the geojson map.
     */
    async GetNumObs(map_uid){
        this.gdaProxy.postMessage({
            action:"GetNumObs",
            params:{
                map_uid,
            }
        });

        this.gdaProxy.onmessage = (e) => {
            const result = e?.data;
            if (result) {
                return result.json_data
            }
        }
    }    
    
    GetMapType(map_uid) {
        return this.geojsonMaps[map_uid].type;
    }

    /**
     * Get the numeric values of a column or field. 
     * @param {String} map_uid A unique string represents the geojson map that has been read into GeoDaProxy.
     * @param {String} col_name A string of column or field name.
     * @returns {Array} Returns the values of a column of field. 
     */
    GetNumericCol(map_uid, col_name) {
        this.gdaProxy.postMessage({
            action:"GetNumericCol",
            params:{
                map_uid,
                col_name
            }
        });

        this.gdaProxy.onmessage = (e) => {
            const result = e?.data;
            if (result) {
                return result.json_data
            }
        }
    }

    async GetMinDistThreshold(map_uid, is_arc, is_mile){
        this.gdaProxy.postMessage({
            action: "min_distance_threshold",
            params:{
                map_uid, 
                is_arc, 
                is_mile
            }
        });

        this.gdaProxy.onmessage = (e) => {
            const result = e?.data;
            if (result) {
                return result.json_data
            }
        }

    }  
}

export default JsGeoDaWorker;