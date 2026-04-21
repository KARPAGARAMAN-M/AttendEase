const API_BASE = import.meta.env.VITE_API_BASE || "";

function buildUrl(endpoint) {
  return `${API_BASE}${endpoint}`;
}

function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function apiFetch(endpoint, options = {}) {
  const method = options.method || "GET";
  const headers = new Headers(options.headers || {});

  if (options.token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(endpoint), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      isJson && payload && typeof payload === "object" && payload.message
        ? payload.message
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function downloadFile(endpoint, params = {}, token, filename) {
  const response = await fetch(buildUrl(`${endpoint}${toQuery(params)}`), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const maybeJson = response.headers.get("content-type")?.includes("application/json");
    if (maybeJson) {
      const payload = await response.json();
      throw new Error(payload.message || "Download failed");
    }
    throw new Error("Download failed");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export { API_BASE, toQuery };
