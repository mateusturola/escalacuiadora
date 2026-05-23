'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Cuidadora {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  cor?: string;
}

interface Plantao {
  inicio: string;
  fim: string;
  cuidadora: string;
}

interface Agendamento {
  cuidadoras: Cuidadora[];
  plantoes: Plantao[];
}

export default function CalendarioPage() {
  const [cuidadoras, setCuidadoras] = useState<Cuidadora[]>([]);
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await fetch('/agendamento.json');
        const dados: Agendamento = await res.json();
        setCuidadoras(dados.cuidadoras);
        setPlantoes(dados.plantoes);
      } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Gerar dias do mês
  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
  const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  
  const dias: Date[] = [];
  const diaDaSemana = primeiroDia.getDay();
  
  // Adicionar dias do mês anterior se não começa no domingo
  if (diaDaSemana > 0) {
    const ultimoDiaDoMesAnterior = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 0);
    const diasDoMesAnterior = ultimoDiaDoMesAnterior.getDate();
    for (let i = diaDaSemana - 1; i >= 0; i--) {
      const dia = diasDoMesAnterior - i;
      dias.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, dia));
    }
  }
  
  // Adicionar dias do mês
  for (let i = 1; i <= diasNoMes; i++) {
    dias.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i));
  }
  
  // Verificar se um dia pertence ao mês atual
  const isDiaDoMesAtual = (data: Date) => {
    return data.getMonth() === mesAtual.getMonth() && data.getFullYear() === mesAtual.getFullYear();
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1));
  };

  const getCor = (cuidadora: Cuidadora) => {
    if (cuidadora.cor === 'teal') return 'bg-teal-100 border border-teal-400 text-teal-900';
    if (cuidadora.cor === 'blue') return 'bg-blue-100 border border-blue-400 text-blue-900';
    if (cuidadora.cor === 'pink') return 'bg-fuchsia-100 border border-fuchsia-400 text-fuchsia-900';
    if (cuidadora.cor === 'purple') return 'bg-purple-100 border border-purple-400 text-purple-900';
    if (cuidadora.cor === 'green') return 'bg-green-100 border border-green-400 text-green-900';
    return 'bg-gray-100 border border-gray-400 text-gray-900';
  };

  // Usar plantões diretamente do JSON
  const plantoesAjustados = plantoes;

  // Agrupar eventos contínuos
  const getEventosPorCuidadora = (cuidadora: Cuidadora) => {
    return plantoesAjustados
      .filter(p => p.cuidadora === cuidadora.nome)
      .map(p => ({
        inicio: new Date(p.inicio),
        fim: new Date(p.fim)
      }));
  };

  const plantoesDoMes = plantoesAjustados.filter(plantao => {
    const inicio = new Date(plantao.inicio);
    const fim = new Date(plantao.fim);
    const primeiroDiaDoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const primeiroDiaProximoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1);
    
    // Incluir também dias do mês anterior se estiverem sendo exibidos
    const primeiroDiaExibido = dias.length > 0 ? dias[0] : primeiroDiaDoMes;
    
    // Incluir plantão se ele sobrepõe os dias sendo exibidos
    return inicio < primeiroDiaProximoMes && fim > primeiroDiaExibido;
  });

  // Contar apenas plantões que COMEÇAM no mês (para evitar dupla contagem)
  const plantoesQueComecamNoMes = plantoesAjustados.filter(plantao => {
    const inicio = new Date(plantao.inicio);
    return inicio.getFullYear() === mesAtual.getFullYear() && inicio.getMonth() === mesAtual.getMonth();
  });

  const getCuidadoraPorNome = (nome: string) =>
    cuidadoras.find(c => c.nome === nome);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando escala...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-3 md:p-4">
        <div className="max-w-full mx-auto flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Escala de Cuidadoras</h1>
              <p className="text-sm text-gray-600 mt-1">
                36h × 12h até 31/05/2026 · 24h × 48h a partir de 01/06/2026 (troca às 18h)
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {cuidadoras.map(cuidadora => {
                  const total = plantoesAjustados.filter(p => p.cuidadora === cuidadora.nome).length;
                  if (total === 0) return null;
                  return (
                    <p key={cuidadora.id} className="text-xs md:text-sm text-gray-600">
                      <span className="font-semibold">{cuidadora.nome}:</span> {total} plantões
                    </p>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legenda no header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6 pt-2 border-t md:border-t-0">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <span className="text-base md:text-lg font-bold text-gray-900">Legenda</span>
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {cuidadoras.map(cuidadora => {
                  const totalNoMes = plantoesQueComecamNoMes.filter(p => p.cuidadora === cuidadora.nome).length;
                  if (totalNoMes === 0) return null;

                  return (
                    <div key={cuidadora.id} className="flex items-center gap-2">
                      <span className={`${getCor(cuidadora)} inline-flex items-center justify-center w-6 h-6 rounded text-sm font-bold`}>
                        {totalNoMes}
                      </span>
                      <span className="text-sm md:text-base font-semibold text-gray-900">{cuidadora.nome}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 md:p-4">
        {/* Estatísticas por Cuidadora */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Estatísticas do Mês</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cuidadoras.map(cuidadora => {
              const plantoesQueComecam = plantoesQueComecamNoMes.filter(p => p.cuidadora === cuidadora.nome);
              const quantidadePlantoes = plantoesQueComecam.length;
              if (quantidadePlantoes === 0) return null;

              const totalHoras = plantoesQueComecam.reduce((acc, p) => {
                return acc + (new Date(p.fim).getTime() - new Date(p.inicio).getTime()) / 3600000;
              }, 0);

              const usaPadraoNovo = plantoesQueComecam[0].inicio >= '2026-06-01T18:00:00';
              const horarioStr = usaPadraoNovo ? '18:00 às 18:00 do dia seguinte' : '18:00 às 06:00';
              const duracaoStr = usaPadraoNovo ? '24 horas por plantão (24h × 48h)' : '36 horas por plantão (36h × 12h)';

              return (
                <div
                  key={cuidadora.id}
                  className={`${getCor(cuidadora)} rounded-lg p-4 shadow-sm`}
                >
                  <div className="font-bold text-lg mb-2">{cuidadora.nome}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>📅 Plantões no mês:</span>
                      <span className="font-bold text-lg">{quantidadePlantoes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>⏱️ Horas totais:</span>
                      <span className="font-bold text-lg">{Math.round(totalHoras)}h</span>
                    </div>
                    <div className="pt-2 border-t border-current/20 text-xs opacity-75">
                      <div>🕕 Horário: {horarioStr}</div>
                      <div>⌛ Duração: {duracaoStr}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seletor do mês */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-3">
          <button
            onClick={mesAnterior}
            className="p-1.5 md:p-2 hover:bg-white rounded transition"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-base md:text-xl font-bold text-gray-900 md:min-w-56 text-center capitalize">
            Calendário - {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={proximoMes}
            className="p-1.5 md:p-2 hover:bg-white rounded transition"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendário compacto (mobile) */}
        <div className="bg-white rounded-lg shadow border mb-4 md:hidden">
          <div className="grid grid-cols-7 bg-gray-100 border-b">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, index) => (
              <div
                key={index}
                className="py-2 text-center font-bold text-gray-900 border-r text-xs"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Grid principal mobile */}
          <div
            className="grid grid-cols-7 gap-0"
          >
            {/* Células com barras por dia */}
            {dias.map((data, index) => {
              const hoje = new Date().toDateString() === data.toDateString();
              const isDiaAtual = isDiaDoMesAtual(data);
              
              // Encontrar TODOS os plantões que acontecem neste dia
              const plantoesDoDia = plantoesDoMes.filter(plantao => {
                const inicio = new Date(plantao.inicio);
                const fim = new Date(plantao.fim);
                const inicioDoDia = new Date(data.getFullYear(), data.getMonth(), data.getDate());
                const fimDoDia = new Date(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59);
                
                return inicio <= fimDoDia && fim >= inicioDoDia;
              });

              return (
                <div
                  key={data.toISOString()}
                  className={`border-r border-b p-1 min-h-24 flex flex-col gap-1 relative ${
                    hoje ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset z-10' : isDiaAtual ? 'bg-white' : 'bg-gray-50'
                  } ${!isDiaAtual ? 'opacity-40' : ''}`}
                >
                  {/* Número do dia */}
                  <div className={hoje
                    ? 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold'
                    : 'text-xs font-bold text-gray-900'
                  }>
                    {data.getDate()}
                  </div>

                  {/* Mostrar plantões do dia */}
                  {plantoesDoDia.map((plantao, idx) => {
                    const cuidadora = getCuidadoraPorNome(plantao.cuidadora);
                    if (!cuidadora) return null;
                    
                    const inicio = new Date(plantao.inicio);
                    const fim = new Date(plantao.fim);
                    const horas = Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60));
                    
                    // Verificar se começa ou termina neste dia
                    const comecaHoje = inicio.toDateString() === data.toDateString();
                    const terminaHoje = fim.toDateString() === data.toDateString();
                    
                    let texto = '';
                    let subtexto = '';
                    if (comecaHoje && terminaHoje) {
                      texto = `${inicio.getHours()}h-${fim.getHours()}h`;
                      subtexto = `(${horas}h)`;
                    } else if (comecaHoje) {
                      texto = `↓ Inicia ${inicio.getHours()}:00`;
                      subtexto = `(${horas}h totais)`;
                    } else if (terminaHoje) {
                      texto = `↑ Termina ${fim.getHours()}:00`;
                      subtexto = `(${horas}h totais)`;
                    } else {
                      texto = 'Trabalhando';
                      subtexto = `(Plantão ${horas}h)`;
                    }
                    
                    return (
                      <div
                        key={`plantao-${idx}`}
                        className={`${getCor(cuidadora)} rounded px-1 py-1 text-[9px] font-bold text-center shadow-sm`}
                      >
                        <div>{cuidadora.nome}</div>
                        <div className="text-[8px]">{texto}</div>
                        <div className="text-[7px] mt-0.5">{subtexto}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendário */}
        <div className="bg-white rounded-lg shadow overflow-hidden border hidden md:block">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 bg-gray-100 border-b min-w-215">
            {['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SAB.'].map((dia, index) => (
              <div
                key={index}
                className="p-2 md:p-3 text-center font-bold text-gray-900 border-r text-xs md:text-base h-12 md:h-14 flex items-center justify-center"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Grid principal desktop */}
          <div className="overflow-x-auto">
            <div
              className="grid grid-cols-7 min-w-215"
            >
              {/* Células com barras por dia */}
              {dias.map((data, index) => {
                const hoje = new Date().toDateString() === data.toDateString();
                const isDiaAtual = isDiaDoMesAtual(data);
                
                // Encontrar TODOS os plantões que acontecem neste dia
                const plantoesDoDia = plantoesDoMes.filter(plantao => {
                  const inicio = new Date(plantao.inicio);
                  const fim = new Date(plantao.fim);
                  const inicioDoDia = new Date(data.getFullYear(), data.getMonth(), data.getDate());
                  const fimDoDia = new Date(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59);
                  
                  return inicio <= fimDoDia && fim >= inicioDoDia;
                });

                return (
                  <div
                    key={data.toISOString()}
                    className={`border-r border-b p-2 min-h-32 flex flex-col gap-2 relative ${
                      hoje ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset z-10' : isDiaAtual ? 'bg-white' : 'bg-gray-50'
                    } ${!isDiaAtual ? 'opacity-40' : ''}`}
                  >
                    {/* Número do dia */}
                    <div className={hoje
                      ? 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold'
                      : 'text-base font-bold text-gray-900'
                    }>
                      {data.getDate()}
                    </div>
                    
                    {/* Mostrar plantões do dia */}
                    {plantoesDoDia.map((plantao, idx) => {
                      const cuidadora = getCuidadoraPorNome(plantao.cuidadora);
                      if (!cuidadora) return null;
                      
                      const inicio = new Date(plantao.inicio);
                      const fim = new Date(plantao.fim);
                      const horas = Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60));
                      
                      // Verificar se começa ou termina neste dia
                      const comecaHoje = inicio.toDateString() === data.toDateString();
                      const terminaHoje = fim.toDateString() === data.toDateString();
                      
                      let texto = '';
                      if (comecaHoje && terminaHoje) {
                        texto = `${inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
                      } else if (comecaHoje) {
                        texto = `↓ Inicia ${inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
                      } else if (terminaHoje) {
                        texto = `↑ Termina ${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
                      } else {
                        texto = 'Trabalhando';
                      }
                      
                      return (
                        <div
                          key={`plantao-${idx}`}
                          className={`${getCor(cuidadora)} rounded-lg px-2 py-2 text-xs font-bold text-center shadow-md`}
                        >
                          <div>{cuidadora.nome}</div>
                          <div className="text-[10px] mt-0.5">{texto}</div>
                          <div className="text-[9px] opacity-75 mt-0.5">({horas}h totais)</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
