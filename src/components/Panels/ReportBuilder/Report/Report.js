import { useState, useRef } from "react";
import ReportPage from "../ReportPage/ReportPage";
import { LayoutContainer } from "./LayoutContainer";
import { MetaButtonsContainer, MetaButton } from "./MetaButtons";
import { templates } from "./Templates";

export default function Report({ county = {}, selectedTemplate = "" }) {
  const [pages, setPages] = useState(templates[selectedTemplate] || [[]]);
  const handleAddPage = () => setPages((pages) => [...pages, []]);
  const handleResetPages = () => setPages(templates[selectedTemplate] || [[]]);
  const gridContext = useRef({});
  const handleAddItem = (pageIdx, item) =>
    setPages((pages) => {
      let prevPages = [...pages];
      prevPages[pageIdx] = [...prevPages[pageIdx], item];
      return prevPages;
    });

  const handleChange = (pageIdx, itemIdx, props) =>
    setPages((pages) => {
      let prevPages = [...pages];
      prevPages[pageIdx][itemIdx] = {
        ...prevPages[pageIdx][itemIdx],
        ...props,
      };
      return prevPages;
    });

  const handleRemove = (pageIdx, itemIdx) =>
    setPages((pages) => {
      let prevPages = [...pages];
      prevPages[pageIdx] = [
        ...prevPages[pageIdx].slice(0, itemIdx),
        ...prevPages[pageIdx].slice(itemIdx + 1),
      ];
      return prevPages;
    });

  const handleToggle = (pageIdx, itemIdx, prop) =>
    setPages((pages) => {
      let prevPages = [...pages];
      prevPages[pageIdx][itemIdx][prop] = !prevPages[pageIdx][itemIdx][prop];
      return prevPages;
    });

  const handleGridContext = (grid, pageIdx) => {
    gridContext.current = {
      ...gridContext.current,
      [pageIdx]: grid,
    }
  }

  const handleGridUpdate = (pageIdx) => {
    const currItems = gridContext?.current[pageIdx]?._items;
    const currItemsOrder = currItems.map(item => item._id);
    const itemsMin = Math.min(...currItemsOrder);
    
    setPages((pages) => {
      let tempPages = [...pages];
      tempPages[pageIdx] = currItemsOrder.map(idx => tempPages[pageIdx][idx - itemsMin]);
      return tempPages;
    })
  }

  return (
    <LayoutContainer>
      {pages.map((page, idx) => (
        <ReportPage
          content={page}
          pageIdx={idx}
          geoid={county.value}
          name={county.label}
          {...{ handleToggle, handleChange, handleRemove, handleAddItem, handleGridContext, handleGridUpdate }}
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
