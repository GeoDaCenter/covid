class GeodaProxy {
    // file_target is evt.target
    constructor() {
      this.geojson_maps = {};
    }
  
    ReadGeojsonMap(map_uid, file_target) {
      //evt.target.result is an ArrayBuffer. In js, 
          //you can't do anything with an ArrayBuffer 
          //so we have to ???cast??? it to an Uint8Array
          const uint8_t_arr = new Uint8Array(file_target.result);
  
          //Right now, we have the file as a unit8array in javascript memory. 
          //As far as I understand, wasm can't directly access javascript memory. 
          //Which is why we need to allocate special wasm memory and then
          //copy the file from javascript memory into wasm memory so our wasm functions 
          //can work on it.
  
          //First we need to allocate the wasm memory. 
          //_malloc returns the address of the new wasm memory as int32.
          //This call is probably similar to 
          //uint8_t * ptr = new uint8_t[sizeof(uint8_t_arr)/sizeof(uint8_t_arr[0])]
          const uint8_t_ptr = window.Module._malloc(uint8_t_arr.length);
  
          //Now that we have a block of memory we can copy the file data into that block
          //This is probably similar to 
          //std::memcpy(uint8_t_ptr, uint8_t_arr, sizeof(uint8_t_arr)/sizeof(uint8_t_arr[0]))
          window.Module.HEAPU8.set(uint8_t_arr, uint8_t_ptr);
  
          //The only thing that's now left to do is pass 
          //the address of the wasm memory we just allocated
          //to our function as well as the size of our memory.
          window.Module.new_geojsonmap(map_uid, uint8_t_ptr, uint8_t_arr.length);
  
          //At this point we're forced to wait until wasm is done with the memory. 
          //Your site will now freeze if the memory you're working on is big. 
          //Maybe we can somehow let our wasm function run on a seperate thread and pass a callback?
  
          //Retreiving our (modified) memory is also straight forward. 
          //First we get some javascript memory and then we copy the 
          //relevant chunk of the wasm memory into our javascript object.
      //const returnArr = new Uint8Array(uint8_t_arr.length);
  
          //If returnArr is std::vector<uint8_t>, then is probably similar to 
          //returnArr.assign(ptr, ptr + dataSize)
          //returnArr.set(window.Module.HEAPU8.subarray(uint8_t_ptr, uint8_t_ptr + uint8_t_arr.length));
  
          //Lastly, according to the docs, we should call ._free here.
          //Do we need to call the gc somehow?
          window.Module._free(uint8_t_ptr);
  
      // store the map and map type
      let map_type = Module.get_map_type(map_uid);
      this.geojson_maps[map_uid] = map_type;
  
      return map_uid;
    }
  
    GetNumObs(map_uid) {
      let n = Module.get_num_obs(map_uid);
      return n;
    }
  
    GetMapType(map_uid) {
      return this.geojson_maps[map_uid];
    }
  
    GetNumericCol(map_uid, col_name) {
      // return VectorDouble
      return Module.get_numeric_col(map_uid, col_name)
    }
  
    CreateRookWeights(map_uid, order, include_lower_order, precision) {
      let w_uid = Module.rook_weights(map_uid, order, include_lower_order, precision);
      return w_uid;
    }

    CreateQueenWeights(map_uid, order, include_lower_order, precision) {
      let w_uid = Module.queen_weights(map_uid, order, include_lower_order, precision);
      return w_uid;
    }

    GetMinDistThreshold(map_uid, is_arc, is_mile) {
      let val = Module.min_distance_threshold(map_uid, is_arc, is_mile);
      return val;
    }

    CreateKnnWeights(map_uid, k, power, is_inverse, is_arc, is_mile) {
      let w = Module.knn_weights(map_uid, k, power, is_inverse, is_arc, is_mile);
      return w;
    }

    CreateDistWeights(map_uid, dist_thres, power, is_inverse, is_arc, is_mile) {
      let w = Module.dist_weights(map_uid, dist_thres, power, is_inverse, is_arc, is_mile);
      return w;
    }

    CreateKernelWeights(map_uid, k, kernel, adaptive_bandwidth, use_kernel_diagonals, is_arc, is_mile) {
      let w = Module.kernel_weights(map_uid, k, kernel, adaptive_bandwidth, use_kernel_diagonals, is_arc, is_mile);
      return w;
    }

    CreateKernelBandwidthWeights(map_uid, dist_thres, kernel, use_kernel_diagonals, is_arc, is_mile) {
      let w = Module.kernel_bandwidth_weights(map_uid, dist_thres, kernel, use_kernel_diagonals, is_arc, is_mile);
      return w;
    }

    local_moran(map_uid, weight_uid, col_name) {
      return Module.local_moran(map_uid, weight_uid, col_name);
    }

    local_g(map_uid, weight_uid, col_name) {
      return Module.local_g(map_uid, weight_uid, col_name);
    }

    local_gstar(map_uid, weight_uid, col_name) {
      return Module.local_gstar(map_uid, weight_uid, col_name);
    }

    local_geary(map_uid, weight_uid, col_name) {
      return Module.local_geary(map_uid, weight_uid, col_name);
    }

    local_joincount(map_uid, weight_uid, col_name) {
      return Module.local_joincount(map_uid, weight_uid, col_name);
    }

    parseVecVecInt(vvi) {
      let result = []; 
      for (let i=0; i<vvi.size(); ++i) {
        let sub = [];
        let vi = vvi.get(i);
        for (let j=0; j<vi.size(); ++j) {
          sub.push( vi.get(j) );
        }
        result.push(sub);
      }
      return result;
    }

    parseVecDouble(vd) {
      let result = []
      for (let i=0; i<vd.size(); ++i) {
        result.push( vd.get(i));
      }
      return result;
    }

    toVecString(input) {
      let vs = new Module.VectorString();
      for (let i=0; i<input.length; ++i) {
        vs.push_back(input[i]);
      }
      return vs;
    }

    redcap(map_uid, weight_uid, k, sel_fields, bound_var, min_bound, method) {
      let col_names = this.toVecString(sel_fields);
      let clusters_vec = Module.redcap(map_uid, weight_uid, k, col_names, bound_var, min_bound, method);
      let clusters = this.parseVecVecInt(clusters_vec);
      return clusters;
    }

    maxp(map_uid, weight_uid, k, sel_fields, bound_var, min_bound, method, tabu_length, cool_rate, n_iter) {
      let col_names = this.toVecString(sel_fields);
      let clusters_vec = Module.maxp(map_uid, weight_uid, col_names, bound_var, min_bound, tabu_length, cool_rate, method, k, n_iter);
      let clusters = this.parseVecVecInt(clusters_vec);
      return clusters;
    }

    custom_breaks(map_uid, break_name, k, sel_field, values) {
      let breaks_vec = Module.custom_breaks(map_uid, k, sel_field, break_name);
      let breaks = this.parseVecDouble(breaks_vec);

      let bins = [];
      let id_array = [];
      for (let i=0; i<breaks.length; ++i) {
        id_array.push([]);
        bins.push(" < " + breaks[i]);
      }
      id_array.push([]);
      bins.push(">= " + breaks[breaks.length-1]);

      breaks.unshift(Number.NEGATIVE_INFINITY);
      breaks.push(Number.POSITIVE_INFINITY);

      for (let i=0; i<values.length; ++i) {
        let v = values[i];
        for (let j=0; j<breaks.length -1; ++j) {
          let min_val = breaks[j];
          let max_val = breaks[j+1];
          if ( v >= min_val && v < max_val) {
            id_array[j].push(i);
            break;
          }
        }
      }

      for (let i =0; i<bins.length; ++i) {
        bins[i] += " (" + id_array[i].length + ')';
      }

      return {
        'k' : k,
        'bins' : bins,
        'id_array' : id_array,
        'col_name' : sel_field
      }
    }
  }

export { GeodaProxy };