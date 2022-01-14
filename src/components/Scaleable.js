import React, { useState, useEffect } from 'react';
import {useSelector} from 'react-redux'
import styled from 'styled-components'

const ResizeButton = styled.button`
    position:absolute;
    right:10px;
    bottom:10px;
    background:none;
    outline:none;
    border:none;
    transform: rotate(90deg);
    cursor:nw-resize;
    display:${props => props.notScaleable ? 'none' : 'initial'};
`

const Scaleable = ({
    defaultWidth=300,
    defaultHeight=200,
    minHeight=100,
    minWidth=150,
    content=null,
    notScaleable=false,
    title=''
}) => {
    
    const [width, setWidth] = useState(defaultWidth);
    const [height, setHeight] = useState(defaultHeight);
    const [currXYPos, setCurrXYPos] = useState(false);

    const listener = (e) => {
        setWidth(prevWidth => prevWidth+e.movementX)
        setHeight(prevHeight => prevHeight+e.movementY)
    }

    const touchListener = (e) => {
        setWidth(prev => (e?.targetTouches[0]?.clientX-currXYPos[0]) || prev)
        setHeight(prev => (e?.targetTouches[0]?.clientY-currXYPos[1]) || prev)
    }

    const removeListener = () => {
        window.removeEventListener('mousemove', listener)
        window.removeEventListener('mouseup', removeListener)
    }

    const removeTouchListener = () => {
        window.removeEventListener('touchmove', touchListener);
        window.removeEventListener('touchend', removeTouchListener);
    }
    
    const handleDown = () => {
        window.addEventListener('mousemove', listener)
        window.addEventListener('mouseup', removeListener)
    }

    const handleTouch = (e) => {
        setCurrXYPos([+e.target.parentNode.parentNode.parentNode.style.left.slice(0,-2), +e.target.parentNode.parentNode.parentNode.style.top.slice(0,-2)])
        window.addEventListener('touchmove', touchListener)
        window.addEventListener('touchend', removeTouchListener)
    }
    
    const open = useSelector(state => state.panelState[title]);

    useEffect(() => {
        setWidth(defaultWidth)
        setHeight(defaultHeight)
    }, [open, defaultHeight, defaultWidth])

    return (
        <div style={{width: width, height: height, minHeight: minHeight, minWidth: minWidth}} className="scaleableWrapper">
            {content}
            <ResizeButton 
                id="resize"
                notScaleable={notScaleable}
                onMouseDown={handleDown}
                onTouchStart={handleTouch}
                style={{zIndex:10}}
            >
                <svg height='20px' width='20px'  fill="white" viewBox="0 0 8.4666667 8.4666667" x="0px" y="0px"><g transform="translate(0,-288.53333)"><path d="m 5.5562495,289.59166 v 0.52916 h 0.94878 l -1.665015,1.66502 0.3741367,0.37414 1.665015,-1.66502 v 0.94878 h 0.5291667 v -1.85208 z m -2.303735,3.78168 -1.665015,1.66501 v -0.94878 H 1.0583328 v 1.85209 h 1.8520834 v -0.52917 h -0.94878 l 1.665015,-1.66501 z"></path></g></svg>
            </ResizeButton>
        </div>
    )
}

export default Scaleable;