import axiosInstance from "./axiosInstance";

// Dropdown options
export const getProducts = () => axiosInstance.get("/products/products/");
export const getProductCategories = () => axiosInstance.get("/products/categories/");
export const getProductSubCategories = () => axiosInstance.get("/products/sub-categories/");
export const getSuppliers = () => axiosInstance.get("/products/suppliers/");
export const getComplaintCategories = () => axiosInstance.get("/complaints/categories/");
export const getComplaintSubCategories = () => axiosInstance.get("/complaints/sub-categories/");
export const getFacilities = () => axiosInstance.get("/complaints/facilities/");

// Complaints CRUD
export const getComplaints = (params = {}) => axiosInstance.get("/complaints/", { params });
export const getComplaintById = (id) => axiosInstance.get(`/complaints/${id}/`);
export const createComplaint = (payload) => axiosInstance.post("/complaints/", payload);
export const addComment = (id, payload) => axiosInstance.post(`/complaints/${id}/comments/`, payload);
