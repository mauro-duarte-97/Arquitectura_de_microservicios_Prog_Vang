import { useEffect, useState } from "react";
import AuditTable from "../components/AuditTable";
import { getAuditHistory } from "../services/auditApi";
import React from "react";

export default function History() {
  const [audits, setAudits] = useState([]);

  useEffect(() => {
    getAuditHistory().then(setAudits);
  }, []);

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Historial</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Auditorías realizadas</h1>
        <p className="mt-2 text-slate-400">
          Acá se listan las consultas previas realizadas por el usuario.
        </p>
      </div>

      <div className="mt-8">
        <AuditTable audits={audits} />
      </div>
    </div>
  );
}
