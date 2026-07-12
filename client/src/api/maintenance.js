import API from "./axios";

export const getMaintenance = () =>
    API.get("/maintenance");

export const updateMaintenance = (
    id,
    payload
) =>
    API.patch(
        `/maintenance/${id}/status`,
        payload
    );