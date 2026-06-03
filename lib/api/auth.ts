import api from "./client";

export type LoginResponse = { message: string };
export type LogoutResponse = { success: boolean; message: string };
export type RefreshResponse = { success: boolean };

export async function Login({ email, password }: { email: string; password: string }) {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  return data;
}

export async function Logout() {
  const { data } = await api.post<LogoutResponse>("/auth/logout");
  return data;
}

// The axios client refreshes automatically on 401 — this is exposed for
// explicit manual refresh (e.g. polling, app focus).
export async function RefreshToken() {
  const { data } = await api.post<RefreshResponse>("/auth/refresh");
  return data;
}
