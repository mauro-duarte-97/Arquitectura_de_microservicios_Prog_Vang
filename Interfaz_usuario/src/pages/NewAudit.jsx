import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import LoadingAudit from "../components/LoadingAudit";
import { analyzeCode } from "../services/auditApi";
import { DEFAULT_LANGUAGE, MAX_CODE_CHARS, SUPPORTED_LANGUAGES } from "../config/auditConfig";
import React from "react";

const STARTER_CODE = `user_id = input()
query = 'SELECT * FROM users WHERE id = ' + user_id`;

function getCounterColor(length) {
  if (length >= MAX_CODE_CHARS) return "text-red-400";
  if (length >= MAX_CODE_CHARS * 0.9) return "text-amber-300";
  if (length >= MAX_CODE_CHARS * 0.75) return "text-yellow-300";
  return "text-slate-400";
}

export default function NewAudit() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [code, setCode] = useState(STARTER_CODE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const charCount = code.length;
  const isOverLimit = charCount > MAX_CODE_CHARS;
  const isCodeEmpty = code.trim().length === 0;
  const disabled = isLoading || isOverLimit || isCodeEmpty;

  async function handleAnalyze() {
    if (disabled) return;
    setError("");
    setIsLoading(true);
    try {
      const result = await analyzeCode({ language, code });
      navigate(`/audit/result/${result.id}`, { state: { audit: result } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Nueva auditoría</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Analizar código</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Pegá un fragmento de código, seleccioná el lenguaje y enviá la solicitud al backend Java,
          que delega el análisis al microservicio de IA en Python.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div>
              <p className="font-semibold text-white">Editor de código</p>
              <p className="text-sm text-slate-500">
                Compatible con {SUPPORTED_LANGUAGES.map((l) => l.label).join(", ")}.
              </p>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none"
            >
              {SUPPORTED_LANGUAGES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <CodeEditor language={language} value={code} onChange={setCode} />

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            <p className="text-slate-500">
              El microservicio de IA usa un modelo gratuito local: mantené el fragmento acotado para
              respuestas rápidas.
            </p>
            <p className={`font-semibold ${getCounterColor(charCount)}`}>
              {charCount.toLocaleString()} / {MAX_CODE_CHARS.toLocaleString()} caracteres
            </p>
          </div>

          {isOverLimit && (
            <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
              Superaste el límite de {MAX_CODE_CHARS.toLocaleString()} caracteres. Reducí el código antes de analizar.
            </p>
          )}

          {error && (
            <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>
          )}

          {isLoading && <LoadingAudit />}

          <button
            onClick={handleAnalyze}
            disabled={disabled}
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
