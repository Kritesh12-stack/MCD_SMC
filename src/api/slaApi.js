import axiosInstance from "./axiosInstance";

export const getSLASettings = () => axiosInstance.get("/sla/settings/");
export const updateSLASettings = (payload) => axiosInstance.put("/sla/settings/", payload);
export const getSLAViolations = () => axiosInstance.get("/sla/violations/");
