import { apiFetch } from "./api";

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  return apiFetch<LoginResult>("/api/v1/Auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function saveSession(result: LoginResult) {
  localStorage.setItem("bmedia_token", result.accessToken);
  localStorage.setItem("bmedia_refresh_token", result.refreshToken);
  localStorage.setItem("bmedia_user", JSON.stringify(result.user));
}

export function clearSession() {
  localStorage.removeItem("bmedia_token");
  localStorage.removeItem("bmedia_refresh_token");
  localStorage.removeItem("bmedia_user");
}

export function getUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("bmedia_user");
  return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("bmedia_token");
}
