const getJsonPure = async (url) => {
    const tempData = await fetch(url).then(response => {
      return response //.json();
    })      
    return tempData;
}

export default getJsonPure;