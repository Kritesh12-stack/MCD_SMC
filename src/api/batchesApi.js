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
export const generateIds = (body = { generate_batch_id: true, generate_sample_id: true }) =>
    axiosInstance.post("/batches/generate-ids/", body);
