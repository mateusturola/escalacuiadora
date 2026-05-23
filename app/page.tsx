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

  const agora = new Date();
  const plantaoAtivo = plantoesAjustados.find(p => {
    const ini = new Date(p.inicio);
    const fim = new Date(p.fim);
    return ini <= agora && fim > agora;
  });
  const proximoPlantao = plantoesAjustados.find(p => new Date(p.inicio) > agora);

  const formatarDataCurta = (d: Date) =>
    d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  const formatarHora = (d: Date) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const irParaHoje = () => {
    const h = new Date();
    setMesAtual(new Date(h.getFullYear(), h.getMonth(), 1));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-3 md:p-4">
        <div className="max-w-full mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Escala de Cuidadoras</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            36h × 12h até 31/05/2026 · 24h × 48h a partir de 01/06/2026 (troca às 18h)
          </p>
        </div>
      </div>

      <div className="p-2 md:p-4 space-y-4">
        {/* Card "Hoje" */}
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Hoje · {formatarDataCurta(agora)}
            </h2>
          </div>
          {plantaoAtivo ? (() => {
            const cuidadora = getCuidadoraPorNome(plantaoAtivo.cuidadora);
            const fim = new Date(plantaoAtivo.fim);
            const horasRestantes = Math.max(0, Math.round((fim.getTime() - agora.getTime()) / 3600000));
            const terminaHoje = fim.toDateString() === agora.toDateString();
            return (
              <div className={`${cuidadora ? getCor(cuidadora) : 'bg-gray-100 border border-gray-300'} rounded-lg p-4`}>
                <div className="text-2xl font-bold">{plantaoAtivo.cuidadora}</div>
                <div className="text-sm mt-1">
                  Termina {terminaHoje ? 'hoje' : 'amanhã'} às {formatarHora(fim)} · {horasRestantes}h restantes
                </div>
              </div>
            );
          })() : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-sm">
              Nenhum plantão ativo no momento.
            </div>
          )}
          {proximoPlantao && (
            <div className="mt-3 pt-3 border-t text-sm text-gray-700">
              <span className="font-semibold text-gray-500 uppercase text-xs tracking-wide mr-2">Próximo:</span>
              {formatarDataCurta(new Date(proximoPlantao.inicio))} · <span className="font-semibold">{proximoPlantao.cuidadora}</span> às {formatarHora(new Date(proximoPlantao.inicio))}
            </div>
          )}
        </div>

        {/* Estatísticas compactas */}
        <div className="bg-white rounded-lg shadow border p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}:
            </span>
            {cuidadoras.map(cuidadora => {
              const plantoesQueComecam = plantoesQueComecamNoMes.filter(p => p.cuidadora === cuidadora.nome);
              const quantidade = plantoesQueComecam.length;
              if (quantidade === 0) return null;
              const totalHoras = plantoesQueComecam.reduce((acc, p) => {
                return acc + (new Date(p.fim).getTime() - new Date(p.inicio).getTime()) / 3600000;
              }, 0);
              return (
                <div key={cuidadora.id} className="flex items-center gap-2">
                  <span className={`${getCor(cuidadora)} inline-flex items-center justify-center w-6 h-6 rounded text-sm font-bold`}>
                    {quantidade}
                  </span>
                  <span className="text-sm text-gray-800">
                    <span className="font-semibold">{cuidadora.nome}</span> · {Math.round(totalHoras)}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seletor do mês */}
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-1">
          <button
            onClick={mesAnterior}
            className="p-1.5 md:p-2 hover:bg-white rounded transition"
            aria-label="Mês anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-base md:text-xl font-bold text-gray-900 md:min-w-56 text-center capitalize">
            {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={proximoMes}
            className="p-1.5 md:p-2 hover:bg-white rounded transition"
            aria-label="Próximo mês"
          >
            <ChevronRight size={24} />
          </button>
          <button
            onClick={irParaHoje}
            className="ml-2 px-3 py-1.5 text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 rounded transition"
          >
            Hoje
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
