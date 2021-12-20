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
    database: "VET",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  return pool;
};

module.exports = { pool, initConnection };
