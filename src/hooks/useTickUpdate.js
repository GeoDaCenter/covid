import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect} from 'react';
import { incrementDate } from '../actions';

export default function useTickUpdate(){
    const nIndex = useSelector(state => state.dataParams.nIndex);
    const mapType = useSelector(state => state.mapParams.mapType);
    const [isTicking, setIsTicking] = useState(false);
    const [tickTimer, setTickTimer] = useState(100);
    const [tickTimeout, setTickTimeout] = useState()
    const [resetTimeout, setResetTimeout] = useState()

    const dispatch = useDispatch();

    useEffect(() => {
        if (isTicking) dispatch(incrementDate(1))
    },[isTicking])

    useEffect(() => {
        if (isTicking) {
            clearTimeout(tickTimeout)
            setTickTimeout(setTimeout(() => dispatch(incrementDate(1)), tickTimer))
            clearTimeout(resetTimeout)
            setResetTimeout(setTimeout(() => setIsTicking(false), 1500))
        }
    },[nIndex])

    useEffect(() => {
        clearTimeout(resetTimeout)
        clearTimeout(tickTimeout)
        setIsTicking(false)
    }, [mapType])

    return [isTicking, setIsTicking, tickTimer, setTickTimer]
}