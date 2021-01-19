const geojsonArrayBuffer = async (data) => {
    const arrayBuffer = await data.arrayBuffer()

    return arrayBuffer;
}

export default geojsonArrayBuffer;