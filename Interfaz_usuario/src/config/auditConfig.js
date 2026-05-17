// Límite de caracteres permitido en el editor de código.
// El microservicio Python usa modelos LLM gratuitos (qwen2.5-coder:7b vía Ollama), por lo
// que mantenemos el input acotado para que el análisis sea razonablemente
// rápido y no sature el agente.
export const MAX_CODE_CHARS = 2000;

// Lenguajes soportados según el Contexto.md (mínimo 3).
// El value se manda tal cual al backend y a Monaco como `language`.
export const SUPPORTED_LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "kotlin", label: "Kotlin" },
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0].value;
