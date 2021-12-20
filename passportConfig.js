const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
  console.log("Авторизация включена");

  const authenticateUser = (role, name, password, done) => {
    console.log("Аутентификация юзера. Data:", name, password);
    if (role == "doctor") {
      pool.query(
        `SELECT * FROM "` + role + `" WHERE "Name" = $1`,
        [name],
        (err, results) => {
          if (err) {
            throw err;
          }
          // console.log(results.rows);

          if (results.rows.length > 0) {
            const user = results.rows[0];
            console.log("Юзер успешно найден:", user);

            bcrypt.compare(password, user.password, (err, isMatch) => {
              console.log();
              if (err) {
                console.log(err);
              }
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "Password is incorrect" });
              }
            });
            // if (user.Password == password) {
            //   // @info грубое сравнение паролей!!! Необходимо использовать bcrypt compare hashed password
            //   console.log('паспорта совалпаи')
            //   return done(null, user);
            // }
          } else {
            return done(null, false, {
              message: "No user with that email address",
            });
          }
        }
      );
    }
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );
  passport.serializeUser((user, done) => done(null, user.Id));
  passport.deserializeUser((id, done) => {
    pool.query(
      `SELECT * FROM "Employee" WHERE "Id" = $1`,
      [id],
      (err, results) => {
        if (err) {
          return done(err);
        }
        console.log(`Authorized user ID is ${results.rows[0].Id}`);
        return done(null, results.rows[0]);
      }
    );
  });
}

module.exports = initialize;
