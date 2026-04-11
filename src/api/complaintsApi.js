import axiosInstance from "./axiosInstance";

export const getProducts = () => axiosInstance.get("/products/products/");
export const getProductCategories = () => axiosInstance.get("/products/categories/");
export const getProductSubCategories = () => axiosInstance.get("/products/sub-categories/");
export const getSuppliers = () => axiosInstance.get("/products/suppliers/");
export const getComplaintCategories = () => axiosInstance.get("/complaints/categories/");
export const getComplaintSubCategories = () => axiosInstance.get("/complaints/sub-categories/");
export const getFacilities = () => axiosInstance.get("/complaints/facilities/");

export const createComplaint = (payload) => axiosInstance.post("/complaints/", payload);
