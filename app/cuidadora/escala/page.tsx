"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Escala, ConfiguracaoHorarios } from "@/lib/types";

export default function CuidadoraEscala() {
  const [cuidadora, setCuidadora] = useState<any>(null);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [config, setConfig] = useState<ConfiguracaoHorarios | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedCuidadora = localStorage.getItem("cuidadora");
    if (!storedCuidadora) {
      router.push("/cuidadora");
      return;
    }

    const cuidadoraData = JSON.parse(storedCuidadora);
    setCuidadora(cuidadoraData);
    loadEscalas(cuidadoraData.id);
    loadConfig(cuidadoraData.id);
  }, [router]);

  const loadEscalas = async (cuidadoraId: string) => {
    try {
      const response = await fetch(`/api/escalas?cuidadoraId=${cuidadoraId}`);
      const data = await response.json();
      // Sort by date
      const sorted = data.sort(
        (a: Escala, b: Escala) =>
          new Date(a.data).getTime() - new Date(b.data).getTime()
      );
      setEscalas(sorted);
    } catch (error) {
      console.error("Erro ao carregar escalas:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async (cuidadoraId: string) => {
    try {
      const response = await fetch(
        `/api/escalas?tipo=config&cuidadoraId=${cuidadoraId}`
      );
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cuidadora");
    router.push("/cuidadora");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getDiasSemanaNomes = (dias: number[]) => {
    const nomes = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    return dias.map((d) => nomes[d]).join(", ");
  };

  if (!cuidadora) return null;

  // Filter upcoming and past escalas
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEscalas = escalas.filter(
    (e) => new Date(e.data + "T00:00:00") >= today
  );
  const pastEscalas = escalas.filter(
    (e) => new Date(e.data + "T00:00:00") < today
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Minha Escala</h1>
            <p className="text-green-100">Olá, {cuidadora.nome}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-green-500 hover:bg-green-700 px-4 py-2 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Configuration Info */}
        {config && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Configuração de Trabalho
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <span className="font-semibold">Carga Horária Semanal:</span>{" "}
                {config.cargaHorariaSemanal}h
              </div>
              <div>
                <span className="font-semibold">Horário Padrão:</span>{" "}
                {config.horaInicioPadrao} às {config.horaFimPadrao}
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Dias de Trabalho:</span>{" "}
                {config.diasTrabalho && config.diasTrabalho.length > 0
                  ? getDiasSemanaNomes(config.diasTrabalho)
                  : "Não configurado"}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Escalas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Próximas Escalas
          </h2>

          {loading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : upcomingEscalas.length === 0 ? (
            <p className="text-gray-500">
              Nenhuma escala futura cadastrada no momento.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingEscalas.map((escala) => (
                <div
                  key={escala.id}
                  className={`border-l-4 p-4 rounded-lg ${
                    escala.tipo === "trabalho"
                      ? "border-green-500 bg-green-50"
                      : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 capitalize">
                        {formatDate(escala.data)}
                      </h3>
                      <p className="text-gray-700 mt-1">
                        <span className="font-semibold">Tipo:</span>{" "}
                        {escala.tipo === "trabalho" ? "Trabalho" : "Folga"}
                      </p>
                      {escala.tipo === "trabalho" && (
                        <p className="text-gray-700">
                          <span className="font-semibold">Horário:</span>{" "}
                          {escala.horaInicio} às {escala.horaFim}
                        </p>
                      )}
                      {escala.observacoes && (
                        <p className="text-gray-600 mt-2 italic">
                          {escala.observacoes}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        escala.tipo === "trabalho"
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {escala.tipo === "trabalho" ? "Trabalho" : "Folga"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Escalas */}
        {pastEscalas.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Escalas Anteriores
            </h2>
            <div className="space-y-4">
              {pastEscalas.slice(-10).reverse().map((escala) => (
                <div
                  key={escala.id}
                  className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded-lg opacity-75"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-700 capitalize">
                        {formatDate(escala.data)}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {escala.tipo === "trabalho"
                          ? `Trabalho: ${escala.horaInicio} às ${escala.horaFim}`
                          : "Folga"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
