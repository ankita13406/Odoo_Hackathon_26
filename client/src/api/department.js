
import API from "./axios";

/* GET */

export const getDepartments = () =>
    API.get("/departments");

/* GET ONE */

export const getDepartment = (id) =>
    API.get(`/departments/${id}`);

/* CREATE */

export const createDepartment = (data) =>
    API.post("/departments", data);

/* UPDATE */

export const updateDepartment = (id, data) =>
    API.put(`/departments/${id}`, data);

/* DEACTIVATE */

export const deactivateDepartment = (id) =>
    API.patch(`/departments/${id}/deactivate`);

/* DELETE */

export const deleteDepartment = (id) =>
    API.delete(`/departments/${id}`);