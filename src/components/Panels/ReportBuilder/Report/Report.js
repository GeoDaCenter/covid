import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReportPage from "../ReportPage/ReportPage";
import { LayoutContainer } from "./LayoutContainer";
import { MetaButtonsContainer, MetaButton } from "./MetaButtons";
import useGetNeighbors from "../../../../hooks/useGetNeighbors";
// import { templates } from "./Templates";

export default function Report({
  reportName = "",
}) {
  const dispatch = useDispatch();
  const report = useSelector(({ report }) => report.reports[reportName]) || {};
  const pages = report?.spec || [];
  const county = report?.county || {};
  const date = report?.date || {};
  const gridContext = useRef({});
  const geoid = report?.county?.value;
  const currentData = "county_usfacts.geojson";
  const [neighbors, secondOrderNeighbors, stateNeighbors] = useGetNeighbors({
    geoid,
    currentData,
  });

  console.log(neighbors, secondOrderNeighbors, stateNeighbors)
  const handleAddPage = () =>
    dispatch({
      type: "ADD_REPORT_PAGE",
      payload: reportName,
    });

  const handleResetPages = () => {}; 
  const handleAddItem = (pageIdx, item) =>
    dispatch({
      type: "ADD_REPORT_ITEM",
      payload: {
        reportName,
        pageIdx,
        item,
      },
    });

  const handleChange = (pageIdx, itemIdx, props) =>
    dispatch({
      type: "CHANGE_REPORT_ITEM",
      payload: {
        reportName,
        pageIdx,
        itemIdx,
        props,
      },
    });

  const handleRemove = (pageIdx, itemIdx) =>
    dispatch({
      type: "DELETE_REPORT_ITEM",
      payload: {
        reportName,
        pageIdx,
        itemIdx,
      },
    });

  const handleToggle = (pageIdx, itemIdx, prop) =>
    dispatch({
      type: "TOGGLE_REPORT_ITEM",
      payload: {
        reportName,
        pageIdx,
        itemIdx,
        prop,
      },
    });

  const handleGridContext = (grid, pageIdx) => {
    gridContext.current = {
      ...gridContext.current,
      [pageIdx]: grid,
    };
  };

  const handleGridUpdate = (pageIdx) => {
    const currItems = gridContext?.current[pageIdx]?._items;
    const currItemsOrder = currItems.map((item) => item._id);
    const itemsMin = Math.min(...currItemsOrder);
    dispatch({
      type: "REORDER_REPORT_ITEMS",
      payload: {
        reportName,
        pageIdx,
        itemsMin,
        currItemsOrder,
      },
    });
  };

  return (
    <LayoutContainer>
      {pages.map((page, idx) => (
        <ReportPage
          content={page}
          pageIdx={idx}
          geoid={county.value}
          name={county.label}
          date={date.label}
          dateIndex={date.value}
          {...{
            handleToggle,
            handleChange,
            handleRemove,
            handleAddItem,
            handleGridContext,
            handleGridUpdate,
            reportName
          }}
        />
      ))}
      <MetaButtonsContainer>
        <MetaButton onClick={handleAddPage}>Add New Page</MetaButton>
        <MetaButton reset={true} onClick={handleResetPages}>
          Reset Template
        </MetaButton>
      </MetaButtonsContainer>
    </LayoutContainer>
  );
}
