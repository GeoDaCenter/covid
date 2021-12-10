export function mapFn(val, bins, colors, maptype, table) {
  if (val === null) {
    return [0, 0, 0, 0];
  } else if (maptype === 'natural_breaks') {
    if (
      (val === 0 && table.indexOf('testing') === -1) ||
      (val === -100 && table.includes('testing'))
    )
      return colors[0];

    for (let i = 0; i < colors.length; i++) {
      if (val < bins[i - 1]) {
        return colors[i];
      }
    }
    return colors[0];
  } else if (maptype.includes('hinge')) {
    if (val === null) return [0, 0, 0, 0];

    for (let i = 1; i < colors.length; i++) {
      if (val < bins[i - 1]) {
        return colors[i];
      }
    }
    return colors[colors.length - 1];
  }
}

export function mapFnNb(val, bins, colors, maptype, table) {
  if (val === null) return [0, 0, 0, 0];
  if (val === 0) return colors[0];
  for (let i = 1; i < colors.length; i++) {
    if (val < bins[i - 1]) {
      return colors[i];
    }
  }
  return colors[colors.length - 1];
}

export function mapFnTesting(val, bins, colors, maptype, table) {
  if (val === null) return [0, 0, 0, 0];
  if (val === -1) return colors[0];
  for (let i = 0; i < colors.length; i++) {
    if (val < bins[i]) {
      return colors[i];
    }
  }
  return colors[colors.length - 1];
}

export function mapFnHinge(val, bins, colors, maptype, table) {
  if (val === null) return [0, 0, 0, 0];
  for (let i = 0; i < bins.length; i++) {
    if (val < bins[i]) {
      return colors[i];
    }
  }
  return colors[colors.length - 1];
}
