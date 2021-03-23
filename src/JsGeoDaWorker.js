class JsGeoDaWorker {
    constructor(){
        this.gdaProxy = null
        this.geojsonMaps = {}
        this.ready = false;
        this.working = false;
    }

    ////////////////////// INITIALIZE /////////////////////
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
     * @param {String} url Link to fetch Geojson file
     * @returns {Promise} Resolves with GeoJson Data and adds geojson info to this.geojsonMaps
     */
    async LoadGeojson(url){
        this.gdaProxy.postMessage({
            action:"ReadGeojsonMap",
            params:{
                url,
            }
        });

        return new Promise((resolve, reject) => {
            try {
                this.gdaProxy.onmessage = (e) => {
                    for (const map in e.data.result.geojsonMaps) {
                        this.geojsonMaps[map] = {
                            type: e.data.result.geojsonMaps[map]
                        }
                    }
                    resolve({
                        data: e.data.result.data,
                        indices: e.data.result.indices
                    });
                };
                this.gdaProxy.onerror = error => {
                  reject(error);
                };
            } catch(error) {
                reject(error)
            };
        });
    };

    ////////////////////// WEIGHTS /////////////////////
    
    CreateWeights = {
        Rook: async (map_uid, order, include_lower_order, precision) => {
            this.gdaProxy.postMessage({
                action:"CreateRookWeights",
                params:{
                    map_uid, 
                    order, 
                    include_lower_order, 
                    precision
                }
            });
    
            this.gdaProxy.onmessage = (e) => {
                const result = e?.data;
                if (result) {
                    return result.json_data
                }
            }
        },
        Queen: async (map_uid, order=1, include_lower_order=0, precision=0) => {
            this.gdaProxy.postMessage({
                action:"CreateQueenWeights",
                params:{
                    map_uid, 
                    order, 
                    include_lower_order, 
                    precision
                }
            });
            return new Promise((resolve, reject) => {
                try {
                    this.gdaProxy.onmessage = (e) => {
                        this.geojsonMaps[map_uid]['Queen'] = e.data.result;
                        console.log(this.geojsonMaps)
                        resolve(e.data.result);
                    };
                    this.gdaProxy.onerror = error => {
                    reject(error);
                    };
                } catch(error) {
                    reject(error)
                };
            });
        },
        Knn: async (map_uid, k, power, is_inverse, is_arc, is_mile) => {
            this.gdaProxy.postMessage({
                action:"CreateKnnWeights",
                params:{
                    map_uid, 
                    k, 
                    power, 
                    is_inverse, 
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
        },
        Dist: async (map_uid, dist_thres, power, is_inverse, is_arc, is_mile) => {
            this.gdaProxy.postMessage({
                action:"CreateKernelWeights",
                params:{
                    map_uid, 
                    dist_thres, 
                    power, 
                    is_inverse, 
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
        },
        Kernel: async (map_uid, k, kernel, adaptive_bandwidth, use_kernel_diagonals, is_arc, is_mile) => {
            this.gdaProxy.postMessage({
                action:"CreateDistWeights",
                params:{
                    map_uid, 
                    k, 
                    kernel, 
                    adaptive_bandwidth, 
                    use_kernel_diagonals, 
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
        },
        KernelBandwidth: async (map_uid, dist_thres, kernel, use_kernel_diagonals, is_arc, is_mile) => {
            this.gdaProxy.postMessage({
                action:"CreateKernelBandwidthWeights",
                params:{
                    map_uid, 
                    dist_thres, 
                    kernel, 
                    use_kernel_diagonals, 
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

    ////////////////////// CLUSTERS /////////////////////

    Cluster = {
        LocalMoran1: async (map_uid, weight_uid, values) => {
            this.gdaProxy.postMessage({
                action: "local_moran1",
                params:{
                    map_uid, 
                    weight_uid, 
                    values
                }
            });
            return new Promise((resolve, reject) => {
                try {
                    this.gdaProxy.onmessage = (e) => {
                        resolve(e.data.result);
                    };
                    this.gdaProxy.onerror = error => {
                        reject(error);
                    };
                } catch(error) {
                    reject(error)
                };
            });
        },
        LocalMoran: async (map_uid, weight_uid, col_name) => {
            this.gdaProxy.postMessage({
                action:"local_moran",
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
        LocalG: async (map_uid, weight_uid, col_name) => {
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
        LocalGstar: async (map_uid, weight_uid, col_name) => {
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
        LocalGeary: async (map_uid, weight_uid, col_name) => {
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
        LocalJoinCount: async (map_uid, weight_uid, col_name) => {
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
            let col_names = this.toVecString(sel_fields);
            let clusters_vec = window.Module.redcap(map_uid, weight_uid, k, col_names, bound_var, min_bound, method);
            let clusters = this.parseVecVecInt(clusters_vec);
            return clusters;
        },  
        MaxP: async (map_uid, weight_uid, k, sel_fields, bound_var, min_bound, method, tabu_length, cool_rate, n_iter) => {
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
            this.gdaProxy.postMessage({
                action:"custom_breaks",
                params:{
                    algorithm: 'hinge15_breaks',
                    numberOfBins,
                    values
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    this.gdaProxy.onmessage = (e) => {
                        resolve(e.data.result);
                    };
                    this.gdaProxy.onerror = error => {
                      reject(error);
                    };
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
            this.gdaProxy.postMessage({
                action:"custom_breaks",
                params:{
                    algorithm: 'hinge30_breaks',
                    numberOfBins,
                    values
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    this.gdaProxy.onmessage = (e) => {
                        resolve(e.data.result);
                    };
                    this.gdaProxy.onerror = error => {
                      reject(error);
                    };
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
            this.gdaProxy.postMessage({
                action:"custom_breaks",
                params:{
                    algorithm: 'natural_breaks',
                    numberOfBins,
                    values
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    this.gdaProxy.onmessage = (e) => {
                        resolve(e.data.result);
                    };
                    this.gdaProxy.onerror = error => {
                      reject(error);
                    };
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
            this.gdaProxy.postMessage({
                action:"quantile_breaks",
                params:{
                    numberOfBins,
                    values
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    this.gdaProxy.onmessage = (e) => {
                        resolve(e.data.result);
                    };
                    this.gdaProxy.onerror = error => {
                      reject(error);
                    };
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
            this.gdaProxy.postMessage({
                action:"stddev_breaks",
                params:{
                    numberOfBins,
                    values
                }
            });
    
            return new Promise((resolve, reject) => {
                try {
                    this.gdaProxy.onmessage = (e) => {
                        resolve(e.data.result);
                    };
                    this.gdaProxy.onerror = error => {
                      reject(error);
                    };
                } catch(error) {
                    reject(error)
                };
            });
        },   
    }

    ////////////////////// GEOMETRY /////////////////////

    async GetCentroids(map_uid){
        this.gdaProxy.postMessage({
            action:"GetCentroids",
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

    
    async GetNeighbors(map_uid, weight_uid, idx){
        this.gdaProxy.postMessage({
            action: "get_neighbors",
            params:{
                map_uid, 
                weight_uid, 
                idx
            }
        });

        this.gdaProxy.onmessage = (e) => {
            const result = e?.data;
            if (result) {
                return result.json_data
            }
        }
    }

    
    async cartogram(map_uid, values){

    }

    
    ////////////////////// HELPERS /////////////////////
    Has(map_uid){
        return map_uid in this.geojsonMaps; 
    }

    List(){
        return this.geojsonMaps;
    }

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