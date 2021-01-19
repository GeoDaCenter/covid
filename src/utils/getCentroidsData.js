export const getCentroidsData = async (url) => {
    const tempData = await getParseCSV(url, ['GEOID'], false)
        .then(data => { return data[0]})

    return tempData;
}