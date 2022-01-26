import React, { useState } from "react";
import ReportComponentMapping from "../PageComponents/PageComponents";
import { MuuriComponent } from "muuri-react";

import { Icon } from "../../../../components";
import { AvailableModulesList } from "./AvailableModules";
import {
  AddItemButton,
  LayoutPageContainer,
  DateWaterMark,
  AtlasWaterMark,
  Attribution
} from "./ReportPageLayout";

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
  content,
  geoid,
  date,
  dateIndex,
  pageIdx,
  handleRemove,
  handleChange,
  handleToggle,
  handleAddItem,
  handleGridContext,
  handleGridUpdate,
  name,
  reportName
}) {
  const [openAddItem, setOpenAddItem] = useState(false);
  const toggleOpenAddItem = () => setOpenAddItem((prev) => !prev);
  
  return (
    <LayoutPageContainer>
      <MuuriComponent
        key={JSON.stringify(content)}
        dragEnabled
        dragStartPredicate={{ handle: ".content-header" }}
        onDragEnd={() => handleGridUpdate(pageIdx)}
        onMount={(grid) => handleGridContext(grid, pageIdx)}
        instantLayout
        // {...options}
      >
        {content.map((item, index) => (
          <ReportComponentMapping
            {...{
              handleToggle,
              handleChange,
              handleRemove,
              pageIdx,
              geoid,
              name,
              date,
              index,
              dateIndex,
              reportName
            }}
            key={"page-component-" + index}
            contentIdx={index}
            {...item}
          />
        ))}
      </MuuriComponent>
      <DateWaterMark />
      <AtlasWaterMark />
      <Attribution />

      <AddItemButton onClick={toggleOpenAddItem}>
        <Icon symbol="plus" />
      </AddItemButton>
      {openAddItem && (
        <AvailableModulesList
          handleAddItem={handleAddItem}
          handleClose={toggleOpenAddItem}
          pageIdx={pageIdx}
        />
      )}
    </LayoutPageContainer>
  );
}
