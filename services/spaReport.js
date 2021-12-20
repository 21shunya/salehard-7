const { initConnection } = require("../dbConfig");

const spaReport = (req, res) => {
  let { Id, start_date, end_date } = req.body;
  console.log("Запрос на создание отчета, содержимое:", Id);
  initConnection().query(
    `CALL report($1, $2, $3);`,
    [Id, start_date, end_date],
    (err, results) => {
      if (err) {
        throw err;
      }
      console.log(results.rows);
    }
  );
  res.redirect("/users/justtable?entity=History");
};

module.exports = { spaReport };
