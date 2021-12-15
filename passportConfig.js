const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
  console.log("Авторизация включена");

  const authenticateUser = (email, password, done) => {
    console.log('Аутентификация юзера. Data:', email, password);
    pool.query(
      `SELECT * FROM "user" WHERE name = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        // console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0];
          console.log('Юзер успешно найден:', user);

          // if (user.password == password){ // @info грубое сравнение паролей!!! Необходимо использовать bcrypt compare hashed password
          //   return done(null, user);
          // }
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.log(err);
            }
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Password is incorrect" });
            }
          });
        } else {
          return done(null, false, {
            message: "No user with that email address"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM "user" WHERE id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`Authorized user ID is ${results.rows[0].id}`);
      return done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;
