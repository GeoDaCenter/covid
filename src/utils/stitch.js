export const stitch = (
    xData,
    yData,
    keys
) => {
    const rtn = [];
    if (!xData || !yData || !keys) return rtn;
    for (let i = 0; i < keys.length; i++) {
        rtn.push({
            x: xData[i],
            y: yData[i],
            geoid: keys[i]
        });
    }
    return rtn
}