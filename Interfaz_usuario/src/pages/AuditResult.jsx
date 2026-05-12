import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import IssueCard from "../components/IssueCard";
import SeverityBadge from "../components/SeverityBadge";
import { getAuditById } from "../services/auditApi";
import React from "react";

export default function AuditResult() {
  const { id } = useParams();
  const location = useLocation();
  const [audit, setAudit] = useState(location.state?.audit ?? null);

  useEffect(() => {
    if (!audit) {
      getAuditById(id).then(setAudit);
    }
  }, [id, audit]);

  if (!audit) {
    return <p className="text-slate-400">Cargando auditoría...</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Resultado</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{audit.title}</h1>
          <p className="mt-2 max-w-3xl text-slate-400">{audit.summary}</p>
        </div>
        <SeverityBadge severity={audit.globalSeverity} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">Código original</h2>
          <CodeEditor language={audit.language} value={audit.originalCode} readOnly />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">Código refactorizado</h2>
          <CodeEditor language={audit.language} value={audit.refactoredCode} readOnly />
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Problemas detectados</h2>
        <div className="space-y-4">
          {audit.issues.map((issue, index) => (
            <IssueCard key={index} issue={issue} />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-xl font-semibold text-white">Explicación pedagógica</h2>
        <p className="mt-3 leading-7 text-slate-400">{audit.pedagogicalExplanation}</p>
      </section>
    </div>
  );
}
