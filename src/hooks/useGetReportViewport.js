import { useMemo } from "react";
import bbox from "@turf/bbox";
import { fitBounds } from "@math.gl/web-mercator";
import useGetNeighbors from "./useGetNeighbors";
const DEFAULT_VIEWPORT = {
  latitude: 0,
  longitude: 0,
  zoom: 4,
  bearing: 0,
  pitch: 0,
};
export default function useGetReportViewport({
  viewportType = "county",
  geoid = 17031,
  margin = 0.1,
  currentData = "",
  geojsonData,
  mapIdCol,
  mapWidth,
  mapHeight,
}) {
  const [neighbors, secondOrderNeighbors, stateNeighbors] = useGetNeighbors({
    geoid,
    currentData
  });

  const nationalViewport = useMemo(() => {
    if (!!mapWidth && !!mapHeight){
      const bounds = fitBounds({
        width: mapWidth,
        height: mapHeight,
        bounds: [[-125.109215,25.043926],[-66.925621,49.295128]]
      })
      return {...bounds, zoom: bounds.zoom*.85}
    } 
    return DEFAULT_VIEWPORT}
  , [mapWidth, mapHeight]);

  const [countyViewport, neighborsViewport, secondOrderViewport, stateViewport] =
    geojsonData?.data?.features?.length &&
    neighbors?.length &&
    secondOrderNeighbors?.length &&
    stateNeighbors?.length
      ? [[geoid],neighbors, secondOrderNeighbors, stateNeighbors].map(
          (neighborList) => {
            if (!neighborList || !neighborList?.length) return null;
            const tempBbox = bbox({
              ...geojsonData.data,
              features: geojsonData.data.features.filter((f) =>
                neighborList.includes(+f.properties[mapIdCol])
              ),
            });
            if (!tempBbox || !tempBbox?.length) return DEFAULT_VIEWPORT;
            try {
              const bounds = fitBounds({
                width: mapWidth,
                height: mapHeight,
                bounds: [
                  [tempBbox[0], tempBbox[1]],
                  [tempBbox[2], tempBbox[3]],
                ],
              });
              return {
                ...bounds,
                zoom: bounds.zoom * (1 - margin),
                pitch: 0,
                bearing: 0,
              };
            } catch {
              return DEFAULT_VIEWPORT;
            }
          }
        )
      : [DEFAULT_VIEWPORT, DEFAULT_VIEWPORT, DEFAULT_VIEWPORT];

  return [countyViewport, neighborsViewport, secondOrderViewport, stateViewport, nationalViewport, neighbors, secondOrderNeighbors, stateNeighbors];
}
