// api/auth.js

import API from "./axios";

export const loginUser = (email, password) =>
    API.post("/auth/login", {
        email,
        password,
    });

export const signupUser = (name, email, password) =>
    API.post("/auth/signup", {
        name,
        email,
        password,
    });