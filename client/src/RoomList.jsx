import React, { useState, useEffect } from 'react';
import './App.css';
import socketio from "socket.io-client";
import { InRoom } from './InRoom';
import { Link, Route } from 'react-router-dom';
const socket = socketio.connect("http://localhost:8081");

export const RoomList = ({ history }) => {
    const [roomName, setRoomName] = useState("");
    const [roomList, setRoomList] = useState([]);

    useEffect(() => {
        socket.on('roomList', (rooms) => {
            console.log(rooms)
            setRoomList([...roomList, rooms]);
        });
    })



    const onSubmit2 = async (e) => {
        e.preventDefault();
        await socket.emit('roomList', {
            name: roomName
        })
        console.log(roomName)
    }


    return (
        <div className="App">

            <p>방만들기</p>
            <form onSubmit={onSubmit2}>
                <input type="text" name="room" value={roomName} onChange={e => setRoomName(e.target.value)} required />
                <button type="submit">생성</button>
            </form>

            {roomList ? roomList.map(k => {
                return (
                    <div className="send">
                        <p>
                            <Link to={`/inroom=${k.name}`}>방이름 : {k.name}<br />
                            </Link>
                        </p>
                    </div>
                )
            }) : '안나와'
            }

            <Route exact path="/inroom" component={InRoom} />
        </div>
    );
}

