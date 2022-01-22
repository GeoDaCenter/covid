import { useMemo } from "react";
import useGetCovidStatistics from "../../../../hooks/useGetCovidStatistics";
import useGetSdohStatistics from "../../../../hooks/useGetSdohStatistics";
import { useTable } from "react-table";
import styled from "styled-components";

const TableContainer = styled.div``;

const Table = styled.table`
  border-collapse: collapse;

  tr,
  th,
  td {
    padding: 0.25em 0.5em;
  }
  tr:nth-child(even) {
    background: rgba(0, 0, 0, 0.05);
  }
  tr {
    td:nth-of-type(n + 2) {
      border-left: 1px solid rgba(0, 0, 0, 0.25);
    }
  }
`;
const StatsTableInner = ({ data, columns }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    });

  return (
    <TableContainer>
      <Table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableContainer>
  );
};

const CovidStatsTable = ({ geoid }) => {
  const [data, columns, dataReady] = useGetCovidStatistics({
    geoid,
  });

  const innerTable = useMemo(
    () => <StatsTableInner data={data} columns={columns} />,
    [dataReady, geoid]
  );
  return innerTable;
};

const SdohStatsTable = ({ geoid }) => {
  const [data, columns, dataReady] = useGetSdohStatistics({
    geoid,
  });

  const innerTable = useMemo(
    () => <StatsTableInner data={data} columns={columns} />,
    [dataReady, geoid]
  );
  return innerTable;
};

export default function StatsTable({ geoid = 17031, topic = "COVID" }) {
  console.log(topic)
  switch (topic) {
    case "COVID":
      return <CovidStatsTable geoid={geoid} />;
    case "SDOH":
      return <SdohStatsTable geoid={geoid} />;
    default:
      return null;
  }
}
