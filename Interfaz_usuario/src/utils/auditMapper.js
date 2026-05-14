// Adapta los DTOs del backend Java (Microservicio_gestion_persistencia) al modelo
// que esperan los componentes del frontend. Mantenemos el mapeo concentrado para
// que los componentes no conozcan la forma del backend.

const SEVERITY_RANK = { critical: 3, warning: 2, suggestion: 1 };

export function mapSeverity(rawSeverity) {
  if (!rawSeverity) return "suggestion";
  const normalized = String(rawSeverity).toLowerCase();

  if (["critical", "error", "high"].includes(normalized)) return "critical";
  if (["warning", "warn", "medium"].includes(normalized)) return "warning";
  if (["info", "suggestion", "low", "hint"].includes(normalized)) return "suggestion";

  return "suggestion";
}

export function pickWorstSeverity(issues = []) {
  let worst = "suggestion";
  for (const issue of issues) {
    const sev = mapSeverity(issue?.severity);
    if (SEVERITY_RANK[sev] > SEVERITY_RANK[worst]) worst = sev;
  }
  return worst;
}

function extractTitleFromMessage(message, fallback = "Hallazgo detectado") {
  if (!message) return fallback;
  const firstLine = String(message).split("\n")[0].trim();
  if (firstLine.length <= 80) return firstLine || fallback;
  return `${firstLine.slice(0, 77)}...`;
}

function buildSummary(explanation, fallback = "Análisis ejecutado sin observaciones detalladas.") {
  if (!explanation) return fallback;
  const firstSentence = String(explanation).split(/(?<=[\.\!\?])\s/)[0];
  return firstSentence?.trim() || fallback;
}

function buildTitle(language, issues = []) {
  if (issues.length === 0) {
    return `Análisis ${language ? `de ${capitalize(language)}` : "de código"} sin hallazgos`;
  }
  const worst = pickWorstSeverity(issues);
  const critical = issues.find((i) => mapSeverity(i.severity) === worst);
  return extractTitleFromMessage(critical?.message, `Análisis de ${language ?? "código"}`);
}

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(isoString) {
  if (!isoString) return new Date().toISOString().slice(0, 10);
  try {
    return new Date(isoString).toISOString().slice(0, 10);
  } catch {
    return String(isoString).slice(0, 10);
  }
}

function mapIssue(issue) {
  const severity = mapSeverity(issue?.severity);
  return {
    severity,
    type: issue?.type ?? severity,
    title: extractTitleFromMessage(issue?.message),
    line: issue?.line ?? 0,
    description: issue?.message ?? "Sin descripción",
    // El backend actual no devuelve recomendación por issue: usamos string vacío
    // para que el componente IssueCard decida si renderiza la sección o no.
    recommendation: issue?.recommendation ?? "",
  };
}

// Combina la respuesta cruda de POST /api/v1/analyze con el código y lenguaje
// enviados desde el frontend, para construir el objeto de auditoría completo
// que renderean Dashboard / AuditResult / History.
export function buildAuditFromAnalyzeResponse({ analyzeResponse, code, language, id, createdAt }) {
  const issues = (analyzeResponse?.issues ?? []).map(mapIssue);
  return {
    id: id ?? `local-${Date.now()}`,
    date: formatDate(createdAt),
    language: language ?? "python",
    globalSeverity: pickWorstSeverity(issues),
    title: buildTitle(language, analyzeResponse?.issues ?? []),
    summary: buildSummary(analyzeResponse?.explanation),
    originalCode: code ?? "",
    refactoredCode: analyzeResponse?.refactoredCode ?? code ?? "",
    pedagogicalExplanation:
      analyzeResponse?.explanation ?? "El servicio de IA no devolvió una explicación pedagógica.",
    issues,
  };
}

// Mapea un AnalysisHistoryResponse de Spring al modelo del frontend.
export function mapHistoryEntry(entry) {
  return buildAuditFromAnalyzeResponse({
    analyzeResponse: entry?.response,
    code: entry?.code,
    language: entry?.language,
    id: entry?.id,
    createdAt: entry?.createdAt,
  });
}
