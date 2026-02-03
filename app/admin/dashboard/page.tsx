"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Cuidadora, Escala, ConfiguracaoHorarios, User } from "@/lib/types";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [cuidadoras, setCuidadoras] = useState<Cuidadora[]>([]);
  const [selectedCuidadora, setSelectedCuidadora] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showEscalaModal, setShowEscalaModal] = useState(false);
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  const [configData, setConfigData] = useState<Partial<ConfiguracaoHorarios>>({
    cargaHorariaSemanal: 40,
    diasTrabalho: [],
    horaInicioPadrao: "08:00",
    horaFimPadrao: "17:00",
  });

  const [escalaData, setEscalaData] = useState({
    data: "",
    horaInicio: "08:00",
    horaFim: "17:00",
    tipo: "trabalho" as "trabalho" | "folga",
    observacoes: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/admin");
      return;
    }
    const userData: User = JSON.parse(storedUser);
    setUser(userData);
    loadCuidadoras();
  }, [router]);

  const loadCuidadoras = async () => {
    try {
      const response = await fetch("/api/cuidadoras");
      const data = await response.json();
      setCuidadoras(data);
    } catch (error) {
      console.error("Erro ao carregar cuidadoras:", error);
    }
  };

  const handleAddCuidadora = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/cuidadoras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({ nome: "", email: "", telefone: "" });
        loadCuidadoras();
      }
    } catch (error) {
      console.error("Erro ao adicionar cuidadora:", error);
    }
  };

  const handleDeleteCuidadora = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta cuidadora?")) return;

    try {
      const response = await fetch(`/api/cuidadoras?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadCuidadoras();
      }
    } catch (error) {
      console.error("Erro ao deletar cuidadora:", error);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCuidadora) return;

    try {
      const response = await fetch("/api/escalas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "config",
          cuidadoraId: selectedCuidadora,
          ...configData,
        }),
      });

      if (response.ok) {
        setShowConfigModal(false);
        alert("Configuração salva com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
    }
  };

  const handleAddEscala = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCuidadora) return;

    try {
      const response = await fetch("/api/escalas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuidadoraId: selectedCuidadora,
          ...escalaData,
        }),
      });

      if (response.ok) {
        setShowEscalaModal(false);
        setEscalaData({
          data: "",
          horaInicio: "08:00",
          horaFim: "17:00",
          tipo: "trabalho",
          observacoes: "",
        });
        alert("Escala adicionada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao adicionar escala:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/admin");
  };

  const toggleDiaTrabalho = (dia: number) => {
    const current = configData.diasTrabalho || [];
    if (current.includes(dia)) {
      setConfigData({
        ...configData,
        diasTrabalho: current.filter((d) => d !== dia),
      });
    } else {
      setConfigData({
        ...configData,
        diasTrabalho: [...current, dia],
      });
    }
  };

  if (!user) return null;

  const diasSemana = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <button
            onClick={handleLogout}
            className="bg-indigo-500 hover:bg-indigo-700 px-4 py-2 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Actions */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
          >
            + Adicionar Cuidadora
          </button>
        </div>

        {/* Cuidadoras List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Cuidadoras Cadastradas
          </h2>

          {cuidadoras.length === 0 ? (
            <p className="text-gray-500">Nenhuma cuidadora cadastrada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700">Nome</th>
                    <th className="px-4 py-3 text-left text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-gray-700">
                      Telefone
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {cuidadoras.map((cuidadora) => (
                    <tr key={cuidadora.id} className="border-t">
                      <td className="px-4 py-3 text-gray-800">
                        {cuidadora.nome}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {cuidadora.email}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {cuidadora.telefone}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedCuidadora(cuidadora.id);
                              setShowConfigModal(true);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                          >
                            Configurar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCuidadora(cuidadora.id);
                              setShowEscalaModal(true);
                            }}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition"
                          >
                            Add Escala
                          </button>
                          <button
                            onClick={() => handleDeleteCuidadora(cuidadora.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Cuidadora Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Adicionar Cuidadora
            </h2>
            <form onSubmit={handleAddCuidadora} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Configurar Horários
            </h2>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carga Horária Semanal (horas)
                </label>
                <input
                  type="number"
                  value={configData.cargaHorariaSemanal}
                  onChange={(e) =>
                    setConfigData({
                      ...configData,
                      cargaHorariaSemanal: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias de Trabalho
                </label>
                <div className="space-y-2">
                  {diasSemana.map((dia, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(configData.diasTrabalho || []).includes(
                          index
                        )}
                        onChange={() => toggleDiaTrabalho(index)}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{dia}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Início Padrão
                </label>
                <input
                  type="time"
                  value={configData.horaInicioPadrao}
                  onChange={(e) =>
                    setConfigData({
                      ...configData,
                      horaInicioPadrao: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Fim Padrão
                </label>
                <input
                  type="time"
                  value={configData.horaFimPadrao}
                  onChange={(e) =>
                    setConfigData({
                      ...configData,
                      horaFimPadrao: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escala Modal */}
      {showEscalaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Adicionar Escala
            </h2>
            <form onSubmit={handleAddEscala} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  value={escalaData.data}
                  onChange={(e) =>
                    setEscalaData({ ...escalaData, data: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={escalaData.tipo}
                  onChange={(e) =>
                    setEscalaData({
                      ...escalaData,
                      tipo: e.target.value as "trabalho" | "folga",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="trabalho">Trabalho</option>
                  <option value="folga">Folga</option>
                </select>
              </div>
              {escalaData.tipo === "trabalho" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Início
                    </label>
                    <input
                      type="time"
                      value={escalaData.horaInicio}
                      onChange={(e) =>
                        setEscalaData({
                          ...escalaData,
                          horaInicio: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Fim
                    </label>
                    <input
                      type="time"
                      value={escalaData.horaFim}
                      onChange={(e) =>
                        setEscalaData({
                          ...escalaData,
                          horaFim: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={escalaData.observacoes}
                  onChange={(e) =>
                    setEscalaData({
                      ...escalaData,
                      observacoes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setShowEscalaModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
