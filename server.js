const { spaSelect } = require("./services/spaSelect");
const { spaInsert } = require("./services/spaInsert");
const role = require("./services/currentRole");
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// ======@info ======НАЧАЛО= эту хуйню не трогать, 95% шанс что-то сломать============================================================
const express = require("express");
const { initConnection } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const app = express();
const PORT = 3000;
const initializePassport = require("./passportConfig");
const { spaDelete } = require("./services/spaDelete");
const { spaReport } = require("./services/spaReport");
const { spaSearch } = require("./services/spaSearh");
const { spaOptimize } = require("./services/spaOptimize");
const { sqlInjectionFilter } = require("./services/sqlInjectionFilter");
const { spaViewOrders } = require("./services/spaViewOrders");
initializePassport(passport);

// Middleware
// Parses details from a form
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET,
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false,
  })
);
// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => {
  res.redirect("/users/login");
});

app.get("/users/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/users/login", (req, res) => {
  // flash sets a messages variable. passport sets the error message
  // console.log(req.session.flash.error);
  res.render("login.ejs");
});

app.get("/users/logout", (req, res) => {
  req.logout();
  res.redirect("/users/login");
});

app.post("/users/register", async (req, res) => {
  let { name, surname, role: rolename, password, password2 } = req.body;
  let errors = [];
  let rolenameindb;

  if (!name || !rolename || !password || !password2) {
    errors.push({ message: "Заполните все поля" });
  }

  if (password !== password2) {
    errors.push({ message: "Пароли не совпадают" });
  }
  console.log(role);
  console.log("====");
  switch (rolename) {
    case "Admin":
      role.name = rolename;
      rolenameindb = "Admin";
      role.tablename = "Administration";
      break;
    case "Staff":
      role.name = rolename;
      rolenameindb = "Pharmacy_staff";
      role.tablename = "Pharmacy_staff";
      break;
    case "Doctor":
      role.name = rolename;
      rolenameindb = "Doctors";
      role.tablename = "Doctor";
      break;
  }
  console.log(name, role, password, password2);

  const hashedPassword = await bcrypt.hash(password, 10);

  const id = getRandomInt(10000000);
  const pool = initConnection();
  console.log(`INSERT INTO "${role.tablename}" ("id", "Name", "Surname", "Password") 
  VALUES (${id}, ${name}, ${surname}, ${hashedPassword})`);
  pool.query(
    `INSERT INTO "${role.tablename}" ("id", "Name", "Surname", "Password") 
                VALUES (${id}, '${name}', '${surname}', '${hashedPassword}')`,
    [],
    (err, results) => {
      if (err) {
        throw err;
      }

      console.log("Человек зарегистрирован. Data: ", {
        id,
        name,
        surname,
        hashedPassword,
      });

      console.log("ебаные запросы для ебаных ролей::");
      console.log(`CREATE ROLE "${name}" WITH
      LOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      PASSWORD '${password}'`);
      console.log(`GRANT "${rolenameindb}" TO "${name}"`);

      pool.query(
        `CREATE ROLE "${name}" WITH
        LOGIN
        NOSUPERUSER
        NOCREATEDB
        NOCREATEROLE
        PASSWORD '${password}'`,
        [],
        (err, results) => {
          if (err) console.log(1008, err);
          pool.query(
            `GRANT "${rolenameindb}" TO "${name}"`,
            [],
            (err, results) => {
              if (err) console.log(1009, err);
            }
          );
        }
      );
      res.redirect("/users/login");
    }
  );
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/justtable?entity=sflhdjgbfnkjdfnmg,d;f,.g",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

app.post("/users/login1", async (req, res) => {
  const { name, password, role: rolename } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
  console.log(rolename);
  role.name = rolename;
  switch (role.name) {
    case "Admin":
      role.tablename = "Administration";
      break;
    case "Staff":
      role.tablename = "Pharmacy_staff";
      break;
    case "Doctor":
      role.tablename = "Doctor";
      break;
  }
  initConnection(name, password);
  if (rolename == "Staff")
    res.redirect("/users/justtable?entity=Veterinary_Pharmacy");
  res.redirect("/users/justtable?entity=History");
});
// =====@info =======КОНЕЦ= хуйни которую нельзя трогать===============================================================

// ====НАЧАЛО БЛОКА @info здесь можно писать свои эндпоинты, и по-хорошему логику выносить в файлы отдельные в папке services
// пример импорта есть в самом начале документа
app.get("/users/justtable", (req, res) => {
  let { key, value, entity } = req.query;
  if (
    sqlInjectionFilter(key) ||
    sqlInjectionFilter(value) ||
    sqlInjectionFilter(entity)
  ) {
    key = undefined;
    value = undefined;
  }
  if (key != undefined && value != undefined && key != "" && value != "") {
    console.log("Запрос должен фильтроваться", { key, value });
    return spaSelect(req, res, entity, { key, value });
  }
  return spaSelect(req, res, entity);
});
// @info браузер жалуется на то что в форме для фильтрации и в форме для создания новой записи имеются дивы с одинаковыми именами
app.post("/users/justtable/add", (req, res) => {
  //console.log(req.body)
  return spaInsert(req, res);
});

app.get("/delete/:entity/:id", (req, res) => {
  const { entity, id } = req.params;
  return spaDelete(res, entity, id);
});

app.post("/report/", (req, res) => {
  return spaReport(req, res);
});

app.post("/searh", (req, res) => {
  return spaSearch(req, res);
});

app.get("/optimize", (req, res) => {
  return spaOptimize(res);
});

app.get("/view-orders", (req, res) => {
  return spaViewOrders(res);
});
// ====КОНЕЦ БЛОКА @info ==============================================================================================

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/justtable?entity=History");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
