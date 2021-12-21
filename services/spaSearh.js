const { initConnection } = require("../dbConfig");
const role = require("./currentRole");
const { sqlInjectionFilter } = require("./sqlInjectionFilter");

const spaSearch = (req, res) => {
  let { Name } = req.body;
  if (sqlInjectionFilter(Name)) {
    return res.redirect("users/justtable?entity=History");
  }
  console.log("Вызов функции поиска по имени:", Name);
  initConnection().query(
    `SELECT find_history_of_animal('${Name}')`,
    [],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      const rows = results.rows;
      const arr = [];
      for (const item of rows) {
        const parsedSet = item.find_history_of_animal
          .replace("(", "")
          .replace(")", "")
          .split(",");

        arr.push({
          name: parsedSet[0],
          kind: parsedSet[1],
          age: parsedSet[2],
          date_of_appointment: parsedSet[3].replace('"', "").replace('"', ""),
          complaints: parsedSet[4].replace('"', "").replace('"', ""),
          diagnosis: parsedSet[5],
        });
      }

      res.render("justtable.ejs", {
        rolename: role.name,
        rows: arr,
        entity: "alallala",
      });
    }
  );
};
module.exports = { spaSearch };
