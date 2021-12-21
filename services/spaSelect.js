const { initConnection } = require("../dbConfig");
const role = require("./currentRole");

const spaSelect = (req, res, entity, filterParams) => {
  console.log(`SELECT * FROM "${entity}"`);
  if (filterParams == undefined) {
    // @info запрос без фильтра
    const con = initConnection();
    con.query(`SELECT * FROM "${entity}"`, [], (err, results) => {
      if (err) {
        console.log(err);
      }
      const rows = results.rows;
      // console.log('aa', rows)
      res.render("justtable.ejs", {
        rolename: role.name,
        rows: rows,
        entity: entity,
      });
    });
  } else {
    // @info запрос с фильтром
    const { key, value } = filterParams;
    initConnection().query(
      `SELECT * FROM "${entity}" where "${key}" = $1`,
      [value],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        const rows = results.rows;

        res.render("justtable.ejs", {
          rolename: role.name,
          rows: rows,
          entity: entity,
        });
      }
    );
  }
};

module.exports = { spaSelect };
