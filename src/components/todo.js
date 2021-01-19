function getCurrentWuuid() {
    if (!(selectedDataset in gda_weights)) {
      var w = gda_proxy.CreateQueenWeights(selectedDataset, 1, 0, 0);

      // put in store
      gda_weights[selectedDataset] = w;
    }
    return {
      'map_uuid': selectedDataset,
      'w_uuid': gda_weights[selectedDataset].get_uid()
    };
  }

  
  var w = getCurrentWuuid();

  if (!(selectedDataset in lisaData)) lisaData[selectedDataset] = {};

  if (selectedDate in lisaData[selectedDataset] && field in lisaData[selectedDataset][selectedDate]) {
    clusters = lisaData[selectedDataset][selectedDate][field].clusters;
    sig = lisaData[selectedDataset][selectedDate][field].sig;

  } else {
    let all_zeros = true;
    for (let i=0; i<data.length; ++i) { 
      if (data[i] != 0)
        all_zeros = false;
    }
    if (all_zeros) {
      clusters = [];
      sig = [];
      for (let i=0; i<data.length; ++i) { 
        clusters.push(0);
        sig.push(0);
      }
    } else {
      var lisa = gda_proxy.local_moran1(w.map_uuid, w.w_uuid, data);
      clusters = gda_proxy.parseVecDouble(lisa.clusters());
      sig = gda_proxy.parseVecDouble(lisa.significances());
    }
    if (!(selectedDate in lisaData[selectedDataset])) lisaData[selectedDataset][selectedDate] = {}
    if (!(field in lisaData[selectedDataset][selectedDate])) lisaData[selectedDataset][selectedDate][field] = {}
    lisaData[selectedDataset][selectedDate][field]['clusters'] = clusters;
    lisaData[selectedDataset][selectedDate][field]['pvalues'] = sig;
  }