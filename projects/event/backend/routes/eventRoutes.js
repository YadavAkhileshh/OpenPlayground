const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// Add Event
router.post("/", async (req, res) => {
  const event = new Event(req.body);
  await event.save();
  res.json(event);
});

// Get Events
router.get("/", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Update Event
router.put("/:id", async (req, res) => {
  const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete Event
router.delete("/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;