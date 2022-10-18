const amqp = require("amqplib");

const amqpURL = "amqp://localhost:5672";
const { chatting } = require('../model');

let globalArr = [];
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

module.exports = {
  Produce : async (msg) => {
    try {
      console.log(msg ,"<<< mq func")
      const conn = await amqp.connect(amqpURL)
      const ch = await conn.createChannel()
      const exchange = "web_exchange";
      const q ="web_queue";
      const routingKey = "web_routing_key";
      await ch.assertExchange(exchange, 'direct', {durable: true}).catch((err) => console.log(error));
      await ch.assertQueue(q, {durable:true});
      await ch.bindQueue(q, exchange, routingKey)
      await ch.publish(exchange, routingKey, Buffer.from(msg))
    } catch (error) {
      console.log(error)
    }
  },
  Consume : async() => {
    try {
      const conn = await amqp.connect(amqpURL)
      const ch = await conn.createChannel()
      const q= "web_queue";
      await ch.assertQueue(q, {durable: true});
      await ch.consume(q, async (msg) => {
        console.log(msg.content.toString());

        globalArr.push(JSON.parse(msg.content.toString()))
        console.log("여기이제 제이슨으로 다시 바꾼담에 디비에 넣는 로직 넣으면 됨");
        timer (globalArr.length.toString());                
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
        ch.ack(msg)
      }, { consumerTag: 'web_consumer'})
    } catch (error) {
      console.log(error);
    }
  }
}