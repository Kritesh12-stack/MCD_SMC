import axiosInstance from "./axiosInstance";

export const getScorecardMappings = (productId) =>
    axiosInstance.get("/scorecards/mappings/", { params: { product_id: productId } });

export const uploadScorecardAttachment = (scorecardId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post(`/scorecards/${scorecardId}/attachments/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const generateScorecardReport = (scorecardId) =>
    axiosInstance.post(`/scorecards/${scorecardId}/report/`);

export const getScorecardReport = (scorecardId) =>
    axiosInstance.get(`/scorecards/${scorecardId}/report/`);

export const exportScorecardReport = (reportId) =>
    axiosInstance.get(`/scorecards/reports/${reportId}/export/`, { responseType: "blob" });

export const getScorecardAnalytics = (params = {}) =>
    axiosInstance.get("/scorecards/analytics/", { params });
