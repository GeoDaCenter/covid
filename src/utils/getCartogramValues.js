const getCartogramValues = (gda_proxy, dataset, data) => {
  let cartogramData = gda_proxy.cartogram(dataset, data);
  let tempArray = new Array(cartogramData.length);
  for (let i = 0; i < cartogramData.length; i++) {
    cartogramData[i].value = data[i];
    tempArray[i] = cartogramData[i];
  }
  return tempArray;
};

export default getCartogramValues;
