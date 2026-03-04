import { useState } from "react";
import CalendarComponent from "./components/CalendarComponent";
import EventModal from "./components/EventModal";

function App() {
  const [modalData, setModalData] = useState(null);

  const openModal = (date, refreshEvents) => {
    setModalData({ date, refreshEvents });
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">

      {/* Sidebar */}
      <div className="w-64 bg-white/40 backdrop-blur-lg shadow-xl p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6">
          📅 Scheduler
        </h1>

        <button
          onClick={() => openModal(new Date().toISOString())}
          className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition mb-6"
        >
          + Add Event
        </button>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Work
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span> Personal
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Meeting
          </div>
        </div>

        <div className="mt-auto text-sm text-gray-600">
          Designed by You 💙
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-1 p-8">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-6 h-full">
          <CalendarComponent openModal={openModal} />
        </div>
      </div>

      {modalData && (
        <EventModal
          date={modalData.date}
          refreshEvents={modalData.refreshEvents}
          closeModal={closeModal}
        />
      )}
    </div>
  );
}

export default App;