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
export const updateComplaint = (id, payload) => axiosInstance.patch(`/complaints/${id}/`, payload);
export const createComplaint = (payload) => axiosInstance.post("/complaints/", payload);
export const addComment = (id, payload) => axiosInstance.post(`/complaints/${id}/comments/`, payload);
export const uploadAttachment = (id, file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance.post(`/complaints/${id}/attachments/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
};
export const acceptComplaint = (id, payload = {}) => axiosInstance.post(`/complaints/${id}/vendor-accept/`, payload);
export const rejectComplaint = (id, rejectionReason, sentTo) => axiosInstance.post(`/complaints/${id}/vendor-reject/`, { rejection_reason: rejectionReason, sent_to: sentTo });

export const getDashboardOverview = () => axiosInstance.get("/dashboard/overview/");
export const getDashboardAnalytics = () => axiosInstance.get("/dashboard/analytics/");
export const getDashboardCharts = () => axiosInstance.get("/dashboard/charts/");
export const getVoluntaryRecalls = (params = {}) => axiosInstance.get("/recalls/voluntary/", { params });
export const getVoluntaryRecallById = (id) => axiosInstance.get(`/recalls/voluntary/${id}/`);
export const createVoluntaryRecall = (payload) => axiosInstance.post("/recalls/voluntary/", payload);

export const getSLASettings = () => axiosInstance.get("/sla/settings/");
export const updateSLASettings = (payload) => axiosInstance.post("/sla/settings/", payload);
export const getSLAViolations = () => axiosInstance.get("/sla/violations/");
