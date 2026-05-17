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

<<<<<<< Updated upstream
=======
// Patrones conocidos: si el mensaje contiene alguna de estas frases, devolvemos
// directamente la etiqueta corta. Es el atajo mas barato y deterministico antes
// de caer al heuristico generico de "primeras N palabras".
const TITLE_PATTERNS = [
  { re: /sql\s*injection|inyecc[ií]o?n\s*sql/i, label: "INYECCION SQL" },
  { re: /command\s*injection|inyecc[ií]o?n\s*de\s*comando/i, label: "INYECCION DE COMANDOS" },
  { re: /path\s*traversal/i, label: "PATH TRAVERSAL" },
  { re: /xss|cross.site\s*scripting/i, label: "XSS" },
  { re: /hardcoded|contrase[nñ]a\s*(hardcodeada|en\s*el\s*c[oó]digo)/i, label: "CONTRASENA HARDCODEADA" },
  { re: /weak\s*crypto|criptograf[ií]a\s*d[eé]bil/i, label: "CRIPTOGRAFIA DEBIL" },
  { re: /sin\s*manejo\s*de\s*errores|exception\s*handling|try\W?except|try\W?catch/i, label: "FALTA MANEJO DE ERRORES" },
  { re: /system\.out\.println|uso\s*de\s*print|uso\s*de\s*println/i, label: "LOG EN PRODUCCION" },
  { re: /syntaxerror|error\s*de\s*sintaxis|sintaxis\s*inv[aá]lida/i, label: "ERROR DE SINTAXIS" },
  { re: /expected\s*['"]?:['"]?|falta\s*[''"]?:[''"]?|dos\s*puntos/i, label: "FALTA DE DOS PUNTOS" },
  { re: /indent(aci[oó]n|ation)/i, label: "ERROR DE INDENTACION" },
  { re: /variable\s*no\s*definida|undefined\s*variable|name\s*['"][^'"]+['"]\s*is\s*not\s*defined/i, label: "VARIABLE NO DEFINIDA" },
  { re: /off.by.one|fuera\s*de\s*rango/i, label: "OFF-BY-ONE" },
  { re: /todo|fixme/i, label: "TODO/FIXME PENDIENTE" },
];

function deriveTitleFromMessage(message) {
  if (!message) return "HALLAZGO DETECTADO";

  for (const { re, label } of TITLE_PATTERNS) {
    if (re.test(message)) return label;
  }

  // Fallback final: primeras 4-5 palabras del mensaje en mayusculas, sin signos.
  const firstSentence = String(message).split(/(?<=[\.\!\?])\s/)[0] || "";
  const words = firstSentence
    .replace(/[`"'.,;:()]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "HALLAZGO DETECTADO";

  const short = words.slice(0, 5).join(" ");
  return short.toUpperCase();
}

// Decide el titulo definitivo del card a partir de lo que mando el backend.
// Reglas: si el backend trae un "title" corto (<= 6 palabras), se respeta.
// Si trae uno largo (el modelo a veces copia el mensaje completo aca), lo
// recortamos. Si no trae nada, derivamos uno desde el mensaje.
function pickIssueTitle(rawTitle, message) {
  if (typeof rawTitle === "string") {
    const trimmed = rawTitle.trim();
    if (trimmed.length > 0) {
      const words = trimmed.split(/\s+/);
      // Si el modelo nos mando una frase larga como "title", ignoramos y
      // derivamos uno corto desde el mensaje (los patrones suelen acertar).
      if (words.length <= 6 && trimmed.length <= 50) {
        return trimmed.toUpperCase();
      }
    }
  }
  return deriveTitleFromMessage(message);
}

// Helper viejo, mantenido por compatibilidad con `buildTitle` (titulo de la
// auditoria completa, no de cada issue). Esto no afecta a los cards.
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  return {
    severity,
    type: issue?.type ?? severity,
    title: extractTitleFromMessage(issue?.message),
=======
  // El titulo del card es SIEMPRE una etiqueta corta. Reglas (ver pickIssueTitle):
  //   1. Si el backend mando un `title` corto (<= 6 palabras), se respeta.
  //   2. Si mando algo largo o no mando nada, derivamos un titulo desde el
  //      mensaje usando patrones conocidos ("INYECCION SQL", "ERROR DE
  //      SINTAXIS", etc.) o, como ultimo recurso, las primeras 5 palabras
  //      del mensaje en mayusculas.
  // Asi nunca dependemos de que el LLM siga el contrato a rajatabla.
  const title = pickIssueTitle(issue?.title, issue?.message);
  return {
    severity,
    type: issue?.type ?? severity,
    title,
>>>>>>> Stashed changes
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
