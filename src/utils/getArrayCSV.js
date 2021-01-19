const getArrayCSV = async (url) => {
    const arrToInt = (arr) => arr.map(d => +d);
    const tempData = await fetch(url).then(response => {
            return response.ok ? response.text() : Promise.reject(response.status);
        }).then(data => {
            let rows = data.split("\n");
            return rows.map(row => arrToInt(row.split(",")))
        })

    return tempData;
}

export default getArrayCSV