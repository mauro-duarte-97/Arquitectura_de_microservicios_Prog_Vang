import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { registerUser } from "../services/auditApi";
import React from "react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await registerUser(form);
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
        <h1 className="mt-6 text-center text-3xl font-bold text-white">Crear cuenta</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Registrate para guardar tu historial de auditorías.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {["name", "email", "password", "confirmPassword"].map((field) => (
            <input
              key={field}
              type={field.toLowerCase().includes("password") ? "password" : "text"}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-blue-400"
              placeholder={
                field === "name"
                  ? "Nombre"
                  : field === "email"
                  ? "Email"
                  : field === "password"
                  ? "Contraseña"
                  : "Confirmar contraseña"
              }
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          ))}

          {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

          <button className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:bg-blue-400">
            Crear cuenta
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
