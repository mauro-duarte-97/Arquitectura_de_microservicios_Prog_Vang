import { useEffect, useState } from "react";
import AuditTable from "../components/AuditTable";
import { getAuditHistory } from "../services/auditApi";
import React from "react";

export default function History() {
  const [audits, setAudits] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getAuditHistory()
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

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Historial</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Auditorías realizadas</h1>
        <p className="mt-2 text-slate-400">
          Acá se listan las consultas previas realizadas con tu usuario.
        </p>
      </div>

      <div className="mt-8">
        {error && (
          <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p>
        )}

        {isLoading ? (
          <p className="text-slate-400">Cargando historial...</p>
        ) : audits.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-400">
            Todavía no realizaste auditorías. Probá crear una desde "Nueva auditoría".
          </div>
        ) : (
          <AuditTable audits={audits} />
        )}
      </div>
    </div>
  );
}
