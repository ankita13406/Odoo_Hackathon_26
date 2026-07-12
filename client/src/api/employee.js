import API from "./axios";

/* GET */

export const getEmployees = (params = {}) =>
    API.get("/employees", {
        params,
    });

/* PROMOTE */

export const promoteEmployee = (id, role) =>
    API.patch(`/employees/${id}/promote`, {
        role,
    });


