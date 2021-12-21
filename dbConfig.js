require("dotenv").config();

const { Pool } = require("pg");
const role = require("./services/currentRole");

let pool;
let alreadyDone = false;
const initConnection = (user, password) => {
  console.log("Текущая роль:", role.name);
  if (alreadyDone && !user && !password) {
    return pool;
  }
  console.log(alreadyDone);
  alreadyDone = true;
  if (!user) {
    user = process.env.DB_USER;
  }
  if (!password) {
    password = process.env.DB_PASSWORD;
  }
  console.log("Запрос за коннект:", user, password);
  console.log(
    `postgresql://${user}:${password}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
  );

  pool = new Pool({
    host: "localhost",
    user: user,
    password: password,
    database: "vet2",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  if (user == "postgres") {
    return pool;
  }
  // При неправильно выбрайнно роли мы всё равно подключимся, но запросим имя из базы с этой ролью, чтобы если его нет - кинуть ошибку
  pool.query(
    `SELECT id FROM "${role.tablename}" where "Name" = user;`,
    [],
    (err, results) => {
      if (err) {
        throw err;
      }
      if (results.rows.length == 0) {
        console.log(
          "\n===!!!ОШИБКА КОННЕКТА К БАЗЕ!!!=== ЮЗЕР НЕ НАЙДЕН В СОПУТСТВУЮЩЕЙ ТАБЛИЦЕ\n"
        );
      }
      const currentUserId = results.rows.shift().id;
      console.log(`Вход под user id (role: ${role.name})`, currentUserId);
    }
  );

  return pool;
};

module.exports = { initConnection };
