export const getIdOrder = (features, idProp) => {
  let geoidOrder = {};
  let indexOrder = {};
  if (features.length === 0) return { geoidOrder, indexOrder };
  if (!idProp) {
    for (let i = 0; i < features.length; i++) {
      geoidOrder[i] = i;
      indexOrder[i] = i;
    }
  } else {
    for (let i = 0; i < features.length; i++) {
      geoidOrder[features[i].properties[idProp]] = i;
      indexOrder[i] = features[i].properties[idProp];
    }
  }
  return { geoidOrder, indexOrder };
};
