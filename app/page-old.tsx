"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { Cuidadora, Escala } from "@/lib/types";

type FiltroTipo = 'mes' | 'semana' | '3meses';

export default function Home() {
  const [cuidadoras, setCuidadoras] = useState<Cuidadora[]>([]);
  const [escalas, setEscalas] = useState<Record<string, Escala[]>>({});
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('mes');
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [showFiltroMenu, setShowFiltroMenu] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);
  const [dataDestacada, setDataDestacada] = useState<Date | null>(null);

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

  const aplicarFiltro = (tipo: FiltroTipo) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    setFiltroTipo(tipo);
    
    if (tipo === 'semana') {
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);
      setDataInicio(inicioSemana);
      setDataFim(fimSemana);
      setMesAtual(inicioSemana);
    } else if (tipo === '3meses') {
      const inicio3Meses = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fim3Meses = new Date(hoje.getFullYear(), hoje.getMonth() + 3, 0);
      setDataInicio(inicio3Meses);
      setDataFim(fim3Meses);
      setMesAtual(inicio3Meses);
    } else {
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      setDataInicio(inicioMes);
      setDataFim(fimMes);
      setMesAtual(inicioMes);
    }
    setShowFiltroMenu(false);
  };

  const selecionarData = (data: Date | undefined) => {
    if (!data) return;
    
    setDataSelecionada(data);
    setDataDestacada(data);
    setFiltroTipo('mes');
    setMesAtual(new Date(data.getFullYear(), data.getMonth(), 1));
  };

  const getTituloFiltro = () => {
    if (filtroTipo === 'semana') {
      const inicio = dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      const fim = dataFim.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      return `${inicio} - ${fim}`;
    } else if (filtroTipo === '3meses') {
      const mesI = dataInicio.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      const mesF = dataFim.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      return `${mesI} - ${mesF}`;
    }
    return mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

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
    if (filtroTipo === 'semana') {
      const novaData = new Date(dataInicio);
      novaData.setDate(dataInicio.getDate() + (direcao * 7));
      setDataInicio(novaData);
      const novaDataFim = new Date(novaData);
      novaDataFim.setDate(novaData.getDate() + 6);
      setDataFim(novaDataFim);
      setMesAtual(novaData);
    } else if (filtroTipo === '3meses') {
      const novaData = new Date(dataInicio.getFullYear(), dataInicio.getMonth() + (direcao * 3), 1);
      setDataInicio(novaData);
      const novaDataFim = new Date(novaData.getFullYear(), novaData.getMonth() + 3, 0);
      setDataFim(novaDataFim);
      setMesAtual(novaData);
    } else {
      const novaData = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + direcao, 1);
      setMesAtual(novaData);
    }
  };

  const mesNome = getTituloFiltro();
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dias = getDiasDoMes();
  const periodos = getPeriodosContinuos();

  useEffect(() => {
    aplicarFiltro('mes');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showFiltroMenu && !target.closest('.filtro-dropdown')) {
        setShowFiltroMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFiltroMenu]);

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
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Busca por Data */}
              <div className="relative">
                <input
                  type="date"
                  value={dataSelecionada ? format(dataSelecionada, "yyyy-MM-dd") : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const data = new Date(e.target.value + 'T00:00:00');
                      selecionarData(data);
                    } else {
                      setDataSelecionada(undefined);
                      setDataDestacada(null);
                    }
                  }}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-full sm:w-auto min-w-[200px] cursor-pointer hover:bg-gray-50 transition-colors"
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
              <Link 
              href="/admin" 
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </Link>
            </div>
          </div>
        </div>

        {/* Calendário */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
          {/* Cabeçalho do Calendário */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 capitalize">{mesNome}</h2>
            <div className="flex gap-2">
              {/* Filtro de Período */}
              <div className="relative filtro-dropdown">
                <button
                  onClick={() => setShowFiltroMenu(!showFiltroMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium"
                >
                  📅 {filtroTipo === 'mes' ? 'Mês' : filtroTipo === 'semana' ? 'Semana' : '3 Meses'}
                  <span>▼</span>
                </button>
                
                {showFiltroMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <button
                      onClick={() => aplicarFiltro('semana')}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filtroTipo === 'semana' ? 'bg-teal-50 text-teal-700 font-medium' : ''
                      }`}
                    >
                      📅 Esta Semana
                    </button>
                    <button
                      onClick={() => aplicarFiltro('mes')}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filtroTipo === 'mes' ? 'bg-teal-50 text-teal-700 font-medium' : ''
                      }`}
                    >
                      📆 Este Mês
                    </button>
                    <button
                      onClick={() => aplicarFiltro('3meses')}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filtroTipo === '3meses' ? 'bg-teal-50 text-teal-700 font-medium' : ''
                      }`}
                    >
                      🗓️ Próximos 3 Meses
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => mudarMes(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Anterior"
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

          {/* Info da Data Buscada */}
          {dataDestacada && (
            <div className="mb-4 p-4 bg-teal-50 border-l-4 border-teal-500 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-teal-900 mb-1">
                    {dataDestacada.toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                  {(() => {
                    const dataStr = dataDestacada.toISOString().split('T')[0];
                    const cuidadorasNoDia = cuidadoras.filter(c => 
                      escalas[c.id]?.some(e => e.data === dataStr && e.tipo === 'trabalho')
                    );
                    return cuidadorasNoDia.length > 0 ? (
                      <p className="text-sm text-teal-800">
                        ✅ <span className="font-medium">Trabalhando:</span> {cuidadorasNoDia.map(c => c.nome).join(', ')}
                      </p>
                    ) : (
                      <p className="text-sm text-teal-700">❌ Nenhuma cuidadora escalada</p>
                    );
                  })()}
                </div>
                <button
                  onClick={() => {
                    setDataDestacada(null);
                    setDataSelecionada(undefined);
                  }}
                  className="text-teal-600 hover:text-teal-800"
                  title="Limpar"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

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
                    return <div key={`empty-${index}`} className="h-24 sm:h-32 bg-gray-50 rounded"></div>;
                  }

                  const isHoje = data.toDateString() === new Date().toDateString();
                  const isDestacada = dataDestacada && data.toDateString() === dataDestacada.toDateString();
                  const periodosQueComecam = periodos.filter(p => p.posicaoInicio === index);
                  
                  return (
                    <div
                      key={data.toISOString()}
                      className={`h-24 sm:h-32 border rounded p-1 sm:p-2 hover:bg-gray-50 transition-all relative ${
                        isDestacada 
                          ? 'ring-4 ring-teal-500 border-teal-500 bg-teal-50 shadow-lg' 
                          : isHoje 
                          ? 'ring-2 ring-blue-500 border-blue-500' 
                          : 'border-gray-200'
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
                        // Janaina (par/verde) fica embaixo, Rosario (ímpar/roxo) fica em cima
                        const isJanaina = cuidadoraIndex % 2 === 0;
                        
                        return (
                          <div
                            key={`${periodo.cuidadora.id}-${periodo.dataInicio}`}
                            className={`absolute left-1 ${periodo.cor.bg} ${periodo.cor.border} ${periodo.cor.text} px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-md font-semibold text-[9px] sm:text-sm z-10 flex items-center gap-1 sm:gap-2 whitespace-nowrap overflow-hidden border-2`}
                            style={{
                              bottom: isJanaina ? '40px' : 'auto',
                              top: isJanaina ? 'auto' : '32px',
                              right: larguraNaLinha === 1 ? '4px' : 'auto',
                              width: larguraNaLinha > 1 
                                ? `calc(${larguraNaLinha * 100}% + ${(larguraNaLinha - 1) * 2}px + ${larguraNaLinha * 4}px)`
                                : 'auto',
                              maxWidth: larguraNaLinha > 1 ? 'none' : 'calc(100% - 8px)',
                            }}
                            title={`${periodo.cuidadora.nome}: ${new Date(periodo.dataInicio).toLocaleDateString('pt-BR')} 18:00 - ${new Date(periodo.dataFim).toLocaleDateString('pt-BR')} 18:00 (${periodo.largura * 24}h)`}
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate font-bold">
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
