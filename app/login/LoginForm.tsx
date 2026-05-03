"use client";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

const initialState = { error: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {/* Usuario */}
      <div>
        <label htmlFor="usuario" className="block text-gray-300 text-sm font-medium mb-2">
          Usuario
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          autoComplete="username"
          required
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
          placeholder="Tu usuario"
        />
      </div>

      {/* Contraseña */}
      <div>
        <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/50 transition-colors"
          placeholder="••••••••"
        />
      </div>

      {/* Error */}
      {state.error && (
        <div className="bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl px-4 py-3">
          <p className="text-[#C8102E] text-sm">{state.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm mt-2"
      >
        {pending ? "Verificando..." : "Entrar"}
      </button>
    </form>
  );
}
