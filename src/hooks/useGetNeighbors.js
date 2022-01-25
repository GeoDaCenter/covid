import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useGeoda } from "../contexts/Geoda";
import { onlyUniqueArray } from "../utils";

const getWeights = async (currentGeojson, geoda) => {
  if (currentGeojson?.weights && "Queen" in currentGeojson.weights) {
    return {
      weights: currentGeojson.weights.Queen,
      shouldCacheWeights: false,
    };
  } else {
    const weights = await geoda.getQueenWeights(currentGeojson.mapId);
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
  )
  const secondOrderNeighbors = secondOrderNeighborsResult.flat().filter(onlyUniqueArray)
  return {
    neighbors,
    secondOrderNeighbors,
  };
};

export default function useGetNeighbors({
  geoid=17031,
  currentData,
  geojsonData,
}) {
  
  const dispatch = useDispatch();
  const [neighbors, setNeighbors] = useState({
    neighbors: [],
    secondOrderNeighbors: [],
    neighbors: []
  });

  const { geoda, geodaReady } = useGeoda();
  
  useEffect(() => {
    if (geojsonData?.order?.geoidOrder) {
      const index = geojsonData.order.geoidOrder[geoid];
      getWeights(geojsonData, geoda).then(({ weights, shouldCacheWeights }) => {
        getNeighbors(weights, geoda, index).then(
          ({neighbors, secondOrderNeighbors}) => {
              setNeighbors({
                  neighbors: neighbors.map(n => geojsonData.order.indexOrder[n]), 
                  secondOrderNeighbors: secondOrderNeighbors.map(n => geojsonData.order.indexOrder[n]),
                  state: Object.entries(geojsonData.order.geoidOrder).filter(([k]) => Math.floor(k/1000) === Math.floor(geoid/1000)).map(([_, v]) => geojsonData.order.indexOrder[v])
                })
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
      });
    }
  }, [geoid, currentData, geodaReady]);

  return [
    neighbors.neighbors,
    neighbors.secondOrderNeighbors,
    neighbors.state
  ];
}
