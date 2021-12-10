const findBin = (geoidIndex, binArray) => {
  for (let i = 0; i < binArray.length; i++) {
    if (binArray[i].indexOf(geoidIndex) !== -1) return i;
  }
  return null;
};

const parseBinPairs = (geoidArray, binArray) => {
  let keys = Object.keys(geoidArray);
  let rtn = {};

  for (let i = 0; i < keys.length; i++) {
    rtn[`${keys[i]}`] = findBin(geoidArray[keys[i]], binArray);
  }
};

export default parseBinPairs;
