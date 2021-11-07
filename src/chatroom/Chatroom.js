import React, {useRef} from 'react';
import SocketIOClient from 'socket.io-client'
import { useEffect } from 'react';
const Chatroom = (props) => {
    const socket = React.useRef(SocketIOClient.connect("http://localhost:3010/socket"));
    React.useEffect(() => {
        console.log("render use effect", props.location.state);
        
        })
    return (
        <div>
            hi chatroom..............
        </div>
    )
}

export default Chatroom