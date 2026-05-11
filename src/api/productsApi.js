import axiosInstance from "./axiosInstance";

export const getProducts = () => axiosInstance.get("/products/products/");
