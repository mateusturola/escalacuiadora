"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Escala, ConfiguracaoHorarios } from '@/lib/types';

export function useEscalas(cuidadoraId?: string) {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [config, setConfig] = useState<ConfiguracaoHorarios | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEscalas = useCallback(async () => {
    if (!cuidadoraId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/escalas?cuidadoraId=${cuidadoraId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar escalas');
      }
      
      const data = await response.json();
      const sorted = data.sort(
        (a: Escala, b: Escala) =>
          new Date(a.data).getTime() - new Date(b.data).getTime()
      );
      setEscalas(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar escalas');
    } finally {
      setLoading(false);
    }
  }, [cuidadoraId]);

  const loadConfig = useCallback(async () => {
    if (!cuidadoraId) return;

    try {
      const response = await fetch(
        `/api/escalas?tipo=config&cuidadoraId=${cuidadoraId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Erro ao carregar configuração:', err);
    }
  }, [cuidadoraId]);

  useEffect(() => {
    loadEscalas();
    loadConfig();
  }, [loadEscalas, loadConfig]);

  const addEscala = async (escalaData: Omit<Escala, 'id'>) => {
    try {
      const response = await fetch('/api/escalas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(escalaData),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar escala');
      }

      const novaEscala = await response.json();
      setEscalas(prev => [...prev, novaEscala].sort(
        (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
      ));
      return novaEscala;
    } catch (err) {
      throw err;
    }
  };

  const updateEscala = async (id: string, updates: Partial<Escala>) => {
    try {
      const response = await fetch('/api/escalas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar escala');
      }

      const updated = await response.json();
      setEscalas(prev => prev.map(e => e.id === id ? updated : e).sort(
        (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
      ));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteEscala = async (id: string) => {
    try {
      const response = await fetch(`/api/escalas?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar escala');
      }

      setEscalas(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      throw err;
    }
  };

  // Filtros úteis
  const upcomingEscalas = escalas.filter(e => {
    const date = new Date(e.data + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  });

  const pastEscalas = escalas.filter(e => {
    const date = new Date(e.data + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  });

  return {
    escalas,
    config,
    loading,
    error,
    loadEscalas,
    loadConfig,
    addEscala,
    updateEscala,
    deleteEscala,
    upcomingEscalas,
    pastEscalas,
  };
}
