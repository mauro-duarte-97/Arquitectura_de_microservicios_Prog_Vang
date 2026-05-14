// Cliente HTTP central que adjunta el JWT y normaliza errores del backend Java.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const TOKEN_STORAGE_KEY = "code-audit-ai.token";
const USER_STORAGE_KEY = "code-audit-ai.user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistSession({ token, user }) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

// Extrae el mensaje de error que devuelve Spring Boot (ResponseStatusException, validaciones, etc.)
async function buildError(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // body vacío o no-JSON
  }

  const message =
    payload?.message ||
    payload?.error ||
    payload?.detail ||
    (Array.isArray(payload?.errors) ? payload.errors.join(", ") : null) ||
    `Error ${response.status}: ${response.statusText || "respuesta no esperada del servidor"}`;

  const error = new Error(message);
  error.status = response.status;
  error.payload = payload;
  return error;
}

export async function apiFetch(path, { method = "GET", body, auth = true, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (networkError) {
    throw new Error(
      `No se pudo conectar con el backend (${API_BASE_URL}). ¿Está corriendo el microservicio Java?`
    );
  }

  if (response.status === 401 && auth) {
    clearSession();
    // Aviso al resto de la app (AuthProvider) para que reaccione sin esperar a un refresh.
    window.dispatchEvent(new CustomEvent("code-audit-ai:unauthorized"));
  }

  if (!response.ok) {
    throw await buildError(response);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export const apiConfig = { baseUrl: API_BASE_URL };
