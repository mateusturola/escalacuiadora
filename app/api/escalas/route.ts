import { NextRequest, NextResponse } from 'next/server';
import {
  getEscalas,
  getEscalasByCuidadora,
  addEscala,
  updateEscala,
  deleteEscala,
  getConfiguracaoByCuidadora,
  saveConfiguracao,
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cuidadoraId = searchParams.get('cuidadoraId');
    const tipo = searchParams.get('tipo');

    if (tipo === 'config' && cuidadoraId) {
      const config = getConfiguracaoByCuidadora(cuidadoraId);
      return NextResponse.json(config || null);
    }

    if (cuidadoraId) {
      const escalas = getEscalasByCuidadora(cuidadoraId);
      return NextResponse.json(escalas);
    }

    const escalas = getEscalas();
    return NextResponse.json(escalas);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar escalas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo } = body;

    if (tipo === 'config') {
      const { cuidadoraId, cargaHorariaSemanal, diasTrabalho, horaInicioPadrao, horaFimPadrao } = body;
      
      if (!cuidadoraId) {
        return NextResponse.json(
          { error: 'cuidadoraId é obrigatório' },
          { status: 400 }
        );
      }

      const config = saveConfiguracao({
        cuidadoraId,
        cargaHorariaSemanal: cargaHorariaSemanal || 40,
        diasTrabalho: diasTrabalho || [],
        horaInicioPadrao: horaInicioPadrao || '08:00',
        horaFimPadrao: horaFimPadrao || '17:00',
      });

      return NextResponse.json(config, { status: 201 });
    }

    const { cuidadoraId, data, horaInicio, horaFim, tipo: tipoEscala, observacoes } = body;

    if (!cuidadoraId || !data || !tipoEscala) {
      return NextResponse.json(
        { error: 'cuidadoraId, data e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    const newEscala = addEscala({
      cuidadoraId,
      data,
      horaInicio: horaInicio || '08:00',
      horaFim: horaFim || '17:00',
      tipo: tipoEscala,
      observacoes,
    });

    return NextResponse.json(newEscala, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar escala' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const updated = updateEscala(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: 'Escala não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar escala' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const deleted = deleteEscala(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Escala não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar escala' },
      { status: 500 }
    );
  }
}
