const db = require('../db');

const getSnippets = async (req, res, next) => {
    try {
        const { search, tag, favorite, collectionId } = req.query;
        let query = `
            SELECT s.*, 
                   array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
                   c.name as collection_name
            FROM snippets s
            LEFT JOIN snippet_tags st ON s.id = st.snippet_id
            LEFT JOIN tags t ON st.tag_id = t.id
            LEFT JOIN collections c ON s.collection_id = c.id
        `;

        const params = [];
        const whereConditions = [];

        if (search) {
            params.push(`%${search}%`);
            whereConditions.push(`(s.title ILIKE $${params.length} OR s.description ILIKE $${params.length} OR s.code ILIKE $${params.length})`);
        }

        if (tag) {
            params.push(tag);
            whereConditions.push(`s.id IN (SELECT snippet_id FROM snippet_tags st2 JOIN tags t2 ON st2.tag_id = t2.id WHERE t2.name = $${params.length})`);
        }

        if (favorite === 'true') {
            whereConditions.push(`s.is_favorite = true`);
        }

        if (collectionId) {
            params.push(collectionId);
            whereConditions.push(`s.collection_id = $${params.length}`);
        }

        if (whereConditions.length > 0) {
            query += ` WHERE ` + whereConditions.join(' AND ');
        }

        query += ` GROUP BY s.id, c.name ORDER BY s.is_favorite DESC, s.created_at DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
};

const toggleFavorite = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'UPDATE snippets SET is_favorite = NOT is_favorite WHERE id = $1 RETURNING is_favorite',
            [id]
        );
        res.json({ is_favorite: result.rows[0].is_favorite });
    } catch (err) {
        next(err);
    }
};

const createSnippet = async (req, res, next) => {
    try {
        const { title, code, description, language, tags, collection_id } = req.body;

        const snippetResult = await db.query(
            'INSERT INTO snippets (title, code, description, language, collection_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, code, description, language, collection_id]
        );
        const newSnippet = snippetResult.rows[0];

        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                let tagResult = await db.query('SELECT id FROM tags WHERE name = $1', [tagName.toLowerCase()]);
                let tagId;

                if (tagResult.rows.length === 0) {
                    const insertTagResult = await db.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [tagName.toLowerCase()]);
                    tagId = insertTagResult.rows[0].id;
                } else {
                    tagId = tagResult.rows[0].id;
                }

                await db.query('INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ($1, $2)', [newSnippet.id, tagId]);
            }
        }

        res.status(201).json(newSnippet);
    } catch (err) {
        next(err);
    }
};

const updateSnippet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, code, description, language, tags, collection_id } = req.body;

        await db.query(
            'UPDATE snippets SET title = $1, code = $2, description = $3, language = $4, collection_id = $5 WHERE id = $6',
            [title, code, description, language, collection_id, id]
        );

        await db.query('DELETE FROM snippet_tags WHERE snippet_id = $1', [id]);

        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                let tagResult = await db.query('SELECT id FROM tags WHERE name = $1', [tagName.toLowerCase()]);
                let tagId;

                if (tagResult.rows.length === 0) {
                    const insertTagResult = await db.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [tagName.toLowerCase()]);
                    tagId = insertTagResult.rows[0].id;
                } else {
                    tagId = tagResult.rows[0].id;
                }

                await db.query('INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, tagId]);
            }
        }

        res.json({ message: 'Snippet updated' });
    } catch (err) {
        next(err);
    }
};

const deleteSnippet = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM snippets WHERE id = $1', [id]);
        res.json({ message: 'Snippet deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSnippets,
    toggleFavorite,
    createSnippet,
    updateSnippet,
    deleteSnippet
};
