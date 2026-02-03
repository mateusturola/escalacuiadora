"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Escala, ConfiguracaoHorarios, Cuidadora } from "@/lib/types";

export default function CuidadoraEscala() {
  const [cuidadora, setCuidadora] = useState<Cuidadora | null>(null);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [config, setConfig] = useState<ConfiguracaoHorarios | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedCuidadora = localStorage.getItem("cuidadora");
    if (!storedCuidadora) {
      router.push("/cuidadora");
      return;
    }

    const cuidadoraData: Cuidadora = JSON.parse(storedCuidadora);
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

  const getEscalaForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return escalas.find(e => e.data === dateStr);
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const changeMonth = (delta: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateSearch = (dateString: string) => {
    if (!dateString) {
      setSelectedDate(null);
      return;
    }
    const date = new Date(dateString + 'T12:00:00');
    setSelectedDate(date);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Minha Escala</h1>
                <p className="text-teal-100">Olá, {cuidadora.nome}! 👋</p>
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
        {/* Configuration Info */}
        {config && config.padrao48h && (
          <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-lg p-6 mb-6 border-2 border-teal-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Seu Regime de Trabalho
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-teal-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="font-semibold text-teal-700 text-sm">Padrão</span>
                </div>
                <p className="text-3xl font-bold text-teal-900">48h / 48h</p>
                <p className="text-sm text-gray-600 mt-1">Trabalho / Folga</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-blue-700 text-sm">Horário</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {config.horaInicioPadrao} - {config.horaFimPadrao}
                </p>
                <p className="text-sm text-gray-600 mt-1">Início e fim do turno</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-semibold text-purple-700 text-sm">Carga semanal</span>
                </div>
                <p className="text-3xl font-bold text-purple-900">{config.cargaHorariaSemanal}h</p>
                <p className="text-sm text-gray-600 mt-1">Horas por semana</p>
              </div>
            </div>
          </div>
        )}

        {/* Status de HOJE - Card Grande */}
        {(() => {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          const escalaHoje = escalas.find(e => e.data === todayStr);
          
          return (
            <div className={`rounded-3xl shadow-2xl p-6 md:p-8 mb-6 border-2 ${
              escalaHoje?.tipo === 'trabalho'
                ? 'bg-gradient-to-br from-teal-500 to-emerald-600 border-teal-400'
                : escalaHoje?.tipo === 'folga'
                ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-orange-400'
                : 'bg-gradient-to-br from-gray-400 to-gray-500 border-gray-400'
            }`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-white flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg md:text-xl font-bold opacity-90">HOJE</h3>
                  </div>
                  <p className="text-3xl md:text-5xl font-black mb-2">
                    {today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                  </p>
                  {escalaHoje ? (
                    <div className="flex items-center gap-2 mt-3">
                      {escalaHoje.tipo === 'trabalho' ? (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xl md:text-2xl font-bold">TRABALHANDO</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                          </svg>
                          <span className="text-xl md:text-2xl font-bold">DIA DE FOLGA</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-xl md:text-2xl font-bold">SEM ESCALA</p>
                  )}
                </div>
                {escalaHoje?.tipo === 'trabalho' && (
                  <div className="bg-white/20 backdrop-blur rounded-2xl p-4 md:p-6 text-center min-w-[140px]">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-white text-lg md:text-xl font-bold">{escalaHoje.horaInicio}</p>
                    <p className="text-white/80 text-sm">até</p>
                    <p className="text-white text-lg md:text-xl font-bold">{escalaHoje.horaFim}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* View Mode Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex-1 px-4 md:px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden md:inline">Calendário</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-4 md:px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="hidden md:inline">Lista</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 font-medium">Carregando escalas...</p>
          </div>
        ) : viewMode === 'calendar' ? (
          /* Calendar View */
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            {/* Calendar Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <button
                onClick={() => changeMonth(-1)}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors order-1 md:order-1"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex flex-col items-center gap-3 order-2 md:order-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 capitalize">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                
                {/* Busca por Data */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="date"
                    onChange={(e) => handleDateSearch(e.target.value)}
                    className="bg-transparent text-sm md:text-base font-semibold text-gray-700 outline-none cursor-pointer"
                    placeholder="Buscar data"
                  />
                </div>
              </div>

              <button
                onClick={() => changeMonth(1)}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors order-3 md:order-3"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {/* Day headers */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center font-bold text-gray-700 py-2 md:py-3 text-xs md:text-sm">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {generateCalendarDays().map((date, index) => {
                const escala = getEscalaForDate(date);
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={index}
                    className={`min-h-20 md:min-h-28 p-2 md:p-3 rounded-lg md:rounded-xl border-2 transition-all ${
                      !isCurrentMonthDay
                        ? 'bg-gray-50 border-gray-100 opacity-40'
                        : isSelectedDate(date)
                        ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-200'
                        : isTodayDate
                        ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200'
                        : escala?.tipo === 'trabalho'
                        ? 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-300 hover:shadow-md'
                        : escala?.tipo === 'folga'
                        ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300 hover:shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`text-xs md:text-sm font-bold mb-1 ${
                      isSelectedDate(date) ? 'text-purple-700' : isTodayDate ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {date.getDate()}
                    </div>
                    {escala && isCurrentMonthDay && (
                      <div className="text-xs space-y-1">
                        {escala.tipo === 'trabalho' ? (
                          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-1 md:px-2 py-1 md:py-1.5 rounded-md md:rounded-lg font-bold text-center shadow-sm text-[10px] md:text-xs">
                            ✓
                            <span className="hidden md:inline"> Trabalho</span>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-1 md:px-2 py-1 md:py-1.5 rounded-md md:rounded-lg font-bold text-center shadow-sm text-[10px] md:text-xs">
                            ☀
                            <span className="hidden md:inline"> Folga</span>
                          </div>
                        )}
                        {escala.tipo === 'trabalho' && (
                          <div className="text-gray-700 font-medium mt-1 text-center text-[9px] md:text-xs">
                            <span className="hidden md:inline">{escala.horaInicio} - {escala.horaFim}</span>
                            <span className="md:hidden">{escala.horaInicio}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg">
                <div className="w-4 h-4 bg-gradient-to-r from-teal-600 to-emerald-600 rounded shadow-sm"></div>
                <span className="text-gray-700 font-medium">Dia de trabalho</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded shadow-sm"></div>
                <span className="text-gray-700 font-medium">Dia de folga</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <div className="w-4 h-4 border-2 border-blue-400 bg-blue-50 rounded"></div>
                <span className="text-gray-700 font-medium">Hoje</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                <div className="w-4 h-4 border-2 border-purple-500 bg-purple-50 rounded"></div>
                <span className="text-gray-700 font-medium">Dia pesquisado</span>
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <>
            {/* Upcoming Escalas */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Próximas Escalas
              </h2>

              {upcomingEscalas.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">
                    Nenhuma escala futura cadastrada no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEscalas.map((escala) => (
                    <div
                      key={escala.id}
                      className={`border-l-4 p-5 rounded-xl shadow-md transition-all hover:shadow-lg ${
                        escala.tipo === "trabalho"
                          ? "border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50"
                          : "border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 capitalize mb-2">
                            {formatDate(escala.data)}
                          </h3>
                          <div className="space-y-1">
                            <p className="text-gray-700 flex items-center gap-2">
                              <span className="font-semibold">Tipo:</span>
                              <span>{escala.tipo === "trabalho" ? "Trabalho" : "Folga"}</span>
                            </p>
                            {escala.tipo === "trabalho" && (
                              <p className="text-gray-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold">Horário:</span>
                                <span>{escala.horaInicio} às {escala.horaFim}</span>
                              </p>
                            )}
                            {escala.observacoes && (
                              <p className="text-gray-600 mt-2 italic bg-white/50 p-2 rounded">
                                💬 {escala.observacoes}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                            escala.tipo === "trabalho"
                              ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
                              : "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                          }`}
                        >
                          {escala.tipo === "trabalho" ? "✓ Trabalho" : "☀ Folga"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Escalas */}
            {pastEscalas.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Escalas Anteriores
                </h2>
                <div className="space-y-3">
                  {pastEscalas.slice(-10).reverse().map((escala) => (
                    <div
                      key={escala.id}
                      className="border-l-4 border-gray-300 bg-gray-50 p-4 rounded-xl opacity-75 hover:opacity-100 transition-opacity"
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
          </>
        )}
      </div>
    </div>
  );
}
