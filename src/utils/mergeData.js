import { merge } from 'lodash';

const mergeData = (featureCollection, featureCollectionJoinCol, joinData, joinDataNames, joinDataCol) => {
    // declare parent dictionaries
    let features = {}
    let dataDict = {}
    
    // declare and prep feature collection object
    let i = featureCollection.features.length;
    let colNumCheck = parseInt(featureCollection.features[0].properties[featureCollectionJoinCol])
    if (Number.isInteger(colNumCheck)) {
      while (i>0) {
        i--;
        features[parseInt(featureCollection.features[i].properties[featureCollectionJoinCol])] = featureCollection.features[i];
        dataDict[parseInt(featureCollection.features[i].properties[featureCollectionJoinCol])] = {};
      }
    } else {
      while (i>0) {
        i--;
        features[featureCollection.features[i].properties[featureCollectionJoinCol]] = featureCollection.features[i];
        dataDict[featureCollection.features[i].properties[featureCollectionJoinCol]] = {};
      }
    }
  
    // // declare data objects
    // for (let n=0; n < joinDataNames.length; n++) {
    //   dataDict[`${joinDataNames[n]}`] = {}
    // }
  
    // loop through data and add to dictionaries
    let n = joinData.length;
    while (n>0) {
      n--;
      let cols = Object.keys(joinData[n][0]);
      i = cols.length;
      while (i>0) {
        i--;
        try {
          dataDict[cols[i]][joinDataNames[n]] = joinData[n][0][cols[i]]
        } catch {}
      }
    }
    
    // // use lodash to merge data
    let merged = merge(features, dataDict)
    // for (let n=1; n < joinDataNames.length; n++){
    //   merged = merge(merged, dataDict[joinDataNames[n]])
    // }
    
    // clean data
    let rtn = [];
    let keys = Object.keys(merged)
    
    for (let i = 0; i < keys.length; i++) {
      // if (Object.keys(merged[keys[i]]).length == (joinDataNames.length+baseColumnLength)) rtn.push(merged[keys[i]])
      rtn.push(merged[keys[i]])
    }

    return rtn;
}

export default mergeData;