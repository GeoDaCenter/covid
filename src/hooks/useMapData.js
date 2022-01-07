import React, { useMemo, useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useLoadData from './useLoadData';
import { useGeoda } from '../contexts/Geoda';
import { getVarId, getDataForBins } from '../utils';
import { fixedScales } from '../config/scales';
// function getAndCacheWeights
// function getAndCacheCentroids
const maxDesirableHeight = 500_000;

const getContinuousColor = (val, breaks, colors, useZero = false) => {
  if (useZero && val === 0) return colors[0];
  if (val === null || val === undefined) return [50, 50, 50];
  for (let i = 0; i < breaks.length; i++) {
    if (val <= breaks[i]) return colors[i + useZero];
  }
  return colors[colors.length - 1];
};

const generateJoinData = ({
  binData,
  bins,
  lisaData,
  cartogramData,
  mapParams,
  dataParams,
  order,
  dataReady,
  storedGeojson,
}) => {
  if (!dataReady || !bins.breaks) return [{}, undefined];
  const geoids = Object.values(order);

  // const getColor = getColorFunction(mapParams.mapType)
  // const mapFn = getMapFunction(mapParams.mapType, dataParams.numerator)
  // const getHeight = dataParams.variableName.toLowerCase().includes("percent")
  //     ? getPctHeight
  //     : getStandardHeight
  
  let joinData = {};
  if (mapParams.vizType === 'cartogram') {
  }
  if (mapParams.mapType === 'lisa') {
  }
  const shouldUseZero = mapParams.colorScale[0] === [240,240,240]
  for (let i = 0; i < geoids.length; i++) {
    joinData[geoids[i]] = {
      color: getContinuousColor(
        binData[i],
        bins.breaks,
        mapParams.colorScale,
        shouldUseZero,
      ),
      value: binData[i],
    };
  }

  return [joinData, maxDesirableHeight / Math.max(...binData)];
};

export function useLisaMap({
  geoda = {},
  currentData,
  dataForLisa,
  mapId = '',
  shouldUseLisa = false,
}) {
  const [lisaData, setLisaData] = useState({});
  const storedGeojson = useSelector((state) => state.storedGeojson);
  useMemo(async () => {
    if (
      shouldUseLisa &&
      typeof geoda === 'function' &&
      dataForLisa.length &&
      mapId.length
    ) {
      const weights =
        storedGeojson[currentData] &&
          'Queen' in storedGeojson[currentData].weights
          ? storedGeojson[currentData].Weights.Queen
          : await geoda.getQueenWeights(mapId);
      const lisaValues = await geoda.localMoran(weights, dataForLisa);
      setLisaData(lisaValues);
    } else {
      return null;
    }
  }, [
    typeof geoda,
    currentData,
    mapId,
    shouldUseLisa,
    JSON.stringify(currentData),
  ]);

  return lisaData;
}

export function useCartogramMap({
  geoda = {},
  mapId = '',
  dataForCartogram,
  shouldUseCartogram = false,
}) {
  const [cartoramData, setCartogramData] = useState({});

  useMemo(async () => {
    if (
      shouldUseCartogram &&
      typeof geoda === 'function' &&
      dataForCartogram.length &&
      mapId.length
    ) {
      let cartogramValues = await geoda
        .cartogram(mapId, dataForCartogram)
        .then((data) =>
          data.map((f, i) => ({ ...f, value: dataForCartogram[i] })),
        );
      setCartogramData(cartogramValues);
    }
  }, [
    JSON.stringify(dataForCartogram),
    shouldUseCartogram,
    mapId,
    typeof geoda,
  ]);

  return cartoramData;
}

const getAsyncBins = async (geoda, mapParams, binData) =>
  mapParams.mapType === 'natural_breaks'
    ? await geoda.naturalBreaks(mapParams.nBins, binData)
    : await geoda.hinge15Breaks(binData);

const shallowCompareNotIndex = (a, b) => {
  const keys= Object.keys(a);
  for (let i = 0; i < keys.length; i++) {
    if (a[keys[i]] !== b[keys[i]] && keys[i] !== 'nIndex' && keys[i] !== 'dIndex') return false;
  }
  return true;
};

function useGetBins({ mapParams, dataParams, binData, geoda, dataReady }) {
  const [bins, setBins] = useState({});
  const [binnedParams, setBinnedParams] = useState({
    mapParams: JSON.stringify(mapParams),
    dataParams: JSON.stringify(dataParams),
    dataReady,
    geoda: typeof geoda
  });

  useMemo(async () => {
    if (!dataReady) return;
    
    if (bins.bins){
      if (
        (binnedParams.mapParams === JSON.stringify(mapParams)
          && binnedParams.dataReady === dataReady
          && (binnedParams.geoda === typeof geoda && typeof geoda === 'function')
          && (binnedParams.dataParams === JSON.stringify(dataParams)))) {
        return {}
      }

      if (mapParams.binMode !== 'dynamic' && shallowCompareNotIndex(JSON.parse(binnedParams.dataParams), dataParams)) {
        return {}
      }
    }
    if (mapParams.mapType === 'lisa') {
      setBins(fixedScales['lisa']);
      setBinnedParams({
        mapParams: JSON.stringify(mapParams),
        dataParams: JSON.stringify(dataParams),
        dataReady,
        geoda: typeof geoda
      })
    } else if (dataParams.fixedScale !== null && dataParams.fixedScale !== undefined && fixedScales[dataParams.fixedScale]) {
      setBins(fixedScales[dataParams.fixedScale]);
      setBinnedParams({
        mapParams: JSON.stringify(mapParams),
        dataParams: JSON.stringify(dataParams),
        dataReady,
        geoda: typeof geoda
      })
    } else if (typeof geoda === 'function') {
      const nb = await getAsyncBins(geoda, mapParams, binData);
      setBins({
        bins:
          mapParams.mapType === 'natural_breaks'
            ? nb
            : [
              'Lower Outlier',
              '< 25%',
              '25-50%',
              '50-75%',
              '>75%',
              'Upper Outlier',
            ],
        breaks: nb,
      });
      setBinnedParams({
        mapParams: JSON.stringify(mapParams),
        dataParams: JSON.stringify(dataParams),
        dataReady,
        geoda: typeof geoda
      })
    }
    return {};
  }, [JSON.stringify(mapParams), JSON.stringify(dataParams), typeof geoda, dataReady]); //todo update depenency array if needed for some dataparam roperties
  return bins;
}

export default function useMapData({ }) {
  const dataParams = useSelector((state) => state.dataParams);
  const currentData = useSelector((state) => state.currentData);
  const mapParams = useSelector((state) => state.mapParams);
  const {
    geojsonData,
    numeratorData,
    denominatorData,
    dateIndices,
    dataReady,
  } = useLoadData();
  const dispatch = useDispatch();
  const {
    geoda,
    geodaReady
  } = useGeoda();

  const binIndex =
    dateIndices !== null
      ? mapParams.binMode === 'dynamic' &&
        dateIndices?.indexOf(dataParams.nIndex) !== -1
        ? dataParams.nIndex
        : dateIndices.slice(-1)[0]
      : null;

  const binData = useMemo(
    () =>
      getDataForBins({
        numeratorData:
          dataParams.numerator === 'properties'
            ? geojsonData?.properties
            : numeratorData?.data,
        denominatorData:
          dataParams.denominator === 'properties'
            ? geojsonData?.properties
            : denominatorData?.data,
        dataParams,
        binIndex,
        fixedOrder:
          geojsonData?.order?.indexOrder &&
          Object.values(geojsonData.order.indexOrder),
        dataReady,
      }),
    [
      JSON.stringify(dataParams),
      JSON.stringify(mapParams),
      binIndex,
      dataReady,
    ],
  );

  const bins = useGetBins({
    mapParams,
    dataParams,
    binData,
    geoda,
    dataReady,
  });

  const lisaData = useLisaMap({
    geoda,
    currentData,
    dataForLisa: binData,
    mapId: geojsonData?.mapId,
    shouldUseLisa: dataReady && mapParams.mapType === 'lisa',
  });

  const cartogramData = useCartogramMap({
    mapId: geojsonData?.mapId,
    dataForCartogram: binData,
    shouldUseCartogram: dataReady && mapParams.mapType === 'cartogram',
  });

  const [colorAndValueData, heightScale] = useMemo(
    () =>
      generateJoinData({
        binData,
        bins,
        lisaData,
        cartogramData,
        mapParams,
        dataParams,
        order: geojsonData?.order?.indexOrder,
        dataReady,
      }),
    [
      JSON.stringify(mapParams),
      JSON.stringify(dataParams),
      dataReady,
      bins,
      JSON.stringify(lisaData),
      JSON.stringify(cartogramData),
    ],
  );
  
  return [
    geojsonData?.data, // geography
    colorAndValueData, // color and value data
    getVarId(currentData, dataParams, mapParams, dataReady), // string params for updater dep arrays
    bins, // bins for legend etc,
    heightScale, // height scale
    !(dataReady && bins?.breaks && Object.keys(colorAndValueData).length),
  ];
}
