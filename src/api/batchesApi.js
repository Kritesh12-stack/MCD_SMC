import axiosInstance from "./axiosInstance";

/**
 * GET /api/v1/batches/
 * Uses the same axios instance as complaints (Bearer from localStorage user.access).
 *
 * Observed **401** envelope from server (expired/invalid token example):
 * ```json
 * {
 *   "success": false,
 *   "data": null,
 *   "error": { "message": "User not found", "details": null }
 * }
 * ```
 *
 * Confirmed **200** envelope (empty list):
 * ```json
 * {
 *   "success": true,
 *   "data": [],
 *   "error": null,
 *   "meta": { "total": 0, "page": 1, "page_size": 20, "total_pages": 1 }
 * }
 * ```
 * `data` is the batch array. Pagination lives on `meta`.
 *
 * Also supported by normalizer: nested `results`, raw arrays.
 */
export const getBatches = (params = {}) => axiosInstance.get("/batches/", { params });
export const getBatch = (id) => axiosInstance.get(`/batches/${id}/`);
export const generateIds = (body = { generate_batch_id: true, generate_sample_id: true }) =>
    axiosInstance.post("/batches/generate-ids/", body);
export const createReport = (body) => axiosInstance.post("/batches/create-report/", body);
export const marketReviewBatch = (id, body) => axiosInstance.post(`/batches/${id}/market-review/`, body);
export const regionalReviewBatch = (id, body) => axiosInstance.post(`/batches/${id}/regional-review/`, body);
export const addBatchSubmission = (id, body) => axiosInstance.post(`/batches/${id}/submissions/`, body);
export const submitBatch = (id, body = {}) => axiosInstance.post(`/batches/${id}/submit/`, body);
export const sendBatchFeedback = (id, body = {}) => axiosInstance.post(`/batches/${id}/send-feedback/`, body);
export const getBatchCharts = (id) => axiosInstance.get(`/batches/${id}/charts/`);
export const addBatchComment = (id, body) => axiosInstance.post(`/batches/${id}/comment/`, body);
