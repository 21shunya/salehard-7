const {pool} = require("../dbConfig");

const spaInsert = (req, res) => {
    let { name, phone, password,  } = req.body;
    console.log('Запрос на создание, содержимое:', name,phone,password)
    pool.query(
        `INSERT INTO "user" (name, phone, password)
                VALUES ($1, $2, $3)
                RETURNING id, password;`, // @info Записывается сырой пароль!! использовать bcrypt hash password
        [name, phone, password],
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows);
            req.flash("success_msg", "You are now registered. Please log in");
            res.redirect("/users/justtable?entity=Employee");
        }
    );
}

module.exports = { spaInsert };
