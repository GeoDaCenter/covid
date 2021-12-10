import React, { useMemo, useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useLoadData from './useLoadData';
import { GeoDaContext } from '../contexts/GeoDaContext';
import { getVarId, getDataForBins } from '../utils';
import { fixedScales } from '../config/scales';
// function getAndCacheWeights
// function getAndCacheCentroids
const maxDesirableHeight = 500_000;

const getContinuousColor = (val, breaks, colors, useZero = false) => {
  if (useZero && val === 0) return colors[0];
  if (val === null || val === undefined) return [50, 50, 50];
  for (let i = 0; i < breaks.length; i++) {
    if (val <= breaks[i]) return colors[i + 1];
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
  if (!dataReady || !bins.breaks) return [undefined, undefined];
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
  for (let i = 0; i < geoids.length; i++) {
    joinData[geoids[i]] = {
      color: getContinuousColor(
        binData[i],
        bins.breaks,
        mapParams.colorScale,
        true,
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

function useGetBins({ mapParams, dataParams, binData, geoda, dataReady }) {
  const [bins, setBins] = useState({});
  useMemo(async () => {
    if (!dataReady) return {};

    if (dataParams.fixedScale !== null && dataParams.fixedScale !== undefined) {
      setBins(fixedScales[dataParams.fixedScale]);
    }
    if (mapParams.mapType === 'lisa') {
      setBins(fixedScales['lisa']);
    }
    if (typeof geoda === 'function') {
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
    }
    return {};
  }, [JSON.stringify(mapParams), typeof geoda, dataReady]); //todo update depenency array if needed for some dataparam roperties

  return bins;
}

export default function useMapData({}) {
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
  const geoda = useContext(GeoDaContext);

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
        dataParams: {
          ...dataParams,
          nIndex: binIndex,
          dIndex: dataParams.dType === 'time-series' ? binIndex : null,
        },
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
