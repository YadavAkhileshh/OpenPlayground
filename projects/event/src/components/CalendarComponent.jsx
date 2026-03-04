import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { getEvents, deleteEvent } from "../services/api";

function CalendarComponent({ openModal }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const getColor = (category) => {
    switch (category) {
      case "Work": return "#3B82F6";
      case "Personal": return "#10B981";
      case "Meeting": return "#F59E0B";
      default: return "#8B5CF6";
    }
  };

  const fetchEvents = async () => {
    const res = await getEvents();

    const formatted = res.data.map((event) => ({
      id: event._id,
      title: event.title,
      start: event.date,
      backgroundColor: getColor(event.category),
      borderRadius: "8px"
    }));

    setEvents(formatted);
  };

  const handleDelete = async (id) => {
    await deleteEvent(id);
    fetchEvents();
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        start: "prev,next today",
        center: "title",
        end: ""
      }}
      events={events}
      dateClick={(info) => openModal(info.dateStr, fetchEvents)}
      eventClick={(info) => handleDelete(info.event.id)}
      height="90%"
    />
  );
}

export default CalendarComponent;