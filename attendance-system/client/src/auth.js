const TOKEN_KEY = "attendease_token";
const USER_KEY = "attendease_user";

export const ROLE_PATH = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  HOD: "/hod",
};

export function loadSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  if (!token || !userRaw) {
    return { token: "", user: null };
  }
  try {
    return { token, user: JSON.parse(userRaw) };
  } catch {
    return { token: "", user: null };
  }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function rolePath(role) {
  return ROLE_PATH[String(role || "").toUpperCase()] || "/login";
}
