const db = require('../db');

const getTags = async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM tags ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getTags
};
