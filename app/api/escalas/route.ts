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
      const { cuidadoraId, cargaHorariaSemanal, diasTrabalho, horaInicioPadrao, horaFimPadrao, padrao48h } = body;
      
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
        horaInicioPadrao: horaInicioPadrao || '18:00',
        horaFimPadrao: horaFimPadrao || '18:00',
        padrao48h: padrao48h || false,
      });

      return NextResponse.json(config, { status: 201 });
    }

    // Geração automática de escala 48/48
    if (tipo === 'generate48h') {
      const { cuidadoraId, dataInicio, meses, iniciaTrabalhando } = body;
      
      if (!cuidadoraId || !dataInicio) {
        return NextResponse.json(
          { error: 'cuidadoraId e dataInicio são obrigatórios' },
          { status: 400 }
        );
      }

      // Buscar configuração da cuidadora
      const config = getConfiguracaoByCuidadora(cuidadoraId);
      const horaInicio = config?.horaInicioPadrao || '18:00';
      const horaFim = config?.horaFimPadrao || '18:00';

      // Gerar escalas para os próximos N meses
      const startDate = new Date(dataInicio);
      const monthsToGenerate = meses || 6;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + monthsToGenerate);

      const escalasGeradas = [];
      let currentDate = new Date(startDate);
      let isTrabalhando = iniciaTrabalhando !== undefined ? iniciaTrabalhando : true; // Usa o parâmetro ou começa trabalhando

      while (currentDate < endDate) {
        // Adicionar 2 dias de trabalho
        if (isTrabalhando) {
          for (let i = 0; i < 2; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            escalasGeradas.push({
              cuidadoraId,
              data: dateStr,
              horaInicio,
              horaFim,
              tipo: 'trabalho',
            });
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } else {
          // Adicionar 2 dias de folga
          for (let i = 0; i < 2; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            escalasGeradas.push({
              cuidadoraId,
              data: dateStr,
              horaInicio: '00:00',
              horaFim: '00:00',
              tipo: 'folga',
            });
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
        
        isTrabalhando = !isTrabalhando;
      }

      // Salvar todas as escalas
      const escalas = escalasGeradas.map(e => addEscala(e));

      return NextResponse.json({ 
        success: true, 
        count: escalas.length,
        message: `${escalas.length} escalas geradas com sucesso!`
      }, { status: 201 });
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
      horaInicio: horaInicio || '18:00',
      horaFim: horaFim || '18:00',
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
