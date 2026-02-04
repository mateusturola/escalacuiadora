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
  const [mesAtual, setMesAtual] = useState(new Date(2026, 1)); // Fevereiro 2026
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
  
  const dias: (Date | null)[] = [];
  const diaDaSemana = primeiroDia.getDay();
  
  // Adicionar espaços vazios antes do primeiro dia
  for (let i = 0; i < diaDaSemana; i++) {
    dias.push(null);
  }
  
  // Adicionar dias do mês
  for (let i = 1; i <= diasNoMes; i++) {
    dias.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i));
  }

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
    return 'bg-gray-100 border border-gray-400 text-gray-900';
  };

  const inicioBruna = new Date('2026-02-08T18:00:00');
  const fimFeriasJanaina = new Date('2026-03-08T18:00:00');
  const ms48h = 48 * 60 * 60 * 1000;

  const ajustarCuidadoraPorInicio = (plantao: Plantao, inicio: Date) => {
    if (inicio < inicioBruna) return plantao.cuidadora;

    const indiceBloco = Math.floor((inicio.getTime() - inicioBruna.getTime()) / ms48h);

    if (inicio < fimFeriasJanaina) {
      return indiceBloco % 2 === 0 ? 'Bruna' : 'Rosario';
    }

    return indiceBloco % 2 === 0 ? 'Bruna' : 'Janaina';
  };

  const plantoesAjustados = plantoes.flatMap(plantao => {
    const inicio = new Date(plantao.inicio);
    const fim = new Date(plantao.fim);
    const cortes = [inicioBruna, fimFeriasJanaina]
      .filter(corte => corte > inicio && corte < fim)
      .sort((a, b) => a.getTime() - b.getTime());

    let inicioSegmento = inicio;
    const segmentos: Plantao[] = [];

    for (const corte of cortes) {
      segmentos.push({
        inicio: inicioSegmento.toISOString(),
        fim: corte.toISOString(),
        cuidadora: ajustarCuidadoraPorInicio(plantao, inicioSegmento),
      });
      inicioSegmento = corte;
    }

    segmentos.push({
      inicio: inicioSegmento.toISOString(),
      fim: fim.toISOString(),
      cuidadora: ajustarCuidadoraPorInicio(plantao, inicioSegmento),
    });

    return segmentos;
  });

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
    
    // Incluir plantão se ele sobrepõe o mês
    return inicio < primeiroDiaProximoMes && fim > primeiroDiaDoMes;
  });

  // Contar apenas plantões que COMEÇAM no mês (para evitar dupla contagem)
  const plantoesQueComecamNoMes = plantoesAjustados.filter(plantao => {
    const inicio = new Date(plantao.inicio);
    return inicio.getFullYear() === mesAtual.getFullYear() && inicio.getMonth() === mesAtual.getMonth();
  });

  const contagemPorCuidadora = cuidadoras.map(cuidadora => ({
    cuidadora,
    total: plantoesQueComecamNoMes.filter(p => p.cuidadora === cuidadora.nome).length
  }));

  const temPlantaoNoMes = (cuidadora: Cuidadora) =>
    plantoesDoMes.some(p => p.cuidadora === cuidadora.nome);

  const getPlantaoDoDia = (data: Date) => {
    const inicioDia = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    const fimDia = new Date(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59, 999);

    return plantoesDoMes.find(plantao => {
      const inicio = new Date(plantao.inicio);
      const fim = new Date(plantao.fim);
      return inicio <= fimDia && fim >= inicioDia;
    });
  };

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
        <div className="max-w-full mx-auto flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Escala de Cuidadoras</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {cuidadoras.map(cuidadora => (
                <p key={cuidadora.id} className="text-xs md:text-sm text-gray-600">
                  <span className="font-semibold">{cuidadora.nome}:</span> {plantoesAjustados.filter(p => p.cuidadora === cuidadora.nome).length} plantões
                </p>
              ))}
            </div>
          </div>
          
          {/* Navegação */}
          <div className="flex items-center gap-3 md:gap-4 md:mt-1">
            <button
              onClick={mesAnterior}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-base md:text-xl font-bold text-gray-900 md:min-w-56 text-center">
              {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={proximoMes}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-2 md:p-4">
        {/* Legenda e contagem */}
        <div className="bg-white rounded-lg shadow border p-3 md:p-4 mb-4">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-6">
            <div className="flex items-center gap-3">
              <span className="text-base md:text-lg font-bold text-gray-900">Legenda</span>
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {cuidadoras.map(cuidadora => (
                  <div key={cuidadora.id} className="flex items-center gap-2">
                    <span className={`${getCor(cuidadora)} inline-block w-4 h-4 rounded`}></span>
                    <span className="text-sm md:text-base font-semibold text-gray-900">{cuidadora.nome}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <span className="text-base md:text-lg font-bold text-gray-900">Plantões no mês</span>
              {contagemPorCuidadora.map(item => (
                <div key={item.cuidadora.id} className="text-sm md:text-base font-semibold text-gray-900">
                  {item.cuidadora.nome}: {item.total}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendário compacto (mobile) */}
        <div className="bg-white rounded-lg shadow border mb-4 md:hidden">
          <div className="grid grid-cols-7 bg-gray-100 border-b">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(dia => (
              <div
                key={dia}
                className="py-2 text-center font-bold text-gray-900 border-r text-xs"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Grid principal mobile */}
          <div
            className="relative"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '100px' }}
          >
            {/* Células de fundo */}
            {dias.map((data, index) => {
              if (!data) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="border-r border-b bg-gray-50"
                    style={{ gridColumn: (index % 7) + 1, gridRow: Math.floor(index / 7) + 1 }}
                  >
                    <div className="p-1"></div>
                  </div>
                );
              }

              const hoje = new Date().toDateString() === data.toDateString();

              return (
                <div
                  key={data.toISOString()}
                  className={`border-r border-b p-1 ${
                    hoje ? 'bg-blue-50' : 'bg-white'
                  }`}
                  style={{ gridColumn: (index % 7) + 1, gridRow: Math.floor(index / 7) + 1 }}
                >
                  {/* Número do dia */}
                  <div className={`text-xs font-bold relative z-20 inline-flex px-1 rounded bg-white/90 ${
                    hoje ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {data.getDate()}
                  </div>
                </div>
              );
            })}

            {/* Eventos como barras (mobile compactado) */}
            {cuidadoras.map((cuidadora, cuidadoraIdx) => {
              const eventosDoMes = plantoesDoMes
                .filter(p => p.cuidadora === cuidadora.nome)
                .map(p => ({
                  inicio: new Date(p.inicio),
                  fim: new Date(p.fim)
                }));
              
              return eventosDoMes.map((evento, eventoIdx) => {
                const barras = [];

                let inicio = evento.inicio;
                let fim = evento.fim;
                
                const primeiroDiaDoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
                const ultimoDiaDoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
                
                if (inicio < primeiroDiaDoMes) {
                  inicio = primeiroDiaDoMes;
                }
                
                if (fim > ultimoDiaDoMes) {
                  fim = new Date(ultimoDiaDoMes.getFullYear(), ultimoDiaDoMes.getMonth(), ultimoDiaDoMes.getDate(), 23, 59, 59);
                }

                const inicioDia = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
                const fimDia = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());
                const fimInclusivo = new Date(fimDia);

                if (fim.getHours() === 0 && fim.getMinutes() === 0 && fim.getSeconds() === 0) {
                  fimInclusivo.setDate(fimInclusivo.getDate() - 1);
                }

                const indiceInicio = dias.findIndex(d => d && d.toDateString() === inicioDia.toDateString());

                if (indiceInicio === -1) return null;

                let indiceFim = dias.findIndex(d => d && d.toDateString() === fimInclusivo.toDateString());
                
                if (indiceFim === -1) {
                  indiceFim = dias.length - 1;
                }

                const linhaInicio = Math.floor(indiceInicio / 7) + 1;
                const linhaFim = Math.floor(indiceFim / 7) + 1;
                const startMeio = inicio.getHours() >= 12;
                const endMeio = fim.getHours() >= 12;

                for (let linha = linhaInicio; linha <= linhaFim; linha++) {
                  let colunaInicial, colunaFinal;
                  
                  if (linha === linhaInicio) {
                    colunaInicial = (indiceInicio % 7) + 1;
                    if (linha === linhaFim) {
                      colunaFinal = (indiceFim % 7) + 1;
                    } else {
                      colunaFinal = 7;
                    }
                  } else if (linha === linhaFim) {
                    colunaInicial = 1;
                    colunaFinal = (indiceFim % 7) + 1;
                  } else {
                    colunaInicial = 1;
                    colunaFinal = 7;
                  }

                  const diasNaLinha = colunaFinal - colunaInicial + 1;
                  const baseOffset = 32;
                  const rowSpacing = 22;
                  const marginTop = baseOffset + (cuidadoraIdx * rowSpacing);

                  const isPrimeiroSegmento = linha === linhaInicio;
                  const isUltimoSegmento = linha === linhaFim;

                  const meiaColuna = `calc((100% / ${diasNaLinha}) / 2 + 2px)`;
                  const leftOffsetBase = isPrimeiroSegmento && startMeio ? meiaColuna : '4px';
                  const rightOffsetBase = isUltimoSegmento && endMeio ? meiaColuna : '4px';
                  const leftOffset = diasNaLinha === 1 ? '4px' : leftOffsetBase;
                  const rightOffset = diasNaLinha === 1 ? '4px' : rightOffsetBase;

                  barras.push(
                    <div
                      key={`${cuidadora.id}-${eventoIdx}-${linha}`}
                      className={`${getCor(cuidadora)} rounded px-2 py-1 font-bold text-xs z-10 self-start flex items-center justify-center text-center truncate`}
                      style={{
                        gridColumn: `${colunaInicial} / span ${diasNaLinha}`,
                        gridRow: linha,
                        marginTop: `${marginTop}px`,
                        marginLeft: leftOffset,
                        marginRight: rightOffset,
                        height: '18px',
                      }}
                    >
                      {isPrimeiroSegmento && temPlantaoNoMes(cuidadora) ? cuidadora.nome : ''}
                    </div>
                  );
                }

                return barras;
              });
            })}
          </div>
        </div>

        {/* Calendário */}
        <div className="bg-white rounded-lg shadow overflow-hidden border hidden md:block">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 bg-gray-100 border-b min-w-[860px]">
            {['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SAB.'].map(dia => (
              <div
                key={dia}
                className="p-2 md:p-3 text-center font-bold text-gray-900 border-r text-xs md:text-base h-12 md:h-14 flex items-center justify-center"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Grid principal com posicionamento relativo */}
          <div className="overflow-x-auto">
            <div
              className="relative min-w-[860px]"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '136px' }}
            >
            {/* Células de fundo */}
            {dias.map((data, index) => {
              if (!data) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="border-r border-b bg-gray-50 h-32"
                    style={{ gridColumn: (index % 7) + 1, gridRow: Math.floor(index / 7) + 1 }}
                  >
                    <div className="p-2"></div>
                  </div>
                );
              }

              const hoje = new Date().toDateString() === data.toDateString();

              return (
                <div
                  key={data.toISOString()}
                  className={`border-r border-b h-32 p-2 ${
                    hoje ? 'bg-blue-50' : 'bg-white'
                  }`}
                  style={{ gridColumn: (index % 7) + 1, gridRow: Math.floor(index / 7) + 1 }}
                >
                  {/* Número do dia */}
                  <div className={`text-base font-bold relative z-20 inline-flex px-1 rounded bg-white/90 ${
                    hoje ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {data.getDate()}
                  </div>
                </div>
              );
            })}

            {/* Eventos como barras que atravessam dias */}
            {cuidadoras.map((cuidadora, cuidadoraIdx) => {
              // Usar apenas plantões que sobrepõem o mês
              const eventosDoMes = plantoesDoMes
                .filter(p => p.cuidadora === cuidadora.nome)
                .map(p => ({
                  inicio: new Date(p.inicio),
                  fim: new Date(p.fim)
                }));
              
              return eventosDoMes.map((evento, eventoIdx) => {
                const barras = [];

                let inicio = evento.inicio;
                let fim = evento.fim;
                
                // Se o plantão começa antes do mês, ajustar para o primeiro dia
                const primeiroDiaDoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
                const ultimoDiaDoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
                
                if (inicio < primeiroDiaDoMes) {
                  inicio = primeiroDiaDoMes;
                }
                
                // Se o plantão termina depois do mês, ajustar para o último dia
                if (fim > ultimoDiaDoMes) {
                  fim = new Date(ultimoDiaDoMes.getFullYear(), ultimoDiaDoMes.getMonth(), ultimoDiaDoMes.getDate(), 23, 59, 59);
                }

                const inicioDia = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
                const fimDia = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());
                const fimInclusivo = new Date(fimDia);

                if (fim.getHours() === 0 && fim.getMinutes() === 0 && fim.getSeconds() === 0) {
                  fimInclusivo.setDate(fimInclusivo.getDate() - 1);
                }

                // Encontrar a posição inicial do evento no array dias
                const indiceInicio = dias.findIndex(d => d && d.toDateString() === inicioDia.toDateString());

                if (indiceInicio === -1) return null;

                // Procurar o fim no mês atual
                let indiceFim = dias.findIndex(d => d && d.toDateString() === fimInclusivo.toDateString());
                
                // Se não encontrar, usar o último dia do mês
                if (indiceFim === -1) {
                  indiceFim = dias.length - 1;
                }

                const linhaInicio = Math.floor(indiceInicio / 7) + 1;
                const linhaFim = Math.floor(indiceFim / 7) + 1;
                const startMeio = inicio.getHours() >= 12;
                const endMeio = fim.getHours() >= 12;

                // Renderizar uma barra para cada linha que o evento atravessa
                for (let linha = linhaInicio; linha <= linhaFim; linha++) {
                  let colunaInicial, colunaFinal;
                  
                  if (linha === linhaInicio) {
                    // Primeira linha: começa na coluna do evento
                    colunaInicial = (indiceInicio % 7) + 1;
                    if (linha === linhaFim) {
                      // Se também é a última linha, termina na coluna final
                      colunaFinal = (indiceFim % 7) + 1;
                    } else {
                      // Senão, vai até o final da semana
                      colunaFinal = 7;
                    }
                  } else if (linha === linhaFim) {
                    // Última linha: começa na coluna 1
                    colunaInicial = 1;
                    colunaFinal = (indiceFim % 7) + 1;
                  } else {
                    // Linhas intermediárias: semana completa
                    colunaInicial = 1;
                    colunaFinal = 7;
                  }

                  const diasNaLinha = colunaFinal - colunaInicial + 1;
                  const baseOffset = 32;
                  const rowSpacing = 28;
                  const marginTop = baseOffset + (cuidadoraIdx * rowSpacing);

                  const isPrimeiroSegmento = linha === linhaInicio;
                  const isUltimoSegmento = linha === linhaFim;

                  const meiaColuna = `calc((100% / ${diasNaLinha}) / 2 + 4px)`;
                  const leftOffsetBase = isPrimeiroSegmento && startMeio ? meiaColuna : '8px';
                  const rightOffsetBase = isUltimoSegmento && endMeio ? meiaColuna : '8px';
                  const leftOffset = diasNaLinha === 1 ? '8px' : leftOffsetBase;
                  const rightOffset = diasNaLinha === 1 ? '8px' : rightOffsetBase;

                  barras.push(
                    <div
                      key={`${cuidadora.id}-${eventoIdx}-${linha}`}
                      className={`${getCor(cuidadora)} rounded px-3 py-2 font-bold text-sm z-10 self-start flex items-center justify-center text-center`}
                      style={{
                        gridColumn: `${colunaInicial} / span ${diasNaLinha}`,
                        gridRow: linha,
                        marginTop: `${marginTop}px`,
                        marginLeft: leftOffset,
                        marginRight: rightOffset,
                        height: '28px',
                      }}
                    >
                      {isPrimeiroSegmento && temPlantaoNoMes(cuidadora) ? cuidadora.nome : ''}
                    </div>
                  );
                }

                return barras;
              });
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
