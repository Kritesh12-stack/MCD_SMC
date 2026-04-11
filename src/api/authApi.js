import axiosInstance from "./axiosInstance";

export const loginApi = (email, password) =>
    axiosInstance.post("/auth/login/", { email, password });

export const registerApi = (payload) =>
    axiosInstance.post("/auth/register/", payload);
