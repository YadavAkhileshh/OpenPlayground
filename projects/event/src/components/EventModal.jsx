import { useState } from "react";
import { addEvent } from "../services/api";

function EventModal({ date, closeModal, refreshEvents }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "Work",
    email: "",
    reminderTime: 10
  });

  const handleSubmit = async () => {
    await addEvent({ ...formData, date });
    refreshEvents();
    closeModal();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">

      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-96 transform transition-all duration-300 scale-100">

        <h2 className="text-2xl font-bold text-indigo-600 mb-6">
          ✨ Create Event
        </h2>

        <input
          type="text"
          placeholder="Event Title"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-400 outline-none"
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />

        <select
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-400 outline-none"
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
        >
          <option>Work</option>
          <option>Personal</option>
          <option>Meeting</option>
        </select>

        <input
          type="email"
          placeholder="Email for reminder"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-400 outline-none"
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Reminder (minutes before)"
          className="w-full border border-gray-300 p-3 rounded-lg mb-6 focus:ring-2 focus:ring-indigo-400 outline-none"
          onChange={(e) =>
            setFormData({ ...formData, reminderTime: e.target.value })
          }
        />

        <div className="flex justify-end gap-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}

export default EventModal;