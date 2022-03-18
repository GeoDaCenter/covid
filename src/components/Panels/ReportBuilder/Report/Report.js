import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReportPage from "../ReportPage/ReportPage";
import {
  LayoutContainer,
  PrintContainer,
  PrintButton,
} from "./LayoutContainer";
import { MetaButtonsContainer, MetaButton } from "./MetaButtons";
// import useGetNeighbors from "../../../../hooks/useGetNeighbors";
// import { templates } from "./Templates";
export default function Report({ reportName = "", activeStep }) {
  const dispatch = useDispatch();
  // const report = useSelector(({report}) => report.reports[reportName])
  const pages = useSelector(({report}) => report.reports[reportName] && report.reports[reportName].layout && new Array(report.reports[reportName].layout.length).fill(null))
  // const geoid = useSelector(({report}) => report.reports[reportName] && report.reports[reportName].meta?.geoid)
  const gridContext = useRef({});
  const pagesRef = useRef({});
  const containerRef = useRef(null)
  // const currentData = "county_usfacts.geojson";
  const pageWidth = containerRef?.current?.clientWidth;

  // const [neighbors, secondOrderNeighbors, stateNeighbors] = useGetNeighbors({
  //   geoid,
  //   currentData,
  //   updateTrigger: JSON.stringify(reportName)
  // });

  const handleAddPage = () =>
    dispatch({
      type: "ADD_REPORT_PAGE",
      payload: reportName,
    });

  // const handleUpdateMeta = () =>
  //   dispatch({
  //     type: "UPDATE_REPORT_META",
  //     payload: {
  //       reportName,
  //       props: {neighbors, secondOrderNeighbors, stateNeighbors}
  //     }
  //   });

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

  const handleRef = (ref, idx) => {
    pagesRef.current = {
      ...pagesRef.current,
      [idx]: ref,
    };
  };

  const handlePrint = (fileType) => {
    import("react-component-export-image").then(
      ({ exportComponentAsJPEG, exportComponentAsPDF }) => {
        Object.values(pagesRef.current).forEach((pageRef, idx) => {
          try {
            if (fileType === "JPG") {
              exportComponentAsJPEG(pageRef, {
                fileName: `${reportName}-page-${idx+1}.jpg`,
              });
            } else if (fileType === "PDF") {
              exportComponentAsPDF(pageRef, {
                fileName: `${reportName}-page-${idx+1}.pdf`,
              });
            }
          } catch {
            console.log("error");
          }
        });
      }
    );
  };
  return (
    <LayoutContainer ref={containerRef}>
      {activeStep === 3 && (
        <PrintContainer>
          <h2>Nice work!</h2>
          <h4>
            Your report has been saved. On your current device, come back to
            this page any time and select your report name from the 'Previous
            Reports' drop down to see up-to-date data.
          </h4>
          <p>
            Currently, you may export your report pages as JPGs.
            We plan to add an export feature as a single PDF. To leave the
            report builder, click 'finish' below.
          </p>
          <p>
            This new feature is an experimental feature, and we'd love to hear
            your feedback. Send us a message on our{" "}
            <a
              href={`${process.env.PUBLIC_URL}/contact`}
              target="_blank"
              rel="noreferrer"
            >
              contact page.
            </a>
          </p>
          <PrintButton onClick={() => handlePrint("JPG")}>
            Export JPGs
          </PrintButton>
          {/* <PrintButton onClick={() => handlePrint("PDF")}>
            Export PDF
          </PrintButton> */}
        </PrintContainer>
      )}
      {!!pages && pages.map((_, pageIdx) => (
        <ReportPage
          onMount={handleRef}
          key={`report-page-${reportName}-${pageIdx}`}
          {...{handleGridContext, handleGridUpdate, pageIdx, reportName, pageWidth}}
        />
      ))}
      <MetaButtonsContainer>
        <MetaButton onClick={handleAddPage}>Add New Page</MetaButton>
        {/* <MetaButton reset={true} onClick={handleResetPages}>
          Reset Template
        </MetaButton> */}
      </MetaButtonsContainer>
    </LayoutContainer>
  );
}


  // const handleResetPages = () => dispatch({
  //   type: "RESET_REPORT",
  //   payload: {
  //     reportName
  //   },
  // });

  // const handleAddItem = (pageIdx, item) =>
  //   dispatch({
  //     type: "ADD_REPORT_ITEM",
  //     payload: {
  //       reportName,
  //       pageIdx,
  //       item,
  //     },
  //   });
