import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/events"
});

export const getEvents = () => API.get("/");
export const addEvent = (data) => API.post("/", data);
export const deleteEvent = (id) => API.delete(`/${id}`);