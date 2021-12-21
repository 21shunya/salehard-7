const { initConnection } = require("../dbConfig");
const role = require("./currentRole");

const spaOptimize = (res) => {
  console.log("Вызвана оптимизация (транзакция)");

  initConnection().query(
    `begin;
    do
    $$
    declare
     d integer;
    begin
     select "id" into d from "Appointment" where "Date" <= CURRENT_DATE;
     if not found 
     then
     else
      insert into "History" ("Date", "id_doctor", "id_animal") 
                                  (select "Date", "id_doctor", "id_animal"
                                    from "Appointment"
                                    where "id" = d);
      delete from "Appointment" where "id" = d;
     end if;
    end;
    $$;
    commit;`,
    [],
    (err, results) => {
      if (err) {
        throw err;
      }

      res.redirect("/users/justtable?entity=History");
    }
  );
};

module.exports = { spaOptimize };
