"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CuidadoraLogin() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get all cuidadoras
      const response = await fetch("/api/cuidadoras");
      const cuidadoras = await response.json();

      // Find cuidadora by email
      const cuidadora = cuidadoras.find(
        (c: any) => c.email.toLowerCase() === email.toLowerCase()
      );

      if (cuidadora) {
        localStorage.setItem("cuidadora", JSON.stringify(cuidadora));
        router.push("/cuidadora/escala");
      } else {
        setError("Email não encontrado");
      }
    } catch (err) {
      setError("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            Acesso Cuidadora
          </h1>
          <p className="text-gray-600">Entre com seu email para ver sua escala</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              required
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Entre em contato com o administrador se não conseguir acessar
          </p>
        </div>
      </div>
    </div>
  );
}
