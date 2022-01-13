const parseMobilityData = (selectedGeoid, weightData, centroids) => {
  let sourceCenter = centroids.findIndex((o) => o[0] === selectedGeoid);
  let sourceX = centroids[sourceCenter][1];
  let sourceY = centroids[sourceCenter][2];

  let length = weightData.length;
  let n = 0;

  while (n < length - 1) {
    centroids[n] = [
      centroids[n][0],
      centroids[n][1],
      centroids[n][2],
      sourceX,
      sourceY,
      weightData[n],
    ];
    n++;
  }
  return centroids;
};

export default parseMobilityData;
