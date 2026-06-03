import axios, { isAxiosError, type InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Same-origin client. All requests target Next.js route handlers under
// `/api/*`, which proxy to the gateway and re-emit HttpOnly cookies onto the
// Next.js host. `withCredentials` ensures the browser attaches cookies to
// every request automatically — the JS layer never reads or holds tokens.
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

const resolveAll = () => {
  pendingRequests.forEach(({ resolve }) => resolve());
  pendingRequests = [];
};

const rejectAll = (error: unknown) => {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || !error.config) return Promise.reject(error);

    const original = error.config as InternalAxiosRequestConfig;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then(() => api(original));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // Use plain fetch instead of the `api` instance to keep the refresh
      // call outside this interceptor — otherwise a 401 from /auth/refresh
      // would recurse indefinitely.
      const refresh = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!refresh.ok) throw new Error("Refresh failed");

      resolveAll();
      return api(original);
    } catch (refreshError) {
      rejectAll(refreshError);
      const { default: useAuthStore } = await import("@/store/useAuthStore");
      useAuthStore.getState().logout();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
