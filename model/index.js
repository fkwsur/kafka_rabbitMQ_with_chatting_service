const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes, Op, QueryTypes } = require("sequelize");
const basename = path.basename(__filename);

const yenv = require('yenv')
const env = yenv('environment.yaml', {
  env: "local_mysql"
})


const env_MYSQL_DB = env.MYSQL_DB.toString()
const env_MYSQL_DB_USER = env.MYSQL_DB_USER.toString()
const env_DB_PASSWORD = env.MYSQL_DB_PASSWORD.toString()

const sequelize = new Sequelize(env_MYSQL_DB, env_MYSQL_DB_USER, env_DB_PASSWORD, {
  host: env.MYSQL_DB_HOST,
  dialect: 'mysql',
  operatorsAliases: 0,
  timezone: "+09:00",
  dialectOptions: {
    charset: "utf8mb4",
    dateStrings: true,
    typeCast: true,
  },
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  ssl: true
});

let db = [];

fs
  .readdirSync(__dirname)
  .filter(file => {
    // 파일이름 추출
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js"
    );
  })
  // 추출한 값을 하나하나하나 db[]안에 담음
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

//외래키 있으면 외래키끼리 연결시켜줌
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// sequelize, Op, QueryTypes 사용을 위한 선언
db.sequelize = sequelize;
db.Op = Op;
db.QueryTypes = QueryTypes;

// 내보내기
module.exports = db;