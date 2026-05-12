import { AlertTriangle, Bug, CheckCircle2 } from "lucide-react";
import MetricCard from "../components/MetricCard";
import AuditTable from "../components/AuditTable";
import { mockAudits } from "../data/mockAudits";
import React from "react";

export default function Dashboard() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Hola Pablo</h1>
          <p className="mt-2 text-slate-400">
            Resumen de auditorías de código, severidades y actividad reciente.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <MetricCard title="Críticos" value="1" description="Riesgos de seguridad altos." icon={Bug} />
        <MetricCard title="Advertencias" value="1" description="Problemas técnicos moderados." icon={AlertTriangle} />
        <MetricCard title="Sugerencias" value="1" description="Mejoras de calidad y legibilidad." icon={CheckCircle2} />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Auditorías recientes</h2>
        <AuditTable audits={mockAudits} />
      </section>
    </div>
  );
}
