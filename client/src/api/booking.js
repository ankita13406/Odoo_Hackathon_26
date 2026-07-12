import API from "./axios";

export const getBookings = () =>
    API.get("/booking");

export const createBooking = (
    payload
) =>
    API.post("/booking", payload);