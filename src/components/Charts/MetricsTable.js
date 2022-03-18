// import useGetQuantileStatistics from "../../hooks/useGetQuantileStatistics";

const Th = ({ children, ...props }) => <th {...props}>{children}</th>;
const Td = ({ children, ...props }) => <td {...props}>{children}</td>;
const TableEntry = ({ type, items, cellProps, rowProps }) => {
    const Cell = type === 'body' ? Td : Th;
    return (
        <tr {...rowProps}>
            {items.map((item, idx) => (
                <Cell {...cellProps} key={`cell-entry-${idx}`}>{item}</Cell>
            ))}
        </tr>
    );
};

export const Table = ({ children, ...props }) => <table {...props}><tbody>{children}</tbody></table>;
export const TableHeader = (props) => <TableEntry type="header" {...props} />;
export const TableRow = (props) => <TableEntry type="body" {...props} />;

// const MetricsRow = ({ metric, geoid, neighborIds, includedColumns, dateIndex, dataset, getStateStats, ...props }) => {
//     const data = useGetQuantileStatistics({
//         variable: metric,
//         dataset,
//         geoid,
//         getStateStats,
//         neighborIds,
//         dateIndex,
//     });
//     const dataReady = Object.keys(data).length;
//     const items = dataReady ? includedColumns.map(column => data[column]) : []
//     return dataReady ? <TableRow {...{ items, ...props }} /> : null
// }

export const MetricsTable = ({ tableProps={}, rowProps={}, metrics=[], includedColumns=[], ...props }) => {
    // console.log(props)
    return null
    // const headers = includedColumns.map(f=>f.header);
    // const accessors = includedColumns.map(f=>f.accessor);
    // return <Table {...{tableProps}}>
    //     <TableHeader items={headers} {...{rowProps}} />
    //     {metrics.map((metric,idx) => <MetricsRow key={`${metric}-table-row-${idx}`} {...{ metric, includedColumns: accessors, rowProps, ...props }} />)}
    // </Table>
};
