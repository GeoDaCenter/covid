import dataFn from './dataFunction';
// this function loops through the current data set and provides data for GeodaJS to create custom breaks
const getDataForBins = ({
  numeratorData,
  denominatorData = {},
  dataParams,
  fixedOrder = false,
  dataReady = true,
  binIndex = null,
}) => {
  if (!dataReady || !numeratorData || !dataParams?.numerator) return [];
  const { nProperty, dType } = dataParams;
  const nIndex = binIndex ||dataParams.nIndex;
  
  const dIndex = dType === 'time-series' ? nIndex : null;
  // declare empty array for return variables
  let rtn = new Array(fixedOrder ? fixedOrder.length : numeratorData.length);

  // length of data table to loop through
  const keys = fixedOrder || Object.keys(numeratorData);
  const n = keys.length;

  // debugger;
  // this checks if the bins generated should be dynamic (generating for each date) or fixed (to the most recent date)
  if (nIndex === null && nProperty === null) {
    // if fixed, get the most recent date
    let tempIndex = numeratorData[keys[0]].length - 1;
    // if the denominator is time series data (eg. deaths / cases this week), make the indices the same (most recent)
    let tempDIndex =
      dType === 'time-series' ? denominatorData.length - 1 : dIndex;
    // loop through, do appropriate calculation. add returned value to rtn array
    for (let i = 0; i < n; i++) {
      rtn[keys[i]] =
        dataFn(numeratorData[keys[i]], denominatorData[keys[i]], {
          ...dataParams,
          nIndex: tempIndex,
          dIndex: tempDIndex,
        }) || 0;
    }
  } else {
    for (let i = 0; i < n; i++) {
      rtn[i] =
        dataFn(numeratorData[keys[i]], denominatorData[keys[i]], {...dataParams, nIndex, dIndex}) ||
        0;
    }
  }

  let conditionalCheck = () => false;

  if (dataParams.numerator.indexOf('vaccin') !== -1)
    conditionalCheck = (val) => (val > 100 ? true : false);
  for (let i = 0; i < rtn.length; i++) {
    if (rtn[i] < 0 || conditionalCheck(rtn[i])) rtn[i] = 0;
  }
  
  return rtn;
};
export default getDataForBins;
