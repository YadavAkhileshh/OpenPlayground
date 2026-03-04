const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  category: String,
  reminderTime: Number, // minutes before event
  recurring: String, // none, daily, weekly
  email: String
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);