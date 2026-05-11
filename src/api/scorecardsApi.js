import axiosInstance from "./axiosInstance";

export const getScorecardMappings = (productId) =>
    axiosInstance.get("/scorecards/mappings/", { params: { product_id: productId } });
