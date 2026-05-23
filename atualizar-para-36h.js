const fs = require('fs');

const path = 'public/agendamento.json';
const dados = JSON.parse(fs.readFileSync(path, 'utf8'));

console.log('📊 Atualizando para turnos de 36h com Rosario e Sandra\n');

// Data/hora de início (hoje)
const dataInicio = new Date('2026-02-14T19:00:00');
console.log(`Data de início: ${dataInicio.toISOString()}\n`);

// Começar sem plantões anteriores - fresh start
const novosPlantoes = [];
const ms36h = 36 * 60 * 60 * 1000;
const dataFim = new Date('2028-12-31T19:00:00');

let inicioAtual = dataInicio;
let contador = 0;
let cuidadoraAtual = 'Rosario';

console.log('Gerando novos plantões de 36h:');

// Função para formatar data sem timezone (mantém hora local)
function formatarDataLocal(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  const hora = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const seg = String(date.getSeconds()).padStart(2, '0');
  return `${ano}-${mes}-${dia}T${hora}:${min}:${seg}`;
}

while (inicioAtual < dataFim) {
  const fimAtual = new Date(inicioAtual.getTime() + ms36h);
  
  novosPlantoes.push({
    inicio: formatarDataLocal(inicioAtual),
    fim: formatarDataLocal(fimAtual),
    cuidadora: cuidadoraAtual
  });
  
  if (contador < 6) {
    const tipo = inicioAtual.getHours() === 19 ? 'noturno' : 'diurno';
    console.log(`  ${cuidadoraAtual} (${tipo}): ${formatarDataLocal(inicioAtual)} → ${formatarDataLocal(fimAtual)}`);
  } else if (contador === 6) {
    console.log(`  ... (continuando até ${formatarDataLocal(dataFim)})`);
  }
  
  // Alternar cuidadora
  cuidadoraAtual = cuidadoraAtual === 'Rosario' ? 'Sandra' : 'Rosario';
  
  inicioAtual = fimAtual;
  contador++;
}

// Salvar dados atualizados
dados.plantoes = novosPlantoes;
fs.writeFileSync(path, JSON.stringify(dados, null, 2));

console.log(`\n✅ Arquivo atualizado!`);
console.log(`   Total de plantões: ${novosPlantoes.length}`);
console.log(`   Plantões de 36h gerados: ${novosPlantoes.length}`);
