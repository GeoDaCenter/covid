const findDates = (data) => {
    for (let i = 0; i < data.length; i++) {
      if (Date.parse(data[i])) return [data.slice(i,),i]
    }
    return;
}

export default findDates