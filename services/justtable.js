const {pool} = require("../dbConfig");

const renderJustTable = (req, res) => {
    let rows;
    pool.query(`SELECT * FROM "user"`, [], (err, results) => {
        rows = results.rows;
        // console.log('aa', rows)
        res.render("justtable.ejs", { user: req.user.name, rows: rows, pool: pool });
    });
}

module.exports = { renderJustTable };