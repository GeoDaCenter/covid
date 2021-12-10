const resourceOverlayCheck = (mapParams, property, value) => {
  if (mapParams.vizType === '3D')
    return [['setLayoutProperty', 'visibility', 'none']];
  if (mapParams[property] === value)
    return [['setLayoutProperty', 'visibility', 'visible']];
  return [['setLayoutProperty', 'visibility', 'none']];
};

const check3d = (mapParams) => {
  if (mapParams.vizType === '3D')
    return [['setLayoutProperty', 'visibility', 'none']];
  return [['setLayoutProperty', 'visibility', 'visible']];
};

const checkAdmin = (mapParams) => {
  if (mapParams.vizType === '3D')
    return [['setLayoutProperty', 'visibility', 'none']];
  if (mapParams.vizType === 'dotDensity') {
    return [
      ['setLayoutProperty', 'visibility', 'visible'],
      ['setPaintProperty', 'line-color', 'hsl(0,0%,80%)'],
    ];
  }
  return [
    ['setLayoutProperty', 'visibility', 'visible'],
    [
      'setPaintProperty',
      'line-color',
      [
        'interpolate',
        ['linear'],
        ['zoom'],
        8,
        'hsl(216, 36%, 16%)',
        16,
        'rgb(52, 52, 52)',
      ],
    ],
  ];
};

const checkLabel = (mapParams) => {
  if (mapParams.overlay.length && !mapParams.overlay.includes('blackbelt'))
    return [['setLayoutProperty', 'visibility', 'none']];
  return [['setLayoutProperty', 'visibility', 'visible']];
};

const layerDictionary = {
  'blackbelt-geom': (mapParams) =>
    resourceOverlayCheck(mapParams, 'overlay', 'blackbelt'),
  'segregated_cities-geom': (mapParams) =>
    resourceOverlayCheck(mapParams, 'overlay', 'segregated_cities'),
  'native_american_reservations-geom': (mapParams) =>
    resourceOverlayCheck(mapParams, 'overlay', 'native_american_reservations'),
  'uscongress-districts-geom': (mapParams) =>
    resourceOverlayCheck(mapParams, 'overlay', 'uscongress-districts'),
  hillshade: check3d,
  water: check3d,
  'admin-1-boundary-bg': checkAdmin,
  'admin-0-boundary-bg': checkAdmin,
  'admin-1-boundary': checkAdmin,
  'admin-0-boundary': checkAdmin,
  'admin-0-boundary-disputed': checkAdmin,
  'waterway-label': check3d,
  'natural-line-label': check3d,
  'natural-point-label': check3d,
  'water-line-label': check3d,
  'water-point-label': check3d,
  'poi-label': checkLabel,
  'settlement-minor-label': checkLabel,
  'settlement-major-label': checkLabel,
  'state-label': checkLabel,
  'uscongress-label': (mapParams) =>
    resourceOverlayCheck(mapParams, 'overlay', 'uscongress-districts'),
  'segregated_cities-label': (mapParams) =>
    resourceOverlayCheck(mapParams, 'overlay', 'segregated_cities'),
  'native_american_reservations-label': (mapParams) =>
    resourceOverlayCheck(mapParams, 'overlay', 'native_american_reservations'),
};

export default function parseMapboxLayers(
  defaultLayers,
  mapParams,
  mapRef,
  globalMap = false,
) {
  if (mapRef !== undefined && mapRef.current === undefined) return;
  const map = mapRef.current.getMap();
  if (mapParams.vizType === 'cartogram' || globalMap) {
    defaultLayers.forEach(({ id }) =>
      map.setLayoutProperty(id, 'visibility', 'none'),
    );
  } else {
    defaultLayers.forEach(({ id }) => {
      const ops = layerDictionary[id](mapParams);
      ops.forEach((op) => {
        try {
          map[op[0]](id, op[1], op[2]);
        } catch (e) {
          console.log(e);
        }
      });
    });
  }
}
