import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  findAllDefaults,
  fetcher
} from '../utils';
import { createSelector } from 'reselect'
import _FetcherWorker from 'comlink-loader!../utils/fetcher';// eslint-disable-line import/no-webpack-loader-syntax
const FetcherWorker = new _FetcherWorker();

const selectNumCompletedTodos = createSelector(
  ({ data }) => data.storedData,
  (tables) => Object.keys(tables)
)

export default function useBackgroundLoadData({
  currentGeography = '',
  shouldFetch = false,
  tables = [],
  currTimespans = ['latest'],
  dateLists = {},
  numeratorParams = {},
  denominatorParams = {},
  adjacentMonths = [],
}) {
  const tableKeys = useSelector(selectNumCompletedTodos)
  const dispatch = useDispatch();
  const storedData = useSelector(({ data }) => data.storedData);

  useEffect(() => {

    const adjacentMainToFetch = adjacentMonths.map(timespan => [
      { ...numeratorParams[0], timespan },
      { ...denominatorParams[0], timespan },
    ]).flat()

    const tablesToFetch = currTimespans.map(timespan =>
      findAllDefaults(tables, currentGeography)
        .map(dataspec => ({ ...dataspec, timespan }))).flat()

    const filesToFetch = [...adjacentMainToFetch, ...tablesToFetch]
      .filter(filesToFetch => !(storedData[filesToFetch.name] && (storedData[filesToFetch.name].loaded?.includes(filesToFetch.timespan) || filesToFetch.date === null)))
      .flat().filter(f => !f.noFile && f.timespan !== false && f.timespan !== undefined);

    if (shouldFetch && filesToFetch.length) {
      const getData = async () => FetcherWorker.fetcher(filesToFetch, dateLists)
      getData().then(dataArray => {
        if (dataArray.length) {
          const mappedData = dataArray.map((response, idx) => {
            const newData = response.value;
            if (!(storedData[filesToFetch[idx]?.name] && storedData[filesToFetch[idx]?.name][filesToFetch[idx]?.loaded?.includes(filesToFetch[idx]?.timespan)])) {
              if (newData && newData.data) {
                return {
                  name: filesToFetch[idx].name,
                  newData,
                  timespan: filesToFetch[idx].timespan
                }
              } else if (response.status === 'rejected') {
                return {
                  name: filesToFetch[idx].name,
                  newData: {},
                  error: true,
                  timespan: filesToFetch[idx].timespan
                }
              }
            }
          })
          dispatch({
            type: 'RECONCILE_TABLES',
            payload: {
              data: mappedData
            }
          })
        }
      })
    }
  }, [shouldFetch]);
};
