
import {
  findTableOrDefault
} from '../utils';

export function getFetchParams({
  dataParams,
  currDataset,
  tables,
  predicate
}){
  const tableName = dataParams[predicate] 
  
  if (tableName === 'properties') {
    return {
      noFile: true
    }
  }
  
  return findTableOrDefault(currDataset, tables, tableName)
}