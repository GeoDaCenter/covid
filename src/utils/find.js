export const findIn = (array, property, match) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i][property] === match) {
      return array[i];
    }
  }
  return {};
};

export const findDefault = (array, table, geography) => {
  for (let i = 0; i < array.length; i++) {
    if (
      array[i].table === table &&
      array[i].geography === geography &&
      array[i].default
    ) {
      return array[i];
    }
  }
  return {};
};

export const findAllDefaults = (tables, geography) => {
  const defaults = [];
  for (let i = 0; i < tables.length; i++) {
    if (tables[i].geography === geography && tables[i].default) {
      defaults.push(tables[i]);
    }
  }
  return defaults;
};

const onlyUnique = (value, index, self) => self.findIndex(value.id) === index;

export const findAllCurrentTables = (currPreset, tables, geography) => {
  return [
    ...Object.values(currPreset.tables).map((tableId) =>
      findIn(tables, "id", tableId)
    ),
    ...findAllDefaults(tables, geography),
  ].filter(onlyUnique);
};

export const findDates = (data) => {
  for (let i = 0; i < data.length; i++) {
    if (Date.parse(data[i])) return [data.slice(i), i];
  }
  return;
};

export const findDateIndices = (dateList, columnList) => {
  let validIndices = [];
  for (let i = 0; i < dateList.length; i++) {
    if (columnList.indexOf(dateList[i]) !== -1) validIndices.push(i);
  }
  return validIndices;
};

export const getDateIndices = (data, names) => {
  let rtn = {};

  for (let i = 0; i < data.length; i++) {
    rtn[names[i]] = data[i][2];
  }

  return rtn;
};

export const findTableOrDefault = (currDataset, tables, tableName) => {
  if (tableName === "properties") return tableName;
  if (currDataset?.tables && currDataset.tables[tableName])
    return findIn(tables, "id", currDataset.tables[tableName]);
  return findDefault(tables, tableName, currDataset.geography);
};

export const findTableOrDefaultId = (currDataset, tables, tableName) =>
  findTableOrDefault(currDataset, tables, tableName).id;
