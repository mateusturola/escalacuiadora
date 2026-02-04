export interface Cuidadora {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataCadastro: string;
  dataInicioTrabalho?: string; // Data de início no padrão 48/48
  arquivada?: boolean; // Se a cuidadora está arquivada
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
  padrao48h: boolean; // Se usa o padrão 48h trabalho / 48h folga
}

export interface User {
  id: string;
  username: string;
  password: string;
  tipo: 'admin' | 'cuidadora';
  cuidadoraId?: string;
}
