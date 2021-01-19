var Module = window.Module;

function isInt(n) {
  return Number(n) === n && n % 1 === 0;
}

class GeodaProxy {
  // file_target is evt.target
  constructor() {
    this.geojson_maps = {};
  }

  ReadGeojsonMap(map_uid, file_target) {
    //evt.target.result is an ArrayBuffer. In js, 
    const uint8_t_arr = new Uint8Array(file_target.result);
    //First we need to allocate the wasm memory. 
    const uint8_t_ptr = window.Module._malloc(uint8_t_arr.length);
    //Now that we have a block of memory we can copy the file data into that block
    window.Module.HEAPU8.set(uint8_t_arr, uint8_t_ptr);
    // pass the address of the wasm memory we just allocated to our function
    //window.Module.new_geojsonmap(map_uid, uint8_t_ptr, uint8_t_arr.length);
    window.Module.ccall("new_geojsonmap1", null, ["string", "number", "number"], [map_uid, uint8_t_ptr, uint8_t_arr.length]);

    //Lastly, according to the docs, we should call ._free here.
    window.Module._free(uint8_t_ptr);
    // store the map and map type
    let map_type = window.Module.get_map_type(map_uid);
    this.geojson_maps[map_uid] = map_type;
    return map_uid;
  }

  Has(map_uid) {
    return map_uid in this.geojson_maps;
  }

  List() {
    return this.geojson_maps;
  }

  GetCentroids(map_uid) {
    let cc = window.Module.get_centroids(map_uid);
    let xx = cc.get_x();
    let yy = cc.get_y();
    var centroids = [];
    for (let i = 0; i < xx.size(); ++i) {
      centroids.push([xx.get(i), yy.get(i)]);
    }
    return centroids;
  }

  GetNumObs(map_uid) {
    let n = window.Module.get_num_obs(map_uid);
    return n;
  }

  GetMapType(map_uid) {
    return this.geojson_maps[map_uid];
  }

  GetNumericCol(map_uid, col_name) {
    // return VectorDouble
    return window.Module.get_numeric_col(map_uid, col_name)
  }

  CreateRookWeights(map_uid, order, include_lower_order, precision) {
    let w_uid = window.Module.rook_weights(map_uid, order, include_lower_order, precision);
    return w_uid;
  }

  CreateQueenWeights(map_uid, order, include_lower_order, precision) {
    let w_uid = window.Module.queen_weights(map_uid, order, include_lower_order, precision);
    return w_uid;
  }

  GetMinDistThreshold(map_uid, is_arc, is_mile) {
    let val = window.Module.min_distance_threshold(map_uid, is_arc, is_mile);
    return val;
  }

  CreateKnnWeights(map_uid, k, power, is_inverse, is_arc, is_mile) {
    let w = window.Module.knn_weights(map_uid, k, power, is_inverse, is_arc, is_mile);
    return w;
  }

  CreateDistWeights(map_uid, dist_thres, power, is_inverse, is_arc, is_mile) {
    let w = window.Module.dist_weights(map_uid, dist_thres, power, is_inverse, is_arc, is_mile);
    return w;
  }

  CreateKernelWeights(map_uid, k, kernel, adaptive_bandwidth, use_kernel_diagonals, is_arc, is_mile) {
    let w = window.Module.kernel_weights(map_uid, k, kernel, adaptive_bandwidth, use_kernel_diagonals, is_arc, is_mile);
    return w;
  }

  CreateKernelBandwidthWeights(map_uid, dist_thres, kernel, use_kernel_diagonals, is_arc, is_mile) {
    let w = window.Module.kernel_bandwidth_weights(map_uid, dist_thres, kernel, use_kernel_diagonals, is_arc, is_mile);
    return w;
  }

  local_moran(map_uid, weight_uid, col_name) {
    return window.Module.local_moran(map_uid, weight_uid, col_name);
  }

  local_moran1(map_uid, weight_uid, values) {
    return window.Module.local_moran1(map_uid, weight_uid, this.toVecDouble(values));
  }

  local_g(map_uid, weight_uid, col_name) {
    return window.Module.local_g(map_uid, weight_uid, col_name);
  }

  local_gstar(map_uid, weight_uid, col_name) {
    return window.Module.local_gstar(map_uid, weight_uid, col_name);
  }

  local_geary(map_uid, weight_uid, col_name) {
    return window.Module.local_geary(map_uid, weight_uid, col_name);
  }

  local_joincount(map_uid, weight_uid, col_name) {
    return window.Module.local_joincount(map_uid, weight_uid, col_name);
  }

  GetNeighbors(map_uid, weight_uid, idx) {
    let nbrs = window.Module.get_neighbors(map_uid, weight_uid, idx);
    return this.parseVecInt(nbrs);
  }

  parseVecInt(vi) {
    let result = [];
    for (let j = 0; j < vi.size(); ++j) {
      result.push(vi.get(j));
    }
    return result;
  }

  parseVecVecInt(vvi) {
    let result = [];
    for (let i = 0; i < vvi.size(); ++i) {
      let sub = [];
      let vi = vvi.get(i);
      for (let j = 0; j < vi.size(); ++j) {
        sub.push(vi.get(j));
      }
      result.push(sub);
    }
    return result;
  }

  parseVecDouble(vd) {
    let result = []
    for (let i = 0; i < vd.size(); ++i) {
      result.push(vd.get(i));
    }
    return result;
  }


  toVecString(input) {
    let vs = new window.Module.VectorString();
    for (let i = 0; i < input.length; ++i) {
      vs.push_back(input[i]);
    }
    return vs;
  }

  toVecDouble(input) {
    let vs = new window.Module.VectorDouble();
    for (let i = 0; i < input.length; ++i) {
      if (isNaN(input[i]) || input[i] == Infinity)
        vs.push_back(0);
      else
        vs.push_back(input[i]);
    }
    return vs;
  }

  redcap(map_uid, weight_uid, k, sel_fields, bound_var, min_bound, method) {
    let col_names = this.toVecString(sel_fields);
    let clusters_vec = window.Module.redcap(map_uid, weight_uid, k, col_names, bound_var, min_bound, method);
    let clusters = this.parseVecVecInt(clusters_vec);
    return clusters;
  }

  maxp(map_uid, weight_uid, k, sel_fields, bound_var, min_bound, method, tabu_length, cool_rate, n_iter) {
    let col_names = this.toVecString(sel_fields);
    let clusters_vec = window.Module.maxp(map_uid, weight_uid, col_names, bound_var, min_bound, tabu_length, cool_rate, method, k, n_iter);
    let clusters = this.parseVecVecInt(clusters_vec);
    return clusters;
  }

  custom_breaks(map_uid, break_name, k, sel_field, values) {
    var breaks_vec;
    if (sel_field == null) {
      breaks_vec = window.Module.custom_breaks1(map_uid, k, break_name, this.toVecDouble(values));
    } else {
      breaks_vec = window.Module.custom_breaks(map_uid, k, sel_field, break_name);
    }
    let breaks = this.parseVecDouble(breaks_vec);
    var orig_breaks = breaks;

    let bins = [];
    let id_array = [];
    for (let i = 0; i < breaks.length; ++i) {
      id_array.push([]);
      let txt = isInt(breaks[i]) ? breaks[i] : breaks[i].toFixed(2);
      bins.push("" + txt);
    }
    id_array.push([]);
    let txt = breaks[breaks.length - 1];
    if (txt != undefined) {
      txt = isInt(txt) ? txt : txt.toFixed(2);
      bins.push(">" + txt);
    }

    breaks.unshift(Number.NEGATIVE_INFINITY);
    breaks.push(Number.POSITIVE_INFINITY);

    for (let i = 0; i < values.length; ++i) {
      let v = values[i];
      for (let j = 0; j < breaks.length - 1; ++j) {
        let min_val = breaks[j];
        let max_val = breaks[j + 1];
        if (v >= min_val && v < max_val) {
          id_array[j].push(i);
          break;
        }
      }
    }

    for (let i = 0; i < bins.length; ++i) {
      //bins[i] += " (" + id_array[i].length + ')';
    }

    return {
      'k': k,
      'bins': bins,
      'breaks': orig_breaks,
      'id_array': id_array
    }
  }

  cartogram(map_uid, values) {
    let cart = window.Module.cartogram(map_uid, this.toVecDouble(values));
    let x = cart.get_x();
    let y = cart.get_y();
    let r = cart.get_radius();
    // rescale x, y [-100,0], [0, 45]
    let min_x = x.get(0);
    let max_x = x.get(0);
    let min_y = y.get(0);
    let max_y = y.get(0);
    for (let i = 0; i < x.size(); ++i) {
      if (min_x > x.get(i)) min_x = x.get(i);
      if (max_x < x.get(i)) max_x = x.get(i);
      if (min_y > y.get(i)) min_y = y.get(i);
      if (max_y < y.get(i)) max_y = y.get(i);
    }
    let scale_x = 100.0 / (max_x - min_x);
    let scale_y = 45.0 / (max_y - min_y);


    var result = [];
    for (let i = 0; i < x.size(); ++i) {
      let xx = (x.get(i) - min_x) * scale_x;
      let yy = (y.get(i) - min_y) * scale_y;
      result.push({
        'properties': {
          'id': i
        },
        'position': [x.get(i) / 10000.0, y.get(i) / 10000.0],
        'radius': r.get(i)
      });
    }
    return result;
  }
}

export default GeodaProxy