import API from "./axios";

/* GET */

export const getCategories = () =>
    API.get("/categories");

/* GET ONE */

export const getCategory = (id) =>
    API.get(`/categories/${id}`);

/* CREATE */

export const createCategory = (data) =>
    API.post("/categories", data);

/* UPDATE */

export const updateCategory = (id, data) =>
    API.put(`/categories/${id}`, data);