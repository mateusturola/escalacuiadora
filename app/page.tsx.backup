"use client";

import { useEffect, useState } from "react";
import type { Cuidadora, Escala } from "@/lib/types";

export default function EscalaPublica() {
  const [cuidadoras, setCuidadoras] = useState<Cuidadora[]>([]);
  const [escalas, setEscalas] = useState<Record<string, Escala[]>>({});
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date());

  const cores = [
    { bg: 'bg-teal-100', border: 'border-l-4 border-teal-500', text: 'text-teal-800', name: 'teal' },
    { bg: 'bg-purple-100', border: 'border-l-4 border-purple-500', text: 'text-purple-800', name: 'purple' },
    { bg: 'bg-blue-100', border: 'border-l-4 border-blue-500', text: 'text-blue-800', name: 'blue' },
    { bg: 'bg-pink-100', border: 'border-l-4 border-pink-500', text: 'text-pink-800', name: 'pink' },
    { bg: 'bg-orange-100', border: 'border-l-4 border-orange-500', text: 'text-orange-800', name: 'orange' },
    { bg: 'bg-emerald-100', border: 'border-l-4 border-emerald-500', text: 'text-emerald-800', name: 'emerald' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar cuidadoras
        const resCuidadoras = await fetch("/api/cuidadoras");
        const dataCuidadoras: Cuidadora[] = await resCuidadoras.json();
        const cuidadorasAtivas = dataCuidadoras.filter(c => !c.arquivada);
        setCuidadoras(cuidadorasAtivas);

        // Buscar escalas de todas as cuidadoras
        const escalasData: Record<string, Escala[]> = {};
        for (const cuidadora of cuidadorasAtivas) {
          const response = await fetch(`/api/escalas?cuidadoraId=${cuidadora.id}`);
          if (response.ok) {
            const data = await response.json();
            escalasData[cuidadora.id] = data;
          }
        }
        setEscalas(escalasData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDiasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const primeiroDiaSemana = primeiroDia.getDay();
    
    const dias = [];
    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push(null);
    }
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(new Date(ano, mes, dia));
    }
    return dias;
  };

  const getPeriodosContinuos = () => {
    type Periodo = {
      cuidadora: Cuidadora;
      dataInicio: string;
      dataFim: string;
      cor: any;
      posicaoInicio: number;
      largura: number;
    };
    
    type PeriodoAtual = {
      dataInicio: string;
      datas: string[];
    };
    
    const periodos: Periodo[] = [];

    cuidadoras.forEach((cuidadora, index) => {
      const escalasDaCuidadora = (escalas[cuidadora.id] || [])
        .filter(e => e.tipo === 'trabalho')
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

      let periodoAtual: PeriodoAtual | null = null;

      escalasDaCuidadora.forEach(escala => {
        if (!periodoAtual) {
          periodoAtual = { dataInicio: escala.data, datas: [escala.data] };
        } else {
          const ultimaData = new Date(periodoAtual.datas[periodoAtual.datas.length - 1]);
          const dataAtual = new Date(escala.data);
          const diffDias = Math.ceil((dataAtual.getTime() - ultimaData.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDias === 1) {
            periodoAtual.datas.push(escala.data);
          } else {
            if (periodoAtual.datas.length > 0) {
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
            periodoAtual = { dataInicio: escala.data, datas: [escala.data] };
          }
        }
      });

      if (periodoAtual) {
        const periodo = periodoAtual as PeriodoAtual;
        if (periodo.datas && periodo.datas.length > 0) {
          const dataFim = periodo.datas[periodo.datas.length - 1];
          const posicaoInicio = getDiasDoMes().findIndex(d => 
            d && d.toISOString().split('T')[0] === periodo.dataInicio
          );
          
          if (posicaoInicio !== -1) {
            periodos.push({
              cuidadora,
              dataInicio: periodo.dataInicio,
              dataFim: dataFim,
              cor: cores[index % cores.length],
              posicaoInicio: posicaoInicio,
              largura: periodo.datas.length,
            });
          }
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
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando escala...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-emerald-50 to-cyan-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Escala de Cuidadoras</h1>
                <p className="text-sm text-gray-500">Visualização pública</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendário */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
          {/* Cabeçalho do Calendário */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 capitalize">{mesNome}</h2>
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
                className="px-3 sm:px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
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
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 pb-4 border-b border-gray-200">
            {cuidadoras.map((cuidadora, index) => {
              const cor = cores[index % cores.length];
              return (
                <div key={cuidadora.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${cor.bg} border-2 ${cor.border.replace('border-l-4 ', '')}`}></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{cuidadora.nome}</span>
                </div>
              );
            })}
          </div>

          {/* Grid do Calendário */}
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="min-w-[280px] sm:min-w-0">
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {/* Cabeçalho dos dias da semana */}
                {diasSemana.map(dia => (
                  <div key={dia} className="text-center font-bold text-gray-600 text-xs sm:text-sm py-1 sm:py-2">
                    <span className="hidden sm:inline">{dia}</span>
                    <span className="sm:hidden">{dia.substring(0, 1)}</span>
                  </div>
                ))}
                
                {/* Células dos dias */}
                {dias.map((data, index) => {
                  if (!data) {
                    return <div key={`empty-${index}`} className="h-16 sm:h-24 bg-gray-50 rounded"></div>;
                  }

                  const isHoje = data.toDateString() === new Date().toDateString();
                  const periodosQueComecam = periodos.filter(p => p.posicaoInicio === index);
                  
                  return (
                    <div
                      key={data.toISOString()}
                      className={`h-16 sm:h-24 border border-gray-200 rounded p-1 sm:p-2 hover:bg-gray-50 transition-colors relative ${
                        isHoje ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className={`text-xs sm:text-sm font-semibold ${
                        isHoje ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {data.getDate()}
                      </div>
                      
                      {/* Renderizar barras de períodos */}
                      {periodosQueComecam.map((periodo) => {
                        const colInicio = periodo.posicaoInicio % 7;
                        const diasRestantesNaLinha = 7 - colInicio;
                        const larguraNaLinha = Math.min(periodo.largura, diasRestantesNaLinha);
                        const cuidadoraIndex = cuidadoras.findIndex(c => c.id === periodo.cuidadora.id);
                        const posicaoVertical = cuidadoraIndex % 2 === 0 ? 'top-6 sm:top-8' : 'bottom-1 sm:bottom-2';
                        
                        return (
                          <div
                            key={`${periodo.cuidadora.id}-${periodo.dataInicio}`}
                            className={`absolute ${posicaoVertical} left-1 ${periodo.cor.bg} ${periodo.cor.border} ${periodo.cor.text} px-1 sm:px-2 py-0.5 sm:py-1 rounded shadow-sm font-medium text-[8px] sm:text-xs z-10 flex items-center gap-1 whitespace-nowrap overflow-hidden`}
                            style={{
                              right: larguraNaLinha === 1 ? '4px' : 'auto',
                              width: larguraNaLinha > 1 
                                ? `calc(${larguraNaLinha * 100}% + ${(larguraNaLinha - 1) * 2}px + ${larguraNaLinha * 4}px)`
                                : 'auto',
                              maxWidth: larguraNaLinha > 1 ? 'none' : 'calc(100% - 8px)',
                            }}
                            title={`${periodo.cuidadora.nome}: ${new Date(periodo.dataInicio).toLocaleDateString('pt-BR')} 18:00 - ${new Date(periodo.dataFim).toLocaleDateString('pt-BR')} 18:00 (${periodo.largura * 24}h)`}
                          >
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">
                              <span className="hidden sm:inline">18hrs </span>
                              {periodo.cuidadora.nome}
                              <span className="hidden sm:inline"> ({periodo.largura * 24}h)</span>
                            </span>
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
    </div>
  );
}
