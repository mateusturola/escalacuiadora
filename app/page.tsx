'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

interface PlantaoParsed extends Plantao {
  inicioMs: number;
  fimMs: number;
}

const corPill = (cuidadora?: Cuidadora) => {
  if (!cuidadora) return 'bg-gray-200 text-gray-800 ring-gray-300';
  switch (cuidadora.cor) {
    case 'teal':   return 'bg-teal-100 text-teal-900 ring-teal-400';
    case 'blue':   return 'bg-blue-100 text-blue-900 ring-blue-400';
    case 'pink':   return 'bg-pink-100 text-pink-900 ring-pink-400';
    case 'orange': return 'bg-orange-100 text-orange-900 ring-orange-400';
    case 'purple': return 'bg-purple-100 text-purple-900 ring-purple-400';
    case 'green':  return 'bg-green-100 text-green-900 ring-green-400';
    default:       return 'bg-gray-100 text-gray-900 ring-gray-400';
  }
};

const corBadgeNumero = (cuidadora: Cuidadora) => {
  switch (cuidadora.cor) {
    case 'teal':   return 'bg-teal-500 text-white';
    case 'blue':   return 'bg-blue-500 text-white';
    case 'pink':   return 'bg-pink-500 text-white';
    case 'orange': return 'bg-orange-500 text-white';
    case 'purple': return 'bg-purple-500 text-white';
    case 'green':  return 'bg-green-500 text-white';
    default:       return 'bg-gray-500 text-white';
  }
};

const corLegendaChip = (cuidadora: Cuidadora) => {
  switch (cuidadora.cor) {
    case 'teal':   return 'bg-teal-100 text-teal-900';
    case 'blue':   return 'bg-blue-100 text-blue-900';
    case 'pink':   return 'bg-pink-100 text-pink-900';
    case 'orange': return 'bg-orange-100 text-orange-900';
    case 'purple': return 'bg-purple-100 text-purple-900';
    case 'green':  return 'bg-green-100 text-green-900';
    default:       return 'bg-gray-100 text-gray-900';
  }
};

const DIA_MS = 24 * 60 * 60 * 1000;

export default function CalendarioPage() {
  const [cuidadoras, setCuidadoras] = useState<Cuidadora[]>([]);
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [mesAtual, setMesAtual] = useState(() => {
    const h = new Date();
    return new Date(h.getFullYear(), h.getMonth(), 1);
  });
  const [vista, setVista] = useState<'lista' | 'calendario'>('lista');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/agendamento.json')
      .then(res => res.json())
      .then((d: Agendamento) => {
        setCuidadoras(d.cuidadoras);
        setPlantoes(d.plantoes);
      })
      .catch(err => console.error('Erro ao carregar dados:', err))
      .finally(() => setLoading(false));
  }, []);

  const plantoesParsed: PlantaoParsed[] = useMemo(
    () => plantoes.map(p => ({
      ...p,
      inicioMs: new Date(p.inicio).getTime(),
      fimMs: new Date(p.fim).getTime(),
    })),
    [plantoes],
  );

  const getCuidadoraPorNome = (nome: string) =>
    cuidadoras.find(c => c.nome === nome);

  const dias: Date[] = useMemo(() => {
    const out: Date[] = [];
    const primeiro = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const ultimo = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const offset = primeiro.getDay();
    if (offset > 0) {
      const ultDoAnterior = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 0).getDate();
      for (let i = offset - 1; i >= 0; i--) {
        out.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, ultDoAnterior - i));
      }
    }
    for (let i = 1; i <= ultimo.getDate(); i++) {
      out.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i));
    }
    while (out.length % 7 !== 0) {
      const last = out[out.length - 1];
      out.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
    }
    return out;
  }, [mesAtual]);

  const semanas: Date[][] = useMemo(() => {
    const out: Date[][] = [];
    for (let i = 0; i < dias.length; i += 7) out.push(dias.slice(i, i + 7));
    return out;
  }, [dias]);

  const hoje = new Date();
  const isHoje = (d: Date) => d.toDateString() === hoje.toDateString();
  const isDoMes = (d: Date) =>
    d.getMonth() === mesAtual.getMonth() && d.getFullYear() === mesAtual.getFullYear();

  const proximoMes = () =>
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1));
  const mesAnterior = () =>
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1));
  const irParaHoje = () =>
    setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));

  const contagemNoMes = (cuidadora: Cuidadora) =>
    plantoesParsed.filter(p => {
      const ini = new Date(p.inicioMs);
      return (
        p.cuidadora === cuidadora.nome &&
        ini.getFullYear() === mesAtual.getFullYear() &&
        ini.getMonth() === mesAtual.getMonth()
      );
    }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Carregando escala...</p>
        </div>
      </div>
    );
  }

  const mesmoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const formatarHoraCurta = (ms: number) => {
    const d = new Date(ms);
    const h = d.getHours();
    const m = d.getMinutes();
    return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
  };

  const Dia = ({ d }: { d: Date }) => {
    const doMes = isDoMes(d);
    const ehHoje = isHoje(d);
    const entra = plantoesParsed.find(p => mesmoDia(new Date(p.inicioMs), d));
    const sai = plantoesParsed.find(p => mesmoDia(new Date(p.fimMs), d));
    const cEntra = entra ? getCuidadoraPorNome(entra.cuidadora) : undefined;
    const cSai = sai ? getCuidadoraPorNome(sai.cuidadora) : undefined;

    return (
      <div
        className={[
          'border-r border-b border-gray-200 last:border-r-0 p-1.5 md:p-2 flex flex-col gap-1 min-h-[88px] md:min-h-[100px]',
          !doMes ? 'bg-gray-50/60' : 'bg-white',
        ].join(' ')}
      >
        <div className="flex items-center justify-between">
          {ehHoje ? (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shadow">
              {d.getDate()}
            </span>
          ) : (
            <span
              className={[
                'text-sm font-semibold',
                doMes ? 'text-gray-800' : 'text-gray-400',
              ].join(' ')}
            >
              {d.getDate()}
            </span>
          )}
        </div>

        <div className={`flex flex-col gap-1 ${!doMes ? 'opacity-50' : ''}`}>
          {sai && (
            <div
              className={`flex items-center gap-1 text-[10px] md:text-xs font-semibold rounded px-1.5 py-0.5 ${corPill(cSai)}`}
              title={`Sai ${sai.cuidadora} às ${formatarHoraCurta(sai.fimMs)}`}
            >
              <span aria-hidden>↓</span>
              <span className="truncate">{sai.cuidadora}</span>
              <span className="ml-auto opacity-70 hidden md:inline">{formatarHoraCurta(sai.fimMs)}</span>
            </div>
          )}
          {entra && (
            <div
              className={`flex items-center gap-1 text-[10px] md:text-xs font-semibold rounded px-1.5 py-0.5 ${corPill(cEntra)}`}
              title={`Entra ${entra.cuidadora} às ${formatarHoraCurta(entra.inicioMs)}`}
            >
              <span aria-hidden>↑</span>
              <span className="truncate">{entra.cuidadora}</span>
              <span className="ml-auto opacity-70 hidden md:inline">{formatarHoraCurta(entra.inicioMs)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Semana = ({ semana }: { semana: Date[] }) => (
    <div className="grid grid-cols-7">
      {semana.map((d, i) => <Dia key={i} d={d} />)}
    </div>
  );

  const agoraMs = hoje.getTime();
  const plantaoAtual = plantoesParsed.find(
    p => p.inicioMs <= agoraMs && p.fimMs > agoraMs,
  );
  const proximosPlantoes = plantoesParsed
    .filter(p => p.fimMs > agoraMs)
    .sort((a, b) => a.inicioMs - b.inicioMs)
    .slice(0, 30);

  const inicioDeHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const rotuloDiaRelativo = (d: Date) => {
    const dia = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDias = Math.round((dia.getTime() - inicioDeHoje.getTime()) / DIA_MS);
    if (diffDias === 0) return 'Hoje';
    if (diffDias === 1) return 'Amanhã';
    return dia
      .toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
      .replace(/^./, c => c.toUpperCase());
  };
  const formatarHora = (ms: number) =>
    new Date(ms).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const rotuloFim = (fimMs: number, inicioMs: number) => {
    const ini = new Date(inicioMs);
    const fim = new Date(fimMs);
    const mesmoDia =
      ini.toDateString() === fim.toDateString();
    if (mesmoDia) return formatarHora(fimMs);
    const diffDias = Math.round(
      (new Date(fim.getFullYear(), fim.getMonth(), fim.getDate()).getTime() -
        new Date(ini.getFullYear(), ini.getMonth(), ini.getDate()).getTime()) /
        DIA_MS,
    );
    if (diffDias === 1) return `${formatarHora(fimMs)} (dia seguinte)`;
    return `${formatarHora(fimMs)} de ${fim.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
  };
  const corPontinho = (cuidadora?: Cuidadora) => {
    if (!cuidadora) return 'bg-gray-400';
    switch (cuidadora.cor) {
      case 'teal':   return 'bg-teal-500';
      case 'blue':   return 'bg-blue-500';
      case 'pink':   return 'bg-pink-500';
      case 'orange': return 'bg-orange-500';
      case 'purple': return 'bg-purple-500';
      case 'green':  return 'bg-green-500';
      default:       return 'bg-gray-500';
    }
  };

  const ListaView = () => {
    const cuidadoraAtual = plantaoAtual ? getCuidadoraPorNome(plantaoAtual.cuidadora) : undefined;
    return (
      <div className="space-y-5">
        {/* Quem está agora */}
        <Card className={`p-5 md:p-6 ${plantaoAtual ? corPill(cuidadoraAtual) : 'bg-white'} border-2`}>
          <p className="text-xs md:text-sm font-bold uppercase tracking-wider opacity-80">
            Agora
          </p>
          {plantaoAtual && cuidadoraAtual ? (
            <>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-block w-4 h-4 rounded-full ${corPontinho(cuidadoraAtual)}`}></span>
                <h2 className="text-3xl md:text-4xl font-bold">{cuidadoraAtual.nome}</h2>
              </div>
              <p className="mt-2 text-base md:text-lg opacity-90">
                Plantão até {rotuloFim(plantaoAtual.fimMs, plantaoAtual.inicioMs)}
              </p>
              {cuidadoraAtual.telefone && (
                <p className="mt-1 text-sm md:text-base opacity-80">
                  Telefone: {cuidadoraAtual.telefone}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-xl md:text-2xl font-semibold text-gray-600">
              Nenhum plantão no momento
            </p>
          )}
        </Card>

        {/* Próximos plantões */}
        <div>
          <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-gray-600 px-1 mb-2">
            Próximos plantões
          </h3>
          <Card className="divide-y divide-gray-200 p-0 gap-0">
            {proximosPlantoes
              .filter(p => !plantaoAtual || p.inicio !== plantaoAtual.inicio)
              .map((p, idx) => {
                const c = getCuidadoraPorNome(p.cuidadora);
                const ini = new Date(p.inicioMs);
                return (
                  <div
                    key={`${p.inicio}-${p.cuidadora}-${idx}`}
                    className="flex items-center gap-4 px-4 py-4 md:py-5"
                  >
                    <span className={`inline-block w-3 h-3 md:w-4 md:h-4 rounded-full shrink-0 ${corPontinho(c)}`}></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-base md:text-lg font-bold text-gray-900 truncate">
                        {p.cuidadora}
                      </p>
                      <p className="text-sm md:text-base text-gray-600">
                        {rotuloDiaRelativo(ini)} · {formatarHora(p.inicioMs)} até {rotuloFim(p.fimMs, p.inicioMs)}
                      </p>
                    </div>
                  </div>
                );
              })}
            {proximosPlantoes.length === 0 && (
              <div className="px-4 py-6 text-center text-gray-500">
                Sem plantões cadastrados.
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  const CalendarioView = () => (
    <div className="space-y-4">
      {/* Legenda */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {cuidadoras.map(cuidadora => {
            const count = contagemNoMes(cuidadora);
            if (count === 0) return null;
            return (
              <span
                key={cuidadora.id}
                className={`inline-flex items-center gap-1.5 rounded-full pl-1 pr-3 py-0.5 text-sm font-medium ${corLegendaChip(cuidadora)}`}
              >
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${corBadgeNumero(cuidadora)}`}
                  title={`${count} plantões neste mês`}
                >
                  {count}
                </span>
                {cuidadora.nome}
              </span>
            );
          })}
        </div>
        <p className="text-xs text-gray-600">
          <span className="font-semibold">↓ sai</span> · <span className="font-semibold">↑ entra</span>
        </p>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" onClick={mesAnterior} aria-label="Mês anterior">
          <ChevronLeft />
        </Button>
        <h2 className="text-base md:text-lg font-semibold min-w-40 md:min-w-48 text-center text-gray-900">
          {mesAtual
            .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
            .replace(/^./, c => c.toUpperCase())}
        </h2>
        <Button variant="ghost" size="icon" onClick={proximoMes} aria-label="Próximo mês">
          <ChevronRight />
        </Button>
        <Button variant="outline" size="sm" onClick={irParaHoje} className="ml-2">
          Hoje
        </Button>
      </div>

      {/* Calendar */}
      <Card className="overflow-hidden p-0 gap-0">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SAB.'].map((d, i) => (
            <div
              key={i}
              className="py-3 text-center text-xs md:text-sm font-bold text-gray-600 tracking-wide border-r border-gray-200 last:border-r-0"
            >
              {d}
            </div>
          ))}
        </div>
        <div>
          {semanas.map((semana, i) => (
            <Semana key={i} semana={semana} />
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-4 py-4 flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Escala de Cuidadoras</h1>
        </div>
      </header>

      <main className="px-3 md:px-4 py-4 md:py-6 space-y-5">
        {/* View toggle */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-white border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setVista('lista')}
              className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-colors ${
                vista === 'lista'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setVista('calendario')}
              className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-colors ${
                vista === 'calendario'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Calendário
            </button>
          </div>
        </div>

        {vista === 'lista' ? (
          <div className="max-w-3xl mx-auto">
            <ListaView />
          </div>
        ) : (
          <CalendarioView />
        )}
      </main>
    </div>
  );
}
