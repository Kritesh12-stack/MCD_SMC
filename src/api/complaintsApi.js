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
export const addComment = (id, text, visibility, notifiedRoles) => axiosInstance.post(`/complaints/${id}/comments/`, { text, visibility, notified_roles: notifiedRoles });
export const uploadAttachment = (id, file) => {
    const fd = new FormData();
    fd.append("file", file);
    return axiosInstance.post(`/complaints/${id}/attachments/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
};
export const acceptComplaint = (id, payload = {}) => axiosInstance.post(`/complaints/${id}/vendor-accept/`, payload);
export const rejectComplaint = (id, rejectionReason, notifiedRoles) => axiosInstance.post(`/complaints/${id}/vendor-reject/`, { rejection_reason: rejectionReason, notified_roles: notifiedRoles });
export const submitStockAction = (id, payload) => axiosInstance.post(`/complaints/${id}/stock-action/`, payload);

export const getDashboardOverview = () => axiosInstance.get("/dashboard/overview/");
export const getDashboardAnalytics = () => axiosInstance.get("/dashboard/analytics/");
export const getDashboardCharts = () => axiosInstance.get("/dashboard/charts/");
export const getVoluntaryRecalls = (params = {}) => axiosInstance.get("/recalls/voluntary/", { params });
export const getVoluntaryRecallById = (id) => axiosInstance.get(`/recalls/voluntary/${id}/`);
export const createVoluntaryRecall = (payload) => axiosInstance.post("/recalls/voluntary/", payload);

export const getMockRecalls = (params = {}) => axiosInstance.get("/recalls/mock/", { params });
export const getMockRecallById = (id) => axiosInstance.get(`/recalls/mock/${id}/`);
export const createMockRecall = (payload) => axiosInstance.post("/recalls/mock/", payload);
export const updateMockRecall = (id, payload) => axiosInstance.put(`/recalls/mock/${id}/`, payload);
export const patchMockRecall = (id, payload) => axiosInstance.patch(`/recalls/mock/${id}/`, payload);
export const deleteMockRecall = (id) => axiosInstance.delete(`/recalls/mock/${id}/`);
export const acceptMockRecall = (id, reason) => axiosInstance.post(`/recalls/mock/${id}/accept/`, { reason });
export const rejectMockRecall = (id, reason) => axiosInstance.post(`/recalls/mock/${id}/reject/`, { reason });

export const getSLASettings = () => axiosInstance.get("/sla/settings/");
export const updateSLASettings = (payload) => axiosInstance.post("/sla/settings/", payload);
export const getSLAViolations = () => axiosInstance.get("/sla/violations/");
export const getNotifications = (params = {}) => axiosInstance.get("/notifications/", { params });
export const getNotificationById = (id) => axiosInstance.get(`/notifications/${id}/`);
export const markNotificationRead = (id) => axiosInstance.post(`/notifications/${id}/read/`);
export const getUnreadNotificationCount = () => axiosInstance.get("/notifications/unread-count/");
