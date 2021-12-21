const { initConnection } = require("../dbConfig");
const role = require("./currentRole");

const spaInsert = (entity, args, res) => {
  let tableColumnNames;
  let dollars;
  switch (entity) {
    case "Animal":
      tableColumnNames = `"Name", "Kind", "Age", "Species", "id_client"`;
      dollars = "$1, $2, $3, $4, $5";
      break;
    case "Client":
      tableColumnNames = `"Name", "Surname", "Patronymic", "Phone",`;
      dollars = "$1, $2, $3, $4";
      break;
    case "Order":
      tableColumnNames = `"Name", "Surname", "Patronymic", "Phone", "id_pharmacy"`;
      dollars = "$1, $2, $3, $4, $5";
      break;
  }
  const pool = initConnection();
  pool.query(
    `INSERT INTO "${entity}" (${tableColumnNames})
                VALUES (${dollars});`,
    [...args],
    (err, results) => {
      if (err) {
        throw err;
      }
      console.log(results.rows);
      res.redirect(`/users/justtable?entity=${entity}`);
    }
  );
};

module.exports = { spaInsert };
