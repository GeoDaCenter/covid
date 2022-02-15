import { TextReport } from "./TextReport";
import { TextContainerReport } from "./TextContainerReport";
import { LineChartReport } from "./LineChartReport"
import { TableReport } from "./TableReport";
import { ScatterChartReport } from "./ScatterChartReport";
import MapReport from "./MapReport";
import { useDispatch, useSelector } from "react-redux";

const mapping = {
  textReport: TextReport,
  text: TextContainerReport,
  lineChart: LineChartReport,
  table: TableReport,
  scatterChart: ScatterChartReport,
  map: MapReport
};

export default function ReportComponentMapping({ itemId, pageIdx, reportName }) {
  const dispatch = useDispatch();
  const meta = useSelector(({ report }) => report.reports[reportName] && report.reports[reportName].meta)
  const itemProps = useSelector(({ report }) => report.reports[reportName] && report.reports[reportName].items && report.reports[reportName].items[itemId])

  const handleChange = (props) => { }
  // dispatch({
  //   type: "CHANGE_REPORT_ITEM",
  //   payload: {
  //     reportName,
  //     pageIdx,
  //     // itemIdx,
  //     props,
  //   },
  // });

  const handleRemove = (pageIdx, itemIdx) => { }
  // dispatch({
  //   type: "DELETE_REPORT_ITEM",
  //   payload: {
  //     reportName,
  //     pageIdx,
  //     // itemIdx,
  //   },
  // });

  const handleToggle = (pageIdx, itemIdx, prop) => { }
  // dispatch({
  //   type: "TOGGLE_REPORT_ITEM",
  //   payload: {
  //     reportName,
  //     pageIdx,
  //     // itemIdx,
  //     prop,
  //   },
  // });
  if (!itemProps) return null;

  const { type } = itemProps;
  const InnerEl = mapping[type];

  if (!InnerEl) return null;
  return <InnerEl {...{ ...meta, ...itemProps, handleRemove, handleToggle, handleChange }} />
}
