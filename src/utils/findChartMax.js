export const findChartMax = (data) => {
    let maximums = {
        a:0,
        v:0
    }
    for (let i=0;i<data.length;i++){
        if (data[i].a > maximums.a) maximums.a = data[i].a
        if (data[i].v > maximums.v) maximums.v = data[i].v
    }
    return maximums
}