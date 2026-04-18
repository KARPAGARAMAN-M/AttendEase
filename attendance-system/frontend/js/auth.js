(() => {
    const APP_CONFIG = window.APP_CONFIG || {};
    const API_BASE = APP_CONFIG.apiBase || localStorage.getItem("apiBase") || "http://localhost:8080";
    const ROOT_PATH = APP_CONFIG.rootPath || ".";
    const LANDING_PAGE = "index.html";
    const LOGIN_PAGE = "login.html";

    function normalizePath(relativePath) {
        const rel = String(relativePath || "").replace(/^\/+/, "");
        const root = String(ROOT_PATH || ".").replace(/\/+$/, "");
        if (root === "." || root === "") {
            return rel;
        }
        return `${root}/${rel}`;
    }

    function getDashboardPath(role) {
        switch ((role || "").toUpperCase()) {
            case "ADMIN":
                return "admin/dashboard.html";
            case "TEACHER":
                return "teacher/dashboard.html";
            case "STUDENT":
                return "student/dashboard.html";
            case "HOD":
                return "hod/dashboard.html";
            default:
                return LOGIN_PAGE;
        }
    }

    function saveSession(token, user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
    }

    function getToken() {
        return localStorage.getItem("token");
    }

    function getCurrentUser() {
        const raw = localStorage.getItem("user");
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw);
        } catch (_) {
            return null;
        }
    }

    function clearSession() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    async function apiFetch(endpoint, options = {}) {
        const headers = new Headers(options.headers || {});
        const body = options.body;

        if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }

        const token = getToken();
        if (token && !headers.has("Authorization")) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const payload = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            const message = isJson && payload.message
                ? payload.message
                : `Request failed with status ${response.status}`;
            throw new Error(message);
        }

        return payload;
    }

    async function login(username, password) {
        const payload = await apiFetch("/api/login", {
            method: "POST",
            body: JSON.stringify({ username, password })
        });

        if (!payload.token || !payload.user) {
            throw new Error("Invalid login response from server");
        }

        saveSession(payload.token, payload.user);
        return payload.user;
    }

    function logout() {
        clearSession();
        window.location.href = normalizePath(LANDING_PAGE);
    }

    function goToDashboard(role) {
        window.location.href = normalizePath(getDashboardPath(role));
    }

    function requireAuth(allowedRoles = []) {
        const token = getToken();
        const user = getCurrentUser();

        if (!token || !user) {
            window.location.href = normalizePath(LOGIN_PAGE);
            return null;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes((user.role || "").toUpperCase())) {
            goToDashboard(user.role);
            return null;
        }

        return user;
    }

    function bindCommonUserUi() {
        const user = getCurrentUser();
        if (!user) {
            return;
        }

        document.querySelectorAll(".js-user-name").forEach((node) => {
            node.textContent = user.name;
        });

        document.querySelectorAll(".js-user-role").forEach((node) => {
            node.textContent = user.role;
        });

        document.querySelectorAll(".js-logout-btn").forEach((button) => {
            button.addEventListener("click", logout);
        });
    }

    window.Auth = {
        API_BASE,
        apiFetch,
        login,
        logout,
        saveSession,
        getToken,
        getCurrentUser,
        clearSession,
        requireAuth,
        goToDashboard,
        getDashboardPath,
        path: normalizePath
    };

    document.addEventListener("DOMContentLoaded", bindCommonUserUi);
})();
