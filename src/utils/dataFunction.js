// branchless variant
// const dataFn = (numeratorData, numeratorProperty, index, range, denominatorData, denominatorProperty, denominatorIndex, denominatorRange, scale)  => {

//     return (
//       (
//         (
//           (
//             (numeratorData[index]||numeratorData[numeratorProperty])
//             -
//             ((range!==null)&&(numeratorData[index-range]))
//           )

//           /
//           (range+(range===null))
//         )
//       /
//         (
//           (
//             (
//               (denominatorData[denominatorIndex]||denominatorData[denominatorProperty])
//               -
//               ((denominatorRange!==null)&&(denominatorData[denominatorIndex-denominatorRange]))
//             )
//             /
//             (denominatorRange+(denominatorRange===null))
//           )
//           ||
//             (denominatorData[denominatorProperty])
//           ||
//           1
//         )
//       )
//       *
//       scale
//     )
// }

// export default dataFn;

const dataFn = (numeratorData, denominatorData, dataParams) => {
  const { nProperty, nIndex, dProperty, dIndex, nType, dType, scale } =
    dataParams;

  const nRange = nIndex <= dataParams.nRange ? nIndex : dataParams.nRange;
  const dRange = dIndex <= dataParams.dRange ? dIndex : dataParams.dRange;

  if (numeratorData === undefined || denominatorData === undefined) {
    return null;
  }

  if (
    (nProperty !== null &&
      (numeratorData[nProperty] === undefined ||
        numeratorData[nProperty] === null)) ||
    (nIndex !== null &&
      nProperty === null &&
      (numeratorData[nIndex] === undefined || numeratorData[nIndex] === null))
  ) {
    return null;
  }

  if (nType === 'time-series' && dType === 'time-series') {
    if ((nRange === null) & (dRange === null)) {
      return (numeratorData[nIndex] / denominatorData[dIndex]) * scale;
    } else {
      return (
        ((numeratorData[nIndex] - numeratorData[nIndex - nRange]) /
          nRange /
          ((denominatorData[dIndex] - denominatorData[dIndex - dRange]) /
            dRange)) *
        scale
      );
    }
  }

  if (dProperty === null && nRange === null) {
    // whole count or number -- no range, no normalization
    return (numeratorData[nProperty] || numeratorData[nIndex]) * scale;
  }

  if (dProperty === null && nRange !== null) {
    // range number, daily or weekly count -- no normalization
    return (
      ((numeratorData[nIndex] - numeratorData[nIndex - nRange]) / nRange) *
      scale
    );
  }

  if (dProperty !== null && nRange === null) {
    // whole count or number normalized -- no range
    return (
      ((numeratorData[nProperty] || numeratorData[nIndex]) /
        (denominatorData[dProperty] || denominatorData[dIndex])) *
      scale
    );
  }

  if (dProperty !== null && nRange !== null && dRange === null) {
    // range number, daily or weekly count, normalized to a single value
    return (
      ((numeratorData[nIndex] - numeratorData[nIndex - nRange]) /
        nRange /
        (denominatorData[dProperty] || denominatorData[dIndex])) *
      scale
    );
    // } else if (dProperty!==null&&nRange!==null&&dRange!==null){ // range number, daily or weekly count, normalized to a range number, daily or weekly count
    //   console.log('getting the right col')
    //   return (
    //     (numeratorData[nIndex]-numeratorData[nIndex-nRange])/nRange)
    //     /
    //     ((denominatorData[dIndex]-denominatorData[dIndex-dIndex])/dIndex)
    //     *scale
  }

  return null;
};

export default dataFn;
