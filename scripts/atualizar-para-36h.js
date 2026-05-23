const fs = require('fs');
const crypto = require('crypto');

const path = 'data/escalas.json';
const escalas = JSON.parse(fs.readFileSync(path, 'utf8'));

// Data de mudança para 36h
const dataMudanca = '2026-02-14';

// Manter apenas dados antes da mudança
const escalasAnteriores = escalas.filter(e => e.data < dataMudanca);
console.log(`Mantendo ${escalasAnteriores.length} registros antes de ${dataMudanca}`);

// Agrupar por cuidadora
const porCuidadora = new Map();
for (const e of escalasAnteriores) {
  if (!porCuidadora.has(e.cuidadoraId)) {
    porCuidadora.set(e.cuidadoraId, []);
  }
  porCuidadora.get(e.cuidadoraId).push(e);
}

// Verificar status antes da mudança
console.log('\nStatus das cuidadoras antes da mudança:');
for (const [cuidadoraId, entries] of porCuidadora) {
  entries.sort((a, b) => a.data.localeCompare(b.data));
  const ultimaEntrada = entries[entries.length - 1];
  
  // Contar dias consecutivos do mesmo tipo
  let diasConsecutivos = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].tipo === ultimaEntrada.tipo) {
      diasConsecutivos++;
    } else {
      break;
    }
  }
  
  console.log(`  ${cuidadoraId.slice(0, 8)}: ${diasConsecutivos} dias de ${ultimaEntrada.tipo} (último: ${ultimaEntrada.data})`);
}

// Gerar novos dados a partir de 14/02/2026
// Ciclo de 36h = aproximadamente 1,5 dias
// Para simplificar no calendário, vamos usar: 2 dias de trabalho, 2 dias de folga
const novasEscalas = [...escalasAnteriores];
const dataInicio = new Date('2026-02-14');
const dataFim = new Date('2027-12-31');

console.log('\nGerando novos dados com ciclo de 36h (2 dias de cada tipo):');

for (const [cuidadoraId, entries] of porCuidadora) {
  entries.sort((a, b) => a.data.localeCompare(b.data));
  const ultimaEntrada = entries[entries.length - 1];
  
  // Contar dias consecutivos
  let diasConsecutivos = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].tipo === ultimaEntrada.tipo) {
      diasConsecutivos++;
    } else {
      break;
    }
  }
  
  // Determinar tipo inicial para o dia 14
  let tipoInicial;
  if (diasConsecutivos >= 2) {
    // Já completou o ciclo, alterna
    tipoInicial = ultimaEntrada.tipo === 'trabalho' ? 'folga' : 'trabalho';
  } else {
    // Continua o tipo atual por mais 1 dia
    tipoInicial = ultimaEntrada.tipo;
  }
  
  console.log(`  ${cuidadoraId.slice(0, 8)}: inicia com ${tipoInicial} no dia 14`);
  
  let dataAtual = new Date(dataInicio);
  let contador = diasConsecutivos; // Continua contando do histórico
  
  while (dataAtual <= dataFim) {
    const dataStr = dataAtual.toISOString().split('T')[0];
    
    // A cada 2 dias, alterna o tipo
    const blocoAtual = Math.floor(contador / 2);
    let tipo;
    
    if (tipoInicial === 'trabalho') {
      tipo = blocoAtual % 2 === 0 ? 'trabalho' : 'folga';
    } else {
      tipo = blocoAtual % 2 === 0 ? 'folga' : 'trabalho';
    }
    
    const entrada = {
      cuidadoraId: cuidadoraId,
      data: dataStr,
      horaInicio: tipo === 'trabalho' ? '19:00' : '00:00',
      horaFim: tipo === 'trabalho' ? '07:00' : '00:00',
      tipo: tipo,
      id: crypto.randomUUID()
    };
    
    novasEscalas.push(entrada);
    
    dataAtual.setDate(dataAtual.getDate() + 1);
    contador++;
  }
}

// Ordenar por data e cuidadora
novasEscalas.sort((a, b) => {
  const cmp = a.data.localeCompare(b.data);
  if (cmp !== 0) return cmp;
  return a.cuidadoraId.localeCompare(b.cuidadoraId);
});

// Salvar
fs.writeFileSync(path, JSON.stringify(novasEscalas, null, 2) + '\n');

console.log(`\n✅ Arquivo atualizado!`);
console.log(`   Total de registros: ${novasEscalas.length}`);
console.log(`   Novos registros: ${novasEscalas.length - escalasAnteriores.length}`);
