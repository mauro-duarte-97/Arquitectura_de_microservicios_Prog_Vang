import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bug, CheckCircle2 } from "lucide-react";
import MetricCard from "../components/MetricCard";
import AuditTable from "../components/AuditTable";
import { getAuditHistory } from "../services/auditApi";
import { useAuth } from "../context/AuthContext";
import React from "react";

function countIssuesBySeverity(audit, severity) {
  if (!audit) return 0;
  return audit.issues.filter((issue) => issue.severity === severity).length;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [audits, setAudits] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getAuditHistory({ size: 5 })
      .then((data) => {
        if (!cancelled) setAudits(data.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Métricas calculadas sobre el último análisis del historial.
  const latestAudit = audits[0] ?? null;
  const metrics = useMemo(
    () => ({
      critical: countIssuesBySeverity(latestAudit, "critical"),
      warning: countIssuesBySeverity(latestAudit, "warning"),
      suggestion: countIssuesBySeverity(latestAudit, "suggestion"),
    }),
    [latestAudit]
  );

  const displayName = user?.username || user?.email || "alumno";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Hola {displayName}</h1>
          <p className="mt-2 text-slate-400">
            Resumen del último análisis realizado y actividad reciente.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <MetricCard
          title="Críticos"
          value={metrics.critical}
          description="Riesgos de seguridad altos en el último análisis."
          icon={Bug}
        />
        <MetricCard
          title="Advertencias"
          value={metrics.warning}
          description="Problemas técnicos moderados detectados."
          icon={AlertTriangle}
        />
        <MetricCard
          title="Sugerencias"
          value={metrics.suggestion}
          description="Mejoras de calidad y legibilidad."
          icon={CheckCircle2}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Auditorías recientes</h2>
        {isLoading ? (
          <p className="text-slate-400">Cargando...</p>
        ) : audits.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-400">
            Todavía no hiciste auditorías. Empezá creando una nueva.
          </div>
        ) : (
          <AuditTable audits={audits} />
        )}
      </section>
    </div>
  );
}
