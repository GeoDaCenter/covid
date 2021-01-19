import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { setNotification } from '../actions'
import { colors } from '../config'

const Notification = styled.div`
    width: 300px;
    max-width: 90vw;
    position: fixed;
    left: 50%;
    top: 50%;
    z-index: 15;
    background: ${colors.gray};
    color: ${colors.white};
    padding: 0;
    overflow: hidden;
    border-radius: 4px;
    padding:20px 30px 20px 20px;
    -moz-box-shadow: 0 0 2px rgba(0,0,0,.1);
    -webkit-box-shadow: 0 0 2px rgba(0,0,0,.1);
    box-shadow: 0 0 0 2px rgba(0,0,0,.1);
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    transform:translate(-50%, -50%);
`

const CloseTutorial = styled.button`
    position: absolute;
    top: 12px;
    right: 10px;
    font-size: 200%;
    cursor: pointer;
    padding:0;
    background:none;
    outline:none;
    border:none;
    color:white;
`

const NotificationBox = () => {
    const dispatch = useDispatch();
    const notification = useSelector(state => state.notification);

    return (
        notification && 
        <Notification>
            <div dangerouslySetInnerHTML={{__html: notification}}></div>
            <CloseTutorial onClick={() => dispatch(setNotification(null))}>×</CloseTutorial>
        </Notification>
    )
}

export default NotificationBox