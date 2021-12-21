const { initConnection } = require("../dbConfig");
const role = require("./currentRole");

const spaViewOrders = (res) => {
  const con = initConnection();
  con.query(`SELECT * FROM "orders"`, [], (err, results) => {
    if (err) {
      console.log(err);
    }
    const rows = results.rows;
    res.render("justtable.ejs", {
      rolename: role.name,
      rows: rows,
      entity: "orders",
    });
  });
};

module.exports = { spaViewOrders };
