const amqp = require("amqplib");

class RabbitmqWrapper {
  constructor(url, queueName, options) {
    // 객체 초기화
    this._url = url;
    this._queueName = queueName;
    this._options = options || {};

    // public
    this.channel = undefined;
    this.queue = undefined;
  }

  // 커넥트 생성하고 채널 연결
  async setup() {
    const connect = await amqp.connect(this._url); //mysqlconnect
    const channel = await connect.createChannel(); //mysql-database
    this.channel = channel;
  }

  // 채널에다가 queue 만들어주기 queue는 메세지를 수신 받을 수 있는 이름
  async assertQueue() {
    const queue = await this.channel.assertQueue(this._queueName, {
      durable: false, // false는 볼 때까지 보관, true는 일정시간이 지나면 사라짐,
    });
    this.queue = queue;
  }

  // queue에 데이터보내기
  async sendToQueue(msg) {
    const sending = await this.channel.sendToQueue(
      this._queueName,
      this.encode(msg),
      {
        persistent: true,
      }
    );
    return sending;
  }

    // queue에 있는 데이터 가져오기
  async recvFromQueue() {
    const message = await this.channel.get(this._queueName, {});
    if (message) {
      this.channel.ack(message);
      console.log(message.content);
      console.log(message.content.toString())
      return message.content.toString();
    } else {
      return null;
    }
  }

  // 문자를 Buffer로 바꿈
  encode(doc) {
    return Buffer.from(JSON.stringify(doc));
  }

  //Buffer를 문자를 바꿔주는 로직
  async recvFromQueue() {
    const message = await this.channel.get(this._queueName, {});
    if (message) {
      this.channel.ack(message);
      console.log(message.content);
      console.log(message.content.toString())
      return message.content.toString();
    } else {
      return null;
    }
  }

  // 메세지보내기
  async send_message(msg) {
    await this.setup(); //레빗엠큐 연결
    await this.assertQueue(); //큐생성
    await this.sendToQueue(msg); //생성큐메세지전달
  }

  // 메세지 가져오기
  async recv_message() {
    await this.setup();
    return await this.recvFromQueue();
  }
}

module.exports = RabbitmqWrapper;