const db = require('../db');

const getCollections = async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM collections ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
};

const createCollection = async (req, res, next) => {
    try {
        const { name, color } = req.body;
        const result = await db.query(
            'INSERT INTO collections (name, color) VALUES ($1, $2) RETURNING *',
            [name, color]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getCollections,
    createCollection
};
