import { useState } from "react";
import useGetQuantileStatistics from "../hooks/useGetQuantileStatistics";

export const SummaryStatistics = ({
  props=null
}) => {
  const [variable] = useState( //setVariable
    "Confirmed Count per 100K Population"
  );
  const { min, max, q25, q50, q75, geoidQ  }= useGetQuantileStatistics({
    variable,
  });

  // const data = [
  //   {
  //     label: "IQR",
  //     iqr1: [q25, q50],
  //     iqr2: [q50, q75],
  //   },
  // ];
  
  return (
    <div>
      {[
        min || "",
        max || "",
        q25 || "",
        q50 || "",
        q75 || "",
        geoidQ || "",
      ].join(",")}
    </div>
  );
};
