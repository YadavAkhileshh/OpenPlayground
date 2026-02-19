const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    wpm: {
        type: Number,
        required: true,
    },
    accuracy: {
        type: Number,
        required: true,
    },
    characters: {
        type: Number,
        required: true,
    },
    errors: {
        type: Number,
        required: true,
    },
    mode: {
        type: String,
        default: 'time',
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('result', ResultSchema);
