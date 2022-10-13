import React, { useState, useEffect } from 'react';
import './App.css';
import socketio from "socket.io-client";

const socket = socketio.connect("http://localhost:8081");

export const InRoom = ({ match }) => {
    const [roomName, setRoomName] = useState("");
    const [roomList, setRoomList] = useState("");
    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState([]);

    const url = match.params.id;

    console.log(url)

    useEffect(() => {
        socket.emit('roomName', url)
    }, [])

    useEffect(() => {
        socket.on('msg', (obj) => {
            setMessageList([...messageList, obj]);
        });
    })


    const onSubmit = async (e) => {
        e.preventDefault();
        socket.emit('msg', {
            user_id: '현지',
            roomName: url,
            chatting: message
        });
    }


    return (

        <div>
            <p>실시간 채팅 테스트</p>
            <form onSubmit={onSubmit}>
                <input type="text" name="message" value={message} onChange={e => setMessage(e.target.value)} required />
                <button type="submit">입력</button>
            </form>
            {messageList ? messageList.map(k => {
                return (
                    <div className="send">
                        <h2>{k.roomName}</h2>
                        <div>
                            <p>
                                아이디 : {k.user_id}<br />
                                내용 : {k.chatting}<br />
                            </p>
                        </div>
                    </div>
                )
            }) : '안나와'
            }
        </div >
    );
}

