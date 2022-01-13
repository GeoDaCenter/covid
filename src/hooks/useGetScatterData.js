import { useMemo } from "react";
import { useSelector } from "react-redux";
import { stitch } from "../utils";
import { useDataStore } from "../contexts/Data";
import useGetVariable from "./useGetVariable";

export default function useGetScatterData({ xAxisVar, yAxisVar }) {
  const [{ storedGeojson }] = useDataStore();
  // pieces of redux state
  const currentData = useSelector((state) => state.currentData);
  const geojsonData = storedGeojson[currentData];
  const xData = useGetVariable({
    variable: xAxisVar,
  });
  const yData = useGetVariable({
    variable: yAxisVar,
  });
  const scatterData = useMemo(
    () =>
      stitch(
        xData,
        yData,
        geojsonData?.order?.indexOrder &&
          Object.values(geojsonData.order.indexOrder)
      ),
    [JSON.stringify(xData), JSON.stringify(yData)]
  );
  return {
    scatterData,
  };
}
