import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { loginUser } from "../services/auditApi";
import React from "react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "pablo@mail.com", password: "123456" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await loginUser(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="code-gradient flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
          <ShieldCheck size={30} />
        </div>
        <h1 className="mt-6 text-center text-3xl font-bold text-white">Code Audit AI</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Plataforma inteligente de auditoría de código.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-blue-400"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-blue-400"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

          <button className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:bg-blue-400">
            Iniciar sesión
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tenés cuenta?{" "}
          <Link className="font-semibold text-blue-300 hover:text-blue-200" to="/register">
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
}
