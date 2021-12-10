export default function findTableDetails(fileName, defaultTables, allTables) {
  const defaultGeographies = Object.keys(defaultTables);

  for (let i = 0; i < defaultGeographies.length; i++) {
    const currTables = Object.values(defaultTables[defaultGeographies[i]]);
    for (let n = 0; n < currTables.length; n++) {
      if (currTables[n]['file'] === fileName) return currTables[n];
    }
  }

  const datasets = Object.keys(allTables);

  for (let i = 0; i < datasets.length; i++) {
    const currTables = Object.values(allTables[datasets[i]].tables);

    for (let n = 0; n < currTables.length; n++) {
      if (currTables[n]['file'] === fileName) return currTables[n];
    }
  }
}
