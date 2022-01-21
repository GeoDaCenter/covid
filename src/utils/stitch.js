export const stitch = (xData, yData, keys) => {
  const rtn = [];
  if (!xData || !yData || !keys)
    return {
      data: [],
      timestamp: null,
    };
  for (let i = 0; i < keys.length; i++) {
    rtn.push({
      x: xData[i],
      y: yData[i],
      geoid: keys[i],
    });
  }
  return {
    data: rtn,
    timestamp: +new Date(),
  };
};
