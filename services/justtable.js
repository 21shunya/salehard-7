const {pool} = require("../dbConfig");

const renderJustTable = (req, res, entity, filterParams) => {
    if (filterParams == undefined){
        // @info запрос без фильтра
        pool.query(`SELECT * FROM "` + entity + `"`, [], (err, results) => {
            if (err){
                console.log(err);
            }
            const rows = results.rows;
            // console.log('aa', rows)
            res.render("justtable.ejs", { user: req.user, rows: rows, pool: pool });
        });
    }
    else{
        // @info запрос с фильтром
        const { key, value } = filterParams;
        pool.query(`SELECT * FROM "` + entity + `" where ` + key + ` = $1`, [value], (err, results) => {
            if (err){
                console.log(err);
            }
            const rows = results.rows;
            console.log('aa', rows)
            res.render("justtable.ejs", { user: req.user, rows: rows, pool: pool });
        });
    }
}

module.exports = { renderJustTable };