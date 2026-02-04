// Constantes do aplicativo

// Cores para identificação de cuidadoras
export const CORES_CUIDADORAS = [
  { bg: 'bg-teal-100', border: 'border-l-4 border-teal-500', text: 'text-teal-800', name: 'teal' },
  { bg: 'bg-purple-100', border: 'border-l-4 border-purple-500', text: 'text-purple-800', name: 'purple' },
  { bg: 'bg-blue-100', border: 'border-l-4 border-blue-500', text: 'text-blue-800', name: 'blue' },
  { bg: 'bg-pink-100', border: 'border-l-4 border-pink-500', text: 'text-pink-800', name: 'pink' },
] as const;

// Dias da semana
export const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
export const DIAS_SEMANA_COMPLETO = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const;

// Configurações padrão
export const CONFIG_PADRAO = {
  CARGA_HORARIA_SEMANAL: 84,
  HORA_INICIO_PADRAO: '18:00',
  HORA_FIM_PADRAO: '18:00',
  PADRAO_48H: true,
} as const;

// Mensagens de erro
export const MENSAGENS_ERRO = {
  GENERICO: 'Ocorreu um erro. Tente novamente.',
  LOGIN_INVALIDO: 'Credenciais inválidas ou acesso não autorizado',
  TELEFONE_NAO_ENCONTRADO: 'Telefone não encontrado',
  CARREGAR_CUIDADORAS: 'Erro ao carregar cuidadoras',
  CARREGAR_ESCALAS: 'Erro ao carregar escalas',
  SALVAR_CUIDADORA: 'Erro ao salvar cuidadora',
  SALVAR_ESCALA: 'Erro ao salvar escala',
} as const;

// Tipos de escala
export const TIPO_ESCALA = {
  TRABALHO: 'trabalho',
  FOLGA: 'folga',
} as const;
