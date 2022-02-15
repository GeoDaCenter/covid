import React, { useMemo, useState, useRef, useEffect } from "react";
import ReportComponentMapping from "../PageComponents/PageComponents";
import { useDispatch } from "react-redux";
import { Responsive, WidthProvider } from "react-grid-layout";

import { Icon } from "../../../../components";
import { AvailableModulesList } from "./AvailableModules";
import {
  AddItemButton,
  LayoutPageContainer,
  DateWaterMark,
  AtlasWaterMark,
  Attribution
} from "./ReportPageLayout";
import { useSelector } from "react-redux";

const ResponsiveGridLayout = WidthProvider(Responsive);
// const options = {
//   layoutDuration: 400,
//   dragRelease: {
//     duration: 400,
//     easing: "ease-out",
//   },
//   dragEnabled: true,
//   dragContainer: document.body,
//   // The placeholder of an item that is being dragged.
//   dragPlaceholder: {
//     enabled: true,
//     createElement: function (item) {
//       // The element will have the Css class ".muuri-item-placeholder".
//       return item.getElement().cloneNode(true);
//     },
//   },
// };

export default function ReportPage({
  pageIdx,
  pageWidth,
  reportName,
  onMount
}) {
  const dispatch = useDispatch();
  const [isSettled, setIsSettled] = useState(false)
  const [openAddItem, setOpenAddItem] = useState(false);
  const toggleOpenAddItem = () => setOpenAddItem((prev) => !prev);
  const initialLayout = useSelector(({ report }) => report.reports[reportName] && report.reports[reportName].layout && report.reports[reportName].layout[pageIdx])
  const layout = useMemo(() => initialLayout, [initialLayout.length])
  const pageRef = useRef(null);

  useEffect(() => {
    onMount(pageRef, pageIdx)
    setIsSettled(true)
  }, [pageIdx])

  const handleAddItem = (pageIdx, item) =>
    dispatch({
      type: "ADD_REPORT_ITEM",
      payload: {
        reportName,
        pageIdx,
        item,
      },
    });
    
  return (
    <LayoutPageContainer ref={pageRef} {...{ pageWidth }}>
      {isSettled && <ResponsiveGridLayout
        className="layout"
        layouts={{
          lg: layout,
          md: layout,
          sm: layout,
          xs: layout,
          xxs: layout
        }}
        layout={layout}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 4, md: 4, sm: 4, xs: 4, xxs: 4 }}
        rowHeight={160}
        draggableHandle={'.content-header'}
        autoSize={false}
        onLayoutChange={(e) => console.log(e)}
        isDraggable
        compactType="vertical"
        isRearrangeable
        isResizable
        resizeHandles={['se']}
      >
        {layout.map(({ i }) => (
          <div key={i}>

            <ReportComponentMapping
              key={i}
              itemId={i}
              {...{ pageIdx, reportName }}
            />
          </div>
        ))}

      </ResponsiveGridLayout>}

      <AddItemButton onClick={toggleOpenAddItem}>
        <Icon symbol="plus" /> Add to this page
      </AddItemButton>
      <DateWaterMark />
      <AtlasWaterMark />
      <Attribution />

      <AvailableModulesList
        handleAddItem={handleAddItem}
        handleClose={toggleOpenAddItem}
        pageIdx={pageIdx}
        open={openAddItem}
      />
    </LayoutPageContainer>
  );
}