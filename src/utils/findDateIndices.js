export const findDateIndices = ( dateList, columnList ) => {
    let validIndices = []
    for (let i=0; i<dateList.length; i++) {
        if (columnList.indexOf(dateList[i]) !== -1) validIndices.push(i)
    }
    return validIndices
}

export const getDateIndices = ( data, names ) => {
    let rtn = {}
    
    for (let i=0; i < data.length; i++) {
        rtn[names[i]] = data[i][2]
    }

    return rtn;
}