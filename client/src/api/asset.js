import API from "./axios";

/* ===========================
   Assets
=========================== */

export const getAssets = (params = {}) => {
    return API.get("/assets", {
        params,
    });
};

export const createAsset = (payload) => {
    return API.post("/assets", payload);
};

export const getAssetHistory = (id) => {
    return API.get(`/assets/${id}/history`);
};

/* ===========================
   Categories
=========================== */

export const getCategories = () => {
    return API.get("/categories");
};

/* ===========================
   Departments
=========================== */

export const getDepartments = () => {
    return API.get("/departments");
};

export default {
    getAssets,
    createAsset,
    getAssetHistory,
    getCategories,
    getDepartments,
};