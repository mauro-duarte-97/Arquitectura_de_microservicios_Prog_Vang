import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { registerUser } from "../services/auditApi";
import { useAuth } from "../context/AuthContext";
import React from "react";

const FIELDS = [
  { name: "username", placeholder: "Nombre de usuario", type: "text", autoComplete: "username" },
  { name: "email", placeholder: "Email", type: "email", autoComplete: "email" },
  { name: "password", placeholder: "Contraseña (mín. 8 caracteres)", type: "password", autoComplete: "new-password" },
  { name: "confirmPassword", placeholder: "Confirmar contraseña", type: "password", autoComplete: "new-password" },
];

export default function Register() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = await registerUser(form);
      login(session);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="code-gradient flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
          <ShieldCheck size={30} />
        </div>
        <h1 className="mt-6 text-center text-3xl font-bold text-white">Crear cuenta</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Registrate para guardar tu historial de auditorías.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          {FIELDS.map((field) => (
            <input
              key={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-blue-400"
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
              required
            />
          ))}

          {error && (
            <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tenés cuenta?{" "}
          <Link className="font-semibold text-blue-300 hover:text-blue-200" to="/login">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
