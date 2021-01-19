const colLookup = (columns, dataset, table, property) => {
    try {
        return columns[dataset][table].indexOf(property); 
    } catch {
        return null;
    }
}
export default colLookup;