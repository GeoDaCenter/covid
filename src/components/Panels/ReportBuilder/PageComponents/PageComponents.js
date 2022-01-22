import { TextReport } from "./TextReport";
import { TextContainerReport } from "./TextContainerReport";
import { LineChartReport } from "./LineChartReport"
import { TableReport } from "./TableReport";
import { ScatterChartReport } from "./ScatterChartReport";

const mapping = {
  textReport: TextReport,
  text: TextContainerReport,
  lineChart: LineChartReport,
  table: TableReport,
  scatterChart: ScatterChartReport,
};

export default function ReportComponentMapping(props) {
  const { type } = props;
  const InnerEl = mapping[type];
  if (!InnerEl) return null;
  return <InnerEl {...props} />;
}
