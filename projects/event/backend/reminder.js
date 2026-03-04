const cron = require("node-cron");
const Event = require("./models/Event");
const nodemailer = require("nodemailer");

cron.schedule("* * * * *", async () => {
  const now = new Date();

  const events = await Event.find();

  events.forEach(async event => {
    const reminderDate = new Date(event.date);
    reminderDate.setMinutes(reminderDate.getMinutes() - event.reminderTime);

    if (
      now.getFullYear() === reminderDate.getFullYear() &&
      now.getMonth() === reminderDate.getMonth() &&
      now.getDate() === reminderDate.getDate() &&
      now.getHours() === reminderDate.getHours() &&
      now.getMinutes() === reminderDate.getMinutes()
    ) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL,
        to: event.email,
        subject: "Event Reminder",
        text: `Reminder: ${event.title} at ${event.date}`
      });

      console.log("Reminder Sent!");
    }
  });
});