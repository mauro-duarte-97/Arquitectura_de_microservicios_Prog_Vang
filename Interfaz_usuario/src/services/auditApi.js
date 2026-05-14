import { apiFetch } from "./apiClient";
import { buildAuditFromAnalyzeResponse, mapHistoryEntry } from "../utils/auditMapper";

// === Autenticación ====================================================
// Endpoints expuestos por el microservicio Java en /api/v1/auth/*

function normalizeAuthResponse(authResponse) {
  // El backend devuelve: { accessToken, tokenType, expiresInMinutes, user }
  // Mantenemos un shape simple para el contexto de auth del frontend.
  return {
    token: authResponse?.accessToken,
    expiresInMinutes: authResponse?.expiresInMinutes ?? 0,
    user: {
      id: authResponse?.user?.id,
      email: authResponse?.user?.email,
      username: authResponse?.user?.username ?? authResponse?.user?.email,
      role: authResponse?.user?.role,
    },
  };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email y contraseña son obligatorios.");
  }

  const data = await apiFetch("/api/v1/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  return normalizeAuthResponse(data);
}

export async function registerUser({ username, email, password, confirmPassword }) {
  if (!username || !email || !password || !confirmPassword) {
    throw new Error("Todos los campos son obligatorios.");
  }
  if (password !== confirmPassword) {
    throw new Error("Las contraseñas no coinciden.");
  }
  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }

  const data = await apiFetch("/api/v1/auth/register", {
    method: "POST",
    auth: false,
    body: { email, username, password },
  });

  return normalizeAuthResponse(data);
}

export async function fetchCurrentUser() {
  return apiFetch("/api/v1/auth/me");
}

// === Análisis =========================================================

export async function analyzeCode({ language, code, mode = "Senior Dev" }) {
  if (!code || !code.trim()) {
    throw new Error("Hay que escribir código antes de analizar.");
  }
  const analyzeResponse = await apiFetch("/api/v1/analyze", {
    method: "POST",
    body: { code, language, mode },
  });

  return buildAuditFromAnalyzeResponse({
    analyzeResponse,
    code,
    language,
    id: analyzeResponse?.historyId,
    createdAt: new Date().toISOString(),
  });
}

// === Historial ========================================================

export async function getAuditHistory({ page = 0, size = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const data = await apiFetch(`/api/v1/history?${params.toString()}`);

  // Respuesta paginada de Spring: { content: [...], totalElements, ... }
  const content = Array.isArray(data?.content) ? data.content : [];
  return {
    items: content.map(mapHistoryEntry),
    totalElements: data?.totalElements ?? content.length,
    totalPages: data?.totalPages ?? 1,
    page: data?.number ?? page,
  };
}

export async function getAuditById(id) {
  const entry = await apiFetch(`/api/v1/history/${id}`);
  return mapHistoryEntry(entry);
}
