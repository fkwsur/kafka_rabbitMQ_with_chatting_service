
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const { PORT  } = process.env;
dotenv.config();
const cors = require('cors');
const db = require('./model') 

db.sequelize
.authenticate()
.then(async () => {
  try{
    console.log('db connect ok');
    await db.sequelize.sync({force : false});
  }catch(err){
    console.log('err');
  }  
})
.catch(err => {
    console.log('db' + err);
});

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: false}))


const http_server = require('http')
.createServer(app)
.listen(PORT || 8081, () => {
  console.log('server on');
});

const socket = require('./service/socket');
socket.io.attach(http_server,{
  cors : {
    origin : 'http://localhost:3000',
    methods : ["GET", "POST"]
  }
});
// socket.Kafka();
socket.RabbitMq();