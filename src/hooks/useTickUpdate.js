import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { incrementDate } from '../actions';

export default function useTickUpdate({
  currDatesAvailable
}) {
  const isTicking = useSelector(({data}) => data.isTicking)
  const dispatch = useDispatch();
  const setIsTicking = (bool) => dispatch({type: 'SET_TICKING', payload: bool})

  const nIndex = useSelector(({params}) => params.dataParams.nIndex);
  const mapType = useSelector(({params}) => params.mapParams.mapType);
  // const [isTicking, setIsTicking] = useState(false);
  const [tickTimer, setTickTimer] = useState(100);
  const [tickTimeout, setTickTimeout] = useState();
  const [resetTimeout, setResetTimeout] = useState();


  useEffect(() => {
    if (isTicking) dispatch(incrementDate(1, currDatesAvailable));
  }, [isTicking]);

  useEffect(() => {
    if (isTicking) {
      clearTimeout(tickTimeout);
      setTickTimeout(setTimeout(() => dispatch(incrementDate(1, currDatesAvailable)), tickTimer));
      clearTimeout(resetTimeout);
      setResetTimeout(setTimeout(() => setIsTicking(false), 1500));
    }
  }, [nIndex]);

  useEffect(() => {
    clearTimeout(resetTimeout);
    clearTimeout(tickTimeout);
    setIsTicking(false);
  }, [mapType]);

  return [isTicking, setIsTicking, tickTimer, setTickTimer];
}
