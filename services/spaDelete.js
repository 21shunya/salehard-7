const {pool} = require("../dbConfig");

const spaDelete = (res, entity, id) => {
    console.log('Вызвано удаление из ' + entity+ ', id:', id);

    pool.query(
        `DELETE FROM "${entity}" WHERE id = $1`,
        [id],
        (err, results) => {
            if (err) {
                throw err;
            }

            res.redirect(`/users/justtable?entity=${entity}`);
        }
    );
}

module.exports = { spaDelete };