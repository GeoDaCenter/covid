// This components (often wrapping Scaleable()) houses a move-able panel

// Import libraries
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components'

// Import config and actions
import { colors } from '../config';
import { setPanelState } from '../actions';

// Styles - Container
const DragContainer = styled.div`
    position:fixed;
    overflow:hidden;
    background:${colors.gray};
    padding:20px 20px 0 20px;
    box-sizing: border-box;
    box-shadow: 0px 0px 5px rgba(0,0,0,0.7);
    border-radius: 0.5vh;
    &.collapsed {
        display:none;
    };
`

// Drag button (crosshair)
const DragButton = styled.button`
    position:absolute;
    left:5px;
    top:5px;
    background:none;
    outline:none;
    border:none;
    cursor:move;
    svg {
        fill:white;
        width:20px;
        height:20px;
    }
`

// Hide panel // collapse button
const CollapseButton = styled.button`
    position: absolute;
    top: 3px;
    right: 5px;
    font-size: 200%;
    cursor: pointer;
    padding:0;
    background:none;
    outline:none;
    border:none;
    color:white;
    p {
        font-size:50%;
        display:inline;
        font-family:'Montserrat', sans-serif;
        line-height:1;
    }
    svg {
        fill:white;
        width:40px;
        height:30px;
    }
`

const Draggable = (props) => {
    // Redux Dispatch and selector
    const dispatch = useDispatch();
    const open = useSelector(state => state.panelState[props.title]);

    // Local state, dragging 
    const [X, setX] = useState(props.defaultX);
    const [Y, setY] = useState(props.defaultY);
    const [isDragging, setIsDragging] = useState(false)

    // Listener and touch listeners for moving
    // On touch/mouseup, the listeners remove themselves
    const listener = (e) => {
        setX(prevWidth => prevWidth+e.movementX)
        setY(prevHeight => prevHeight+e.movementY)
    }

    const touchListener = (e) => {
        setX(e?.targetTouches[0]?.clientX-15)
        setY(e?.targetTouches[0]?.clientY-15)
    }

    const removeListener = () => {
        window.removeEventListener('mousemove', listener)
        window.removeEventListener('mouseup', removeListener)
        setIsDragging(false)
    }

    const removeTouchListener = () => {
        window.removeEventListener('touchmove', touchListener);
        window.removeEventListener('touchend', removeTouchListener);
    }
    
    const handleDown = () => {
        window.addEventListener('mousemove', listener)
        window.addEventListener('mouseup', removeListener)
        setIsDragging(true)
    }

    const handleTouch = () => {
        window.addEventListener('touchmove', touchListener)
        window.addEventListener('touchend', removeTouchListener)
    }

    // End Listeners

    // Hide Panel
    const handleCollapse = () => dispatch(setPanelState({[props.title]: false}))

    // Props change when window changes, updates local state here
    useEffect(() => {
        setX(props.defaultX);
        setY(props.defaultY);
    },[open, props.defaultX, props.defaultY])

    // Component return
    return (
        <DragContainer style={{left:`${X}px`, top: `${Y}px`, zIndex: props.z || 1}} className={open ? '' : 'collapsed'} isDragging={isDragging}>
            {props.content}
            <DragButton 
                id="resize"
                onMouseDown={handleDown}
                onTouchStart={handleTouch}
                style={{zIndex:10}}
            >
                <svg viewBox="0 0 64 64" x="0px" y="0px"><g><path d="M53.39,32.57a1.52,1.52,0,0,0-.33-1.63l-5.84-5.85a1.51,1.51,0,0,0-2.13,2.13l3.29,3.28H33.5V15.62l3.28,3.29a1.51,1.51,0,0,0,2.13-2.13l-5.85-5.84a1.5,1.5,0,0,0-2.12,0l-5.85,5.84a1.51,1.51,0,0,0,2.13,2.13l3.28-3.29V30.5H15.62l3.29-3.28a1.51,1.51,0,0,0-2.13-2.13l-5.84,5.85a1.5,1.5,0,0,0,0,2.12l5.84,5.85a1.51,1.51,0,0,0,2.13-2.13L15.62,33.5H30.5V48.38l-3.28-3.29a1.51,1.51,0,0,0-2.13,2.13l5.85,5.84a1.5,1.5,0,0,0,2.12,0l5.85-5.84a1.51,1.51,0,0,0-2.13-2.13L33.5,48.38V33.5H48.38l-3.29,3.28a1.51,1.51,0,0,0,2.13,2.13l5.84-5.85A1.51,1.51,0,0,0,53.39,32.57Z"></path></g></svg>
            </DragButton>
            <CollapseButton onClick={handleCollapse}>×</CollapseButton>
        </DragContainer>
    )
}

export default Draggable;