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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Si ya tenemos la auditoría desde navigate(state), no la volvemos a pedir.
    // El historial recién persistido en backend puede no ser visible hasta el próximo refetch.
    if (audit) return;
    // Sólo los IDs sintéticos `local-...` no existen en backend (cuando el
    // microservicio Java aún no devuelve historyId). En esos casos no podemos
    // recuperar el detalle por GET; pedimos al usuario que vuelva al listado.
    if (!id || String(id).startsWith("local-")) {
      setError("La auditoría no está disponible. Volvé al listado.");
      return;
    }
    setIsLoading(true);
    getAuditById(id)
      .then(setAudit)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id, audit]);

  if (error && !audit) {
    return <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p>;
  }
  if (isLoading || !audit) {
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
        {audit.issues.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-slate-400">
            La IA no detectó problemas en este fragmento.
          </p>
        ) : (
          <div className="space-y-4">
            {audit.issues.map((issue, index) => (
              <IssueCard key={index} issue={issue} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-xl font-semibold text-white">Explicación pedagógica</h2>
        <p className="mt-3 whitespace-pre-line leading-7 text-slate-400">
          {audit.pedagogicalExplanation}
        </p>
      </section>
    </div>
  );
}
