import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "/api/v1",
    headers: { "Content-Type": "application/json", accept: "application/json" },
});

// Attach access token to every request
axiosInstance.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("[axios] Token:", user?.access ? "present" : "missing");
    if (user?.access) {
        config.headers.Authorization = `Bearer ${user.access}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
    failedQueue = [];
}

// Handle 401 → try refresh → retry original request → else redirect to login
axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        if (error?.response?.status === 401 && !original._retry) {
            original._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(original);
                });
            }

            isRefreshing = true;
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            try {
                const { data } = await axios.post(
                    "/api/v1/auth/token/refresh/",
                    { refresh: user.refresh }
                );

                const updated = { ...user, access: data.access, refresh: data.refresh };
                localStorage.setItem("user", JSON.stringify(updated));

                axiosInstance.defaults.headers.Authorization = `Bearer ${data.access}`;
                original.headers.Authorization = `Bearer ${data.access}`;

                processQueue(null, data.access);
                return axiosInstance(original);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem("user");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Normalize error for all other cases
        const message =
            error?.response?.data?.error?.message ||
            error?.response?.data?.detail ||
            error?.message ||
            "Something went wrong";

        return Promise.reject({ message, details: error?.response?.data?.error?.details || {} });
    }
);

export default axiosInstance;
