import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { stitch } from "../utils";
import useGetVariable from "./useGetVariable";

export default function useGetScatterData({ xAxisVar, yAxisVar }) {
  const storedGeojson = useSelector(({ data }) => data.storedGeojson);
  // pieces of redux state
  const currentData = useSelector(({params}) => params.currentData);
  const geojsonData = storedGeojson[currentData];
  const [data, setData] = useState({
    data: [],
    timestamp: null,
  });
  const xData = useGetVariable({
    variable: xAxisVar,
  });
  const yData = useGetVariable({
    variable: yAxisVar,
  });

  useEffect(() => {
    if (xData?.length && yData?.length) {
      setData(stitch(
        xData,
        yData,
        geojsonData?.order?.indexOrder &&
          Object.values(geojsonData.order.indexOrder)
      ));
    }
  }, [JSON.stringify(xData), JSON.stringify(yData)])

  return {
    scatterData: data.data,
    timestamp: data.timestamp,
  };
}
