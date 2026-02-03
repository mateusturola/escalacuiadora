"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Cuidadora, Escala, ConfiguracaoHorarios, User } from "@/lib/types";

// Componente de Calendário Estilo Google Calendar
function CalendarioGeral({ cuidadoras }: { cuidadoras: Cuidadora[] }) {
  const [escalas, setEscalas] = useState<Record<string, Escala[]>>({});
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date());

  const cores = [
    { bg: 'bg-teal-100', border: 'border-l-4 border-teal-500', text: 'text-teal-800', name: 'teal' },
    { bg: 'bg-purple-100', border: 'border-l-4 border-purple-500', text: 'text-purple-800', name: 'purple' },
    { bg: 'bg-blue-100', border: 'border-l-4 border-blue-500', text: 'text-blue-800', name: 'blue' },
    { bg: 'bg-pink-100', border: 'border-l-4 border-pink-500', text: 'text-pink-800', name: 'pink' },
  ];

  useEffect(() => {
    const fetchAllEscalas = async () => {
      try {
        const escalasData: Record<string, Escala[]> = {};
        
        for (const cuidadora of cuidadoras) {
          const response = await fetch(`/api/escalas?cuidadoraId=${cuidadora.id}`);
          if (response.ok) {
            const data = await response.json();
            escalasData[cuidadora.id] = data;
          }
        }
        
        setEscalas(escalasData);
      } catch (error) {
        console.error("Erro ao carregar escalas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllEscalas();
  }, [cuidadoras]);

  const getDiasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const primeiroDiaSemana = primeiroDia.getDay();
    
    const dias = [];
    // Adicionar dias vazios do início
    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push(null);
    }
    // Adicionar todos os dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(new Date(ano, mes, dia));
    }
    
    return dias;
  };

  // Função para encontrar períodos contínuos de trabalho (48h)
  const getPeriodosContinuos = () => {
    const periodos: Array<{
      cuidadora: Cuidadora;
      dataInicio: string;
      dataFim: string;
      cor: any;
      posicaoInicio: number;
      largura: number;
    }> = [];

    cuidadoras.forEach((cuidadora, index) => {
      const escalasDaCuidadora = (escalas[cuidadora.id] || [])
        .filter(e => e.tipo === 'trabalho')
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

      let periodoAtual: { dataInicio: string; datas: string[] } | null = null;

      escalasDaCuidadora.forEach(escala => {
        if (!periodoAtual) {
          periodoAtual = { dataInicio: escala.data, datas: [escala.data] };
        } else {
          const ultimaData = new Date(periodoAtual.datas[periodoAtual.datas.length - 1]);
          const dataAtual = new Date(escala.data);
          const diffDias = Math.ceil((dataAtual.getTime() - ultimaData.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDias === 1) {
            // Dia consecutivo
            periodoAtual.datas.push(escala.data);
          } else {
            // Novo período
            if (periodoAtual.datas.length > 0) {
              const dataFim = periodoAtual.datas[periodoAtual.datas.length - 1];
              
              // Calcular posição e largura no grid
              const inicio = new Date(periodoAtual.dataInicio);
              const diasDoMes = getDiasDoMes();
              const primeiroDiaDoMes = diasDoMes.find(d => d !== null) as Date;
              const posicaoInicio = diasDoMes.findIndex(d => 
                d && d.toISOString().split('T')[0] === periodoAtual!.dataInicio
              );
              
              if (posicaoInicio !== -1) {
                periodos.push({
                  cuidadora,
                  dataInicio: periodoAtual.dataInicio,
                  dataFim: dataFim,
                  cor: cores[index % cores.length],
                  posicaoInicio: posicaoInicio,
                  largura: periodoAtual.datas.length,
                });
              }
            }
            
            periodoAtual = { dataInicio: escala.data, datas: [escala.data] };
          }
        }
      });

      // Adicionar último período
      if (periodoAtual && periodoAtual.datas.length > 0) {
        const dataFim = periodoAtual.datas[periodoAtual.datas.length - 1];
        const posicaoInicio = getDiasDoMes().findIndex(d => 
          d && d.toISOString().split('T')[0] === periodoAtual!.dataInicio
        );
        
        if (posicaoInicio !== -1) {
          periodos.push({
            cuidadora,
            dataInicio: periodoAtual.dataInicio,
            dataFim: dataFim,
            cor: cores[index % cores.length],
            posicaoInicio: posicaoInicio,
            largura: periodoAtual.datas.length,
          });
        }
      }
    });

    return periodos;
  };

  const mudarMes = (direcao: number) => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + direcao, 1));
  };

  const mesNome = mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dias = getDiasDoMes();
  const periodos = getPeriodosContinuos();

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando calendário...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Cabeçalho do Calendário */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 capitalize">{mesNome}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => mudarMes(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Mês anterior"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setMesAtual(new Date())}
            className="px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
          >
            Hoje
          </button>
          <button
            onClick={() => mudarMes(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Próximo mês"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-200">
        {cuidadoras.map((cuidadora, index) => {
          const cor = cores[index % cores.length];
          return (
            <div key={cuidadora.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${cor.bg} border-2 ${cor.border.replace('border-l-4 ', '')}`}></div>
              <span className="text-sm font-medium text-gray-700">{cuidadora.nome}</span>
            </div>
          );
        })}
      </div>

      {/* Grid do Calendário */}
      <div className="relative">
        <div className="grid grid-cols-7 gap-1">
          {/* Cabeçalho dos dias da semana */}
          {diasSemana.map(dia => (
            <div key={dia} className="text-center font-bold text-gray-600 text-sm py-2">
              {dia}
            </div>
          ))}
          
          {/* Células dos dias */}
          {dias.map((data, index) => {
            if (!data) {
              return <div key={`empty-${index}`} className="h-24 bg-gray-50 rounded"></div>;
            }

            const isHoje = data.toDateString() === new Date().toDateString();
            
            // Verificar se algum período começa nesta posição
            const periodosQueComecam = periodos.filter(p => p.posicaoInicio === index);
            
            return (
              <div
                key={data.toISOString()}
                className={`h-24 border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors relative ${
                  isHoje ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className={`text-sm font-semibold ${
                  isHoje ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {data.getDate()}
                </div>
                
                {/* Renderizar barras que começam neste dia */}
                {periodosQueComecam.map((periodo, idx) => {
                  const colInicio = periodo.posicaoInicio % 7;
                  const diasRestantesNaLinha = 7 - colInicio;
                  const larguraNaLinha = Math.min(periodo.largura, diasRestantesNaLinha);
                  
                  // Alternar posição: índice par em cima, ímpar embaixo
                  const cuidadoraIndex = cuidadoras.findIndex(c => c.id === periodo.cuidadora.id);
                  const posicaoVertical = cuidadoraIndex % 2 === 0 ? 24 : 52;
                  
                  return (
                    <div
                      key={`${periodo.cuidadora.id}-${periodo.dataInicio}`}
                      className={`absolute ${periodo.cor.bg} ${periodo.cor.border} ${periodo.cor.text} px-2 py-1 rounded-md shadow-sm font-medium text-xs z-10 flex items-center gap-1.5 whitespace-nowrap`}
                      style={{
                        top: `${posicaoVertical}px`,
                        left: '8px',
                        right: larguraNaLinha === 1 ? '8px' : 'auto',
                        width: larguraNaLinha > 1 
                          ? `calc(${larguraNaLinha * 100}% + ${(larguraNaLinha - 1) * 4}px + ${larguraNaLinha * 8}px)`
                          : 'auto',
                      }}
                      title={`${periodo.cuidadora.nome}: ${new Date(periodo.dataInicio).toLocaleDateString('pt-BR')} 18:00 - ${new Date(periodo.dataFim).toLocaleDateString('pt-BR')} 18:00`}
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">18hrs {periodo.cuidadora.nome} ({periodo.largura * 24}h)</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Componente para preview de escala
function EscalaPreview({ cuidadoraId }: { cuidadoraId: string }) {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEscalas = async () => {
      try {
        const response = await fetch(`/api/escalas?cuidadoraId=${cuidadoraId}`);
        if (response.ok) {
          const data = await response.json();
          // Pegar próximos 14 dias
          const hoje = new Date();
          const proximos14Dias = data.filter((e: Escala) => {
            const dataEscala = new Date(e.data);
            const diff = Math.ceil((dataEscala.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            return diff >= 0 && diff <= 14;
          }).sort((a: Escala, b: Escala) => new Date(a.data).getTime() - new Date(b.data).getTime());
          setEscalas(proximos14Dias);
        }
      } catch (error) {
        console.error("Erro ao carregar escalas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEscalas();
  }, [cuidadoraId]);

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Carregando...</div>;
  }

  if (escalas.length === 0) {
    return <div className="text-center py-4 text-gray-400">Nenhuma escala cadastrada para os próximos 14 dias</div>;
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {escalas.map((escala) => {
        const data = new Date(escala.data);
        const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' });
        const dia = data.getDate();
        
        return (
          <div
            key={escala.id}
            className={`p-3 rounded-lg text-center border-2 ${
              escala.tipo === 'trabalho'
                ? 'bg-teal-50 border-teal-300 text-teal-800'
                : 'bg-gray-50 border-gray-300 text-gray-600'
            }`}
          >
            <div className="text-xs font-medium uppercase">{diaSemana}</div>
            <div className="text-2xl font-bold">{dia}</div>
            <div className="text-xs mt-1">
              {escala.tipo === 'trabalho' ? '🟢 Trabalho' : '⚪ Folga'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [cuidadoras, setCuidadoras] = useState<Cuidadora[]>([]);
  const [selectedCuidadora, setSelectedCuidadora] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEscalaModal, setShowEscalaModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showArquivadas, setShowArquivadas] = useState(false);
  const [showEscalasGerais, setShowEscalasGerais] = useState(false);
  const [showGerarEscalasModal, setShowGerarEscalasModal] = useState(false);
  const [escalaConfig, setEscalaConfig] = useState({
    dataInicio: "",
    cuidadoraIniciaTrabalho: "",
  });
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    dataInicioTrabalho: "",
    // Configuração padrão 48/48
    usarPadrao48h: true,
    horaInicioPadrao: "18:00",
    horaFimPadrao: "18:00",
  });

  const [configData, setConfigData] = useState<Partial<ConfiguracaoHorarios>>({
    cargaHorariaSemanal: 84,
    diasTrabalho: [],
    horaInicioPadrao: "18:00",
    horaFimPadrao: "18:00",
    padrao48h: true,
  });

  const [escalaData, setEscalaData] = useState({
    data: "",
    horaInicio: "18:00",
    horaFim: "18:00",
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

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  const handleGenerate48hSchedule = async (cuidadoraId: string) => {
    const cuidadora = cuidadoras.find(c => c.id === cuidadoraId);
    if (!cuidadora || !cuidadora.dataInicioTrabalho) {
      alert("Cuidadora precisa ter uma data de início de trabalho configurada.");
      return;
    }

    if (!confirm("Gerar escala automática de 48h trabalho / 48h folga para os próximos 6 meses?")) {
      return;
    }

    try {
      const response = await fetch("/api/escalas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "generate48h",
          cuidadoraId: cuidadoraId,
          dataInicio: cuidadora.dataInicioTrabalho,
          meses: 6,
        }),
      });

      if (response.ok) {
        alert("Escala 48/48 gerada com sucesso!");
      } else {
        alert("Erro ao gerar escala");
      }
    } catch (error) {
      console.error("Erro ao gerar escala:", error);
      alert("Erro ao gerar escala");
    }
  };

  const handleGenerateAllSchedules = async () => {
    const cuidadorasAtivas = cuidadoras.filter(c => !c.arquivada);
    
    if (cuidadorasAtivas.length === 0) {
      alert("Nenhuma cuidadora ativa cadastrada.");
      return;
    }

    if (cuidadorasAtivas.length < 2) {
      alert("O sistema de escalas 48/48 requer pelo menos 2 cuidadoras ativas.");
      return;
    }

    // Abrir modal para configurar
    setShowGerarEscalasModal(true);
  };

  const handleLimparTodasEscalas = async () => {
    if (!confirm("Tem certeza que deseja apagar TODAS as escalas? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      // Buscar todas as escalas e deletar uma por uma
      for (const cuidadora of cuidadoras) {
        const response = await fetch(`/api/escalas?cuidadoraId=${cuidadora.id}`);
        if (response.ok) {
          const escalas = await response.json();
          
          for (const escala of escalas) {
            await fetch(`/api/escalas?id=${escala.id}`, {
              method: "DELETE",
            });
          }
        }
      }
      
      alert("Todas as escalas foram apagadas com sucesso!");
    } catch (error) {
      console.error("Erro ao limpar escalas:", error);
      alert("Erro ao limpar escalas.");
    }
  };

  const handleConfirmGerarEscalas = async () => {
    const cuidadorasAtivas = cuidadoras.filter(c => !c.arquivada);

    if (!escalaConfig.dataInicio) {
      alert("Por favor, informe a data de início das escalas.");
      return;
    }

    if (!escalaConfig.cuidadoraIniciaTrabalho) {
      alert("Por favor, selecione qual cuidadora inicia trabalhando.");
      return;
    }

    try {
      // Gerar escalas alternadas
      const dataInicio = new Date(escalaConfig.dataInicio);
      const meses = 6;
      const dias = meses * 30;
      
      let sucesso = 0;
      let erros = 0;

      // Índice da cuidadora que começa trabalhando
      const indexInicio = cuidadorasAtivas.findIndex(c => c.id === escalaConfig.cuidadoraIniciaTrabalho);

      for (let i = 0; i < cuidadorasAtivas.length; i++) {
        const cuidadora = cuidadorasAtivas[i];
        const iniciaTrabalhando = i === indexInicio;

        try {
          const response = await fetch("/api/escalas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tipo: "generate48h",
              cuidadoraId: cuidadora.id,
              dataInicio: escalaConfig.dataInicio,
              meses: 6,
              iniciaTrabalhando, // Define se esta cuidadora começa trabalhando ou de folga
            }),
          });

          if (response.ok) {
            sucesso++;
          } else {
            erros++;
          }
        } catch (error) {
          erros++;
        }
      }

      setShowGerarEscalasModal(false);
      setEscalaConfig({ dataInicio: "", cuidadoraIniciaTrabalho: "" });

      if (erros === 0) {
        alert(`Escalas 48/48 geradas com sucesso para ${sucesso} cuidadora(s)!`);
      } else {
        alert(`Escalas geradas: ${sucesso} sucesso, ${erros} erro(s)`);
      }
    } catch (error) {
      console.error("Erro ao gerar escalas:", error);
      alert("Erro ao gerar escalas.");
    }
  };

  const handleAddCuidadora = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Criar cuidadora
      const cuidadoraResponse = await fetch("/api/cuidadoras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          telefone: formData.telefone,
          dataInicioTrabalho: formData.dataInicioTrabalho,
        }),
      });

      if (cuidadoraResponse.ok) {
        const novaCuidadora = await cuidadoraResponse.json();
        
        // 2. Salvar configuração automaticamente
        if (formData.usarPadrao48h) {
          await fetch("/api/escalas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tipo: "config",
              cuidadoraId: novaCuidadora.id,
              cargaHorariaSemanal: 84,
              diasTrabalho: [],
              horaInicioPadrao: formData.horaInicioPadrao,
              horaFimPadrao: formData.horaFimPadrao,
              padrao48h: true,
            }),
          });

          // 3. Gerar escala automática se tiver data de início
          if (formData.dataInicioTrabalho) {
            await fetch("/api/escalas", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tipo: "generate48h",
                cuidadoraId: novaCuidadora.id,
                dataInicio: formData.dataInicioTrabalho,
                meses: 6,
              }),
            });
            alert(`✅ Cuidadora cadastrada e escala 48/48 gerada com sucesso!`);
          } else {
            alert(`✅ Cuidadora cadastrada com sucesso!`);
          }
        }
        
        setShowAddModal(false);
        setFormData({ 
          nome: "", 
          telefone: "", 
          dataInicioTrabalho: "",
          usarPadrao48h: true,
          horaInicioPadrao: "18:00",
          horaFimPadrao: "18:00",
        });
        loadCuidadoras();
      }
    } catch (error) {
      console.error("Erro ao adicionar cuidadora:", error);
      alert("❌ Erro ao adicionar cuidadora");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Painel Administrativo</h1>
                <p className="text-indigo-100">Gerenciamento de Escalas</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 backdrop-blur px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-6">
        {/* Actions */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Cuidadora
          </button>
          <button
            onClick={handleGenerateAllSchedules}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Gerar Escalas (Todas)
          </button>
          <button
            onClick={() => setShowEscalasGerais(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Visualizar Escalas
          </button>
          <button
            onClick={handleLimparTodasEscalas}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpar Todas Escalas
          </button>
        </div>

        {/* Cuidadoras List */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Cuidadoras Cadastradas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {cuidadoras.filter(c => !c.arquivada).length} ativa{cuidadoras.filter(c => !c.arquivada).length !== 1 ? 's' : ''}
                {cuidadoras.filter(c => c.arquivada).length > 0 && (
                  <span className="text-gray-400"> • {cuidadoras.filter(c => c.arquivada).length} arquivada{cuidadoras.filter(c => c.arquivada).length !== 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowArquivadas(!showArquivadas)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showArquivadas
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {showArquivadas ? 'Ocultar' : 'Mostrar'} arquivadas
            </button>
          </div>

          {cuidadoras.filter(c => showArquivadas || !c.arquivada).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                {cuidadoras.length === 0 
                  ? 'Nenhuma cuidadora cadastrada ainda.' 
                  : showArquivadas 
                    ? 'Nenhuma cuidadora arquivada.' 
                    : 'Todas as cuidadoras estão arquivadas.'}
              </p>
            </div>
          ) : (
            <div>
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Data de Início
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Regime
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Horário
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cuidadoras.filter(c => showArquivadas || !c.arquivada).map((cuidadora) => (
                    <tr key={cuidadora.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            cuidadora.arquivada 
                              ? 'bg-gray-200' 
                              : 'bg-gradient-to-br from-teal-100 to-emerald-100'
                          }`}>
                            <span className={`font-bold text-sm ${
                              cuidadora.arquivada ? 'text-gray-500' : 'text-teal-700'
                            }`}>
                              {cuidadora.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${
                                cuidadora.arquivada ? 'text-gray-500' : 'text-gray-900'
                              }`}>{cuidadora.nome}</span>
                              {cuidadora.arquivada && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                  Arquivada
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Cadastrada em {new Date(cuidadora.dataCadastro).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="font-mono">{cuidadora.telefone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cuidadora.dataInicioTrabalho ? (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700 font-medium">
                              {new Date(cuidadora.dataInicioTrabalho).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Não definida</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 border border-teal-200">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          48h / 48h
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 font-medium">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>18:00 - 18:00</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">Turno de 12h</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === cuidadora.id ? null : cuidadora.id)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-all"
                            title="Ações"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          {openDropdown === cuidadora.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenDropdown(null)}
                              />
                              <div className="absolute right-0 top-12 z-20 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]">
                                <button
                                  onClick={() => {
                                    setSelectedCuidadora(cuidadora.id);
                                    setShowEscalaModal(true);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                                >
                                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Adicionar escala manual
                                </button>
                                <div className="border-t border-gray-200 my-2"></div>
                                <button
                                  onClick={() => {
                                    handleArquivarCuidadora(cuidadora.id, !cuidadora.arquivada);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                  {cuidadora.arquivada ? 'Desarquivar' : 'Arquivar'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteCuidadora(cuidadora.id);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Excluir cuidadora
                                </button>
                              </div>
                            </>
                          )}
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
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Cadastrar Nova Cuidadora
              </h2>
            </div>

            <form onSubmit={handleAddCuidadora} className="space-y-5">
              {/* Informações Básicas */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                      placeholder="Maria Silva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefone * (Chave de acesso)
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={formData.dataInicioTrabalho}
                      onChange={(e) =>
                        setFormData({ ...formData, dataInicioTrabalho: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Configuração de Trabalho */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 space-y-4 border-2 border-teal-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Regime de Trabalho
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.usarPadrao48h}
                      onChange={(e) =>
                        setFormData({ ...formData, usarPadrao48h: e.target.checked })
                      }
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Usar padrão 48h / 48h
                    </span>
                  </label>
                </div>

                {formData.usarPadrao48h && (
                  <>
                    <div className="bg-white rounded-lg p-3 border border-teal-200">
                      <p className="text-sm text-gray-700 flex items-start gap-2">
                        <svg className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          <strong>48h trabalhadas / 48h de folga:</strong> A cuidadora trabalha por 2 dias consecutivos e folga os próximos 2 dias. {formData.dataInicioTrabalho && "A escala será gerada automaticamente para os próximos 6 meses!"}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Hora de Início
                        </label>
                        <input
                          type="time"
                          value={formData.horaInicioPadrao}
                          onChange={(e) =>
                            setFormData({ ...formData, horaInicioPadrao: e.target.value })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Hora de Término
                        </label>
                        <input
                          type="time"
                          value={formData.horaFimPadrao}
                          onChange={(e) =>
                            setFormData({ ...formData, horaFimPadrao: e.target.value })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {formData.usarPadrao48h && formData.dataInicioTrabalho ? "Cadastrar e Gerar Escala" : "Cadastrar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all"
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

      {/* Modal de Visualização Geral de Escalas */}
      {showEscalasGerais && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Calendário de Escalas
              </h2>
              <button
                onClick={() => setShowEscalasGerais(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <CalendarioGeral cuidadoras={cuidadoras.filter(c => !c.arquivada)} />
          </div>
        </div>
      )}

      {/* Modal de Configuração de Geração de Escalas */}
      {showGerarEscalasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Configurar Geração de Escalas
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure quando as escalas devem iniciar e qual cuidadora começa trabalhando.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início das Escalas *
                </label>
                <input
                  type="date"
                  value={escalaConfig.dataInicio}
                  onChange={(e) =>
                    setEscalaConfig({
                      ...escalaConfig,
                      dataInicio: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  As escalas serão geradas para os próximos 6 meses a partir desta data
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual cuidadora inicia trabalhando? *
                </label>
                <div className="space-y-2">
                  {cuidadoras.filter(c => !c.arquivada).map((cuidadora) => (
                    <label
                      key={cuidadora.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="cuidadoraInicio"
                        value={cuidadora.id}
                        checked={escalaConfig.cuidadoraIniciaTrabalho === cuidadora.id}
                        onChange={(e) =>
                          setEscalaConfig({
                            ...escalaConfig,
                            cuidadoraIniciaTrabalho: e.target.value,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{cuidadora.nome}</div>
                        <div className="text-xs text-gray-500">{cuidadora.telefone}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 As outras cuidadoras iniciarão de folga, e as escalas alternarão automaticamente
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <strong>Sistema 48/48:</strong> Cada cuidadora trabalha 48 horas seguidas e folga 48 horas, alternando entre elas.
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleConfirmGerarEscalas}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Gerar Escalas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGerarEscalasModal(false);
                    setEscalaConfig({ dataInicio: "", cuidadoraIniciaTrabalho: "" });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
