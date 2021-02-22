import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import styled from 'styled-components';
import Popper from '@material-ui/core/Popper';

import { tooltipInfo, colors } from '../config';
import { setAnchorEl } from '../actions';

const TooltipContentDiv = styled(Popper)`
    z-index:10000;
    max-width:200px;
    background:none;
    padding:0;
    margin:0;
    pointer-events: none;
    div.tooltipContentContainer {
        background:black;
        padding:10px;
        margin:0;
        borderRadius: 4px;
        color:white;
        // transform:translateX(65%);
        box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12);
        pointer-events: all;
        a {
            color: ${colors.yellow};
            text-decoration:none;
        }
    }
`

const Popover = () => {

    const dispatch = useDispatch();

    const anchorEl = useSelector(state => state.anchorEl);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;
    
    const handleMouseOver = (event) => {
        dispatch(setAnchorEl(anchorEl))
    }

    const handleMouseLeave = () => {
        dispatch(setAnchorEl(null))
    }
    
    return (
        <TooltipContentDiv 
            id={id} 
            open={open} 
            anchorEl={anchorEl}
            disablePortal={false}
            modifiers={{
                flip: {
                enabled: true,
                },
                preventOverflow: {
                enabled: true,
                boundariesElement: 'window',
                }
            }}
            onMouseEnter={handleMouseOver} 
            onMouseLeave={handleMouseLeave}
            >
            <div className="tooltipContentContainer">
                {anchorEl && tooltipInfo[anchorEl.id]}
            </div>
        </TooltipContentDiv>
    )
}

export default Popover