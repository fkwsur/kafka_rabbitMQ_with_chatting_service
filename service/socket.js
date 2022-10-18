const io = require('socket.io')();
const redisAdapter = require('socket.io-redis');
const redis = require('redis');
const dotenv = require("dotenv");
dotenv.config();
const { chatting } = require('../model');

// 레디스
io.adapter(redisAdapter({ host: '127.0.0.1', port: '6379' }));
const redis_client = redis.createClient('6379','127.0.0.1');
redis_client.on('error', (err) => {
	console.log(err);
});

//카프카
const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "kafka-client",
  brokers: ["localhost:9092"],
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "tester" });
const kafkaConnect = async () => {
  await producer.connect();   
  };

// 레빗엠큐
const rabbitmq = require('./rabbitmq')


module.exports = { 
  io : io,
  Kafka : async() =>{
  io.on('connection', (socket) => { 

    socket.on('chatroom', async (chat) => {
      try{
        console.log(chat);    
      }catch (err) {
        console.log(err);
      }
      });

      socket.on('msg', async (msg) => {
        try{
          await io.to(msg.roomName).emit('msg',msg);
          const data = JSON.stringify(msg)
          const send_data = await producer.send({
            topic: "chat-log-kafka",
            messages: [
                { 
                value : Buffer.from(data)
            }],
        });
        console.log(data)
        console.log(send_data)
        }catch (err) {
          console.log(err);
        }
        });

        socket.on('roomList', async (rooms) => {
          try{
            console.log(rooms)
            await io.emit('roomList',rooms);
          }catch (e) {
            console.log(e);
          }
        });
        socket.on('roomName', async (roomList) => {
          try{
            console.log(roomList);    
           socket.join(roomList);
          }catch (e) {
            console.log(e);
          }
        });
    
        socket.on('leave', async (leave) => {
          try{
            socket.leave(leave);
          }catch (e) {
            console.log(e);
          }
        });
        // socket.on('disconnect', () => {
        //   console.log('disconnecting');
        //   redis.flushall();
        // });

  });

  //kafka
  let globalArr = [];
  const consumerRun = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "chat-log-kafka", fromBeginning: true });
  await consumer.run({
      eachMessage: async({topic, partition, message}) => {
          console.log(JSON.parse(message.value.toString()))
          globalArr.push(JSON.parse(message.value.toString()))

          const timer = (i) => {
            setTimeout(async() => {
              console.log("checkVal :", i, "globalArr : ", globalArr.length);
              if (i == globalArr.length) {
                console.log("1초동안 응답x 여기다가 넣는 로직넣으면 됨")
                try {
                  console.log(globalArr)
                  const rows = await chatting.bulkCreate(globalArr, {
                      ignoreDuplicates: true,
                    });
                    if(!rows) throw error
                    console.log(rows)
                    globalArr = [];
                  } catch (err) {
                    console.log(err, "잘못된 데이터로 인해 넣기 실패")
                 }
              }
            }, 1000);
          }
          timer(globalArr.length.toString());        
          
          if (globalArr.length >= 5 ) { 
              try {
                console.log(globalArr)
                const rows = await chatting.bulkCreate(globalArr, {
                    ignoreDuplicates: true,
                  });
                  if(!rows) throw error
                  console.log(rows)
                  globalArr = [];
                } catch (err) {
                  console.log(err, "잘못된 데이터로 인해 넣기 실패")
               }
          }
      }
  })
  }

  consumerRun().catch(err => console.log("kafka err : ", err))
  kafkaConnect();
  },
  RabbitMq : async() =>{
    io.on('connection', (socket) => { 
  
      socket.on('chatroom', async (chat) => {
        try{
          console.log(chat);    
        }catch (err) {
          console.log(err);
        }
        });
  
        socket.on('msg', async (msg) => {
          try{
            await io.to(msg.roomName).emit('msg',msg);
            await rabbitmq.Produce(JSON.stringify(msg));           
          }catch (err) {
            console.log(err);
          }
          });
  
          socket.on('roomList', async (rooms) => {
            try{
              console.log(rooms)
              await io.emit('roomList',rooms);
            }catch (e) {
              console.log(e);
            }
          });
          socket.on('roomName', async (roomList) => {
            try{
              console.log(roomList);    
             socket.join(roomList);
            }catch (e) {
              console.log(e);
            }
          });
      
          socket.on('leave', async (leave) => {
            try{
              socket.leave(leave);
            }catch (e) {
              console.log(e);
            }
          });
    });

  }
  };