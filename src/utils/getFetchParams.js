
import {
  findTableOrDefault
} from '../utils';

export function getFetchParams({
  dataParams,
  currDataset,
  tables,
  predicate,
  dateList,
  currTimespans=['latest']
}){
  const tableName = dataParams[predicate] 
  
  if (tableName === 'properties') {
    return [{
      noFile: true
    }]
  }
  
  return currTimespans.filter(t => !!t).map(timespan => ({
    ...findTableOrDefault(currDataset, tables, tableName),
    timespan
  }))
}