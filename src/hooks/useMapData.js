import React, { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import useLoadData from "./useLoadData";
import { useGeoda } from "../contexts/Geoda";
import { getVarId, getDataForBins } from "../utils";
import { fixedScales } from "../config/scales";
import { useDataStore } from "../contexts/Data";
import { colorScales } from "../config/scales";
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
  if (!dataReady || (mapParams.mapType !== 'lisa' && !bins.breaks) || (mapParams.mapType === 'lisa' && !lisaData.length)) return [{}, undefined];
  const geoids = Object.values(order);

  // const getColor = getColorFunction(mapParams.mapType)
  // const mapFn = getMapFunction(mapParams.mapType, dataParams.numerator)
  // const getHeight = dataParams.variableName.toLowerCase().includes("percent")
  //     ? getPctHeight
  //     : getStandardHeight
  let joinData = {};
  if (mapParams.vizType === "cartogram") {
  } else if (mapParams.mapType === "lisa") {
    console.log(' generating lisa data')
    for (let i = 0; i < geoids.length; i++) {
      joinData[geoids[i]] = {
        color: colorScales.lisa[lisaData[i]],
        value: binData[i],
      };
    }
  } else {
    const shouldUseZero = mapParams.colorScale[0] === [240, 240, 240];
    for (let i = 0; i < geoids.length; i++) {
      joinData[geoids[i]] = {
        color: getContinuousColor(
          binData[i],
          bins.breaks,
          mapParams.colorScale,
          shouldUseZero
        ),
        value: binData[i],
      };
    }
  }
  return [joinData, maxDesirableHeight / Math.max(...binData)];
};
const getLisa = async (currentGeojson, geoda, dataForLisa) => {
  const weights =
    currentGeojson && "Queen" in currentGeojson.weights
      ? currentGeojson.weights.Queen
      : await geoda.getQueenWeights(currentGeojson.mapId);
  const lisaValues = await geoda.localMoran(weights, dataForLisa);

  return {
    lisaValues,
    shouldCacheWeights: !("Queen" in currentGeojson.weights),
    weights,
  };
};

export function useLisaMap({
  currentData,
  dataForLisa = [],
  shouldUseLisa = false,
  varId,
}) {
  const { geoda, geodaReady } = useGeoda();
  const [{ storedGeojson }, dataDispatch] = useDataStore();
  const [data, setData] = useState({
    lisaData: [],
    lisaVarId: '',
  });
  useEffect(() => {
    if (
      shouldUseLisa &&
      geodaReady &&
      dataForLisa.length &&
      storedGeojson[currentData]
    ) {
      getLisa(storedGeojson[currentData], geoda, dataForLisa).then(
        ({ lisaValues, shouldCacheWeights, weights }) => {
          setData({
            lisaData: lisaValues.clusters,
            lisaVarId: varId,
          });
          if (shouldCacheWeights) {
            dataDispatch({
              type: "ADD_WEIGHTS",
              payload: {
                id: currentData,
                weights,
              },
            });
          }
        }
      );
    } else {
      return null;
    }
  }, [geodaReady, currentData, shouldUseLisa, varId]);
  return [
    data.lisaData,
    data.lisaVarId    
  ]
}

export function useCartogramMap({
  geoda = {},
  mapId = "",
  dataForCartogram,
  shouldUseCartogram = false,
}) {
  const [cartoramData, setCartogramData] = useState({});

  useMemo(async () => {
    if (
      shouldUseCartogram &&
      typeof geoda === "function" &&
      dataForCartogram.length &&
      mapId.length
    ) {
      let cartogramValues = await geoda
        .cartogram(mapId, dataForCartogram)
        .then((data) =>
          data.map((f, i) => ({ ...f, value: dataForCartogram[i] }))
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
  mapParams.mapType === "natural_breaks"
    ? await geoda.naturalBreaks(mapParams.nBins, binData)
    : await geoda.hinge15Breaks(binData);

function useGetBins({
  currentData,
  mapParams,
  dataParams,
  binData,
  geoda,
  dataReady,
}) {
  const [bins, setBins] = useState({});
  const [binnedParams, setBinnedParams] = useState({
    mapParams: JSON.stringify(mapParams),
    dataParams: JSON.stringify(dataParams),
    dataReady,
    geoda: typeof geoda,
    currentData: null,
  });

  useEffect(() => {
    if (!dataReady) return;

    // if you already have bins....
    if (bins.bins && binnedParams.currentData === currentData) {
      if (
        binnedParams.mapParams === JSON.stringify(mapParams) &&
        binnedParams.dataReady === dataReady &&
        binnedParams.geoda === typeof geoda &&
        typeof geoda === "function" &&
        binnedParams.dataParams === JSON.stringify(dataParams)
      ) {
        console.log("same params");
        return;
      }

      if (
        mapParams.binMode !== "dynamic" &&
        JSON.stringify({
          ...JSON.parse(binnedParams.mapParams),
          ...JSON.parse(binnedParams.dataParams),
          dIndex: 0,
          nIndex: 0,
        }) ===
          JSON.stringify({ ...mapParams, ...dataParams, dIndex: 0, nIndex: 0 })
      ) {
        // console.log("diff params, not dynamic");
        return;
      }
    }
    if (mapParams.mapType === "lisa") {
      setBins(fixedScales["lisa"]);
      setBinnedParams({
        mapParams: JSON.stringify(mapParams),
        dataParams: JSON.stringify(dataParams),
        dataReady,
        geoda: typeof geoda,
        currentData,
      });
    } else if (
      dataParams.fixedScale !== null &&
      dataParams.fixedScale !== undefined &&
      fixedScales[dataParams.fixedScale]
    ) {
      setBins(fixedScales[dataParams.fixedScale]);
      setBinnedParams({
        mapParams: JSON.stringify(mapParams),
        dataParams: JSON.stringify(dataParams),
        dataReady,
        geoda: typeof geoda,
        currentData,
      });
    } else if (typeof geoda === "function") {
      // console.log("generating bins");
      getAsyncBins(geoda, mapParams, binData).then((nb) => {
        setBins({
          bins:
            mapParams.mapType === "natural_breaks"
              ? nb
              : [
                  "Lower Outlier",
                  "< 25%",
                  "25-50%",
                  "50-75%",
                  ">75%",
                  "Upper Outlier",
                ],
          breaks: nb,
        });
        setBinnedParams({
          mapParams: JSON.stringify(mapParams),
          dataParams: JSON.stringify(dataParams),
          dataReady,
          geoda: typeof geoda,
          currentData,
        });
      });
    }
    return {};
  }, [
    JSON.stringify(mapParams),
    JSON.stringify(dataParams),
    typeof geoda,
    dataReady,
  ]); //todo update depenency array if needed for some dataparam roperties
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
  const { geoda, geodaReady } = useGeoda();
  const [mapSnapshot, setMapSnapshot] = useState(0);
  const varId = getVarId(currentData, dataParams, mapParams, dataReady);

  const binIndex =
    dateIndices !== null
      ? mapParams.binMode === "dynamic" &&
        dateIndices?.indexOf(dataParams.nIndex) !== -1
        ? dataParams.nIndex
        : dateIndices.slice(-1)[0]
      : null;

  const binData = useMemo(
    () =>
      getDataForBins({
        numeratorData:
          dataParams.numerator === "properties"
            ? geojsonData?.properties
            : numeratorData?.data,
        denominatorData:
          dataParams.denominator === "properties"
            ? geojsonData?.properties
            : denominatorData?.data,
        dataParams,
        binIndex,
        fixedOrder:
          geojsonData?.order?.indexOrder &&
          Object.values(geojsonData.order.indexOrder),
        dataReady,
      }),
    [JSON.stringify(dataParams), JSON.stringify(mapParams), binIndex, dataReady]
  );

  const bins = useGetBins({
    currentData,
    mapParams,
    dataParams,
    binData,
    geoda,
    dataReady,
  });

  const [
    lisaData,
    lisaVarId    
  ] = useLisaMap({
    currentData,
    dataForLisa: binData,
    mapId: geojsonData?.mapId,
    shouldUseLisa: dataReady && mapParams.mapType === "lisa",
    varId,
  });

  const cartogramData = useCartogramMap({
    mapId: geojsonData?.mapId,
    dataForCartogram: binData,
    shouldUseCartogram: dataReady && mapParams.mapType === "cartogram",
  });

  const [colorAndValueData, heightScale] = useMemo(() => {
    const data = generateJoinData({
      binData,
      bins,
      lisaData,
      cartogramData,
      mapParams,
      dataParams,
      order: geojsonData?.order?.indexOrder,
      dataReady,
    });
    !!data && setMapSnapshot(`${new Date().getTime()}`.slice(-6));
    return data;
  }, [
    mapParams.binMode !== 'dynamic' && mapParams.mapType === 'natural_breaks' && dataParams.nIndex,
    dataReady,
    // JSON.stringify(dataParams),
    JSON.stringify(bins),
    mapParams.mapType === 'lisa' && lisaVarId,
    // JSON.stringify(cartogramData),
  ]);

  return [
    geojsonData?.data, // geography
    colorAndValueData, // color and value data
    mapSnapshot, // string params for updater dep arrays
    bins, // bins for legend etc,
    heightScale, // height scale
    !(dataReady && bins?.breaks && Object.keys(colorAndValueData).length),
  ];
}
