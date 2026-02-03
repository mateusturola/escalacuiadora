export interface Cuidadora {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataCadastro: string;
}

export interface Escala {
  id: string;
  cuidadoraId: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: 'trabalho' | 'folga';
  observacoes?: string;
}

export interface ConfiguracaoHorarios {
  id: string;
  cuidadoraId: string;
  cargaHorariaSemanal: number;
  diasTrabalho: number[];
  horaInicioPadrao: string;
  horaFimPadrao: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  tipo: 'admin' | 'cuidadora';
  cuidadoraId?: string;
}
