import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import LoadingAudit from "../components/LoadingAudit";
import { analyzeCode } from "../services/auditApi";
import React from "react";

const starterCode = `user_id = input()
query = 'SELECT * FROM users WHERE id = ' + user_id`;

export default function NewAudit() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(starterCode);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAnalyze() {
    setIsLoading(true);
    const result = await analyzeCode({ language, code });
    setIsLoading(false);
    navigate(`/audit/result/${result.id}`, { state: { audit: result } });
  }

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Nueva auditoría</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Analizar código</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Pegá un fragmento de código, seleccioná el lenguaje y enviá la solicitud al backend Java.
          Luego Java deberá comunicarse con Python para usar IA.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div>
              <p className="font-semibold text-white">Editor de código</p>
              <p className="text-sm text-slate-500">Compatible con Python, Java, Kotlin y JavaScript.</p>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none"
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="kotlin">Kotlin</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <CodeEditor language={language} value={code} onChange={setCode} />

          {isLoading && <LoadingAudit />}

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Analizando..." : "Analizar código"}
          </button>
        </section>

        <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="font-semibold text-white">Qué debería detectar</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>• Vulnerabilidades como SQL Injection o XSS.</li>
            <li>• Errores lógicos o sintácticos.</li>
            <li>• Oportunidades de refactorización.</li>
            <li>• Explicación pedagógica para el alumno.</li>
            <li>• Respuesta estructurada en JSON.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
