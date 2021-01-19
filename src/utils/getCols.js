const getColumns = (data, names) => {
    let rtn = {};

    for (let i=0; i < data.length; i++) {
        rtn[names[i]] = data[i][1]
    }

    return rtn;
}

export default getColumns;