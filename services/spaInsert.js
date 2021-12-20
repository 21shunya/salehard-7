const { initConnection } = require("../dbConfig");
const role = require("./currentRole");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const spaInsert = (req, res) => {
  let {
    Deadline,
    AssigneeId,
    OrganizationId,
    ContactPersonId,
    TypeId,
    PriorityId,
  } = req.body;
  const Id = getRandomInt(10000);
  const CreatedAt = new Date()
    .toISOString()
    .replace("T", " ")
    .replace("Z", " ")
    .split(".")[0];
  Deadline += " 00:00:00";
  const pool = initConnection();
  pool.query(
    `SELECT id FROM "${role.tablename}" where "Name" = user;`,
    [],
    (err, results) => {
      if (err) {
        throw err;
      }
      const currentUserId = results.rows.shift().id;
      console.log(`current USER ID (role: ${role.name})`, currentUserId);
    }
  );

  console.log(
    "Запрос на создание, содержимое:",
    Id,
    OwnerId,
    CreatedAt,
    Deadline,
    AssigneeId,
    OrganizationId,
    ContactPersonId,
    TypeId,
    PriorityId
  );

  pool.query(
    `INSERT INTO "Task" ("Id", "OwnerId", "CreatedAt", "Deadline", "AssigneeId", "OrganizationId",  "ContactPersonId", "TypeId", "PriorityId")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 );`,
    [
      Id,
      OwnerId,
      CreatedAt,
      Deadline,
      AssigneeId,
      OrganizationId,
      ContactPersonId,
      TypeId,
      PriorityId,
    ],
    (err, results) => {
      if (err) {
        throw err;
      }
      console.log(results.rows);
      req.flash("success_msg", "You are now registered. Please log in");
      res.redirect("/users/justtable?entity=History");
    }
  );
};

module.exports = { spaInsert };
