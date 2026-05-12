export const severityConfig = {
  critical: {
    label: "Crítico",
    className: "bg-red-500/15 text-red-300 border-red-500/30",
  },
  warning: {
    label: "Advertencia",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  suggestion: {
    label: "Sugerencia",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
};

export function getSeverityConfig(severity) {
  return severityConfig[severity] ?? severityConfig.suggestion;
}
