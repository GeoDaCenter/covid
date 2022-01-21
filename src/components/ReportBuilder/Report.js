import { useState, useRef } from "react";
import styled from "styled-components";
import colors from "../../config/colors";
import ReportPage from "./ReportPage";

const LayoutContainer = styled.div`
  overflow-y: scroll;
  max-height: 80vh;
  margin-top: 1em;
  ::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #2b2b2b;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: url("${process.env.PUBLIC_URL}/icons/grip.png"), #999;
    background-position: center center;
    background-repeat: no-repeat, no-repeat;
    background-size: 50%, 100%;
    transition: 125ms all;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: url("${process.env.PUBLIC_URL}/icons/grip.png"), #f9f9f9;
    background-position: center center;
    background-repeat: no-repeat, no-repeat;
    background-size: 50%, 100%;
  }
`;

const MetaButtonsContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
`;
const MetaButton = styled.button`
  background: none;
  color: ${(props) => (props.reset ? colors.strongOrange : "white")};
  border: 1px solid ${(props) => (props.reset ? colors.strongOrange : "white")};
  padding: 0.25em 0.5em;
  margin-right: ${(props) => (props.reset ? "0" : "1em")};
  cursor: pointer;
`;

const templates = {
  "My County's Stats": [
    [
      {
        type: 'text',
        width: 4,
        height: 1,
        content: ({name}) => <h2>7-Day Average Report: {name}</h2>
      },
      {
        type: "textReport",
        width: 2,
        height: 3,
      },
      {
        type: "lineChart",
        width: 2,
        height: 3,
      },
      {
        type: 'table',
        topic: 'COVID',
        width: 2,
        height: 3,
      },
      {
        type: 'table',
        topic: 'SDOH',
        width: 2,
        height: 3,
      }
    ],
  ],
  "A National Snapshot": [
    [
      {
        type: "textReport",
        width: 2,
        height: 2,
      },
    ],
  ],
  "My Region's Snapshot": [
    [
      {
        type: "textReport",
        width: 2,
        height: 2,
      },
    ],
  ],
  "My Neighboring County's Stats": [
    [
      {
        type: "textReport",
        width: 2,
        height: 2,
      },
    ],
  ],
  "Something Else (Blank Report)": [[]],
};

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
