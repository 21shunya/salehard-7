const {renderJustTable} = require("./services/justtable");
const {renderJustTableAdd} = require("./services/justtableadd")






// ======@info ======НАЧАЛО= эту хуйню не трогать, 95% шанс что-то сломать============================================================
const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const app = express();
const PORT = 3000;
const initializePassport = require("./passportConfig");
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
    saveUninitialized: false
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

app.get("/users/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  // flash sets a messages variable. passport sets the error message
  // console.log(req.session.flash.error);
  res.render("login.ejs");
});

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  console.log('Запрос от авторизованного лица? =>' ,req.isAuthenticated());
  res.render("dashboard.ejs", { user: req.user.name });
});



app.get("/users/logout", (req, res) => {
  req.logout();
  res.redirect("/users/login");
});

app.post("/users/register", async (req, res) => {
  let { name, phone, password, password2 } = req.body;

  let errors = [];

  console.log({
    name,
    phone,
    password,
    password2
  });

  if (!name || !phone || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, phone, password, password2 });
  } else {
    // hashedPassword = await bcrypt.hash(password, 10); // @info хэширование
    // console.log(hashedPassword);
    // Validation passed
    pool.query(
      `SELECT * FROM "user"
        WHERE name = $1`,
      [name],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          return res.render("register", {
            message: "Name already registered"
          });
        } else {
          pool.query(
            `INSERT INTO "user" (name, phone, password)
                VALUES ($1, $2, $3) // @info Записывается сырой пароль!! использовать bcrypt hash password
                RETURNING id`,
            [name, phone, password],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              console.log('Человек зарегистрирован. Data: ', { name, phone, password})

              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })
);
// =====@info =======КОНЕЦ= хуйни которую нельзя трогать===============================================================

// ====НАЧАЛО БЛОКА @info здесь можно писать свои эндпоинты, и по-хорошему логику выносить в файлы отдельные в папке services
// пример импорта есть в самом начале документа
app.get("/users/justtable", checkNotAuthenticated, (req, res) => {
    const { key, value } = req.query;
    console.log(req)
    if (key != undefined && value != undefined) {
        console.log('Запрос должен фильтроваться', {key, value})
        return renderJustTable(req, res, {key, value})
    }
    return renderJustTable(req, res)
});
// @info браузер жалуется на то что в форме для фильтрации и в форме для создания новой записи имеются дивы с одинаковыми именами
app.post("/users/justtable/add", checkNotAuthenticated, (req, res) => {
    //console.log(req.body)
    return renderJustTableAdd(req, res)
});

app.get("/justtabledeleterow/:id", checkNotAuthenticated, (req, res) => {
    const { id } = req.params;
    console.log('Вызвано удаление из justtable, id:', id);

    pool.query(
        `DELETE FROM "user" WHERE id = $1`,
        [id],
        (err, results) => {
            if (err) {
                throw err;
            }

            res.redirect("/users/justtable");
        }
    );



});

// ====КОНЕЦ БЛОКА @info ==============================================================================================

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
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
