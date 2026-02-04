"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.user.tipo === "admin") {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/admin/dashboard");
      } else {
        setError("Credenciais inválidas ou acesso não autorizado");
      }
    } catch (err) {
      setError("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            Admin Login
          </h1>
          <p className="text-gray-600">
            Acesso restrito para administradores
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Input
            label="Usuário"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            isLoading={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Credenciais padrão: admin / admin123
          </p>
        </div>
      </Card>
    </div>
  );
}
