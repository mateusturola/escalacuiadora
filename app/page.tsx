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
    if (cuidadora.cor === 'blue') return 'bg-blue-500';
    if (cuidadora.cor === 'pink') return 'bg-pink-500';
    return 'bg-gray-500';
  };

  // Agrupar eventos contínuos
  const getEventosPorCuidadora = (cuidadora: Cuidadora) => {
    return plantoes
      .filter(p => p.cuidadora === cuidadora.nome)
      .map(p => ({
        inicio: new Date(p.inicio),
        fim: new Date(p.fim)
      }));
  };

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
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Escala de Cuidadoras</h1>
          
          {/* Navegação */}
          <div className="flex items-center gap-4">
            <button
              onClick={mesAnterior}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 min-w-48 text-center">
              {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={proximoMes}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Calendário */}
        <div className="bg-white rounded-lg shadow overflow-hidden border">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SAB.'].map(dia => (
              <div
                key={dia}
                className="p-3 text-center font-bold text-gray-800 border-r text-sm h-12 flex items-center justify-center"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Grid principal com posicionamento relativo */}
          <div className="relative" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Células de fundo */}
            {dias.map((data, index) => {
              if (!data) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="border-r border-b bg-gray-50 min-h-40"
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
                  className={`border-r border-b min-h-40 p-2 ${
                    hoje ? 'bg-blue-50' : 'bg-white'
                  }`}
                  style={{ gridColumn: (index % 7) + 1, gridRow: Math.floor(index / 7) + 1 }}
                >
                  {/* Número do dia */}
                  <div className={`text-sm font-bold ${
                    hoje ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {data.getDate()}
                  </div>
                </div>
              );
            })}

            {/* Eventos como barras que atravessam dias */}
            {cuidadoras.map((cuidadora, cuidadoraIdx) => {
              const eventos = getEventosPorCuidadora(cuidadora);
              
              return eventos.map((evento, eventoIdx) => {
                const barras = [];

                const inicio = evento.inicio;
                const fim = evento.fim;
                const inicioDia = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
                const fimDia = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());
                const fimInclusivo = new Date(fimDia);

                if (fim.getHours() === 0 && fim.getMinutes() === 0 && fim.getSeconds() === 0) {
                  fimInclusivo.setDate(fimInclusivo.getDate() - 1);
                }

                // Encontrar a posição inicial e final do evento no array dias
                const indiceInicio = dias.findIndex(d => d && d.toDateString() === inicioDia.toDateString());

                if (indiceInicio === -1) return null;

                const indiceFim = dias.findIndex(d => d && d.toDateString() === fimInclusivo.toDateString());

                if (indiceFim === -1) return null;

                const linhaInicio = Math.floor(indiceInicio / 7) + 1;
                const linhaFim = Math.floor(indiceFim / 7) + 1;

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
                  const topOffset = 32 + (cuidadoraIdx * 32);

                  const horaInicio = inicio.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  barras.push(
                    <div
                      key={`${cuidadora.id}-${eventoIdx}-${linha}`}
                      className={`${getCor(cuidadora)} text-white rounded px-2 py-1 font-semibold text-xs absolute z-10`}
                      style={{
                        gridColumn: `${colunaInicial} / span ${diasNaLinha}`,
                        gridRow: linha,
                        top: `${topOffset}px`,
                        left: '8px',
                        right: '8px',
                        height: '24px',
                      }}
                    >
                      {linha === linhaInicio && colunaInicial === ((indiceInicio % 7) + 1) ? `${horaInicio} ` : ''}{cuidadora.nome}
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
  );
}
