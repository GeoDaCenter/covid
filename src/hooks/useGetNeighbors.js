import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGeoda } from "../contexts/Geoda";
import useGetGeojson from "./useGetGeojson";
import { findIn, onlyUniqueArray } from "../utils";

const getWeights = async (weights, mapId, geoda) => {
  if (weights && "Queen" in weights) {
    return {
      weights: weights.Queen,
      shouldCacheWeights: false,
    };
  } else {
    const weights = await geoda.getQueenWeights(mapId);
    return {
      weights,
      shouldCacheWeights: true,
    };
  }
};

const getNeighbors = async (weights, geoda, idx) => {
  const neighbors = await geoda.getNeighbors(weights, idx);
  const secondOrderNeighborsResult = await Promise.all(
    neighbors.map((f) => geoda.getNeighbors(weights, f))
  );
  const secondOrderNeighbors = secondOrderNeighborsResult
    .flat()
    .filter(onlyUniqueArray);
  return {
    neighbors,
    secondOrderNeighbors,
  };
};

export default function useGetNeighbors({ geoid = null, currentData, updateTrigger = null }) {
  const dispatch = useDispatch();
  const { geoda, geodaReady } = useGeoda();
  const storedGeojson = useSelector(({data}) => data.storedGeojson);  
  const datasets = useSelector(({params}) => params.datasets);
  const currDataset = findIn(datasets, "file", currentData);
  const [geojsonData] = useGetGeojson({
    geoda,
    geodaReady,
    currDataset,
    storedGeojson
  });
  const {
    geoidOrder,
    indexOrder
  } = geojsonData?.order || {};

  const {
    weights,
    mapId
  } = geojsonData || {};

  const [neighbors, setNeighbors] = useState({
    neighbors: [],
    secondOrderNeighbors: [],
    state: []
  });

  useEffect(() => {
    if (geoidOrder && geoid) {
      const index = geoidOrder[geoid];
      getWeights(weights, mapId, geoda).then(
        ({ weights, shouldCacheWeights }) => {
          getNeighbors(weights, geoda, index).then(
            ({ neighbors, secondOrderNeighbors }) => {
              setNeighbors({
                neighbors: neighbors.map((n) => indexOrder[n]),
                secondOrderNeighbors: secondOrderNeighbors.map(
                  (n) => indexOrder[n]
                ),
                state: Object.entries(geoidOrder)
                  .filter(
                    ([k]) => Math.floor(k / 1000) === Math.floor(geoid / 1000)
                  )
                  .map(([_, v]) => indexOrder[v]),
              });
            }
          );
          if (shouldCacheWeights) {
            dispatch({
              type: "ADD_WEIGHTS",
              payload: {
                id: currentData,
                weights,
              },
            });
          }
        }
      );
    }
  }, [geoid, currentData, geodaReady, updateTrigger]);

  return [neighbors.neighbors, neighbors.secondOrderNeighbors, neighbors.state];
}
