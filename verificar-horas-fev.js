const data = require('./public/agendamento.json');

const plantoesFev = data.plantoes.filter(p => {
  const ini = new Date(p.inicio);
  return ini.getMonth() === 1 && ini.getFullYear() === 2026;
});

console.log('Plantões de Fevereiro 2026:\n');
const stats = {};

plantoesFev.forEach(p => {
  const ini = new Date(p.inicio);
  const fim = new Date(p.fim);
  const horas = (fim - ini) / (1000 * 60 * 60);
  
  if (!stats[p.cuidadora]) {
    stats[p.cuidadora] = { total: 0, count: 0 };
  }
  stats[p.cuidadora].total += horas;
  stats[p.cuidadora].count++;
  
  console.log(`${p.cuidadora}: ${p.inicio} → ${p.fim} (${horas}h)`);
});

console.log('\n--- RESUMO ---');
Object.keys(stats).forEach(nome => {
  console.log(`${nome}: ${stats[nome].count} plantões = ${stats[nome].total}h total`);
});
