const loadGeojsonToGeoda = async (data, url, gda_proxy) => {
  const arrayBuffer = await data.arrayBuffer();

  gda_proxy.ReadGeojsonMap(url.split('/').slice(-1,)[0], {
      result: arrayBuffer,
  });
  
  return true;
}

export default loadGeojsonToGeoda;