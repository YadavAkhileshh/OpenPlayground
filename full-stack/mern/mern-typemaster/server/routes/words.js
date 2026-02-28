const express = require('express');
const router = express.Router();
const words = require('../data/words');

// @route   GET api/words
// @desc    Get random words for typing test
// @access  Public
router.get('/', (req, res) => {
    const count = req.query.count || 50;
    const shuffled = words.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    res.json(selected);
});

module.exports = router;
