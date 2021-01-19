import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { setAnchorEl } from '../actions';

const TooltipContainer = styled.button`
    width:12.5px;
    height:12.5px;
    background:url('${process.env.PUBLIC_URL}/assets/img/info.png');
    background-repeat: no-repeat;
    background-size: cover;
    outline:none;
    border:none;
    padding:0;
    margin:4px;
`

const Tooltip = (props) => {
    const dispatch = useDispatch();

    const handleMouseOver = (event) => {
        dispatch(setAnchorEl(event.currentTarget))
    }

    const handleMouseLeave = () => {
        dispatch(setAnchorEl(null))
    }

    return (
        <TooltipContainer id={props.id} key={props.id} onMouseEnter={handleMouseOver} onMouseLeave={handleMouseLeave} />
    )
}

export default Tooltip