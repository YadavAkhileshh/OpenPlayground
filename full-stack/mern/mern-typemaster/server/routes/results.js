const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Result = require('../models/Result');

// @route   GET api/results
// @desc    Get all user results
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const results = await Result.find({ user: req.user.id }).sort({ date: -1 });
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/results
// @desc    Add new result
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('wpm', 'WPM is required').not().isEmpty(),
            check('accuracy', 'Accuracy is required').not().isEmpty(),
            check('characters', 'Characters is required').not().isEmpty(),
            check('errors', 'Errors is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { wpm, accuracy, characters, errors: typingErrors, mode } = req.body;

        try {
            const newResult = new Result({
                user: req.user.id,
                wpm,
                accuracy,
                characters,
                errors: typingErrors,
                mode,
            });

            const result = await newResult.save();
            res.json(result);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route    GET api/results/stats
// @desc     Get user stats and goal progress
// @access   Private
router.get('/stats', auth, async (req, res) => {
    try {
        const results = await Result.find({ user: req.user.id }).sort({ date: -1 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const testsToday = results.filter(r => new Date(r.date) >= today).length;
        const bestWpm = results.length > 0 ? Math.max(...results.map(r => r.wpm)) : 0;
        const avgAccuracy = results.length > 0
            ? Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / results.length)
            : 0;

        // Simple achievement logic
        const achievements = [];
        if (results.length >= 1) achievements.push({ id: 1, name: 'Newbie', desc: 'Completed first test', icon: 'Trophy' });
        if (bestWpm >= 60) achievements.push({ id: 2, name: 'Speed Demon', desc: 'Hit 60+ WPM', icon: 'Zap' });
        if (results.length >= 100) achievements.push({ id: 3, name: 'Type Master', desc: 'Completed 100 tests', icon: 'Award' });
        if (avgAccuracy >= 95 && results.length >= 10) achievements.push({ id: 4, name: 'Sniper', desc: 'Maintain 95%+ accuracy', icon: 'Target' });

        res.json({
            testsToday,
            bestWpm,
            avgAccuracy,
            totalTests: results.length,
            achievements: achievements.slice(-3) // Return last 3
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
