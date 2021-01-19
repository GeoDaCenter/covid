import getCurrentWuuid from './getCurrentWuuid.js';

const getLisaValues = (gda_proxy, dataset, data, geoids) => {
  let w = getCurrentWuuid(gda_proxy, dataset);
  let all_zeros = true;
  for (let i=0; i<data.length; ++i) { 
    if (data[i] !== 0)
      all_zeros = false;
  }
  let clusters = [];
  let sig = [];

  if (all_zeros) {
    for (let i=0; i<data.length; ++i) { 
      clusters.push(0);
      sig.push(0);
    }
  } else {
    var lisa = gda_proxy.local_moran(w.map_uuid, w.w_uuid, data);
    clusters = gda_proxy.parseVecDouble(lisa.clusters());
    sig = gda_proxy.parseVecDouble(lisa.significances());
  }
  console.log(w.w_uuid)
  console.log(w.map_uuid)
  return clusters;
}

export default getLisaValues;