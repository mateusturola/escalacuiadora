import { NextRequest, NextResponse } from 'next/server';
import {
  getCuidadoras,
  getCuidadoraById,
  addCuidadora,
  updateCuidadora,
  deleteCuidadora,
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const cuidadora = getCuidadoraById(id);
      if (!cuidadora) {
        return NextResponse.json(
          { error: 'Cuidadora não encontrada' },
          { status: 404 }
        );
      }
      return NextResponse.json(cuidadora);
    }

    const cuidadoras = getCuidadoras();
    return NextResponse.json(cuidadoras);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar cuidadoras' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, telefone, dataInicioTrabalho } = body;

    if (!nome || !telefone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    const newCuidadora = addCuidadora({ nome, email: '', telefone, dataInicioTrabalho });
    return NextResponse.json(newCuidadora, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar cuidadora' },
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

    const updated = updateCuidadora(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: 'Cuidadora não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar cuidadora' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const { searchParams } = new URL(request.url);
    const id = body?.id || searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const deleted = deleteCuidadora(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Cuidadora não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar cuidadora' },
      { status: 500 }
    );
  }
}
