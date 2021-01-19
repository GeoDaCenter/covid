const mapFn = (val, bins, colors, maptype, column) => {
  if (val === null) {
    return null;
  } else if (maptype === "natural_breaks") {
    if (val === 0 || (val === -1 && column.includes('testing'))) return colors[0];

    for (let i=1; i<bins.length; i++) {
      if (val < bins[i]) {
        return colors[i]
      }
    }
    return colors[0];
  } else if (maptype.includes("hinge")) {
    
    if (val === null) return [0,0,0,0];
    
    for (let i=1; i<bins.length; i++) {
      if (val < bins[i]) {
        return colors[i-1]
      }
    }
    return colors[0];
  }
}

export default mapFn