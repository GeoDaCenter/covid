const getCurrentWuuid = (gda_proxy, selectedDataset) => {
    var w = gda_proxy.CreateQueenWeights(selectedDataset, 1, 0, 0);

    return {
      'map_uuid': selectedDataset,
      'w': w,
      'w_uuid': w.get_uid()
    };
}

export default getCurrentWuuid