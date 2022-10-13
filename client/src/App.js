import React,{useState,useEffect} from 'react';
import './App.css';
import socketio from "socket.io-client";
import { withRouter, Route } from 'react-router-dom';
import { InRoom } from './InRoom';
import { RoomList } from './RoomList';
const socket = socketio.connect("http://localhost:8081");

const App = () => {

  return (
    <div className="App">
        <Route exact path="/" component={RoomList}/> 
        <Route exact path="/inroom" component={InRoom}/> 
        <Route exact path="/inroom=:id" component={InRoom}/> 
    </div>
  );
}

export default withRouter(App);
