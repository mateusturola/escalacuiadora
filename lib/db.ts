import fs from 'fs';
import path from 'path';
import type { Cuidadora, Escala, ConfiguracaoHorarios, User } from './types';

const dataDir = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readJSON<T>(filename: string, defaultValue: T): T {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content);
}

function writeJSON<T>(filename: string, data: T): void {
  const filepath = path.join(dataDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Cuidadoras
export function getCuidadoras(): Cuidadora[] {
  return readJSON<Cuidadora[]>('cuidadoras.json', []);
}

export function saveCuidadoras(cuidadoras: Cuidadora[]): void {
  writeJSON('cuidadoras.json', cuidadoras);
}

export function getCuidadoraById(id: string): Cuidadora | undefined {
  const cuidadoras = getCuidadoras();
  return cuidadoras.find(c => c.id === id);
}

export function addCuidadora(cuidadora: Omit<Cuidadora, 'id' | 'dataCadastro'>): Cuidadora {
  const cuidadoras = getCuidadoras();
  const newCuidadora: Cuidadora = {
    ...cuidadora,
    id: crypto.randomUUID(),
    dataCadastro: new Date().toISOString(),
  };
  cuidadoras.push(newCuidadora);
  saveCuidadoras(cuidadoras);
  return newCuidadora;
}

export function updateCuidadora(id: string, updates: Partial<Cuidadora>): Cuidadora | null {
  const cuidadoras = getCuidadoras();
  const index = cuidadoras.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  cuidadoras[index] = { ...cuidadoras[index], ...updates };
  saveCuidadoras(cuidadoras);
  return cuidadoras[index];
}

export function deleteCuidadora(id: string): boolean {
  const cuidadoras = getCuidadoras();
  const filtered = cuidadoras.filter(c => c.id !== id);
  if (filtered.length === cuidadoras.length) return false;
  
  saveCuidadoras(filtered);
  return true;
}

// Escalas
export function getEscalas(): Escala[] {
  return readJSON<Escala[]>('escalas.json', []);
}

export function saveEscalas(escalas: Escala[]): void {
  writeJSON('escalas.json', escalas);
}

export function getEscalasByCuidadora(cuidadoraId: string): Escala[] {
  const escalas = getEscalas();
  return escalas.filter(e => e.cuidadoraId === cuidadoraId);
}

export function addEscala(escala: Omit<Escala, 'id'>): Escala {
  const escalas = getEscalas();
  const newEscala: Escala = {
    ...escala,
    id: crypto.randomUUID(),
  };
  escalas.push(newEscala);
  saveEscalas(escalas);
  return newEscala;
}

export function updateEscala(id: string, updates: Partial<Escala>): Escala | null {
  const escalas = getEscalas();
  const index = escalas.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  escalas[index] = { ...escalas[index], ...updates };
  saveEscalas(escalas);
  return escalas[index];
}

export function deleteEscala(id: string): boolean {
  const escalas = getEscalas();
  const filtered = escalas.filter(e => e.id !== id);
  if (filtered.length === escalas.length) return false;
  
  saveEscalas(filtered);
  return true;
}

// Configurações de Horários
export function getConfiguracoes(): ConfiguracaoHorarios[] {
  return readJSON<ConfiguracaoHorarios[]>('configuracoes.json', []);
}

export function saveConfiguracoes(configs: ConfiguracaoHorarios[]): void {
  writeJSON('configuracoes.json', configs);
}

export function getConfiguracaoByCuidadora(cuidadoraId: string): ConfiguracaoHorarios | undefined {
  const configs = getConfiguracoes();
  return configs.find(c => c.cuidadoraId === cuidadoraId);
}

export function saveConfiguracao(config: Omit<ConfiguracaoHorarios, 'id'>): ConfiguracaoHorarios {
  const configs = getConfiguracoes();
  const existingIndex = configs.findIndex(c => c.cuidadoraId === config.cuidadoraId);
  
  if (existingIndex !== -1) {
    configs[existingIndex] = { ...configs[existingIndex], ...config };
    saveConfiguracoes(configs);
    return configs[existingIndex];
  }
  
  const newConfig: ConfiguracaoHorarios = {
    ...config,
    id: crypto.randomUUID(),
  };
  configs.push(newConfig);
  saveConfiguracoes(configs);
  return newConfig;
}

// Users
export function getUsers(): User[] {
  const defaultUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      password: 'admin123',
      tipo: 'admin',
    },
  ];
  return readJSON<User[]>('users.json', defaultUsers);
}

export function saveUsers(users: User[]): void {
  writeJSON('users.json', users);
}

export function getUserByUsername(username: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.username === username);
}

export function addUser(user: Omit<User, 'id'>): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: crypto.randomUUID(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}
