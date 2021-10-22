export const closestIndex = (indices, index) => indices.includes(index)
    ? index
    : indices.reduce((a, b) => {return Math.abs(a - index) < Math.abs(b - index) ? a : b});