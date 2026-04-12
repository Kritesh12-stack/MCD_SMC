import axios from 'axios';
import axiosInstance from "./axiosInstance";

export const loginApi = (email, password) =>
    axiosInstance.post("/auth/login/", { email, password });

export const registerApi = (payload) =>
    axiosInstance.post("/auth/register/", payload);

export const logoutApi = (refresh) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return axios.post("/api/v1/auth/logout/", { refresh }, {
        headers: {
            Authorization: `Bearer ${user.access}`,
            'Content-Type': 'application/json',
        }
    });
};
