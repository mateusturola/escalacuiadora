"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Cuidadora } from '@/lib/types';

export function useCuidadoras() {
  const [cuidadoras, setCuidadoras] = useState<Cuidadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCuidadoras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/cuidadoras');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar cuidadoras');
      }
      
      const data = await response.json();
      setCuidadoras(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cuidadoras');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCuidadoras();
  }, [loadCuidadoras]);

  const addCuidadora = async (cuidadoraData: Omit<Cuidadora, 'id' | 'dataCadastro'>) => {
    try {
      const response = await fetch('/api/cuidadoras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuidadoraData),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar cuidadora');
      }

      const novaCuidadora = await response.json();
      setCuidadoras(prev => [...prev, novaCuidadora]);
      return novaCuidadora;
    } catch (err) {
      throw err;
    }
  };

  const updateCuidadora = async (id: string, updates: Partial<Cuidadora>) => {
    try {
      const response = await fetch('/api/cuidadoras', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar cuidadora');
      }

      const updated = await response.json();
      setCuidadoras(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteCuidadora = async (id: string) => {
    try {
      const response = await fetch(`/api/cuidadoras?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar cuidadora');
      }

      setCuidadoras(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    cuidadoras,
    loading,
    error,
    loadCuidadoras,
    addCuidadora,
    updateCuidadora,
    deleteCuidadora,
  };
}
